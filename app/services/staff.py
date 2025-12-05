from sqlalchemy.orm import Session
from app.models.staff import Staff
from app.utils.security import verify_password, create_access_token
from fastapi import HTTPException, status


class StaffService:

    def login(self, db: Session, admin_name: str, password: str):
        staff = db.query(Staff).filter(Staff.admin_name == admin_name).first()

        if not staff:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff not found"
            )

        if not verify_password(password, staff.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password"
            )

        token = create_access_token({"sub": staff.admin_name, "role": staff.role})

        return {
            "access_token": token,
            "token_type": "bearer",
            "admin_id": staff.admin_id,
            "full_name": staff.full_name,
            "role": staff.role
        }


staff_service = StaffService()
