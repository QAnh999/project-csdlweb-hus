import uuid
from datetime import datetime
import qrcode
from io import BytesIO
import base64

def generate_reservation_code() -> str:
    return f"RES-{datetime.utcnow():%y%m%d}-{uuid.uuid4().hex[:6].upper()}"

def generate_invoice_number() -> str:
    return f"INV-{datetime.utcnow():%Y%m%d}-{uuid.uuid4().hex[:6].upper()}"

def generate_ticket_number() -> str:
    return f"TIC-{uuid.uuid4().hex[:10].upper()}"


def generate_boarding_pass_code() -> str:
    return f"BP-{uuid.uuid4().hex[:10].upper()}"

def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return img_str


