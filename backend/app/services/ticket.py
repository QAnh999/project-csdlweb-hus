from sqlalchemy.orm import Session
from app.repositories.ticket import ticket_repository
from app.models.ticket import Ticket

class TicketService:
    def __init__(self, repository=ticket_repository):
        self.repository = repository

    