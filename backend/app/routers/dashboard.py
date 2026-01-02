from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from datetime import date, timedelta, datetime
from ..database import get_db
from .. import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def dashboard_general(db: Session = Depends(get_db)):
    today = date.today()
    # 1. Thống kê chung
    active_flights = db.query(func.count(models.Flight.id)).filter(models.Flight.status == 'active').scalar() or 0
    completed_flights = db.query(func.count(models.Flight.id)).filter(models.Flight.status == 'completed').scalar() or 0
    revenue_today = db.query(func.sum(models.Reservation.total_amount)).filter(func.date(models.Reservation.created_at) == today).scalar() or 0
    new_users = db.query(func.count(models.User.id)).filter(func.date(models.User.created_at) == today).scalar() or 0

    return {
        "active_flights": active_flights,
        "completed_flights": completed_flights,
        "revenue_today": revenue_today,
        "new_users_today": new_users
    }

@router.get("/revenue-stats")
def revenue_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    # 1. Thống kê theo tuần (7 ngày qua, trả về Thứ)
    # Lưu ý: extract('dow', ...) trả về 0=Chủ nhật, 1=Thứ 2...
    week_start = today - timedelta(days=6)
    week_data = db.query(
        extract('dow', models.Reservation.created_at).label('dow'),
        func.sum(models.Reservation.total_amount).label('rev')
    ).filter(func.date(models.Reservation.created_at) >= week_start)\
     .group_by('dow').all()
    
    # Map số sang tên Thứ
    days_map = {0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday"}
    weekly_result = {days_map[int(r.dow)]: r.rev for r in week_data}

    # 2. Thống kê 1 tháng gần nhất (Chia làm 4 tuần)
    # Logic đơn giản: Chia 30 ngày thành 4 khoảng
    month_start = today - timedelta(days=28)
    month_data = db.query(models.Reservation.created_at, models.Reservation.total_amount)\
        .filter(func.date(models.Reservation.created_at) >= month_start).all()
        
    weeks = {"Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0}
    for item in month_data:
        day_diff = (item.created_at.date() - month_start).days
        if day_diff < 7: weeks["Week 1"] += item.total_amount
        elif day_diff < 14: weeks["Week 2"] += item.total_amount
        elif day_diff < 21: weeks["Week 3"] += item.total_amount
        else: weeks["Week 4"] += item.total_amount

    return {"weekly_revenue_by_day": weekly_result, "monthly_revenue_by_week": weeks}

@router.get("/ticket-sales")
def ticket_sales(db: Session = Depends(get_db)):
    # 7 ngày gần nhất: Ngày tháng năm và doanh thu
    today = date.today()
    start_date = today - timedelta(days=6)
    
    results = db.query(
        func.date(models.Reservation.created_at).label('date'),
        func.sum(models.Reservation.total_amount).label('revenue')
    ).filter(func.date(models.Reservation.created_at) >= start_date)\
     .group_by(func.date(models.Reservation.created_at))\
     .order_by(func.date(models.Reservation.created_at)).all()
     
    return [{"date": r.date.strftime("%d/%m/%Y"), "revenue": r.revenue} for r in results]

@router.get("/top-bookings")
def top_bookings(db: Session = Depends(get_db)):
    bookings = db.query(models.Reservation).order_by(models.Reservation.created_at.desc()).limit(3).all()
    res = []
    for b in bookings:
        user_name = f"{b.user.last_name} {b.user.first_name}" if b.user else b.passenger_name
        res.append({
            "user_name": user_name,
            "booking_id": b.reservation_code,
            "flight_number": b.flight.flight_number if b.flight else "N/A",
            "time": b.created_at.strftime("%H:%M"),
            "status": b.status
        })
    return res

@router.get("/popular-routes")
def popular_routes(db: Session = Depends(get_db)):
    # Top 5 tuyến bay
    # Cần join Airport 2 lần (Đi và Đến)
    from sqlalchemy.orm import aliased
    A1 = aliased(models.Airport)
    A2 = aliased(models.Airport)
    
    data = db.query(A1.city, A2.city, func.count(models.Reservation.id).label('cnt'))\
        .join(models.Flight, models.Reservation.main_flight_id == models.Flight.id)\
        .join(A1, models.Flight.dep_airport == A1.id)\
        .join(A2, models.Flight.arr_airport == A2.id)\
        .group_by(A1.city, A2.city)\
        .order_by(desc('cnt')).limit(5).all()
        
    return [{"route": f"{r[0]} - {r[1]}", "count": r[2]} for r in data]

@router.get("/popular-airlines")
def popular_airlines(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Reservation.id)).scalar() or 1
    data = db.query(models.Airline.name, func.count(models.Reservation.id))\
        .outerjoin(models.Flight, models.Airline.id == models.Flight.id_airline)\
        .outerjoin(models.Reservation, models.Flight.id == models.Reservation.main_flight_id)\
        .group_by(models.Airline.name).all()
        
    return [{"airline": r[0], "popularity": round((r[1]/total)*100, 2)} for r in data]