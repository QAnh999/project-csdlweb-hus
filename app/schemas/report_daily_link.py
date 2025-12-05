from pydantic import BaseModel
from typing import Optional

class ReportDailyLinkBase(BaseModel):
    report_id: int
    daily_stat_id: int

class ReportDailyLinkCreate(ReportDailyLinkBase):
    pass

class ReportDailyLinkUpdate(BaseModel):
    report_id: Optional[int]
    daily_stat_id: Optional[int]

class ReportDailyLinkResponse(ReportDailyLinkBase):
    id: int

    class Config:
        orm_mode = True
