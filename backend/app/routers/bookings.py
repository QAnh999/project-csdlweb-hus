# routers/bookings.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from database import get_db
from models import Reservation, User, Flight, Passenger, Payment, ReservationDetail
from schemas.admin_schemas import BookingResponse, BookingDetailResponse

router = APIRouter(prefix="/admin/booking", tags=["Bookings"])

logger = logging.getLogger(__name__)

# ==================== HELPER FUNCTIONS ====================

def is_booking_old(booking: Reservation) -> bool:
    """Kiểm tra nếu booking đã cũ hơn 1 năm"""
    if not booking or not booking.created_at:
        return False
    one_year_ago = datetime.now() - timedelta(days=365)
    return booking.created_at < one_year_ago

def auto_cancel_old_bookings(db: Session):
    """Tự động đánh dấu booking cũ hơn 1 năm là expired"""
    try:
        one_year_ago = datetime.now() - timedelta(days=365)
        
        old_bookings = db.query(Reservation).filter(
            Reservation.created_at < one_year_ago,
            Reservation.status.in_(['pending', 'confirmed'])
        ).all()
        
        if old_bookings:
            for booking in old_bookings:
                booking.status = 'expired'
            
            db.commit()
            logger.info(f"Auto-expired {len(old_bookings)} old bookings")
            
    except Exception as e:
        logger.error(f"Error in auto_cancel_old_bookings: {e}")
        db.rollback()

# ==================== API ENDPOINTS ====================

@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db)
):
    """
    Hiển thị danh sách vé và trạng thái - hiển thị 10 cái mới nhất
    """
    # Tự động đánh dấu booking cũ trước khi lấy dữ liệu
    auto_cancel_old_bookings(db)
    
    try:
        # Lấy 10 booking mới nhất từ database
        bookings = db.query(Reservation).join(
            User, Reservation.user_id == User.id
        ).filter(
            Reservation.status != 'deleted'
        ).order_by(
            desc(Reservation.created_at)
        ).limit(10).all()
        
        if not bookings:
            return []
        
        result = []
        for booking in bookings:
            if not booking.user:
                continue
                
            result.append({
                "id": booking.id,
                "reservation_code": booking.reservation_code,
                "user_name": f"{booking.user.first_name} {booking.user.last_name}",
                "email": booking.user.email,
                "booking_time": booking.created_at,
                "status": booking.status,
                "total_amount": float(booking.total_amount) if booking.total_amount else 0,
                "total_passengers": booking.total_passengers,
                "is_old": is_booking_old(booking)
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_all_bookings: {str(e)}")
        return []

@router.get("/{booking_id}", response_model=BookingDetailResponse)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db)
):
    """
    Hiển thị chi tiết booking theo ID
    TỰ ĐỘNG KIỂM TRA NẾU BOOKING ĐÃ CŨ HƠN 1 NĂM THÌ ĐÁNH DẤU EXPIRED
    """
    # Tự động đánh dấu booking cũ trước
    auto_cancel_old_bookings(db)
    
    try:
        # Tìm booking theo ID
        booking = db.query(Reservation).filter(Reservation.id == booking_id).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Kiểm tra và đánh dấu expired nếu cũ hơn 1 năm
        if is_booking_old(booking) and booking.status in ['pending', 'confirmed']:
            booking.status = 'expired'
            db.commit()
        
        # Lấy thông tin user
        user = db.query(User).filter(User.id == booking.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found for this booking"
            )
        
        # Lấy thông tin flight chính
        main_flight = None
        if booking.main_flight_id:
            main_flight = db.query(Flight).filter(Flight.id == booking.main_flight_id).first()
        
        # Lấy thông tin flight về (nếu có)
        return_flight = None
        if booking.return_flight_id:
            return_flight = db.query(Flight).filter(Flight.id == booking.return_flight_id).first()
        
        # Lấy thông tin payment
        payment = db.query(Payment).filter(
            Payment.reservation_id == booking.id,
            Payment.status == 'completed'
        ).first()
        
        # Lấy danh sách hành khách
        passengers_details = []
        reservation_details = db.query(ReservationDetail).filter(
            ReservationDetail.reservation_id == booking.id
        ).all()
        
        for detail in reservation_details:
            passenger = db.query(Passenger).filter(Passenger.id == detail.passenger_id).first()
            if passenger:
                passengers_details.append({
                    "passenger_id": passenger.id,
                    "name": f"{passenger.first_name} {passenger.last_name}",
                    "seat_id": detail.seat_id,
                    "total_fare": float(detail.total_fare) if detail.total_fare else 0
                })
        
        # Xây dựng response đúng với schema
        flight_info = {
            "main_flight": {
                "flight_id": main_flight.id if main_flight else None,
                "flight_number": main_flight.flight_number if main_flight else "N/A",
                "departure": main_flight.dep_datetime if main_flight else None,
                "arrival": main_flight.arr_datetime if main_flight else None
            }
        }
        
        # Thêm return_flight nếu có
        if return_flight:
            flight_info["return_flight"] = {
                "flight_id": return_flight.id if return_flight else None,
                "flight_number": return_flight.flight_number if return_flight else None,
                "departure": return_flight.dep_datetime if return_flight else None,
                "arrival": return_flight.arr_datetime if return_flight else None
            }
        else:
            flight_info["return_flight"] = None
        
        # Xây dựng booking details
        booking_details = {
            "total_passengers": booking.total_passengers,
            "total_amount": float(booking.total_amount) if booking.total_amount else 0,
            "paid_amount": float(booking.paid_amount) if booking.paid_amount else 0,
            "discount_amount": float(booking.discount_amount) if booking.discount_amount else 0,
            "status": booking.status,
            "created_at": booking.created_at,
            "is_old": is_booking_old(booking)
        }
        
        # Xây dựng payment info nếu có
        payment_info = None
        if payment:
            payment_info = {
                "payment_method": payment.payment_method if payment.payment_method else None,
                "transaction_id": payment.transaction_id if payment.transaction_id else None,
                "amount": float(payment.amount) if hasattr(payment, 'amount') and payment.amount else 0,
                "status": payment.status if payment.status else None
            }
        
        return {
            "booking_id": booking.id,
            "reservation_code": booking.reservation_code,
            "user_info": {
                "user_id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "phone": user.phone if user.phone else None
            },
            "flight_info": flight_info,
            "booking_details": booking_details,
            "payment_info": payment_info,
            "passengers": passengers_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_booking_by_id: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching booking: {str(e)}"
        )

# ==================== DEBUG ENDPOINTS ====================

@router.get("/debug/check-data")
def check_booking_data(
    db: Session = Depends(get_db)
):
    """Kiểm tra dữ liệu booking thực tế trong database"""
    try:
        total_count = db.query(Reservation).count()
        
        recent_bookings = db.query(Reservation).order_by(
            desc(Reservation.created_at)
        ).limit(5).all()
        
        sample_data = []
        for booking in recent_bookings:
            user = db.query(User).filter(User.id == booking.user_id).first()
            sample_data.append({
                "booking_id": booking.id,
                "reservation_code": booking.reservation_code,
                "user_name": f"{user.first_name} {user.last_name}" if user else "No user",
                "status": booking.status,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "total_amount": float(booking.total_amount) if booking.total_amount else 0
            })
        
        return {
            "total_bookings_in_db": total_count,
            "recent_bookings_sample": sample_data,
            "current_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": str(e)}