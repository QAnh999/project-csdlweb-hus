# routers/dashboard.py - SỬA LẠI TOÀN BỘ
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import aliased
from database import get_db
from models import Flight, Reservation, User, Airline, Airport
import schemas
from datetime import datetime, date, timedelta
from typing import List
from decimal import Decimal
import logging

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)

# ==================== DAILY STATS ====================

@router.get("/daily-stats")
def get_daily_stats(db: Session = Depends(get_db)):
    """
    Thống kê tổng các chuyến bay đang hoạt động, 
    các chuyến bay đã hoàn thành, 
    tổng doanh thu theo ngày (hôm nay), 
    người dùng mới (hôm nay)
    """
    try:
        # Lấy ngày hôm nay
        today = date.today()
        
        # 1. Tổng chuyến bay đang hoạt động (hôm nay) - theo dep_datetime
        active_flights = db.query(Flight).filter(
            Flight.status.in_(['scheduled', 'boarding', 'departed']),
            func.date(Flight.dep_datetime) == today
        ).count()
        
        # 2. Chuyến bay đã hoàn thành (hôm nay) - theo arr_datetime
        completed_flights = db.query(Flight).filter(
            Flight.status == 'arrived',
            func.date(Flight.arr_datetime) == today
        ).count()
        
        # 3. Tổng doanh thu theo ngày (hôm nay) - QUAN TRỌNG: theo status 'confirmed' hoặc 'completed'
        today_revenue = db.query(
            func.coalesce(func.sum(Reservation.total_amount), 0)
        ).filter(
            Reservation.status.in_(['confirmed', 'completed']),
            func.date(Reservation.created_at) == today
        ).scalar() or 0
        
        # 4. Người dùng mới (hôm nay)
        new_users = db.query(User).filter(
            func.date(User.created_at) == today
        ).count()
        
        return {
            "date": today.isoformat(),
            "stats": {
                "active_flights": active_flights,
                "completed_flights": completed_flights,
                "today_revenue": float(today_revenue),
                "new_users": new_users
            }
        }
        
    except Exception as e:
        logger.error(f"Error in get_daily_stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ==================== WEEKLY REVENUE ====================

@router.get("/weekly-revenue")
def get_weekly_revenue(db: Session = Depends(get_db)):
    """
    Thống kê tổng doanh thu trong 1 tuần (7 ngày gần nhất)
    """
    today = date.today()
    week_ago = today - timedelta(days=6)  # 7 ngày: 6 ngày trước + hôm nay
    
    # Tạo danh sách tất cả các ngày trong tuần
    all_days = []
    for i in range(7):
        current_date = week_ago + timedelta(days=i)
        
        # Query doanh thu cho ngày cụ thể
        day_revenue = db.query(
            func.coalesce(func.sum(Reservation.total_amount), 0)
        ).filter(
            Reservation.status.in_(['confirmed', 'completed']),  # SỬA: cả confirmed và completed
            func.date(Reservation.created_at) == current_date
        ).scalar() or 0
        
        # Lấy tên thứ tiếng Việt
        day_names = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
        day_index = current_date.weekday()  # 0=Monday, 6=Sunday
        
        all_days.append({
            "date": current_date.isoformat(),
            "day_of_week": day_names[day_index],
            "revenue": float(day_revenue)
        })
    
    # Tổng doanh thu tuần
    total_week_revenue = sum(day["revenue"] for day in all_days)
    
    return {
        "period": {
            "start_date": week_ago.isoformat(),
            "end_date": today.isoformat()
        },
        "revenue_by_day": all_days,
        "total_week_revenue": total_week_revenue
    }

# ==================== MONTHLY REVENUE ====================

@router.get("/monthly-revenue")
def get_monthly_revenue(db: Session = Depends(get_db)):
    """
    Thống kê tổng doanh thu trong tháng hiện tại (theo tuần)
    """
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    
    # Tính tuần trong tháng
    weeks_data = []
    
    # Chia tháng thành 4 tuần (xấp xỉ)
    for week_num in range(1, 5):
        # Tính ngày bắt đầu và kết thúc của tuần
        if week_num == 1:
            week_start = first_day_of_month
            week_end = first_day_of_month + timedelta(days=6)
        elif week_num == 2:
            week_start = first_day_of_month + timedelta(days=7)
            week_end = first_day_of_month + timedelta(days=13)
        elif week_num == 3:
            week_start = first_day_of_month + timedelta(days=14)
            week_end = first_day_of_month + timedelta(days=20)
        else:  # week_num == 4
            week_start = first_day_of_month + timedelta(days=21)
            week_end = today if today < first_day_of_month + timedelta(days=27) else first_day_of_month + timedelta(days=27)
        
        # Đảm bảo week_end không vượt quá hôm nay
        if week_end > today:
            week_end = today
        
        # Query doanh thu trong tuần
        week_revenue = db.query(
            func.coalesce(func.sum(Reservation.total_amount), 0)
        ).filter(
            Reservation.status.in_(['confirmed', 'completed']),
            func.date(Reservation.created_at).between(week_start, week_end)
        ).scalar() or 0
        
        weeks_data.append({
            "week_number": week_num,
            "period": f"{week_start.strftime('%d/%m')} - {week_end.strftime('%d/%m')}",
            "revenue": float(week_revenue)
        })
    
    return {
        "month": today.strftime("%Y-%m"),
        "weeks": weeks_data,
        "total_month_revenue": sum(week["revenue"] for week in weeks_data)
    }

# ==================== WEEKLY TICKETS ====================

@router.get("/weekly-tickets")
def get_weekly_tickets(db: Session = Depends(get_db)):
    """
    Thống kê tổng số vé bán được của các ngày trong 1 tuần
    """
    today = date.today()
    week_ago = today - timedelta(days=6)
    
    tickets_by_day = []
    
    # Query vé bán theo ngày
    for i in range(7):
        current_date = week_ago + timedelta(days=i)
        
        # Số vé bán (số booking)
        tickets_sold = db.query(Reservation).filter(
            Reservation.status.in_(['confirmed', 'completed']),
            func.date(Reservation.created_at) == current_date
        ).count()
        
        # Doanh thu ngày
        day_revenue = db.query(
            func.coalesce(func.sum(Reservation.total_amount), 0)
        ).filter(
            Reservation.status.in_(['confirmed', 'completed']),
            func.date(Reservation.created_at) == current_date
        ).scalar() or 0
        
        tickets_by_day.append({
            "date": current_date.isoformat(),
            "date_formatted": current_date.strftime("%d/%m/%Y"),
            "tickets_sold": tickets_sold,
            "revenue": float(day_revenue)
        })
    
    return {
        "period": {
            "start_date": week_ago.isoformat(),
            "end_date": today.isoformat()
        },
        "tickets_by_day": tickets_by_day,
        "total_tickets_week": sum(day["tickets_sold"] for day in tickets_by_day),
        "total_revenue_week": sum(day["revenue"] for day in tickets_by_day)
    }

# ==================== RECENT BOOKINGS ====================

@router.get("/recent-bookings")
def get_recent_bookings(db: Session = Depends(get_db)):
    """
    Hiển thị top 3 user đặt vé gần nhất
    """
    recent_bookings = db.query(
        User.first_name,
        User.last_name,
        Reservation.id,
        Flight.flight_number,
        Reservation.created_at,
        Reservation.status
    ).join(Reservation, Reservation.user_id == User.id
    ).join(Flight, Reservation.main_flight_id == Flight.id
    ).filter(
        Reservation.status.in_(['pending', 'confirmed', 'completed'])
    ).order_by(Reservation.created_at.desc()
    ).limit(3).all()
    
    result = []
    for booking in recent_bookings:
        result.append({
            "user_name": f"{booking.first_name} {booking.last_name}",
            "booking_id": booking.id,
            "flight_number": booking.flight_number,
            "booking_time": booking.created_at.strftime("%H:%M"),
            "status": booking.status
        })
    
    return result

# ==================== POPULAR ROUTES ====================

@router.get("/popular-routes")
def get_popular_routes(db: Session = Depends(get_db)):
    """
    Hiển thị top 5 tuyến bay phổ biến nhất
    """
    try:
        # Tạo alias cho Airport
        Airport_dep = aliased(Airport)
        Airport_arr = aliased(Airport)
        
        # Query các route phổ biến
        routes = db.query(
            Airport_dep.city.label('departure_city'),
            Airport_arr.city.label('arrival_city'),
            func.count(Flight.id).label('flight_count')
        ).join(Airport_dep, Flight.dep_airport == Airport_dep.id
        ).join(Airport_arr, Flight.arr_airport == Airport_arr.id
        ).filter(
            Flight.status != 'deleted'
        ).group_by(
            Airport_dep.city, Airport_arr.city
        ).order_by(func.count(Flight.id).desc()
        ).limit(5).all()
        
        # Tính tổng số chuyến bay
        total_flights = db.query(func.count(Flight.id)).filter(
            Flight.status != 'deleted'
        ).scalar() or 1  # Tránh chia cho 0
        
        result = []
        for route in routes:
            percentage = (route.flight_count / total_flights * 100)
            result.append({
                "departure_city": route.departure_city,
                "arrival_city": route.arrival_city,
                "percentage": round(percentage, 2)
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error in popular-routes: {e}")
        return []

# ==================== POPULAR AIRLINES ====================

@router.get("/popular-airlines")
def get_popular_airlines(db: Session = Depends(get_db)):
    """
    Hiển thị hãng bay phổ biến
    """
    # Tổng số chuyến bay
    total_flights = db.query(func.count(Flight.id)).filter(
        Flight.status != 'deleted'
    ).scalar() or 1
    
    airlines = db.query(
        Airline.name,
        func.count(Flight.id).label('flight_count')
    ).join(Flight, Airline.id == Flight.id_airline
    ).filter(Flight.status != 'deleted'
    ).group_by(Airline.id, Airline.name
    ).all()
    
    result = []
    for airline in airlines:
        percentage = (airline.flight_count / total_flights * 100)
        result.append({
            "airline_name": airline.name,
            "total_flights": airline.flight_count,
            "percentage": round(percentage, 2)
        })
    
    return result