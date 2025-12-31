from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text, Numeric, func
from sqlalchemy.orm import relationship
from .database import Base

# --- USER & STAFF ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    reservations = relationship("Reservation", back_populates="user")

class Staff(Base):
    __tablename__ = "staff"
    admin_id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String)
    password = Column(String)
    full_name = Column(String)
    role = Column(String)
    email = Column(String)
    is_active = Column(Boolean, default=True)

# --- FLIGHTS ---
class Airline(Base):
    __tablename__ = "airlines"
    id = Column(Integer, primary_key=True)
    name = Column(String)

class Airport(Base):
    __tablename__ = "airports"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    city = Column(String)

class Aircraft(Base):
    __tablename__ = "aircrafts"
    id = Column(Integer, primary_key=True)
    model = Column(String)

class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String)
    id_airline = Column(Integer, ForeignKey("airlines.id"))
    id_aircraft = Column(Integer, ForeignKey("aircrafts.id"))
    dep_airport = Column(Integer, ForeignKey("airports.id"))
    arr_airport = Column(Integer, ForeignKey("airports.id"))
    dep_datetime = Column(DateTime)
    arr_datetime = Column(DateTime)
    status = Column(String)
    available_seats_economy = Column(Integer)
    available_seats_business = Column(Integer)
    
    # Quan hệ (dùng lazy='selectin' nếu cần query nhanh trong async)
    reservations = relationship("Reservation", back_populates="flight")

# --- BOOKING ---
class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True)
    reservation_code = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    main_flight_id = Column(Integer, ForeignKey("flights.id"))
    total_amount = Column(Numeric(12, 2))
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reservations")
    flight = relationship("Flight", back_populates="reservations")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    ticket_number = Column(String)
    issue_date = Column(DateTime, server_default=func.now())
    status = Column(String) 

# --- SERVICE & FEEDBACK ---
class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    base_price = Column(Numeric(10, 2))

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating_overall = Column(Integer)
    comment_text = Column(Text)
    user = relationship("User")

class Promotion(Base):
    __tablename__ = "promotions"
    id = Column(Integer, primary_key=True)
    code = Column(String)
    name = Column(String)
    description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean)
    discount_value = Column(Numeric(10, 2))