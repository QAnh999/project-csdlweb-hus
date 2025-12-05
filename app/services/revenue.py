from sqlalchemy.orm import Session
from datetime import date
from app.models.daily_stats import DailyStats
from fastapi import HTTPException


class RevenueService:

    def get_daily_revenue(self, db: Session, stat_date: date):
        """Trả về thống kê doanh thu theo ngày"""
        stat = db.query(DailyStats).filter(
            DailyStats.stat_date == stat_date
        ).first()

        if not stat:
            raise HTTPException(404, "No revenue data for this date")

        return {
            "date": stat_date,
            "total_revenue": float(stat.total_revenue),
            "tickets_sold": stat.tickets_sold,
            "completed_flights": stat.completed_flights,
            "active_flights": stat.active_flights,
            "cancelled_flights": stat.cancelled_flights,

            "compare_with_previous_day": {
                "prev_revenue": float(stat.prev_revenue),
                "prev_tickets_sold": stat.prev_tickets_sold,
                "prev_completed_flights": stat.prev_completed_flights,
                "prev_active_flights": stat.prev_active_flights,
                "prev_cancelled_flights": stat.prev_cancelled_flights
            }
        }


revenue_service = RevenueService()
