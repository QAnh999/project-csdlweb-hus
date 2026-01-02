from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Numeric, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    reservations = relationship("Reservation", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Staff(Base):
    __tablename__ = "staff"
    admin_id = Column(Integer, primary_key=True, index=True)
    admin_name = Column(String)
    password = Column(String)
    full_name = Column(String)
    role = Column(String) # 'Admin' hoặc 'Super Admin'
    email = Column(String)
    status = Column(String, default="active") # active, deleted

class Airline(Base):
    __tablename__ = "airlines"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    flights = relationship("Flight", back_populates="airline")

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
    status = Column(String, default="scheduled") # active, completed, scheduled, deleted
    available_seats_economy = Column(Integer)
    available_seats_business = Column(Integer)
    
    airline = relationship("Airline", back_populates="flights")
    reservations = relationship("Reservation", back_populates="flight")
    dep_obj = relationship("Airport", foreign_keys=[dep_airport])
    arr_obj = relationship("Airport", foreign_keys=[arr_airport])

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True)
    reservation_code = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    main_flight_id = Column(Integer, ForeignKey("flights.id"))
    total_amount = Column(Numeric(12, 2))
    status = Column(String) 
    passenger_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reservations")
    flight = relationship("Flight", back_populates="reservations")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(Text)
    base_price = Column(Numeric(10, 2))
    category = Column(String)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating_overall = Column(Integer)
    comment_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="reviews")

class Promotion(Base):
    __tablename__ = "promotions"
    id = Column(Integer, primary_key=True)
    code = Column(String)
    name = Column(String)
    description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    discount_value = Column(Numeric(10, 2))