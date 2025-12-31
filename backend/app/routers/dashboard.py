from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import date, timedelta
from .. import models
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def dashboard_stats(target_date: date = Query(default=date.today()), db: AsyncSession = Depends(get_db)):
    # 1. Active Flights
    q_active = select(func.count(models.Flight.id)).where(models.Flight.status.in_(['scheduled', 'boarding', 'departed']))
    active = (await db.execute(q_active)).scalar() or 0
    
    # 2. Cancelled Flights
    q_cancelled = select(func.count(models.Flight.id)).where(models.Flight.status == 'cancelled')
    cancelled = (await db.execute(q_cancelled)).scalar() or 0
    
    # 3. Revenue
    q_rev = select(func.sum(models.Reservation.total_amount))\
            .where(func.date(models.Reservation.created_at) == target_date)\
            .where(models.Reservation.status.in_(['confirmed', 'completed']))
    revenue = (await db.execute(q_rev)).scalar() or 0

    return {"active_flights": active, "cancelled_flights": cancelled, "revenue": revenue, "date": target_date}

@router.get("/weekly-revenue")
async def weekly_revenue(db: AsyncSession = Depends(get_db)):
    start_date = date.today() - timedelta(days=7)
    stmt = select(func.date(models.Reservation.created_at).label("d"), func.sum(models.Reservation.total_amount))\
           .where(models.Reservation.created_at >= start_date, models.Reservation.status.in_(['confirmed', 'completed']))\
           .group_by(func.date(models.Reservation.created_at))
    
    results = (await db.execute(stmt)).all()
    return [{"date": r[0], "total": r[1]} for r in results]

@router.get("/weekly-tickets")
async def weekly_tickets(db: AsyncSession = Depends(get_db)):
    start_date = date.today() - timedelta(days=7)
    stmt = select(func.date(models.Ticket.issue_date).label("d"), func.count(models.Ticket.id))\
           .where(models.Ticket.issue_date >= start_date, models.Ticket.status == 'active')\
           .group_by(func.date(models.Ticket.issue_date))
    
    results = (await db.execute(stmt)).all()
    return [{"date": r[0], "count": r[1]} for r in results]

@router.get("/top-users")
async def top_users(db: AsyncSession = Depends(get_db)):
    # Cần eager load user và flight để tránh lỗi lazy load trong async
    from sqlalchemy.orm import selectinload
    stmt = select(models.Reservation)\
           .options(selectinload(models.Reservation.user), selectinload(models.Reservation.flight))\
           .order_by(models.Reservation.created_at.desc()).limit(3)
    
    bookings = (await db.execute(stmt)).scalars().all()
    
    return [{
        "user": b.user.first_name if b.user else "Unknown",
        "booking_id": b.reservation_code,
        "flight": b.flight.flight_number if b.flight else "N/A"
    } for b in bookings]

@router.get("/popular-routes")
async def popular_routes(db: AsyncSession = Depends(get_db)):
    stmt = select(models.Flight.dep_airport, models.Flight.arr_airport, func.count(models.Reservation.id).label("c"))\
           .join(models.Reservation, models.Reservation.main_flight_id == models.Flight.id)\
           .group_by(models.Flight.dep_airport, models.Flight.arr_airport)\
           .order_by(desc("c")).limit(5)
    
    results = (await db.execute(stmt)).all()
    return [{"dep": r[0], "arr": r[1], "bookings": r[2]} for r in results]