import re

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


