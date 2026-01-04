import re
from datetime import datetime
from typing import Dict, Any, Tuple


# Email
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

def is_valid_email(email: str) -> bool:
    return bool(re.match(EMAIL_REGEX, email))

# Phone number
PHONE_REGEX = r"^\+?\d{9,15}$"

def is_valid_phone(phone: str) -> bool:
    return bool(re.match(PHONE_REGEX, phone))

# Detect identifier
def detect_identifier(identifier: str) -> str:
    if re.match(EMAIL_REGEX, identifier):
        return "email"
    elif re.match(PHONE_REGEX, identifier):
        return "phone"
    else:
        raise ValueError("Identifier must be a valid email or a phone number")


# Password strength
def is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

# UUID
UUID_REGEX = r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"

def is_valid_uuid(uuid_str: str) -> bool:
    return bool(re.match(UUID_REGEX, uuid_str))

# Check non_empty string 
def is_non_empty_string(s: str) -> bool:
    return bool(s and s.trip())


from typing import Dict, Any

def validate_booking_data(data: Dict[str, Any]) -> None:
    required = ["main_flight_id", "seat_class", "passengers", "user_id", "payment_method"]
    for field in required:
        if field not in data:
            raise ValueError(f"Thiếu trường bắt buộc: {field}")
        
    passengers = data["passengers"]
    if not isinstance(passengers, list) or not passengers:
        raise ValueError("Danh sách hành khách không hợp lệ")
    
    if len(passengers) > 9:
        raise ValueError("Tối đa 9 hành khách mỗi lần đặt")
    
    if data["seat_class"] not in ("economy", "business", "first"):
        raise ValueError("Hạng ghế không hợp lệ")
    
    selected_seats = data.get("selected_seats", [])
    if selected_seats and len(selected_seats) != len(passengers):
        raise ValueError("Số ghế phải bằng số hành khách")


def can_checkin(reservation) -> Tuple[bool, str]:
    if reservation.status != "confirmed":
        return False, "Vé chưa được xác nhận"
    
    if reservation.paid_amount < reservation.total_amount:
        return False, "Chưa thanh toán đủ"
    
    dep = reservation.main_flight.dep_datetime
    now = datetime.utcnow()

    if now < dep.replace(hour=dep.hour - 24):
        return False, "Chưa được check-in"
    
    if now > dep.replace(hour=dep.hour - 1):
        return False, "Đã đóng check-in"
    
    return True, "OK"

def can_cancel(reservation) -> bool:
    if reservation.main_flight.dep_datetime <= datetime.utcnow():
        return False
    
    for d in reservation.details:
        if d.checkin_status == "checked_in":
            return False
        
    return True
    

