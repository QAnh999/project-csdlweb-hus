from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime

class BookingCreate(BaseModel):
    main_flight_id: int
    return_flight_id: Optional[int]


class BookingBaseResponse(BaseModel):
    reservation_id: int
    reservation_code: str
    status: str # pending, confirmed, cancelled
    # expires_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SeatStatus(BaseModel):
    # flight_id: int
    seat_id: int
    seat_number: str
    seat_class: str
    status: Optional[str] = None # available, held, booked

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

class PassengerResponse(BaseModel):
    passenger_id: int
    first_name: str
    last_name: str
    date_of_birth: datetime
    gender: Optional[str]
    passport_number: Optional[str]
    identify_number: Optional[str]
    passenger_type: str

    model_config = ConfigDict(from_attributes=True)

class FlightSeatResponse(BaseModel):
    seat_id: int
    seat_number: str
    seat_class: str

class FlightBookingResponse(BaseModel):
    flight_id: int
    direction: str  # "main" | "return"
    seats: List[FlightSeatResponse]

# class BookingPassengerRequest(BaseModel):
#     passengers: List[PassengerInfo]

class PassengerCount(BaseModel):
    adult: int
    child: int
    infant: int

class BookingPassengerRequest(BaseModel):
    passengers: List[PassengerInfo]
    passenger_count: PassengerCount

class PassengerSeatMap(BaseModel):
    passenger_id: int
    seat_id: Optional[int]

class BookingFinalizeRequest(BaseModel):
    seat_class: str
    main_seat_map: List[PassengerSeatMap]
    return_seat_map: Optional[List[PassengerSeatMap]] = None


# class BookingFinalizeRequest(BaseModel):
#     seat_class: str
#     main_seat_ids: List[Optional[int]]
#     return_seat_ids: Optional[List[Optional[int]]] = None

class InvoiceInfo(BaseModel):
    invoice_number: str
    total_amount: float
    tax_amount: float
    due_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

# class BookingFinalizeResponse(BaseModel):
#     total_passengers: int
#     total_amount: float
#     tax_amount: float
#     invoice: InvoiceInfo

class PassengerDetailSeat(BaseModel):
    passenger_id: int
    reservation_detail_id: int
    seat_id: Optional[int]
    total_fare: float

class BookingFinalizeResponse(BaseModel):
    total_passengers: int
    total_amount: float
    tax_amount: float
    invoice: InvoiceInfo
    passenger_details: List[PassengerDetailSeat]


class BookingPaymentRequest(BaseModel):
    payment_method: str 

class PaymentInfo(BaseModel):
    payment_id: int
    payment_method: str
    status: str
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ServiceItem(BaseModel):
    service_id: int
    service_name: str
    quanitity: int
    base_price: float

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

class BookingDetailResponse(BaseModel):
    reservation_id: int
    reservation_code: str
    status: str
    # expires_at: Optional[datetime]
    created_at: datetime

    flights: List[FlightBookingResponse]
    passengers: List[PassengerResponse]

    total_passengers: int
    total_amount: float
    tax_amount: float

    invoice: Optional[InvoiceInfo]
    payment: Optional[PaymentInfo]
    services: Optional[List[ServiceItem]]

    model_config = ConfigDict(from_attributes=True)

# class ServiceDisplayRequest(BaseModel):
#     category: str

class ServiceDisplayResponse(BaseModel):
    service_id: int
    service_name: str
    description: str
    base_price: float

    model_config = ConfigDict(from_attributes=True)