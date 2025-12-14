from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class PassengerInfo(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Optional[str] = None
    passport_number: Optional[str] = None
    identify_number: Optional[str] = None
    passenger_type: Optional[str] = "adult"

    model_config = ConfigDict(from_attributes=True)

class BookedSeat(BaseModel):
    seat_id: int
    seat_number: Optional[str] = None
    seat_class: Optional[str] = None
    status: Optional[str] = "held"

    model_config = ConfigDict(from_attributes=True)

class PaymentInfo(BaseModel):
    payment_method: str
    transaction_id: Optional[str] = None
    payment_gateway: Optional[str] = None
    currency: Optional[str] = "VND"
    status: Optional[str] = "pending"
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class InvoiceInfo(BaseModel):
    invoice_number: str
    total_amount: float
    tax_amount: Optional[float] = 0
    status: Optional[str] = "unpaid"
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class BookingRequest(BaseModel):
    user_id: int
    payment_method: str
    main_flight_id: int
    return_flight_id: Optional[int] = None
    selected_seats: List[int]
    passengers: List[PassengerInfo]
    seat_class: str

class PaymentRequest(BaseModel):
    reservation_id: int
    payment_method: str
    seat_ids: List[int]

class BookingResponse(BaseModel):
    id: int
    reservation_code: str
    user_id: int

    main_flight_id: int
    return_flight_id: Optional[int] = None
    total_passengers: int
    
    total_amount: float
    paid_amount: Optional[float] = 0
    discount_amount: Optional[float] = 0
    tax_amount: Optional[float] = 0

    status: Optional[str] = "pending"
    expires_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    booked_seats: Optional[List[BookedSeat]] = []
    invoice: Optional[InvoiceInfo] = None

    model_config = ConfigDict(from_attributes=True)

class PaymentResponse(BaseModel):
    id: int 
    reservation_id: int
    payment: PaymentInfo
    booked_seats: Optional[List[BookedSeat]] = []
    invoice: Optional[InvoiceInfo] = None

    model_config = ConfigDict(from_attributes=True)