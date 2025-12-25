from pydantic import BaseModel, ConfigDict
from typing import List, Optional   
from datetime import datetime

class BookingCreate(BaseModel):
    main_flight_id: int
    return_flight_id: Optional[int]


class BookingBaseResponse(BaseModel):
    reservation_id: int
    reservation_code: str
    status: str # pending, confirmed, cancelled
    expires_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

class SeatStatus(BaseModel):
    seat_id: int
    seat_number: str
    seat_class: str
    status: str  # available, held, booked

    model_config = ConfigDict(from_attributes=True)

class BookingHoldSeatsRequest(BaseModel):
    flight_id: int
    seat_ids: List[int]
    seat_class: str

class BookingSeatResponse(BaseModel):
    flight_id: int
    seats: List[SeatStatus]

class PassengerInfo(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Optional[str] = None
    passport_number: Optional[str] = None
    identify_number: Optional[str] = None
    passenger_type: str  # adult, child, infant

    model_config = ConfigDict(from_attributes=True)

class BookingPassengerRequest(BaseModel):
    passengers: List[PassengerInfo]

class BookingFinalizeRequest(BaseModel):
    seat_class: str
    main_seat_ids: List[Optional[int]]
    return_seat_ids: Optional[List[Optional[int]]] = None

class InvoiceInfo(BaseModel):
    invoice_number: str
    total_amount: float
    tax_amount: float
    due_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

class BookingFinalizeResponse(BaseModel):
    total_passengers: int
    total_amount: float
    tax_amount: float
    invoice: InvoiceInfo

class BookingPaymentRequest(BaseModel):
    payment_method: str 

class PaymentInfo(BaseModel):
    payment_method: str
    status: str
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ServiceItemRequest(BaseModel):
    reservation_detail_id: int
    service_id: int 
    quantity: int = 1

class BookingServiceRequest(BaseModel):
    services: List[ServiceItemRequest]

class ServiceItemResponse(BaseModel):
    reservation_detail_id: int
    service_id: int
    quantity: int
    unit_price: float
    total_price: float

    model_config = ConfigDict(from_attributes=True)

class BookingServiceResponse(BaseModel):
    reservation_id: int
    added_services: int
    service_subtotal: float
    service_tax: float
    service_total: float
    services: List[ServiceItemResponse]

class BookingPaymentResponse(BaseModel):
    payment: PaymentInfo
    invoice: InvoiceInfo

class BookingDetailResponse(BookingBaseResponse):
    reservation_id: int
    reservation_code: str
    status: str
    expires_at: Optional[datetime]

    main_flight_id: int
    return_flight_id: Optional[int]

    total_passengers: int
    total_amount: float
    tax_amount: float

    seats: List[SeatStatus]
    passengers: List[PassengerInfo]
    invoice: Optional[InvoiceInfo]
    payment: Optional[PaymentInfo]

    model_config = ConfigDict(from_attributes=True)