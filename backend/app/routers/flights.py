from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload # IMPORT QUAN TRỌNG
from typing import List, Optional
from .. import models, database, auth, schemas

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.get("/", response_model=List[schemas.FlightResponse])
async def get_flights(search: Optional[str] = None, db: AsyncSession = Depends(database.get_db)):
    # Dùng options(selectinload(...)) để báo cho SQLAlchemy lấy luôn dữ liệu bảng liên kết
    query = select(models.Flight).options(
        selectinload(models.Flight.airline),
        selectinload(models.Flight.departure_airport),
        selectinload(models.Flight.arrival_airport),
        selectinload(models.Flight.aircraft)
    )
    
    if search:
        # Tìm kiếm phức tạp hơn: theo mã vé HOẶC tên sân bay đi HOẶC tên sân bay đến
        # Cần join bảng nếu muốn search tên sân bay (đây là ví dụ search mã vé đơn giản)
        query = query.where(models.Flight.flight_number.ilike(f"%{search}%"))
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{id}", response_model=schemas.FlightResponse)
async def get_flight_detail(id: int, db: AsyncSession = Depends(database.get_db)):
    query = select(models.Flight).where(models.Flight.id == id).options(
        selectinload(models.Flight.airline),
        selectinload(models.Flight.departure_airport),
        selectinload(models.Flight.arrival_airport),
        selectinload(models.Flight.aircraft)
    )
    
    result = await db.execute(query)
    flight = result.scalars().first()
    
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight
 
@router.post("/", dependencies=[Depends(auth.check_role(["Admin", "Staff"]))])
async def add_flight(flight: schemas.FlightCreate, db: AsyncSession = Depends(database.get_db)):
    new_flight = models.Flight(**flight.dict())
    db.add(new_flight)
    await db.commit()
    return {"message": "Thêm chuyến bay thành công"}

@router.delete("/{id}", dependencies=[Depends(auth.check_role(["Admin"]))])
async def delete_flight(id: int, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Flight).where(models.Flight.id == id))
    flight = result.scalars().first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    await db.delete(flight)
    await db.commit()
    return {"message": "Deleted"}
# ... (Các hàm POST/DELETE giữ nguyên logic nhưng nhớ import models mới)