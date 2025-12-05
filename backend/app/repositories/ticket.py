from sqlalchemy.orm import Session
from typing import Optional
from app.models.ticket import Ticket
from repositories.base import BaseRepository
from app.schemas.tickets import TicketCreate, TicketUpdate

class TicketRepository(BaseRepository[Ticket, TicketCreate, TicketUpdate]):

    def __init__(self):
        super().__init__(Ticket)

    def get_by_ticket_number(self, db: Session, ticket_number: int) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()
    

ticket_repository = TicketRepository()

