from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class CheckinInfo(BaseModel):
    reservation_detail_id: int
    flight_number: str
    departure_time: datetime
    seat_number: Optional[str]
    passenger_name: str
    checkin_status: str

    model_config = ConfigDict(from_attributes=True)

class CheckinInfoResponse(BaseModel):
    passengers: List[CheckinInfo]


class CheckinConfirm(BaseModel):
    boarding_pass_code: str
    qr_code_url: str
    passenger_name: str
    flight_number: str
    seat_number: Optional[str]
    checkin_time: datetime

class CheckinConfirmResponse(BaseModel):
    ticket: CheckinConfirm

class TicketResponse(BaseModel):
    boarding_pass_code: str
    qr_code_url: str
    passenger_name: str
    flight_number: str
    seat_number: Optional[str]
    checkin_time: datetime

class TicketResponseWrapper(BaseModel):
    ticket: TicketResponse

    model_config = ConfigDict(from_attributes=True)



