from sqlalchemy.orm import Session
from typing import Optional
from models import Ticket
from repositories.base import BaseRepository
from schemas.ticket import TicketCreate, TicketUpdate

class TicketRepository(BaseRepository[Ticket, TicketCreate, TicketUpdate]):

    def __init__(self):
        super().__init__(Ticket)

    def get_by_ticket_number(self, db: Session, ticket_number: int) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()
    
    def get_by_reservation_detail_id(self, db: Session, reservation_detail_id: int) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.reservation_detail_id == reservation_detail_id).first()

ticket_repository = TicketRepository()

