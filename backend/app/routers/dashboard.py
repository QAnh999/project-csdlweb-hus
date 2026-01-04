# routers/dashboard.py - SỬA LẠI TOÀN BỘ
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import aliased
from app.database import get_db
from models import Flight, Reservation, User, Airline, Airport
import schemas.admin_schemas as schemas
from datetime import datetime, date, timedelta
from typing import List
from decimal import Decimal
import logging

router = APIRouter(prefix="/admin/dashboard", tags=["Dashboard"])
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

# routers/dashboard.py - SỬA LẠI MONTHLY REVENUE API
@router.get("/monthly-revenue")
def get_monthly_revenue(db: Session = Depends(get_db)):
    """
    Thống kê tổng doanh thu trong tháng hiện tại (theo tuần)
    Tuần 1: Ngày 1-7 của tháng
    Tuần 2: Ngày 8-14 của tháng  
    Tuần 3: Ngày 15-21 của tháng
    Tuần 4: Ngày 22 đến hết tháng
    """
    try:
        today = date.today()
        first_day_of_month = date(today.year, today.month, 1)
        
        # Tính ngày cuối cùng của tháng
        if today.month == 12:
            last_day_of_month = date(today.year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day_of_month = date(today.year, today.month + 1, 1) - timedelta(days=1)
        
        weeks_data = []
        
        # Định nghĩa các tuần theo đúng yêu cầu
        week_definitions = [
            {"name": "Tuần 1", "start_day": 1, "end_day": 7},
            {"name": "Tuần 2", "start_day": 8, "end_day": 14},
            {"name": "Tuần 3", "start_day": 15, "end_day": 21},
            {"name": "Tuần 4", "start_day": 22, "end_day": 31}  # Sẽ xử lý riêng cho tháng ngắn
        ]
        
        for week_def in week_definitions:
            week_num = week_def["name"].replace("Tuần ", "")
            
            # Tính ngày bắt đầu tuần
            week_start_day = min(week_def["start_day"], last_day_of_month.day)
            week_start = date(today.year, today.month, week_start_day)
            
            # Tính ngày kết thúc tuần
            week_end_day = min(week_def["end_day"], last_day_of_month.day)
            week_end = date(today.year, today.month, week_end_day)
            
            # Đảm bảo không tính tương lai
            if week_start > today:
                # Tuần này chưa đến
                week_revenue = 0
                week_end = week_start  # Để tránh lỗi logic
            else:
                # Tuần kết thúc không được sau hôm nay
                if week_end > today:
                    week_end = today
                
                # Đảm bảo tuần hợp lệ
                if week_start <= week_end:
                    # Query doanh thu trong tuần
                    week_revenue = db.query(
                        func.coalesce(func.sum(Reservation.total_amount), 0)
                    ).filter(
                        Reservation.status.in_(['confirmed', 'completed']),
                        func.date(Reservation.created_at).between(week_start, week_end)
                    ).scalar() or 0
                else:
                    week_revenue = 0
                    week_end = week_start  # Tránh lỗi format
            
            # Tính phần trăm trong tháng
            month_revenue_query = db.query(
                func.coalesce(func.sum(Reservation.total_amount), 0)
            ).filter(
                Reservation.status.in_(['confirmed', 'completed']),
                func.extract('month', Reservation.created_at) == today.month,
                func.extract('year', Reservation.created_at) == today.year
            ).scalar() or 0
            
            percentage = (float(week_revenue) / float(month_revenue_query) * 100) if month_revenue_query > 0 else 0
            
            weeks_data.append({
                "week_number": int(week_num),
                "period": f"{week_start.strftime('%d/%m')} - {week_end.strftime('%d/%m')}",
                "start_date": week_start.isoformat(),
                "end_date": week_end.isoformat(),
                "revenue": float(week_revenue),
                "percentage": round(percentage, 2)
            })
        
        # Tổng doanh thu tháng
        total_month_revenue = sum(week["revenue"] for week in weeks_data)
        
        return {
            "month": today.strftime("%Y-%m"),
            "month_name": today.strftime("%B %Y"),
            "weeks": weeks_data,
            "total_month_revenue": total_month_revenue,
            "total_weeks": len([w for w in weeks_data if w["revenue"] > 0])  # Chỉ đếm tuần có doanh thu
        }
        
    except Exception as e:
        logger.error(f"Error in get_monthly_revenue: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# ==================== WEEKLY TICKETS ====================

@router.get("/weekly-tickets")
def get_weekly_tickets_simple(db: Session = Depends(get_db)):
    """
    Thống kê tổng số vé bán được trong 1 tuần (7 ngày gần nhất)
    Trả về đơn giản: danh sách các ngày với tickets_sold và revenue
    """
    try:
        today = date.today()
        week_ago = today - timedelta(days=6)  # 7 ngày gần nhất
        
        # Tên thứ tiếng Việt
        day_names = {
            0: "Thứ Hai",
            1: "Thứ Ba", 
            2: "Thứ Tư",
            3: "Thứ Năm",
            4: "Thứ Sáu",
            5: "Thứ Bảy",
            6: "Chủ Nhật"
        }
        
        tickets_data = []
        
        # Tạo danh sách 7 ngày
        for i in range(7):
            current_date = week_ago + timedelta(days=i)
            day_index = current_date.weekday()  # 0=Monday, 6=Sunday
            
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
            
            tickets_data.append({
                "date": current_date.isoformat(),
                "date_formatted": current_date.strftime("%d/%m"),
                "day_of_week": day_names[day_index],
                "day_number": day_index + 1,  # Thứ 2=1, Chủ nhật=7
                "tickets_sold": tickets_sold,
                "revenue": float(day_revenue)
            })
        
        # CHỈ TRẢ VỀ DANH SÁCH ĐƠN GIẢN
        return tickets_data
        
    except Exception as e:
        logger.error(f"Error in get_weekly_tickets_simple: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

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