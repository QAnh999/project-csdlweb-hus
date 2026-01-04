# from pydantic import BaseModel
# from datetime import datetime
# from typing import Optional, Literal


# # ========== Base ==========
# class HoldSeatBase(BaseModel):
#     reservation_id: int
#     flight_id: int
#     seat_id: int


# # ========== Create ==========
# class HoldSeatCreate(HoldSeatBase):
#     expire_at: datetime


# # ========== Update status ==========
# class HoldSeatUpdate(BaseModel):
#     status: Literal["held", "confirmed", "released"]


# # ========== Response ==========
# class HoldSeatResponse(HoldSeatBase):
#     id: int
#     expire_at: datetime
#     status: str
#     created_at: datetime

#     class Config:
#         orm_mode = True
