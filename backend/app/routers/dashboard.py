from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, or_, case, text
from sqlalchemy.sql import label
from database import get_db
from models import Flight, Reservation, User, Staff, Airline, Airport, DailyStat, Passenger, Review, Payment
import schemas
from datetime import datetime, date, timedelta
from typing import List
from decimal import Decimal
import logging
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)
# routers/dashboard.py
# routers/dashboard.py
@router.get("/daily-stats")
def get_daily_stats(db: Session = Depends(get_db)):
    """
    Thống kê tổng các chuyến bay đang hoạt động, 
    các chuyến bay đã hoàn thành, 
    tổng doanh thu theo ngày (hôm nay), 
    người dùng mới (hôm nay)
    TẤT CẢ TÍNH THEO NGÀY HÔM NAY - THỜI GIAN THỰC
    """
    try:
        # Lấy ngày hôm nay
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        logger.info(f"Calculating daily stats for {today}")
        
        # 1. Tổng chuyến bay đang hoạt động (hôm nay)
        active_flights = db.query(Flight).filter(
            Flight.status.in_(['scheduled', 'boarding', 'departed']),
            Flight.dep_datetime.between(today_start, today_end)
        ).count()
        
        # 2. Chuyến bay đã hoàn thành (hôm nay)
        completed_flights = db.query(Flight).filter(
            Flight.status == 'arrived',
            Flight.arr_datetime.between(today_start, today_end)
        ).count()
        
        # 3. Tổng doanh thu theo ngày (hôm nay)
        # Tính từ Reservation có status='completed' tạo trong ngày hôm nay
        today_revenue = db.query(
            func.coalesce(func.sum(Reservation.total_amount), 0)
        ).filter(
            Reservation.status == 'completed',
            Reservation.created_at.between(today_start, today_end)
        ).scalar() or 0
        
        # 4. Người dùng mới (hôm nay)
        new_users = db.query(User).filter(
            User.created_at.between(today_start, today_end)
        ).count()
        
        return {
            "date": today.isoformat(),
            "stats": {
                "active_flights": active_flights,
                "completed_flights": completed_flights,
                "today_revenue": float(today_revenue),
                "new_users": new_users
                # ĐÃ BỎ debug_info
            }
            # ĐÃ BỎ time_period
        }
        
    except Exception as e:
        logger.error(f"Error in get_daily_stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

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
    """
    Hiển thị top 5 tuyến bay phổ biến nhất
    CHỈ trả về departure_city, arrival_city, percentage
    """
    try:
        # Tạo alias cho Airport
        Airport_dep = aliased(Airport)
        Airport_arr = aliased(Airport)
        # Query 1: Đếm tổng số chuyến bay
        total_flights_query = db.query(func.count(Flight.id)).filter(
            Flight.status != 'deleted'
        )
        total_flights = total_flights_query.scalar()
        
        print(f"Total flights: {total_flights}")
        
        if total_flights == 0 or total_flights is None:
            return []
        
        # Query 2: Lấy top 5 routes với percentage
        # CÁCH 1: Dùng subquery để tính percentage
        route_counts = db.query(
            Airport_dep.city.label('departure_city'),
            Airport_arr.city.label('arrival_city'),
            func.count(Flight.id).label('flight_count')
        ).join(Airport_dep, Flight.dep_airport == Airport_dep.id
        ).join(Airport_arr, Flight.arr_airport == Airport_arr.id
        ).filter(
            Flight.status != 'deleted',
            Airport_dep.city.isnot(None),
            Airport_arr.city.isnot(None)
        ).group_by(
            Airport_dep.city,
            Airport_arr.city,
            Airport_dep.id,
            Airport_arr.id
        ).order_by(func.count(Flight.id).desc()
        ).limit(5).all()
        
        print(f"Found {len(route_counts)} routes")
        
        # Format response với tính toán percentage
        response = []
        for route in route_counts:
            percentage = (route.flight_count / total_flights * 100) if total_flights > 0 else 0
            response.append({
                "departure_city": route.departure_city,
                "arrival_city": route.arrival_city,
                "percentage": round(percentage, 2)
            })
            print(f"Route: {route.departure_city} -> {route.arrival_city}, Count: {route.flight_count}, %: {percentage}")
        
        return response
        
    except Exception as e:
        print(f"Error in popular-routes (method 1): {str(e)}")
        
        # THỬ CÁCH KHÁC: Dùng raw SQL nếu cần
        try:
            sql = """
            SELECT 
                ad.city as departure_city,
                aa.city as arrival_city,
                COUNT(f.id) as flight_count
            FROM flights f
            JOIN airports ad ON f.dep_airport = ad.id
            JOIN airports aa ON f.arr_airport = aa.id
            WHERE f.status != 'deleted'
            GROUP BY ad.city, aa.city, ad.id, aa.id
            ORDER BY flight_count DESC
            LIMIT 5
            """
            
            result = db.execute(sql)
            routes = result.fetchall()
            
            # Đếm lại total flights
            total_sql = "SELECT COUNT(*) FROM flights WHERE status != 'deleted'"
            total_result = db.execute(total_sql)
            total_flights = total_result.scalar()
            
            response = []
            for route in routes:
                percentage = (route.flight_count / total_flights * 100) if total_flights > 0 else 0
                response.append({
                    "departure_city": route.departure_city,
                    "arrival_city": route.arrival_city,
                    "percentage": round(percentage, 2)
                })
            
            return response
            
        except Exception as e2:
            print(f"Error in popular-routes (SQL method): {str(e2)}")
            
            # CÁCH CUỐI: Debug bằng cách in ra dữ liệu thực tế
            try:
                # In ra để debug
                print("\n=== DEBUG INFO ===")
                
                # 1. Kiểm tra flights
                flights = db.query(Flight).filter(Flight.status != 'deleted').all()
                print(f"Total flights in DB: {len(flights)}")
                
                # 2. Kiểm tra airports
                airports = db.query(Airport).all()
                print(f"Total airports in DB: {len(airports)}")
                
                # 3. Kiểm tra một vài flight để xem data
                for i, flight in enumerate(flights[:3]):
                    dep = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
                    arr = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
                    print(f"Flight {i+1}: {dep.city if dep else 'N/A'} -> {arr.city if arr else 'N/A'}")
                
                # 4. Tính thủ công
                route_dict = {}
                for flight in flights:
                    dep = db.query(Airport).filter(Airport.id == flight.dep_airport).first()
                    arr = db.query(Airport).filter(Airport.id == flight.arr_airport).first()
                    
                    if dep and arr:
                        key = f"{dep.city}|{arr.city}"
                        route_dict[key] = route_dict.get(key, 0) + 1
                
                # Sắp xếp và lấy top 5
                sorted_routes = sorted(route_dict.items(), key=lambda x: x[1], reverse=True)[:5]
                
                response = []
                for route_key, count in sorted_routes:
                    dep_city, arr_city = route_key.split("|")
                    percentage = (count / len(flights) * 100) if flights else 0
                    response.append({
                        "departure_city": dep_city,
                        "arrival_city": arr_city,
                        "percentage": round(percentage, 2)
                    })
                
                print(f"Calculated {len(response)} routes from manual calculation")
                return response
                
            except Exception as e3:
                print(f"Error in popular-routes (debug method): {str(e3)}")
                # Trả về rỗng thay vì dữ liệu mẫu
                return []

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