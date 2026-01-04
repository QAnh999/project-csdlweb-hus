# routers/managers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func  # THÊM desc và func
from typing import List
from datetime import datetime, timedelta  # THÊM timedelta

from database import get_db
from models import Reservation, Staff, User, Flight, Payment, ReservationDetail, Passenger, Airport  # THÊM Airport
from schemas.admin_schemas import AdminCreate, AdminResponse, UserResponse, UserDetailResponse, BookingResponse, BookingDetailResponse, UserBookingsResponse
from dependencies import get_current_super_admin, get_current_admin

router = APIRouter(prefix="/admin/managers", tags=["Managers"])

# ==================== HELPER FUNCTION ====================

def is_booking_old(booking: Reservation) -> bool:
    """Kiểm tra nếu booking đã cũ hơn 1 năm"""
    if not booking.created_at:
        return False
    one_year_ago = datetime.now() - timedelta(days=365)
    return booking.created_at < one_year_ago

# 1. XÓA ADMIN (CHỈ SUPER ADMIN) - Chỉ đổi status thành 'deleted'
@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(
    admin_id: int,
    current_user: dict = Depends(get_current_super_admin),  # CHỈ super admin
    db: Session = Depends(get_db)
):
    # Không cho xóa chính mình
    if admin_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    admin = db.query(Staff).filter(Staff.admin_id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # Xóa mềm: chỉ đổi status thành 'deleted'
    admin.status = 'deleted'
    admin.is_active = False
    db.commit()
    
    return  # 204 No Content
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_admin),  # ✅ CẢ Admin VÀ Super Admin đều được
    db: Session = Depends(get_db)
):
    """
    Xóa user - chỉ chuyển status thành 'deleted'
    Admin và Super Admin đều có quyền xóa user
    """
    # Tìm user
    user = db.query(User).filter(
        User.id == user_id,
        User.status != 'deleted'  # Chỉ xóa user chưa bị xóa
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or already deleted"
        )
    
    # Kiểm tra không xóa chính mình
    # Nếu current_user là staff và user là user thường, kiểm tra qua email
    if current_user.get("type") == "staff":
        # Staff không thể xóa chính mình (so sánh qua email)
        if user.email == current_user["email"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff cannot delete their own user account"
            )
    else:
        # User không thể xóa chính mình
        if user.id == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete yourself"
            )
    
    # Xóa mềm: chỉ đổi status thành 'deleted'
    user.status = 'deleted'
    
    # Nếu có trường deleted_at thì cập nhật
    if hasattr(user, 'deleted_at'):
        user.deleted_at = datetime.now()
    
    db.commit()
    
    return  # 204 No Content

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db)
):
    """
    Hiển thị danh sách user: id, họ tên, email, ngày tham gia
    """
    try:
        # Cách 1: Query đơn giản hơn
        users = db.query(User).filter(
            User.status != 'deleted'  # Không hiện user đã xóa
        ).all()
        
        result = []
        for user in users:
            result.append({
                "id": user.id,
                "full_name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "joined_date": user.created_at.date() if user.created_at else datetime.now().date()
            })
        
        return result
        
    except Exception as e:
        # Log lỗi để debug
        print(f"Error in get_all_users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# 6. HIỂN THỊ USER THEO ID (Thêm theo yêu cầu)
@router.get("/users/{user_id}", response_model=UserDetailResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Hiển thị chi tiết user theo ID
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.status != 'deleted'
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Format response
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "status": user.status,
        "joined_date": user.created_at.date() if user.created_at else None,
        "last_login": user.last_login
    }
@router.get("/admins/super", response_model=List[AdminResponse])
def get_super_admins(
    db: Session = Depends(get_db)
):
    super_admins = db.query(Staff).filter(
        Staff.status != 'deleted',
        Staff.role == 'Super Admin'
    ).all()
    
    return super_admins
@router.get("/admins/{admin_id}", response_model=AdminResponse)
def get_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin admin theo ID
    KHÔNG hiển thị admin có status = 'deleted'
    """
    admin = db.query(Staff).filter(
        Staff.admin_id == admin_id,
        Staff.role.ilike('%admin%'),  # Tìm admin (không phải super admin)
        Staff.status != 'deleted'
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    return admin


@router.get("/admins/super/{admin_id}", response_model=AdminResponse)
def get_super_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy thông tin super admin theo ID
    KHÔNG hiển thị super admin có status = 'deleted'
    """
    super_admin = db.query(Staff).filter(
        Staff.admin_id == admin_id,
        Staff.role.ilike('%super%'),  # Chỉ tìm super admin
        Staff.status != 'deleted'
    ).first()
    
    if not super_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Super admin not found"
        )
    
    return super_admin

# 3. HIỂN THỊ ADMIN (không hiện status deleted)
@router.get("/admins", response_model=List[AdminResponse])
def get_all_admins(
    db: Session = Depends(get_db)
):
    admins = db.query(Staff).filter(
        Staff.status != 'deleted',  # Không hiện đã xóa
        Staff.role == 'Admin'  # Chỉ hiện Admin, không hiện Super Admin
    ).all()
    
    return admins

# 4. HIỂN THỊ SUPER ADMIN


# 5. THÊM ADMIN MỚI (CHỈ SUPER ADMIN)
@router.post("/admins", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_data: AdminCreate,
    current_user: dict = Depends(get_current_super_admin),  # CHỈ super admin
    db: Session = Depends(get_db)
):
    # Kiểm tra email đã tồn tại
    existing = db.query(Staff).filter(Staff.email == admin_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Tạo admin mới với role mặc định là 'Admin' (không phải Super Admin)
    new_admin = Staff(
        admin_name=admin_data.admin_name,
        email=admin_data.email,
        password=admin_data.password,
        full_name=admin_data.full_name,
        role='Admin',  # Mặc định là Admin, Super Admin phải tạo riêng
        is_active=True,
        status='work'
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return new_admin
@router.get("/users/{user_id}/bookings")
def get_user_bookings_manager(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """
    Manager/Admin xem tất cả booking của một user
    Endpoint: GET /admin/managers/users/{user_id}/bookings
    """
    try:
        print(f"Getting bookings for user_id: {user_id}")
        print(f"Current admin: {current_user}")
        
        # 1. Kiểm tra user tồn tại
        user = db.query(User).filter(
            User.id == user_id,
            User.status != 'deleted'
        ).first()
        
        if not user:
            print(f"User {user_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        print(f"Found user: {user.email}")
        
        # 2. Lấy tất cả booking của user
        bookings = db.query(Reservation).filter(
            Reservation.user_id == user_id
        ).order_by(desc(Reservation.created_at)).all()
        
        print(f"Found {len(bookings)} bookings for user {user_id}")
        
        # 3. Format response
        booking_list = []
        for booking in bookings:
            print(f"Processing booking {booking.id} - status: {booking.status}")
            
            # Lấy thông tin chuyến bay chính
            main_flight = db.query(Flight).filter(
                Flight.id == booking.main_flight_id
            ).first()
            
            # Lấy thông tin sân bay
            departure_city = arrival_city = "N/A"
            if main_flight:
                departure_airport = db.query(Airport).filter(
                    Airport.id == main_flight.dep_airport
                ).first()
                arrival_airport = db.query(Airport).filter(
                    Airport.id == main_flight.arr_airport
                ).first()
                
                departure_city = departure_airport.city if departure_airport else "N/A"
                arrival_city = arrival_airport.city if arrival_airport else "N/A"
            
            booking_data = {
                "booking_id": booking.id,
                "reservation_code": booking.reservation_code,
                "status": booking.status,
                "total_amount": float(booking.total_amount) if booking.total_amount else 0,
                "paid_amount": float(booking.paid_amount) if booking.paid_amount else 0,
                "discount_amount": float(booking.discount_amount) if booking.discount_amount else 0,
                "tax_amount": float(booking.tax_amount) if booking.tax_amount else 0,
                "total_passengers": booking.total_passengers,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "expires_at": booking.expires_at.isoformat() if booking.expires_at else None,
                "main_flight": {
                    "flight_id": main_flight.id if main_flight else None,
                    "flight_number": main_flight.flight_number if main_flight else "N/A",
                    "departure": main_flight.dep_datetime.isoformat() if main_flight and main_flight.dep_datetime else None,
                    "arrival": main_flight.arr_datetime.isoformat() if main_flight and main_flight.arr_datetime else None,
                    "departure_city": departure_city,
                    "arrival_city": arrival_city
                } if main_flight else None,
                "has_return_flight": bool(booking.return_flight_id)
            }
            
            booking_list.append(booking_data)
        
        # 4. Tính thống kê
        status_stats = {}
        total_revenue = 0
        
        for booking in bookings:
            status_value = booking.status
            status_stats[status_value] = status_stats.get(status_value, 0) + 1
            
            if booking.status in ['confirmed', 'completed'] and booking.total_amount:
                total_revenue += float(booking.total_amount)
        
        # 5. Lấy thông tin thanh toán gần nhất (nếu có)
        latest_payment = None
        if bookings:
            latest_payment = db.query(Payment).filter(
                Payment.reservation_id.in_([b.id for b in bookings])
            ).order_by(desc(Payment.created_at)).first()
        
        response = {
            "user_info": {
                "user_id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "phone": user.phone,
                "address": user.address,
                "status": user.status,
                "created_at": user.created_at.isoformat() if user.created_at else None
            },
            "bookings": booking_list,
            "stats": {
                "total_bookings": len(bookings),
                "total_revenue": total_revenue,
                "by_status": status_stats,
                "active_bookings": status_stats.get('pending', 0) + status_stats.get('confirmed', 0),
                "completed_bookings": status_stats.get('completed', 0),
                "cancelled_bookings": status_stats.get('cancelled', 0)
            },
            "payment_info": {
                "latest_payment_method": latest_payment.payment_method if latest_payment else None,
                "latest_payment_status": latest_payment.status if latest_payment else None
            } if latest_payment else None
        }
        
        print(f"Successfully processed request for user {user_id}")
        return response
        
    except HTTPException as he:
        print(f"HTTPException: {he.detail}")
        raise he
    except Exception as e:
        print(f"ERROR in get_user_bookings_manager: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# 8. API GET BOOKING DETAIL
@router.get("/users/{user_id}/bookings/{booking_id}", response_model=BookingDetailResponse)
def get_user_booking_detail_manager(
    user_id: int,
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """
    Lấy chi tiết một booking cụ thể của user
    """
    try:
        # Kiểm tra user tồn tại
        user = db.query(User).filter(
            User.id == user_id,
            User.status != 'deleted'
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Tìm booking của user này
        booking = db.query(Reservation).filter(
            Reservation.id == booking_id,
            Reservation.user_id == user_id
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found for this user"
            )
        
        # Lấy thông tin chi tiết
        main_flight = db.query(Flight).filter(Flight.id == booking.main_flight_id).first()
        return_flight = None
        if booking.return_flight_id:
            return_flight = db.query(Flight).filter(Flight.id == booking.return_flight_id).first()
        
        # Lấy thông tin thanh toán
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
        
        # Format response
        flight_info = {
            "main_flight": {
                "flight_id": main_flight.id if main_flight else None,
                "flight_number": main_flight.flight_number if main_flight else "N/A",
                "departure": main_flight.dep_datetime if main_flight else None,
                "arrival": main_flight.arr_datetime if main_flight else None
            }
        }
        
        if return_flight:
            flight_info["return_flight"] = {
                "flight_id": return_flight.id if return_flight else None,
                "flight_number": return_flight.flight_number if return_flight else None,
                "departure": return_flight.dep_datetime if return_flight else None,
                "arrival": return_flight.arr_datetime if return_flight else None
            }
        else:
            flight_info["return_flight"] = None
        
        booking_details = {
            "total_passengers": booking.total_passengers,
            "total_amount": float(booking.total_amount) if booking.total_amount else 0,
            "paid_amount": float(booking.paid_amount) if booking.paid_amount else 0,
            "discount_amount": float(booking.discount_amount) if booking.discount_amount else 0,
            "status": booking.status,
            "created_at": booking.created_at,
            "is_old": is_booking_old(booking)
        }
        
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
            "passengers": passengers_details,
            "accessed_by": {
                "admin_id": current_user.get("id"),
                "admin_role": current_user.get("role")
            }
        }
        
    except Exception as e:
        print(f"Error in get_user_booking_detail_manager: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# 9. TEST ENDPOINT
@router.get("/test/{user_id}")
def test_user_bookings(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Test endpoint để kiểm tra connection và query
    """
    try:
        # Test 1: Kiểm tra user tồn tại
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": f"User {user_id} not found", "test": "failed"}
        
        # Test 2: Đếm số booking
        booking_count = db.query(func.count(Reservation.id)).filter(
            Reservation.user_id == user_id
        ).scalar()
        
        # Test 3: Lấy 1 booking đơn giản
        test_booking = db.query(Reservation).filter(
            Reservation.user_id == user_id
        ).first()
        
        return {
            "test": "success",
            "user_info": {
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email
            },
            "booking_count": booking_count,
            "test_booking": {
                "id": test_booking.id if test_booking else None,
                "code": test_booking.reservation_code if test_booking else None,
                "status": test_booking.status if test_booking else None
            },
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "test": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }