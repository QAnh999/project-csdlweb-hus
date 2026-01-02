from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, case, text
from sqlalchemy.sql import label
from database import get_db
from models import Flight, Reservation, User, Staff, Airline, Airport, DailyStat, Passenger, Review
import schemas
from datetime import datetime, date, timedelta
from typing import List
from decimal import Decimal

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/daily-stats", response_model=schemas.DailyStatsResponse)
def get_daily_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    # 1. Tổng chuyến bay đang hoạt động
    active_flights = db.query(Flight).filter(
        Flight.status.in_(['scheduled', 'boarding', 'departed']),
        func.date(Flight.dep_datetime) == today
    ).count()
    
    # 2. Tổng chuyến bay đã hoàn thành
    completed_flights = db.query(Flight).filter(
        Flight.status == 'arrived',
        func.date(Flight.arr_datetime) == today
    ).count()
    
    # 3. Tổng doanh thu theo ngày
    today_revenue_result = db.query(func.coalesce(func.sum(Reservation.total_amount), 0)).filter(
        func.date(Reservation.created_at) == today,
        Reservation.status.in_(['confirmed', 'completed'])
    ).scalar()
    
    today_revenue = Decimal(str(today_revenue_result)) if today_revenue_result else Decimal('0')
    
    # 4. Người dùng mới
    new_users = db.query(User).filter(
        func.date(User.created_at) == today,
        User.status == 'active'
    ).count()
    
    return {
        "active_flights": active_flights,
        "completed_flights": completed_flights,
        "total_revenue_today": today_revenue,
        "new_users_today": new_users
    }

@router.get("/weekly-revenue", response_model=List[schemas.WeeklyRevenueResponse])
def get_weekly_revenue(db: Session = Depends(get_db)):
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    results = db.query(
        func.to_char(Reservation.created_at, 'Day').label('day_of_week'),
        func.date(Reservation.created_at).label('date'),
        func.coalesce(func.sum(Reservation.total_amount), 0).label('revenue')
    ).filter(
        Reservation.created_at >= week_ago,
        Reservation.created_at <= today,
        Reservation.status.in_(['confirmed', 'completed'])
    ).group_by(
        func.to_char(Reservation.created_at, 'Day'),
        func.date(Reservation.created_at)
    ).order_by(func.date(Reservation.created_at)).all()
    
    response = []
    for r in results:
        response.append({
            "day_of_week": r.day_of_week.strip(),
            "date": r.date,
            "revenue": Decimal(str(r.revenue)) if r.revenue else Decimal('0')
        })
    
    return response

@router.get("/monthly-revenue", response_model=List[schemas.MonthlyRevenueResponse])
def get_monthly_revenue(db: Session = Depends(get_db)):
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    
    results = db.query(
        label('week_number', 
              extract('week', Reservation.created_at) - 
              extract('week', first_day_of_month) + 1),
        func.coalesce(func.sum(Reservation.total_amount), 0).label('revenue')
    ).filter(
        Reservation.created_at >= first_day_of_month,
        Reservation.created_at <= today,
        Reservation.status.in_(['confirmed', 'completed'])
    ).group_by(
        label('week_number', 
              extract('week', Reservation.created_at) - 
              extract('week', first_day_of_month) + 1)
    ).order_by('week_number').all()
    
    response = []
    for r in results:
        response.append({
            "week_number": int(r.week_number),
            "revenue": Decimal(str(r.revenue)) if r.revenue else Decimal('0')
        })
    
    return response

@router.get("/weekly-tickets", response_model=List[schemas.WeeklyTicketsResponse])
def get_weekly_tickets(db: Session = Depends(get_db)):
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    results = db.query(
        func.date(Reservation.created_at).label('date'),
        func.count(Reservation.id).label('tickets_sold'),
        func.coalesce(func.sum(Reservation.total_amount), 0).label('revenue')
    ).filter(
        Reservation.created_at >= week_ago,
        Reservation.created_at <= today,
        Reservation.status.in_(['confirmed', 'completed'])
    ).group_by(func.date(Reservation.created_at)
    ).order_by(func.date(Reservation.created_at)).all()
    
    response = []
    for r in results:
        response.append({
            "date": r.date,
            "tickets_sold": r.tickets_sold,
            "revenue": Decimal(str(r.revenue)) if r.revenue else Decimal('0')
        })
    
    return response

@router.get("/recent-bookings", response_model=List[schemas.RecentBookingResponse])
def get_recent_bookings(db: Session = Depends(get_db)):
    results = db.query(
        User.first_name,
        User.last_name,
        Reservation.id,
        Flight.flight_number,
        Reservation.created_at,
        Reservation.status
    ).join(Reservation, Reservation.user_id == User.id
    ).join(Flight, Reservation.main_flight_id == Flight.id
    ).filter(
        Reservation.status.in_(['pending', 'confirmed'])
    ).order_by(Reservation.created_at.desc()
    ).limit(3).all()
    
    response = []
    for r in results:
        response.append({
            "user_name": f"{r.first_name} {r.last_name}",
            "booking_id": r.id,
            "flight_number": r.flight_number,
            "booking_time": r.created_at.strftime("%H:%M"),
            "status": r.status
        })
    
    return response

@router.get("/popular-routes", response_model=List[schemas.PopularRouteResponse])
def get_popular_routes(db: Session = Depends(get_db)):
    try:
        results = db.query(
            Airport_dep.city.label('departure_city'),
            Airport_arr.city.label('arrival_city'),
            func.count(Reservation.id).label('total_bookings')
        ).select_from(Reservation
        ).join(Flight, Reservation.main_flight_id == Flight.id
        ).join(Airport, alias="Airport_dep", onclause=Flight.dep_airport == Airport_dep.id
        ).join(Airport, alias="Airport_arr", onclause=Flight.arr_airport == Airport_arr.id
        ).filter(
            Reservation.status.in_(['confirmed', 'completed'])
        ).group_by(
            Airport_dep.city,
            Airport_arr.city
        ).order_by(func.count(Reservation.id).desc()
        ).limit(5).all()
        
        response = []
        for r in results:
            response.append({
                "departure_city": r.departure_city,
                "arrival_city": r.arrival_city,
                "total_bookings": r.total_bookings
            })
        
        return response
    except Exception as e:
        # Fallback query đơn giản hơn
        results = db.query(
            Flight.dep_airport,
            Flight.arr_airport,
            func.count(Reservation.id).label('total_bookings')
        ).join(Reservation, Reservation.main_flight_id == Flight.id
        ).filter(
            Reservation.status.in_(['confirmed', 'completed'])
        ).group_by(
            Flight.dep_airport,
            Flight.arr_airport
        ).order_by(func.count(Reservation.id).desc()
        ).limit(5).all()
        
        response = []
        for r in results:
            dep_airport = db.query(Airport).filter(Airport.id == r.dep_airport).first()
            arr_airport = db.query(Airport).filter(Airport.id == r.arr_airport).first()
            
            response.append({
                "departure_city": dep_airport.city if dep_airport else f"Airport {r.dep_airport}",
                "arrival_city": arr_airport.city if arr_airport else f"Airport {r.arr_airport}",
                "total_bookings": r.total_bookings
            })
        
        return response

@router.get("/popular-airlines", response_model=List[schemas.PopularAirlinesResponse])
def get_popular_airlines(db: Session = Depends(get_db)):
    # Đếm tổng số chuyến bay
    total_flights = db.query(Flight).count()
    
    if total_flights == 0:
        return []
    
    results = db.query(
        Airline.name,
        func.count(Flight.id).label('flight_count')
    ).join(Flight, Airline.id == Flight.id_airline
    ).group_by(Airline.id, Airline.name
    ).all()
    
    response = []
    for r in results:
        percentage = (r.flight_count / total_flights) * 100 if total_flights > 0 else 0
        response.append({
            "airline_name": r.name,
            "total_flights": r.flight_count,
            "percentage": round(percentage, 2)
        })
    
    return response