from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models
from ..database import get_db

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.get("/")
async def list_tickets(db: AsyncSession = Depends(get_db)):
    stmt = select(models.Ticket.ticket_number, models.Ticket.status, models.Ticket.issue_date)
    result = await db.execute(stmt)
    return result.all()