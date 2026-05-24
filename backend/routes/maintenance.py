import datetime
import random

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models.models as models
import schema.schemas as schemas

from core.database import get_db
from core.security import get_current_user

router = APIRouter(
    prefix="/api/maintenance",
    tags=["Maintenance"]
)

@router.get("/", response_model=List[schemas.MaintenanceBillOut])
def get_user_bills(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(models.MaintenanceBill).filter(
        models.MaintenanceBill.user_id == current_user.id
    ).all()

@router.post("/{bill_id}/pay", response_model=schemas.MaintenanceBillOut)
def pay_bill(
    bill_id: int,
    payment: schemas.PaymentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    bill = db.query(models.MaintenanceBill).filter(
        models.MaintenanceBill.id == bill_id,
        models.MaintenanceBill.user_id == current_user.id
    ).first()

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Bill not found"
        )

    if bill.status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Already paid"
        )

    if bill.status == "upcoming":
        raise HTTPException(
            status_code=400,
            detail="Cannot pay upcoming bill"
        )

    bill.status = "paid"

    bill.payment_date = datetime.datetime.utcnow()

    bill.transaction_id = (
        f"TXN"
        f"{datetime.datetime.now().strftime('%Y%m%d')}"
        f"{random.randint(1000, 9999)}"
    )

    db.commit()
    db.refresh(bill)

    return bill