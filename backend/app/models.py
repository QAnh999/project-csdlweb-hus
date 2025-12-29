from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Date, Numeric, Text, CheckConstraint, PrimaryKeyConstraint
)
from sqlalchemy.orm import relationship
from .database import Base

# --- 1. CORE SYSTEM (Airlines, Airports, Aircrafts) ---

class Airline(Base):
    __tablename__ = "airlines"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=False, unique=True)
    logo_url = Column(String)
    contact_email = Column(String)
    phone = Column(String)
    website = Column(String)

    # Quan hệ ngược để truy vấn từ Airline ra Aircraft/Flight
    aircrafts = relationship("Aircraft", back_populates="airline")
    flights = relationship("Flight", back_populates="airline")
    reviews = relationship("Review", back_populates="airline")


class Airport(Base):
    __tablename__ = "airports"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    iata = Column(String, unique=True)
    icao = Column(String, unique=True)

    # Không cần relationship ngược ở đây nếu không thực sự cần thiết để tránh loop


class Aircraft(Base):
    __tablename__ = "aircrafts"
    id = Column(Integer, primary_key=True)
    model = Column(String, nullable=False)
    manufacturer = Column(String)
    capacity_economy = Column(Integer, nullable=False)
    capacity_business = Column(Integer, default=0)
    capacity_first = Column(Integer, default=0)
    # total_capacity là cột generated trong SQL, SQLAlchemy thường chỉ đọc cột này
    id_airline = Column(Integer, ForeignKey("airlines.id"), nullable=False)

    airline = relationship("Airline", back_populates="aircrafts")
    seats = relationship("Seat", back_populates="aircraft")
    flights = relationship("Flight", back_populates="aircraft")


class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    seat_number = Column(String, nullable=False)
    seat_class = Column(String, nullable=False)
    seat_type = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)

    aircraft = relationship("Aircraft", back_populates="seats")
    # Relationship tới Booked_Seats
    booked_infos = relationship("BookedSeat", back_populates="seat")


# --- 2. USERS & PASSENGERS ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String)
    date_of_birth = Column(Date)
    gender = Column(String)
    created_at = Column(DateTime)
    last_login = Column(DateTime)

    passengers = relationship("Passenger", back_populates="user")
    reservations = relationship("Reservation", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Passenger(Base):
    __tablename__ = "passengers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String)
    nationality = Column(String)
    passport_number = Column(String, unique=True)
    passport_expiry = Column(Date)
    identify_number = Column(String)
    passenger_type = Column(String, default='adult')

    user = relationship("User", back_populates="passengers")
    reservation_details = relationship("ReservationDetail", back_populates="passenger")


# --- 3. FLIGHTS & OPERATIONS (Phần phức tạp nhất) ---

class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True)
    flight_number = Column(String, nullable=False)
    id_airline = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    
    # Hai khóa ngoại cùng trỏ về Airports
    dep_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    arr_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    
    dep_datetime = Column(DateTime, nullable=False)
    arr_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    base_price_economy = Column(Numeric(12, 2), nullable=False)
    base_price_business = Column(Numeric(12, 2))
    base_price_first = Column(Numeric(12, 2))
    
    status = Column(String, default='scheduled')
    gate = Column(String)
    terminal = Column(String)

    # Relationships: Chỉ định rõ foreign_keys để SQLAlchemy không bị nhầm
    airline = relationship("Airline", back_populates="flights")
    aircraft = relationship("Aircraft", back_populates="flights")
    
    departure_airport = relationship("Airport", foreign_keys=[dep_airport])
    arrival_airport = relationship("Airport", foreign_keys=[arr_airport])

    # Quan hệ tới các bảng Booking
    booked_seats = relationship("BookedSeat", back_populates="flight")
    reservation_details = relationship("ReservationDetail", back_populates="flight")
    reviews = relationship("Review", back_populates="flight")


# --- 4. RESERVATIONS & BOOKING ---

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True)
    reservation_code = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Hai khóa ngoại trỏ về Flights
    main_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    return_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    
    total_passengers = Column(Integer, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=0)
    status = Column(String, default='pending')
    created_at = Column(DateTime)
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="reservations")
    
    main_flight = relationship("Flight", foreign_keys=[main_flight_id])
    return_flight = relationship("Flight", foreign_keys=[return_flight_id])
    
    # Một Reservation có nhiều chi tiết (mỗi hành khách 1 dòng)
    details = relationship("ReservationDetail", back_populates="reservation")
    payment = relationship("Payment", back_populates="reservation", uselist=False)
    invoice = relationship("Invoice", back_populates="reservation", uselist=False)


class BookedSeat(Base):
    __tablename__ = "booked_seats"
    # Khóa chính phức hợp
    id_seat = Column(Integer, ForeignKey("seats.id"), primary_key=True)
    id_flight = Column(Integer, ForeignKey("flights.id"), primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    booked_at = Column(DateTime)

    seat = relationship("Seat", back_populates="booked_infos")
    flight = relationship("Flight", back_populates="booked_seats")
    reservation = relationship("Reservation")


class ReservationDetail(Base):
    __tablename__ = "reservation_details"
    id = Column(Integer, primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
    
    total_fare = Column(Numeric(10, 2), nullable=False)
    checkin_status = Column(String, default='not_checked_in')
    boarding_pass_code = Column(String, unique=True)

    reservation = relationship("Reservation", back_populates="details")
    passenger = relationship("Passenger", back_populates="reservation_details")
    flight = relationship("Flight", back_populates="reservation_details")
    seat = relationship("Seat")
    
    ticket = relationship("Ticket", back_populates="reservation_detail", uselist=False)


class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    ticket_number = Column(String, unique=True, nullable=False)
    reservation_detail_id = Column(Integer, ForeignKey("reservation_details.id"), nullable=False)
    status = Column(String, default='active')
    qr_code_url = Column(String)

    reservation_detail = relationship("ReservationDetail", back_populates="ticket")


# --- 5. FINANCE & SERVICES ---

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    payment_method = Column(String, nullable=False)
    transaction_id = Column(String, unique=True)
    status = Column(String, default='pending')
    
    reservation = relationship("Reservation", back_populates="payment")


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True)
    invoice_number = Column(String, unique=True, nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String, default='unpaid')

    reservation = relationship("Reservation", back_populates="invoice")
    user = relationship("User", back_populates="invoices")


# --- 6. STAFF & REVIEWS & STATS ---

class Staff(Base):
    __tablename__ = "staff"
    admin_id = Column(Integer, primary_key=True)
    admin_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String)
    email = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar = Column(String)


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    rating_overall = Column(Integer)
    comment_text = Column(Text)
    comment_date = Column(DateTime)

    user = relationship("User", back_populates="reviews")
    flight = relationship("Flight", back_populates="reviews")
    airline = relationship("Airline", back_populates="reviews")


class DailyStats(Base):
    __tablename__ = "daily_stats"
    id = Column(Integer, primary_key=True)
    stat_date = Column(Date, unique=True, nullable=False)
    completed_flights = Column(Integer, default=0)
    active_flights = Column(Integer, default=0)
    cancelled_flights = Column(Integer, default=0)
    total_revenue = Column(Numeric(12, 2), default=0)
    tickets_sold = Column(Integer, default=0)
    prev_completed_flights = Column(Integer, default=0)
    prev_active_flights = Column(Integer, default=0)
    prev_cancelled_flights = Column(Integer, default=0)
    prev_revenue = Column(Numeric(12, 2), default=0)
    prev_tickets_sold = Column(Integer, default=0)