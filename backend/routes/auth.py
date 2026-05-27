from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

import models.models as models
import schema.schemas as schemas

from core.database import get_db

from utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token
)

from utils.email import send_otp_email

from utils.otp import (
    generate_otp,
    save_otp,
    verify_otp
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

MONTHLY_MAINTENANCE_AMOUNT = 1200


# ==========================================
# SEND OTP
# ==========================================
@router.post("/send-otp")
def send_otp(request: schemas.OTPRequest):

    email = request.email.strip()

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email required"
        )

    code = generate_otp()

    save_otp(email, code)

    send_otp_email(email, code)

    return {
        "message": "OTP sent successfully",
        "otp": code
    }


# ==========================================
# REGISTER
# ==========================================
@router.post("/register", response_model=schemas.Token)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        (models.User.username == user_in.username) |
        (models.User.gmail == user_in.gmail)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    # ==========================================
    # ADMIN OTP VERIFICATION
    # ==========================================
    if user_in.role == "admin":

        if not user_in.otp:
            raise HTTPException(
                status_code=400,
                detail="OTP required"
            )

        is_valid, message = verify_otp(
            user_in.gmail,
            user_in.otp
        )

        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail=message
            )

    # ==========================================
    # CREATE USER
    # ==========================================
    new_user = models.User(
        username=user_in.username,
        gmail=user_in.gmail,
        phone_number=user_in.phone_number,
        block=user_in.block,
        house_number=user_in.house_number,
        role=user_in.role,
        hashed_password=get_password_hash(
            user_in.password
        )
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # ==========================================
    # CREATE MAINTENANCE DATA
    # CURRENT YEAR ONLY
    # ==========================================

    current_date = datetime.now()

    current_year = current_date.year
    current_month = current_date.month

    maintenance_rows = []

    for month in range(1, 13):

        # ==========================================
        # PAST MONTHS => PAID
        # CURRENT/FUTURE => UNPAID
        # ==========================================

        if month < current_month:

            status = "paid"

            transaction_id = "SYSTEM_GENERATED"

            payment_date = datetime.utcnow()

        else:

            status = "unpaid"

            transaction_id = None

            payment_date = None

        bill = models.MaintenanceBill(
            user_id=new_user.id,
            month=month,
            year=current_year,
            amount=MONTHLY_MAINTENANCE_AMOUNT,
            status=status,
            transaction_id=transaction_id,
            payment_date=payment_date
        )

        maintenance_rows.append(bill)

    db.add_all(maintenance_rows)

    db.commit()

    # ==========================================
    # ACCESS TOKEN
    # ==========================================
    access_token = create_access_token(
        data={"sub": new_user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


# ==========================================
# LOGIN
# ==========================================
@router.post("/login", response_model=schemas.Token)
def login(
    login_in: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(models.User).filter(
        models.User.username == login_in.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    if not verify_password(
        login_in.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    # ==========================================
    # ROLE VALIDATION
    # ==========================================
    if db_user.role != login_in.role:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    access_token = create_access_token(
        data={"sub": db_user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }