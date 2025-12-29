from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from .. import schemas, models, database, auth

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: schemas.LoginSchema,
    response: Response,
    db: AsyncSession = Depends(database.get_db)
):
    # ======================
    # 1. CHECK STAFF (ADMIN)
    # ======================
    res_staff = await db.execute(
        select(models.Staff).where(models.Staff.email == form_data.email)
    )
    staff = res_staff.scalars().first()

    user_data = None
    role = None
    user_id = None

    if staff and auth.verify_password(form_data.password, staff.password):
        user_data = staff
        role = staff.role           # Admin / Super Admin
        user_id = staff.admin_id

    else:
        # ======================
        # 2. CHECK USER (CUSTOMER)
        # ======================
        res_user = await db.execute(
            select(models.User).where(models.User.email == form_data.email)
        )
        user = res_user.scalars().first()

        if user and auth.verify_password(form_data.password, user.password):
            user_data = user
            role = "customer"
            user_id = user.id

    # ======================
    # 3. LOGIN FAILED
    # ======================
    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Email hoặc mật khẩu không đúng"
        )

    # ======================
    # 4. CREATE TOKENS
    # ======================
    access_token = auth.create_access_token(
        data={
            "sub": user_data.email,
            "role": role,
            "id": user_id
        },
        expires_delta=timedelta(minutes=30)
    )

    refresh_token = auth.create_access_token(
        data={"sub": user_data.email},
        expires_delta=timedelta(days=7)
    )

    # ======================
    # 5. SET COOKIE
    # ======================
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True
    )

    # ======================
    # 6. RESPONSE
    # ======================
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "role": role,
            "fullName": getattr(
                user_data,
                "full_name",
                getattr(user_data, "first_name", "")
            )
        }
    }
