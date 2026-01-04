from enum import Enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Date, DECIMAL, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime

# =========================
# 1. BASE TABLES
# =========================

class Airline(Base):
    __tablename__ = "airlines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    logo_url = Column(String(500))
    contact_email = Column(String(255))
    phone = Column(String(20))
    website = Column(String(255))
    
    # Relationships
    aircrafts = relationship("Aircraft", back_populates="airline")
    flights = relationship("Flight", back_populates="airline")

class Airport(Base):
    __tablename__ = "airports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    iata = Column(String(3), unique=True)
    icao = Column(String(4), unique=True)
    
    # Relationships
    departure_flights = relationship("Flight", foreign_keys="Flight.dep_airport", back_populates="departure_airport")
    arrival_flights = relationship("Flight", foreign_keys="Flight.arr_airport", back_populates="arrival_airport")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    gender = Column(String(10))
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted_at = Column(DateTime)
    last_login = Column(DateTime)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="user")
    passengers = relationship("Passenger", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    promotion_usages = relationship("PromotionUsage", back_populates="user")

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"
    DELETED = "deleted"

class Staff(Base):
    __tablename__ = "staff"
    
    admin_id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20))
    email = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    avatar = Column(String(255))
    status = Column(String(20), default='work')
    
    # Relationships
    revenue_reports = relationship("RevenueReport", back_populates="generator")

class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    discount_type = Column(String(20), nullable=False)
    discount_value = Column(DECIMAL(10,2), nullable=False)
    min_order_amount = Column(DECIMAL(10,2), default=0)
    max_discount_amount = Column(DECIMAL(10,2))
    usage_limit = Column(Integer)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    promotion_usages = relationship("PromotionUsage", back_populates="promotion")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    base_price = Column(DECIMAL(10,2), nullable=False)
    is_available = Column(Boolean, default=True)
    
    # Relationships
    reservation_services = relationship("ReservationService", back_populates="service")

# =========================
# 2. AIRCRAFT & SEATS
# =========================

class Aircraft(Base):
    __tablename__ = "aircrafts"
    
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String(100), nullable=False)
    manufacturer = Column(String(100))
    capacity_economy = Column(Integer, nullable=False)
    capacity_business = Column(Integer, default=0)
    capacity_first = Column(Integer, default=0)
    total_capacity = Column(Integer)
    id_airline = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    
    __table_args__ = (
        CheckConstraint('capacity_economy >= 0', name='check_capacity_economy'),
        CheckConstraint('capacity_business >= 0', name='check_capacity_business'),
        CheckConstraint('capacity_first >= 0', name='check_capacity_first'),
    )
    
    # Relationships
    airline = relationship("Airline", back_populates="aircrafts")
    seats = relationship("Seat", back_populates="aircraft")
    flights = relationship("Flight", back_populates="aircraft")

class Seat(Base):
    __tablename__ = "seats"
    
    id = Column(Integer, primary_key=True, index=True)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    seat_class = Column(String(20), nullable=False)
    seat_type = Column(String(50), nullable=False)
    price_surcharge = Column(DECIMAL(10,2), default=0)
    
    __table_args__ = (
        CheckConstraint("seat_class IN ('economy', 'business', 'first')", name='check_seat_class'),
        CheckConstraint("seat_type IN ('window', 'aisle', 'middle', 'emergency')", name='check_seat_type'),
        UniqueConstraint('id_aircraft', 'seat_number', name='unique_seat_per_aircraft'),
    )
    
    # Relationships
    aircraft = relationship("Aircraft", back_populates="seats")
    booked_seats = relationship("BookedSeat", back_populates="seat")
    reservation_details = relationship("ReservationDetail", back_populates="seat")

# =========================
# 3. FLIGHTS
# =========================

class Flight(Base):
    __tablename__ = "flights"
    
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(20), nullable=False)
    id_airline = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"), nullable=False)
    dep_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    arr_airport = Column(Integer, ForeignKey("airports.id"), nullable=False)
    dep_datetime = Column(DateTime, nullable=False)
    arr_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    base_price_economy = Column(DECIMAL(12,2), nullable=False)
    base_price_business = Column(DECIMAL(12,2))
    base_price_first = Column(DECIMAL(12,2))
    
    luggage_fee_per_kg = Column(DECIMAL(10,2), default=0)
    free_luggage_weight = Column(DECIMAL(5,2), default=20)
    overweight_fee_per_kg = Column(DECIMAL(10,2), default=0)
    
    total_seats = Column(Integer, nullable=False)
    available_seats_economy = Column(Integer, nullable=False)
    available_seats_business = Column(Integer, default=0)
    available_seats_first = Column(Integer, default=0)
    
    status = Column(String(20), default='scheduled')
    gate = Column(String(10))
    terminal = Column(String(10))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        CheckConstraint("status IN ('scheduled','boarding','departed','arrived','cancelled','delayed','deleted')", name='check_flight_status'),
        CheckConstraint('arr_datetime > dep_datetime', name='chk_valid_dates'),
    )
    
    # Relationships
    airline = relationship("Airline", back_populates="flights")
    aircraft = relationship("Aircraft", back_populates="flights")
    departure_airport = relationship("Airport", foreign_keys=[dep_airport], back_populates="departure_flights")
    arrival_airport = relationship("Airport", foreign_keys=[arr_airport], back_populates="arrival_flights")
    main_reservations = relationship("Reservation", foreign_keys="Reservation.main_flight_id", back_populates="main_flight")
    return_reservations = relationship("Reservation", foreign_keys="Reservation.return_flight_id", back_populates="return_flight")
    booked_seats = relationship("BookedSeat", back_populates="flight")
    reservation_details = relationship("ReservationDetail", back_populates="flight")
    reviews = relationship("Review", back_populates="flight")
    flight_statistics = relationship("FlightStatistic", back_populates="flight")

# =========================
# 4. PASSENGERS
# =========================

class Passenger(Base):
    __tablename__ = "passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10))
    nationality = Column(String(100))
    passport_number = Column(String(50), unique=True)
    passport_expiry = Column(Date)
    identify_number = Column(String(50))
    passenger_type = Column(String(20), default='adult')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        CheckConstraint("passenger_type IN ('adult','child','infant')", name='check_passenger_type'),
    )
    
    # Relationships
    user = relationship("User", back_populates="passengers")
    reservation_passengers = relationship("ReservationPassenger", back_populates="passenger")
    reservation_details = relationship("ReservationDetail", back_populates="passenger")

# =========================
# 5. RESERVATIONS
# =========================

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_code = Column(String(20), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    main_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    return_flight_id = Column(Integer, ForeignKey("flights.id"))
    total_passengers = Column(Integer, nullable=False)
    total_amount = Column(DECIMAL(12,2), nullable=False)
    paid_amount = Column(DECIMAL(12,2), default=0)
    discount_amount = Column(DECIMAL(10,2), default=0)
    tax_amount = Column(DECIMAL(10,2), default=0)
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    expires_at = Column(DateTime)
    
    __table_args__ = (
        CheckConstraint("status IN ('pending','confirmed','cancelled','completed')", name='check_reservation_status'),
    )
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    main_flight = relationship("Flight", foreign_keys=[main_flight_id], back_populates="main_reservations")
    return_flight = relationship("Flight", foreign_keys=[return_flight_id], back_populates="return_reservations")
    reservation_passengers = relationship("ReservationPassenger", back_populates="reservation")
    booked_seats = relationship("BookedSeat", back_populates="reservation")
    reservation_details = relationship("ReservationDetail", back_populates="reservation")
    payments = relationship("Payment", back_populates="reservation")
    invoices = relationship("Invoice", back_populates="reservation")
    promotion_usages = relationship("PromotionUsage", back_populates="reservation")

class ReservationPassenger(Base):
    __tablename__ = "reservation_passengers"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    reservation = relationship("Reservation", back_populates="reservation_passengers")
    passenger = relationship("Passenger", back_populates="reservation_passengers")

class BookedSeat(Base):
    __tablename__ = "booked_seats"
    
    id_seat = Column(Integer, ForeignKey("seats.id"), primary_key=True)
    id_flight = Column(Integer, ForeignKey("flights.id"), primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    hold_expires = Column(DateTime)
    booked_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    seat = relationship("Seat", back_populates="booked_seats")
    flight = relationship("Flight", back_populates="booked_seats")
    reservation = relationship("Reservation", back_populates="booked_seats")

# =========================
# 6. RESERVATION DETAILS
# =========================

class ReservationDetail(Base):
    __tablename__ = "reservation_details"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
    
    base_fare = Column(DECIMAL(10,2), nullable=False)
    seat_surcharge = Column(DECIMAL(10,2), default=0)
    luggage_surcharge = Column(DECIMAL(10,2), default=0)
    tax_fare = Column(DECIMAL(10,2), default=0)
    total_fare = Column(DECIMAL(10,2), nullable=False)
    
    luggage_count = Column(Integer, default=0)
    luggage_weight = Column(DECIMAL(5,2), default=0)
    
    checkin_time = Column(DateTime)
    checkin_method = Column(String(20), default='none')
    boarding_pass_code = Column(String(50), unique=True)
    checkin_status = Column(String(20), default='not_checked_in')
    
    __table_args__ = (
        CheckConstraint("checkin_method IN ('none','online','counter')", name='check_checkin_method'),
        CheckConstraint("checkin_status IN ('not_checked_in','checked_in','cancelled')", name='check_checkin_status'),
    )
    
    # Relationships
    reservation = relationship("Reservation", back_populates="reservation_details")
    passenger = relationship("Passenger", back_populates="reservation_details")
    flight = relationship("Flight", back_populates="reservation_details")
    seat = relationship("Seat", back_populates="reservation_details")
    reservation_services = relationship("ReservationService", back_populates="reservation_detail")
    tickets = relationship("Ticket", back_populates="reservation_detail")

class ReservationService(Base):
    __tablename__ = "reservation_services"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_detail_id = Column(Integer, ForeignKey("reservation_details.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(DECIMAL(10,2), nullable=False)
    total_price = Column(DECIMAL(10,2), nullable=False)
    
    # Relationships
    reservation_detail = relationship("ReservationDetail", back_populates="reservation_services")
    service = relationship("Service", back_populates="reservation_services")

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, nullable=False)
    reservation_detail_id = Column(Integer, ForeignKey("reservation_details.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.now)
    status = Column(String(20), default='active')
    qr_code_url = Column(String(255))
    pdf_url = Column(String(255))
    
    __table_args__ = (
        CheckConstraint("status IN ('active','used','refunded','cancelled')", name='check_ticket_status'),
    )
    
    # Relationships
    reservation_detail = relationship("ReservationDetail", back_populates="tickets")

# =========================
# 7. PAYMENTS & INVOICES
# =========================

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_gateway = Column(String(100))
    transaction_id = Column(String(255), unique=True)
    currency = Column(String(3), default='VND')
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    paid_at = Column(DateTime)
    
    __table_args__ = (
        CheckConstraint("payment_method IN ('credit_card','bank_transfer','e_wallet')", name='check_payment_method'),
        CheckConstraint("status IN ('pending','completed','failed','refunded')", name='check_payment_status'),
    )
    
    # Relationships
    reservation = relationship("Reservation", back_populates="payments")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.now)
    due_date = Column(DateTime, nullable=False)
    total_amount = Column(DECIMAL(12,2), nullable=False)
    tax_amount = Column(DECIMAL(10,2), default=0)
    status = Column(String(20), default='unpaid')
    
    __table_args__ = (
        CheckConstraint("status IN ('unpaid','paid','overdue','cancelled')", name='check_invoice_status'),
    )
    
    # Relationships
    reservation = relationship("Reservation", back_populates="invoices")
    user = relationship("User", back_populates="invoices")

# =========================
# 8. PROMOTIONS & REVIEWS
# =========================

class PromotionUsage(Base):
    __tablename__ = "promotion_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    promotion_id = Column(Integer, ForeignKey("promotions.id"), nullable=False)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    discount_amount = Column(DECIMAL(10,2), nullable=False)
    used_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    promotion = relationship("Promotion", back_populates="promotion_usages")
    reservation = relationship("Reservation", back_populates="promotion_usages")
    user = relationship("User", back_populates="promotion_usages")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    rating_overall = Column(Integer, nullable=False)
    rating_comfort = Column(Integer)
    rating_service = Column(Integer)
    rating_punctuality = Column(Integer)
    comment_text = Column(Text)
    comment_date = Column(DateTime, nullable=False)
    
    __table_args__ = (
        CheckConstraint('rating_overall BETWEEN 1 AND 5', name='check_rating_overall'),
        CheckConstraint('rating_comfort BETWEEN 1 AND 5', name='check_rating_comfort'),
        CheckConstraint('rating_service BETWEEN 1 AND 5', name='check_rating_service'),
        CheckConstraint('rating_punctuality BETWEEN 1 AND 5', name='check_rating_punctuality'),
    )
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    flight = relationship("Flight", back_populates="reviews")
    airline = relationship("Airline")

# =========================
# 9. STATISTICS & REPORTS
# =========================

class FlightStatistic(Base):
    __tablename__ = "flight_statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    statistic_date = Column(Date, nullable=False)
    total_bookings = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    occupancy_rate = Column(DECIMAL(5,2), default=0)
    avg_ticket_price = Column(DECIMAL(10,2), default=0)
    
    __table_args__ = (
        UniqueConstraint('flight_id', 'statistic_date', name='unique_flight_date'),
    )
    
    # Relationships
    flight = relationship("Flight", back_populates="flight_statistics")

class RouteStatistic(Base):
    __tablename__ = "route_statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    dep_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    arr_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    statistic_date = Column(Date, nullable=False)
    total_passengers = Column(Integer, default=0)
    total_flights = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    average_load_factor = Column(DECIMAL(5,2), default=0)
    
    __table_args__ = (
        CheckConstraint('dep_airport_id <> arr_airport_id', name='check_different_airports'),
        UniqueConstraint('dep_airport_id', 'arr_airport_id', 'statistic_date', name='unique_route_date'),
    )
    
    # Relationships
    departure_airport = relationship("Airport", foreign_keys=[dep_airport_id])
    arrival_airport = relationship("Airport", foreign_keys=[arr_airport_id])

class DailyStat(Base):
    __tablename__ = "daily_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    stat_date = Column(Date, nullable=False, unique=True)
    completed_flights = Column(Integer, default=0)
    active_flights = Column(Integer, default=0)
    cancelled_flights = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(12,2), default=0)
    tickets_sold = Column(Integer, default=0)
    calculated_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    report_daily_links = relationship("ReportDailyLink", back_populates="daily_stat")

class RevenueReport(Base):
    __tablename__ = "revenue_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(20), nullable=False)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    total_revenue = Column(DECIMAL(12,2), default=0)
    generated_at = Column(DateTime, default=datetime.now)
    generated_by = Column(Integer, ForeignKey("staff.admin_id"))
    is_finalized = Column(Boolean, default=False)
    
    # Relationships
    generator = relationship("Staff", back_populates="revenue_reports")
    report_daily_links = relationship("ReportDailyLink", back_populates="report")

class ReportDailyLink(Base):
    __tablename__ = "report_daily_link"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("revenue_reports.id"), nullable=False)
    daily_stat_id = Column(Integer, ForeignKey("daily_stats.id"), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('report_id', 'daily_stat_id', name='unique_report_daily'),
    )
    
    # Relationships
    report = relationship("RevenueReport", back_populates="report_daily_links")
    daily_stat = relationship("DailyStat", back_populates="report_daily_links")