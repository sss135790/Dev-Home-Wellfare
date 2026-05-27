from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.payment import client
import models.models as models

import os
from dotenv import load_dotenv
import hmac
import hashlib
from datetime import datetime

load_dotenv()

from core.database import get_db
from core.security import get_current_user


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


# =========================
# CREATE ORDER
# =========================
@router.post("/create-order")
async def create_order(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    try:
        bill_ids = data.get("bill_ids", [])
        amount = data.get("amount")

        if not bill_ids:
            raise HTTPException(
                status_code=400,
                detail="No bills selected"
            )

        # Fetch bills from DB
        bills = (
            db.query(models.MaintenanceBill)
            .filter(
                models.MaintenanceBill.id.in_(bill_ids),
                models.MaintenanceBill.user_id == current_user.id
            )
            .all()
        )

        if not bills:
            raise HTTPException(
                status_code=404,
                detail="Bills not found"
            )

        # Check already paid bills
        for bill in bills:
            if bill.status == "paid":
                raise HTTPException(
                    status_code=400,
                    detail=f"Bill for month {bill.month}/{bill.year} already paid"
                )

        # Calculate actual amount from DB
        actual_amount = sum(bill.amount for bill in bills)

        # Security check
        if actual_amount != amount:
            raise HTTPException(
                status_code=400,
                detail="Invalid amount"
            )

        # Razorpay amount in paise
        order_data = {
            "amount": int(actual_amount * 100),
            "currency": "INR",
            "payment_capture": 1,
        }

        order = client.order.create(data=order_data)

        return {
            "success": True,
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": os.getenv("RAZORPAY_KEY_ID"),
        }

    except Exception as e:
        print("CREATE ORDER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================
# VERIFY PAYMENT
# =========================
@router.post("/verify-payment")
async def verify_payment(
    data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    try:

        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        bill_ids = data.get("bill_ids", [])

        if not bill_ids:
            raise HTTPException(
                status_code=400,
                detail="No bills provided"
            )

        # Generate signature
        generated_signature = hmac.new(
            os.getenv("RAZORPAY_KEY_SECRET").encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        # Verify signature
        if generated_signature != razorpay_signature:
            raise HTTPException(
                status_code=400,
                detail="Invalid payment signature"
            )

        # Fetch bills
        bills = (
            db.query(models.MaintenanceBill)
            .filter(
                models.MaintenanceBill.id.in_(bill_ids),
                models.MaintenanceBill.user_id == current_user.id
            )
            .all()
        )

        if not bills:
            raise HTTPException(
                status_code=404,
                detail="Bills not found"
            )

        # Mark all bills as paid
        for bill in bills:

            bill.status = "paid"

            bill.transaction_id = razorpay_payment_id

            bill.payment_date = datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "message": "Payment verified successfully"
        }

    except Exception as e:
        print("VERIFY PAYMENT ERROR:", e)

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )