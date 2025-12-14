import uuid
from datetime import datetime

def generate_reservation_code() -> str:
    return f"RES-{datetime.utcnow():%y%m%d}-{uuid.uuid4().hex[:6].upper()}"

def generate_invoice_number() -> str:
    return f"INV-{datetime.utcnow():%Y%m%d}-{uuid.uuid4().hex[:6].upper()}"

def generate_ticket_number() -> str:
    return f"TIC-{uuid.uuid4().hex[:10].upper()}"
