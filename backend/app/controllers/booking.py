from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.services.reservation import reservation_service
from app.repositories.reservation import reservation_repository
from app.services.payment import payment_service
from app.services.seat import seat_service
from app.schemas.booking import (
    BookingCreate,
    BookingBaseResponse,
    BookingHoldSeatsRequest,
    BookingSeatResponse,
    PassengerInfo,
    BookingPassengerRequest,
    BookingFinalizeRequest,
    BookingFinalizeResponse,
    BookingPaymentRequest,
    BookingPaymentResponse,
    BookingDetailResponse,
    SeatStatus,
    InvoiceInfo,
    PaymentInfo,
    BookingServiceRequest,
    BookingServiceResponse,
    ServiceItemRequest,
    ServiceItemResponse,
    PassengerResponse,
    FlightBookingResponse,
    FlightSeatResponse,
    PassengerDetailSeat,
    PassengerSeatMap,
)

class BookingController:
    def __init__(self):
        pass

    
    def create_booking(self, db: Session, user_id: int, req: BookingCreate) -> BookingBaseResponse:
        reservation = reservation_service.start_reservation(
            db=db,
            user_id=user_id,
            main_flight_id=req.main_flight_id,
            return_flight_id=req.return_flight_id
        )
        return BookingBaseResponse(
            reservation_id=reservation.id,
            reservation_code=reservation.reservation_code,
            status=reservation.status,
            expires_at=reservation.expires_at
        )
    
    def get_available_seats(self, db: Session, flight_id: int, seat_class: str) -> BookingSeatResponse:
        seats = seat_service.get_available_seats(db, flight_id, seat_class)
        seat_list = [SeatStatus.model_validate(s) for s in seats]
        return BookingSeatResponse(flight_id=flight_id, seat_class=seat_class, seats=seat_list)
    
    def hold_seats(self, db: Session, user_id: int, reservation_id: int, req: BookingHoldSeatsRequest):
        try:
            held_seats = reservation_service.hold_seats_for_reservation(
                db=db,
                user_id=user_id,
                reservation_id=reservation_id,
                flight_id=req.flight_id,
                seat_ids=req.seat_ids,
                seat_class=req.seat_class
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        return {
            "message": "Giữ chỗ thành công",
            "held_seats": [
                {
                    "seat_id": hs.id_seat,
                    "seat_number": hs.seat.seat_number,
                    "seat_class": hs.seat.seat_class,
                    "flight_id": hs.id_flight,
                    "reservation_id": hs.reservation_id,
                    "hold_expires": hs.hold_expires,
                    "status": "held"
                }
                for hs in held_seats
            ]}
    
    def add_passengers(self, db: Session, user_id: int, reservation_id: int, req: BookingPassengerRequest) -> List[PassengerInfo]:
        passengers = reservation_service.add_passengers(
            db=db,
            user_id=user_id,
            reservation_id=reservation_id,
            passengers=[p.model_dump() for p in req.passengers],
            passenger_count=req.passenger_count.model_dump()
        )

        return [PassengerInfo(
            first_name=p.first_name,
            last_name=p.last_name,
            date_of_birth=p.date_of_birth,
            gender=getattr(p, "gender", None),
            passport_number=getattr(p, "passport_number", None),
            identify_number=getattr(p, "identify_number", None),
            passenger_type=getattr(p, "passenger_type", "adult")
        ) for p in passengers]
    
    def finalize_booking(self, db: Session, user_id: int, reservation_id: int, req: BookingFinalizeRequest) -> BookingFinalizeResponse:
        reservation, details, invoice = reservation_service.finalize_reservation(
            db=db,
            user_id=user_id,
            reservation_id=reservation_id,
            seat_class=req.seat_class,
            # main_seat_ids=req.main_seat_ids,
            # return_seat_ids=req.return_seat_ids or []
            main_seat_map=[s.model_dump() for s in req.main_seat_map],
            return_seat_map=[s.model_dump() for s in req.return_seat_map] if req.return_seat_map else None

        )

        invoice_info = InvoiceInfo(
            invoice_number=invoice.invoice_number,
            total_amount=invoice.total_amount,
            tax_amount=invoice.tax_amount,
            due_date=invoice.due_date,
            status=invoice.status
        )

        passenger_details=[
            PassengerDetailSeat(
                passenger_id=d.passenger_id,
                seat_id=d.seat_id,
                total_fare=d.total_fare
            ) for d in details
        ]


        return BookingFinalizeResponse(
            total_passengers=reservation.total_passengers,
            total_amount=reservation.total_amount,
            tax_amount=reservation.tax_amount,
            invoice=invoice_info,
            passenger_details=passenger_details
        )
    def create_payment(self, db: Session, user_id: int, reservation_id: int, req: BookingPaymentRequest) -> BookingPaymentResponse:
        payment = payment_service.create_payment(
            db=db,
            user_id=user_id,
            reservation_id=reservation_id,
            payment_method=req.payment_method
        )

        reservation = reservation_repository.get(db, reservation_id)
        invoice = reservation.invoice
        invoice_info = InvoiceInfo(
            invoice_number=invoice.invoice_number,
            total_amount=invoice.total_amount,
            tax_amount=invoice.tax_amount,
            due_date=invoice.due_date,
            status=invoice.status
        ) if invoice else None

        payment_info = PaymentInfo(
            payment_id=payment.id,
            payment_method=payment.payment_method,
            status=payment.status,
            paid_at=getattr(payment, "paid_at", datetime.utcnow())
        )

        return BookingPaymentResponse(
            payment=payment_info,
            invoice=invoice_info
        )
    
    def add_services_to_booking(self, db: Session, user_id: int, reservation_id: int, req: BookingServiceRequest) -> BookingServiceResponse:
        result = reservation_service.add_services(
            db=db, 
            user_id=user_id, 
            reservation_id=reservation_id, 
            services=[s.model_dump() for s in req.services]
        )
        
        return BookingServiceResponse(
            reservation_id=reservation_id,
            added_services=len(result["services"]),
            service_subtotal=result["subtotal"],
            service_tax=result["total"],
            service_total=result["total"],
            services=[ServiceItemResponse.model_validate(s) for s in result["services"]]
        )
    
    def get_booking_details(self, db: Session, user_id: int, reservation_id: int) -> BookingDetailResponse:
        reservation = reservation_repository.get(db, reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="Vé không tồn tại")
        
        if reservation.expires_at and reservation.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Vé đã hết hạn. Bạn ko xem đc đâu")

        if reservation.status == "cancelled":
            raise HTTPException(status_code=400, detail="Vé đã hủy. Bạn ko xem đc đâu")

        if reservation.user_id != user_id:
            raise ValueError("Bạn chưa được cấp quyền để thay đổi nội dung này")

        booked_seats = seat_service.booked_repo.get_by_reservation(db, reservation_id)
        # seats = [SeatStatus(
        #     seat_id=bs.id_seat,
        #     seat_number=bs.seat.seat_number,
        #     seat_class=bs.seat.seat_class,
        #     status="booked"
        # ) for bs in booked_seats]
        flight_map = {}
        for bs in booked_seats:
            fid = bs.id_flight
            if fid not in flight_map:
                flight_map[fid] = []
            flight_map[fid].append(
                FlightSeatResponse(
                    seat_id=bs.id_seat,
                    seat_number=bs.seat.seat_number,
                    seat_class=bs.seat.seat_class
                )
            )

        flights = []
        for fid, seats in flight_map.items():
            flights.append(
                FlightBookingResponse(
                    flight_id=fid,
                    direction="inbound" if fid == reservation.main_flight_id else "outbound",
                    seats=seats
                )
            )

        details = reservation_service.detail_repo.get_by_reservation(db, reservation_id)
        # passengers = [PassengerInfo(
        #     first_name=d.passenger.first_name,
        #     last_name=d.passenger.last_name,
        #     date_of_birth=d.passenger.date_of_birth,
        #     gender=getattr(d.passenger, "gender", None),
        #     passport_number=getattr(d.passenger, "passport_number", None),
        #     identify_number=getattr(d.passenger, "identify_number", None),
        #     passenger_type=getattr(d.passenger, "passenger_type", "adult")
        # ) for d in details]
        passenger_map = {}
        for d in details:
            p = d.passenger
            passenger_map[p.id] = p
        
        passengers = [
            PassengerResponse(
                passenger_id=p.id,
                first_name=p.first_name,
                last_name=p.last_name,
                date_of_birth=p.date_of_birth,
                gender=getattr(p, "gender", None),
                passport_number=getattr(p, "passport_number", None),
                identify_number=getattr(p, "identify_number", None),
                passenger_type=getattr(p, "passenger_type", "adult")
            )
            for p in passenger_map.values()
        ]

        invoice = reservation.invoice
        invoice_info = InvoiceInfo(
            invoice_number=invoice.invoice_number,
            total_amount=invoice.total_amount,
            tax_amount=invoice.tax_amount,
            due_date=invoice.due_date,
            status=invoice.status
        ) if invoice else None

        payment = reservation.payment
        payment_info = PaymentInfo(
            payment_id=payment.id,
            payment_method=payment.payment_method,
            status=payment.status,
            paid_at=getattr(payment, "paid_at", datetime.utcnow())
        ) if payment else None

        return BookingDetailResponse(
            reservation_id=reservation.id,
            reservation_code=reservation.reservation_code,
            status=reservation.status,
            expires_at=reservation.expires_at,
            flights=flights,
            passengers=passengers,
            total_passengers=reservation.total_passengers,
            total_amount=reservation.total_amount,
            tax_amount=reservation.tax_amount,
            seats=seats,
            invoice=invoice_info,
            payment=payment_info
        )

    def confirm_payment(self, db: Session, user_id: int, payment_id: int) -> BookingPaymentResponse:
        payment = payment_service.confirm_payment(db, user_id, payment_id)

        reservation = reservation_repository.get(db, payment.reservation_id)
        invoice = reservation.invoice

        return BookingPaymentResponse(
            payment=PaymentInfo(
                payment_method=payment.payment_method,
                status=payment.status,
                paid_at=payment.paid_at
            ),
            invoice=InvoiceInfo.model_validate(invoice) if invoice else None
        )


    def cancel_booking(self, db: Session, user_id: int, reservation_id: int):
        try:
            reservation_service.cancel_reservation(
                db=db,
                user_id=user_id,
                reservation_id=reservation_id
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        return {
            "message": "Hủy đặt vé thành công",
            "reservation_id": reservation_id,
            "status": "cancelled"
        }


booking_controller = BookingController()