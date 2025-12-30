from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.repositories.reservation import reservation_repository
from app.repositories.reservation_detail import reservation_detail_repository
from app.repositories.flight import flight_repository
from app.repositories.passenger import passenger_repository
from app.repositories.payment import payment_repository
from app.repositories.invoice import invoice_repository
from app.repositories.reservation_passenger import reservation_passenger_repository
from app.repositories.service import service_repository
from app.repositories.reservation_service import reservation_service_repository
from app.services.seat import seat_service
from app.services.payment import payment_service
from app.utils.calculator import calculate_total
from app.utils.generator import generate_reservation_code, generate_invoice_number

class ReservationService:
    HOLD_MINUTES = 15

    def __init__(self):
        self.reservation_repo = reservation_repository
        self.detail_repo = reservation_detail_repository
        self.flight_repo = flight_repository
        self.passenger_repo = passenger_repository
        self.invoice_repo = invoice_repository
        self.payment_repo = payment_repository
        self.res_passenger_repo = reservation_passenger_repository
        self.service_repo = service_repository
        self.res_service_repo = reservation_service_repository
        
        self.seat_serv = seat_service
        self.payment_serv = payment_service

    def _assert_user(self, reservation, user_id: int):
        if reservation.user_id != user_id:
            raise ValueError("Bạn chưa được cấp quyền để thay đổi nội dung này")

    def _get_reservation(self, db: Session, reservation_id: int):
        reservation = self.reservation_repo.get(db, reservation_id)
        if not reservation:
            raise ValueError("Mã đặt chỗ không tồn tại")
        if reservation.expires_at and reservation.expires_at < datetime.utcnow():
            raise ValueError("Mã đặt chỗ đã hết hạn")
        if reservation.status != "pending":
            raise ValueError("Mã đặt chỗ không còn thay đổi được")
        return reservation
    
    def _get_or_create_passenger(self, db: Session, user_id: int, passenger_data: dict):
        passenger = self.passenger_repo.get_by_user_and_identity(
            db=db,
            user_id=user_id,
            identify_number=passenger_data.get("identify_number"),
            passport_number=passenger_data.get("passport_number")
        )
        if passenger:
            return passenger
        return self.passenger_repo.create(db, {
            "user_id": user_id,
            **passenger_data
        })
    
    def _count_seated_passengers(self, db: Session, reservation_id: int) -> int:
        passengers = self.res_passenger_repo.get_by_reservation(db, reservation_id)
        return len([p for p in passengers if p.passenger_type != "infant"])

    def _count_held_seats(self, db: Session, reservation_id: int, flight_id: int) -> int:
        return self.seat_serv.count_held_seats(db, reservation_id, flight_id)


    def start_reservation(self, db: Session, user_id: int, main_flight_id: int, return_flight_id: int = None):
        expires_at = datetime.utcnow() + timedelta(minutes=self.HOLD_MINUTES)

        try:
            reservation = self.reservation_repo.create(db, {
                "reservation_code": generate_reservation_code(),
                "user_id": user_id,
                "main_flight_id": main_flight_id,
                "return_flight_id": return_flight_id,
                "total_passengers": 0,
                "total_amount": 0.0,
                "tax_amount": 0.0,
                "status": "pending",
                "expires_at": expires_at
            })
            db.commit()
            return reservation
        except Exception as e:
            db.rollback()
            raise e

    def add_passengers(self, db: Session, user_id: int, reservation_id: int, passengers: list[dict], passenger_count: dict):
        try:
            reservation = self._get_reservation(db, reservation_id)
            self._assert_user(reservation, user_id)

            expected = passenger_count["adult"] + passenger_count["child"] + passenger_count["infant"]
            
            existing = self.res_passenger_repo.count_by_reservation(db, reservation_id)
            if existing + len(passengers) > expected:
                raise ValueError("Số hành khách vượt quá khai báo")

            from collections import Counter
            types = Counter(p["passenger_type"] for p in passengers)

            for t in ["adult", "child", "infant"]:
                if types.get(t, 0) > passenger_count.get(t, 0):
                    raise ValueError(f"Số {t} vượt quá cho phép")
                
            passenger_list = []

            for p in passengers:
                passenger = self._get_or_create_passenger(db, user_id, p)
                
                exists = self.res_passenger_repo.exists(db, reservation.id, passenger.id)
                if not exists:
                    self.res_passenger_repo.create(db, {
                        "reservation_id": reservation.id,
                        "passenger_id": passenger.id
                    })
                passenger_list.append(passenger)

            self.reservation_repo.update(db, reservation, {
                "total_passengers": self.res_passenger_repo.count_by_reservation(db, reservation.id)
            })

            db.commit()
            return passenger_list
        except Exception as e:
            db.rollback()
            raise e
        
    def hold_seats_for_reservation(self, db: Session, user_id: int, reservation_id: int, flight_id: int, seat_ids: list[int], seat_class: str):
        reservation = self._get_reservation(db, reservation_id)
        self._assert_user(reservation, user_id)
        
        if not seat_ids:
            raise ValueError("Danh sách ghế trống")
        
        seated_passenger_count = self._count_seated_passengers(db, reservation.id)
        held_seat_count = self._count_held_seats(db, reservation.id, flight_id)

        if held_seat_count + len(seat_ids) > seated_passenger_count:
            raise ValueError(f"Số ghế giữ vượt quá số hành khách")
        
        try:
            held_seats = self.seat_serv.hold_seats(db, flight_id, reservation.id, seat_ids, seat_class)
            # db.commit()
            return held_seats
        except Exception as e:
            # db.rollback()
            raise e
    
    # def finalize_reservation(self, db: Session, user_id: int, reservation_id: int, seat_class: str, main_seat_ids: list[int], return_seat_ids: list[int] = []):
    #     try:
    #         reservation = self._get_reservation(db, reservation_id)
    #         self._assert_user(reservation, user_id)
            
    #         main_flight = self.flight_repo.get(db, reservation.main_flight_id)
    #         return_flight = self.flight_repo.get(db, reservation.return_flight_id) if reservation.return_flight_id else None

    #         passengers = self.res_passenger_repo.get_by_reservation(db, reservation.id)
    #         if not passengers:
    #             raise ValueError("No passengers in reservation")
            
    #         seated_passengers = [p for p in passengers if p.passenger_type != "infant"]
    #         seated_count = len(seated_passengers)

    #         if not main_seat_ids:
    #             raise ValueError("Vui lòng chọn ghế cho chuyến bay đi")
    #         if return_flight and not return_seat_ids:
    #             raise ValueError("Vui lòng chọn ghế cho chuyến bay về")

    #         main_seats = self.seat_serv.get_held_seats_for_reservation(db, main_flight.id, reservation.id, main_seat_ids) 
    #         return_seats = self.seat_serv.get_held_seats_for_reservation(db, return_flight.id, reservation.id, return_seat_ids) if return_flight else None
            
    #         if len(main_seats) != seated_count or (return_flight and len(return_seats) != seated_count):
    #             raise ValueError("Số ghế chính không khớp với số hành khách")

    #         for seat in main_seats + (return_seats or []):
    #             if seat and seat.seat.seat_class != seat_class:
    #                 raise ValueError("Seat class mismatch")
                
            
    #         main_pricing = calculate_total(main_flight, seat_class, passengers, main_seats)
    #         return_pricing = calculate_total(return_flight, seat_class, passengers, return_seats) if return_flight else None

    #         total_amount = main_pricing["total_amount"] + (return_pricing["total_amount"] if return_pricing else 0)
    #         total_tax = main_pricing["tax_amount"] + (return_pricing["tax_amount"] if return_pricing else 0)
            
    #         self.reservation_repo.update(db, reservation, {
    #             "total_amount": total_amount,
    #             "tax_amount": total_tax
    #         })
            
    #         seat_index = 0
    #         details = []
    #         for i, passenger in enumerate(passengers):
    #             p_type = getattr(passenger, "passenger_type", "adult")
    #             seat = main_seats[seat_index] if p_type != "infant" else None
    #             detail = self.detail_repo.create(db, {
    #                 "reservation_id": reservation.id,
    #                 "passenger_id": passenger.id,
    #                 "flight_id": main_flight.id,
    #                 "seat_id": seat.id_seat if seat else None,
    #                 "base_fare": main_pricing["base_fare_per_passenger"][i],
    #                 "seat_surcharge": main_pricing["seat_surcharge_per_passenger"][i] if seat else Decimal("0"),
    #                 "luggage_surcharge": main_pricing["luggage_surcharge_per_passenger"][i] if seat else Decimal("0"),
    #                 "tax_fare": main_pricing["tax_per_passenger"][i],
    #                 "total_fare": main_pricing["total_per_passenger"][i],
    #                 "checkin_status": "not_checked_in"
    #             })
    #             details.append(detail)

    #             if p_type != "infant":
    #                 seat_index += 1
            

    #         if return_flight:
    #             seat_index = 0
    #             for i, passenger in enumerate(passengers):
    #                 p_type = getattr(passenger, "passenger_type", "adult")
    #                 seat = return_seats[seat_index] if p_type != "infant" else None
    #                 detail = self.detail_repo.create(db, {
    #                     "reservation_id": reservation.id,
    #                     "passenger_id": passenger.id,
    #                     "flight_id": return_flight.id,
    #                     "seat_id": seat.id_seat if seat else None,
    #                     "base_fare": return_pricing["base_fare_per_passenger"][i],
    #                     "seat_surcharge": return_pricing["seat_surcharge_per_passenger"][i] if seat else Decimal("0"),
    #                     "luggage_surcharge": return_pricing["luggage_surcharge_per_passenger"][i] if seat else Decimal("0"),
    #                     "tax_fare": return_pricing["tax_per_passenger"][i],
    #                     "total_fare": return_pricing["total_per_passenger"][i],
    #                     "checkin_status": "not_checked_in"
    #                 })
    #                 details.append(detail)

    #                 if p_type != "infant":
    #                     seat_index += 1


    #         invoice = self.invoice_repo.get_by_reservation(db, reservation_id)
    #         if not invoice:
    #             invoice = self.invoice_repo.create(db, {
    #                 "invoice_number": generate_invoice_number(),
    #                 "reservation_id": reservation.id,
    #                 "user_id": reservation.user_id,
    #                 "total_amount": reservation.total_amount,
    #                 "tax_amount": reservation.tax_amount,
    #                 "due_date": reservation.expires_at,
    #                 "status": "unpaid"
    #             })
    #         else:
    #             self.invoice_repo.update(db, invoice, {
    #                 "total_amount": reservation.total_amount,
    #                 "tax_amount": reservation.tax_amount
    #             })

    #         # self.reservation_repo.update(db, reservation, {
    #         #     "status": "finalized"
    #         # })
    #         db.commit()
    #         return reservation, details, invoice
    #     except Exception as e:
    #         db.rollback()
    #         raise e

    def finalize_reservation(
        self,
        db: Session,
        user_id: int,
        reservation_id: int,
        seat_class: str,
        main_seat_map: list[dict],  # [{"passenger_id": ..., "seat_id": ...}, ...]
        return_seat_map: list[dict] = None
    ):
        try:
            reservation = self._get_reservation(db, reservation_id)
            self._assert_user(reservation, user_id)
            
            main_flight = self.flight_repo.get(db, reservation.main_flight_id)
            return_flight = self.flight_repo.get(db, reservation.return_flight_id) if reservation.return_flight_id else None

            passengers = self.res_passenger_repo.get_by_reservation(db, reservation.id)
            if not passengers:
                raise ValueError("No passengers in reservation")
            
            seated_passengers = [p for p in passengers if p.passenger_type != "infant"]
            seated_count = len(seated_passengers)

            # Main flight seats
            if not main_seat_map or len(main_seat_map) != seated_count:
                raise ValueError("Vui lòng chọn ghế cho chuyến bay đi đúng số hành khách")

            main_seat_ids = [s["seat_id"] for s in main_seat_map]
            main_seats = self.seat_serv.get_held_seats_for_reservation(
                db, main_flight.id, reservation.id, main_seat_ids
            )
            main_seat_dict = {s.id_seat: s for s in main_seats}

            # Check seat class
            for seat in main_seats:
                if seat.seat.seat_class != seat_class:
                    raise ValueError("Seat class mismatch")

            # Return flight seats
            if return_flight:
                if not return_seat_map or len(return_seat_map) != seated_count:
                    raise ValueError("Vui lòng chọn ghế cho chuyến bay về đúng số hành khách")
                return_seat_ids = [s["seat_id"] for s in return_seat_map]
                return_seats = self.seat_serv.get_held_seats_for_reservation(
                    db, return_flight.id, reservation.id, return_seat_ids
                )
                return_seat_dict = {s.id_seat: s for s in return_seats}

                for seat in return_seats:
                    if seat.seat.seat_class != seat_class:
                        raise ValueError("Seat class mismatch")
            else:
                return_seat_dict = {}

            # Calculate pricing
            main_pricing = calculate_total(main_flight, seat_class, passengers, main_seats)
            return_pricing = calculate_total(return_flight, seat_class, passengers, return_seats) if return_flight else None

            total_amount = main_pricing["total_amount"] + (return_pricing["total_amount"] if return_pricing else 0)
            total_tax = main_pricing["tax_amount"] + (return_pricing["tax_amount"] if return_pricing else 0)
            
            self.reservation_repo.update(db, reservation, {
                "total_amount": total_amount,
                "tax_amount": total_tax
            })

            # Create reservation details
            details = []
            for i, passenger in enumerate(passengers):
                p_type = getattr(passenger, "passenger_type", "adult")

                # Main flight seat
                main_seat_id = next((m["seat_id"] for m in main_seat_map if m["passenger_id"] == passenger.id), None)
                main_seat = main_seat_dict.get(main_seat_id) if p_type != "infant" else None

                # Return flight seat
                if return_flight:
                    return_seat_id = next((r["seat_id"] for r in return_seat_map if r["passenger_id"] == passenger.id), None)
                    return_seat = return_seat_dict.get(return_seat_id) if p_type != "infant" else None
                else:
                    return_seat = None

                # Main flight detail
                detail = self.detail_repo.create(db, {
                    "reservation_id": reservation.id,
                    "passenger_id": passenger.id,
                    "flight_id": main_flight.id,
                    "seat_id": main_seat.id_seat if main_seat else None,
                    "base_fare": main_pricing["base_fare_per_passenger"][i],
                    "seat_surcharge": main_pricing["seat_surcharge_per_passenger"][i] if main_seat else Decimal("0"),
                    "luggage_surcharge": main_pricing["luggage_surcharge_per_passenger"][i] if main_seat else Decimal("0"),
                    "tax_fare": main_pricing["tax_per_passenger"][i],
                    "total_fare": main_pricing["total_per_passenger"][i],
                    "checkin_status": "not_checked_in"
                })
                details.append(detail)

                # Return flight detail
                if return_flight:
                    detail = self.detail_repo.create(db, {
                        "reservation_id": reservation.id,
                        "passenger_id": passenger.id,
                        "flight_id": return_flight.id,
                        "seat_id": return_seat.id_seat if return_seat else None,
                        "base_fare": return_pricing["base_fare_per_passenger"][i],
                        "seat_surcharge": return_pricing["seat_surcharge_per_passenger"][i] if return_seat else Decimal("0"),
                        "luggage_surcharge": return_pricing["luggage_surcharge_per_passenger"][i] if return_seat else Decimal("0"),
                        "tax_fare": return_pricing["tax_per_passenger"][i],
                        "total_fare": return_pricing["total_per_passenger"][i],
                        "checkin_status": "not_checked_in"
                    })
                    details.append(detail)

            # Invoice
            invoice = self.invoice_repo.get_by_reservation(db, reservation_id)
            if not invoice:
                invoice = self.invoice_repo.create(db, {
                    "invoice_number": generate_invoice_number(),
                    "reservation_id": reservation.id,
                    "user_id": reservation.user_id,
                    "total_amount": reservation.total_amount,
                    "tax_amount": reservation.tax_amount,
                    "due_date": reservation.expires_at,
                    "status": "unpaid"
                })
            else:
                self.invoice_repo.update(db, invoice, {
                    "total_amount": reservation.total_amount,
                    "tax_amount": reservation.tax_amount
                })

            db.commit()
            return reservation, details, invoice

        except Exception as e:
            db.rollback()
            raise e

    
    def add_services(self, db: Session, user_id: int, reservation_id: int, services: list[dict]):
        try:
            reservation = self._get_reservation(db, reservation_id)
            self._assert_user(reservation, user_id)
            if reservation.status != "pending":
                raise ValueError("Không thể thêm dịch vụ sau khi xác nhận vé")

            details = self.detail_repo.get_by_reservation(db, reservation_id)
            if not details:
                raise ValueError("Bạn phải hoàn tất chọn ghế trước khi thêm dịch vụ")
            
            detail_map = {d.id: d for d in details}
            service_rows = []
            subtotal = Decimal(0.0)

            for item in services:
                detail_id = item.get("reservation_detail_id")
                service_id = item.get("service_id")
                quantity = item.get("quantity", 1)
                
                detail = detail_map.get(detail_id)
                if not detail:
                    raise ValueError("Thông tin chi tiết về booking không hợp lệ")
                
                service = self.service_repo.get(db, service_id)
                if not service or not service.is_available:
                    raise ValueError("Dịch vụ ko tồn tại hoawccj ko khả dụng")
                
                unit_price = Decimal(service.base_price)
                total_price = unit_price * quantity

                existing = self.res_service_repo.get_by_detail_and_service(db, detail_id, service_id)
                if existing:
                    new_quant= existing.quantity + quantity
                    new_total = unit_price * new_quant

                    self.res_service_repo.update(db, existing, {
                        "quantity": new_quant,
                        "total_price": float(new_total)
                    })

                    subtotal += unit_price * quantity
                    service_rows.append(existing)
                else:
                    sr = self.res_service_repo.create(db, {
                        "reservation_detail_id": detail_id,
                        "service_id": service_id,
                        "quantity": quantity,
                        "unit_price": float(unit_price),
                        "total_price": float(total_price)
                    })

                    subtotal += total_price
                    service_rows.append(sr)
                
                detail_tax = Decimal(detail.tax_fare) + total_price * Decimal(0.1)
                detail_total = Decimal(detail.total_fare) + total_price
                self.detail_repo.update(db, detail, {
                    "total_fare": float(detail_total),
                    "tax_fare": float(detail_tax)
                })

            tax = subtotal * Decimal(0.1)
            total = subtotal + tax
            
            reservation_total = Decimal(reservation.total_amount) + total
            reservation_tax = Decimal(reservation.tax_amount) + tax
            self.reservation_repo.update(db, reservation, {
                "total_amount": float(reservation_total),
                "tax_amount": float(reservation_tax)
            })

            invoice = self.invoice_repo.get_by_reservation(db, reservation_id)
            if not invoice:
                raise ValueError("Không tìm thấy hóa đơn")
            invoice_total = Decimal(invoice.total_amount) + total
            invoice_tax = Decimal(invoice.tax_amount) + tax
            self.invoice_repo.update(db, invoice, {
                "total_amount": float(invoice_total),
                "tax_amount": float(invoice_tax)
            })

            db.commit()
            return {
                "reservation_id": reservation_id,
                "subtotal": float(subtotal),
                "tax": float(tax),
                "total": float(total),
                "services": service_rows
            }
        except Exception as e:
            db.rollback()
            raise e
            

    # def confirm_reservation(self, db: Session, user_id: int, reservation_id: int):
    #     reservation = self._get_reservation(db, reservation_id)
    #     self._assert_user(reservation, user_id)

    #     self.reservation_repo.update(db, reservation, {"status": "confirmed"})

    def cancel_reservation(self, db: Session, user_id: int, reservation_id: int):
        reservation = self.reservation_repo.get(db, reservation_id)
        if not reservation:
            raise ValueError("Bạn chưa đặt vé")
        self._assert_user(reservation, user_id)

        details = self.detail_repo.get_by_reservation(db, reservation_id)
        if any(d.checkin_status == "checked_in" for d in details):
            raise ValueError("Đã hoàn tất thủ tục. Không thể hủy")

        invoice = self.invoice_repo.get_by_reservation(db, reservation_id)        
        payment = self.payment_repo.get_by_reversation(db, reservation_id)

        try:
            if invoice.status == "unpaid" and not payment:
                self.reservation_repo.update(db, reservation, {"status": "cancelled"})
                self.seat_serv.release_by_reservation(db, reservation_id)
                self.invoice_repo.update(db, invoice, {"status": "cancelled"})
                db.commit()
                return {"message": "Reservation cancelled"}

            if invoice.status == "overdue" and payment and payment.status == "pending":
                self.reservation_repo.update(db, reservation, {"status": "cancelled"})
                self.seat_serv.release_by_reservation(db, reservation_id)
                self.invoice_repo.update(db, invoice, {"status": "cancelled"})
                self.payment_repo.update(db, payment, {"status": "failed"})
                db.commit()
                return {"message": "Reservation cancelled"}
            
            if invoice.status == "paid" and payment and payment.status == "completed":
                self.payment_serv.refund(db, user_id, payment.id)
                self.reservation_repo.update(db, reservation, {"status": "cancelled"})
                self.seat_serv.release_by_reservation(db, reservation_id)
                db.commit()
                return {"message": "Reservation cancelled"}

        except Exception as e:
            db.rollback()
            raise e     
        

reservation_service = ReservationService()