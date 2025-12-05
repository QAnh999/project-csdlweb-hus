from sqlalchemy.orm import Session
from datetime import date
from app.models.flight_statistics import FlightStatistics
from fastapi import HTTPException


class FlightStatisticsService:

    def get_daily_flight_stats(self, db: Session, statistic_date: date):
        """Lấy thống kê tất cả chuyến bay trong ngày"""
        stats = db.query(FlightStatistics).filter(
            FlightStatistics.statistic_date == statistic_date
        ).all()

        if not stats:
            raise HTTPException(404, "No flight statistics for this date")

        total_bookings = sum(s.total_bookings for s in stats)
        total_revenue = sum(s.total_revenue for s in stats)

        avg_load_factor = (
            sum(s.occupancy_rate for s in stats) / len(stats)
            if len(stats) > 0 else 0
        )

        avg_ticket_price = (
            total_revenue / total_bookings
            if total_bookings > 0 else 0
        )

        return {
            "date": statistic_date,
            "total_bookings": total_bookings,
            "total_revenue": float(total_revenue),
            "avg_load_factor": float(avg_load_factor),
            "avg_ticket_price": float(avg_ticket_price),
            "flights_count": len(stats)
        }


flight_statistics_service = FlightStatisticsService()
