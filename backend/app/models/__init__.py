from .airline import Airline
from .airport import Airport
from .service import Service
from .aircraft import Aircraft
from .user import User
from .seat import Seat
from .passenger import Passenger
from .flight import Flight
from .reservation import Reservation
from .reservation_detail import ReservationDetail
from .payment import Payment
from .invoice import Invoice
from .booked_seat import BookedSeat
from .reservation_service import ReservationService
from .ticket import Ticket

from sqlalchemy.orm import configure_mappers
configure_mappers()

__all__ = [
    "Airline", "Airport", "Service",
    "Aircraft", "User",
    "Seat", "Passenger",
    "Flight",
    "Reservation",
    "ReservationDetail", "Payment", "Invoice", "BookedSeat",
    "ReservationService", "Ticket"
]


from sqlalchemy.orm import configure_mappers
configure_mappers()