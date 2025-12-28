from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.utils.security import hash_password

class UserService:

    def get_all(self, db: Session):
        return db.query(User).all()

    def get_by_id(self, db: Session, user_id: int):
        user = db.query(User).get(user_id)
        if not user:
            raise HTTPException(404, "Không tìm thấy user")
        return user

    def create(self, db: Session, data):
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(400, "Email đã tồn tại")

        user = User(
            email=data.email,
            password=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            address=data.address,
            phone=data.phone,
            date_of_birth=data.date_of_birth,
            gender=data.gender
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def update(self, db: Session, user_id: int, data):
        user = self.get_by_id(db, user_id)

        for k, v in data.dict(exclude_unset=True).items():
            setattr(user, k, v)

        db.commit()
        return user

    def delete(self, db: Session, user_id: int):
        user = self.get_by_id(db, user_id)
        db.delete(user)
        db.commit()
        return {"message": "Đã xóa user"}
