from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from .. import models, database, auth, schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# 1. Overview (Dùng bảng DailyStats để lấy số liệu nhanh)
@router.get("/overview", dependencies=[Depends(auth.check_role(["Admin", "Super Admin"]))])
async def get_overview(db: AsyncSession = Depends(database.get_db)):
    # Lấy bản ghi DailyStats mới nhất
    result = await db.execute(select(models.DailyStats).order_by(desc(models.DailyStats.stat_date)).limit(1))
    stats = result.scalars().first()
    
    if not stats:
        # Trả về data mặc định nếu chưa có thống kê
        return {
            "completedFlights": 0, "activeFlights": 0, "cancelledFlights": 0,
            "totalRevenue": 0, "ticketsSold": 0,
            "growthRates": {"revenue": 0, "bookings": 0}
        }

    # Tính tỉ lệ tăng trưởng giả định (hoặc lấy từ DB nếu đã tính sẵn)
    growth_revenue = 0
    if stats.prev_revenue > 0:
        growth_revenue = ((stats.total_revenue - stats.prev_revenue) / stats.prev_revenue) * 100

    return {
        "completedFlights": stats.completed_flights,
        "activeFlights": stats.active_flights,
        "cancelledFlights": stats.cancelled_flights,
        "totalRevenue": stats.total_revenue,
        "ticketsSold": stats.tickets_sold,
        "growthRates": {
            "revenue": round(growth_revenue, 2),
            "bookings": 5.0 # Ví dụ
        },
        "popularAirlines": ["Vietnam Airlines", "Bamboo"], # Mock hoặc query thêm
        "topRoutes": ["HAN-SGN", "DAD-HPH"]
    }

# 2. Tickets Sold (Chart cột)
@router.get("/ticketsold", dependencies=[Depends(auth.check_role(["Admin", "Super Admin"]))])
async def get_tickets_sold_chart(db: AsyncSession = Depends(database.get_db)):
    # Lấy 7 ngày gần nhất
    result = await db.execute(select(models.DailyStats).order_by(desc(models.DailyStats.stat_date)).limit(7))
    stats = result.scalars().all()
    # Format lại dữ liệu cho Frontend vẽ biểu đồ
    return [{"date": s.stat_date, "count": s.tickets_sold} for s in stats]

# 3. Revenue (Chart đường)
@router.get("/revenue", dependencies=[Depends(auth.check_role(["Admin", "Super Admin"]))])
async def get_revenue_chart(range: str = "week", db: AsyncSession = Depends(database.get_db)):
    limit_days = 30 if range == "month" else 7
    result = await db.execute(select(models.DailyStats).order_by(desc(models.DailyStats.stat_date)).limit(limit_days))
    stats = result.scalars().all()
    return [{"date": s.stat_date, "amount": s.total_revenue} for s in stats]