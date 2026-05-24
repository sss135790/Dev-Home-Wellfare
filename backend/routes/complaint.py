from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models.models as models
import schema.schemas as schemas

from core.database import get_db
from core.security import get_current_user

router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"]
)

@router.get("/", response_model=List[schemas.ComplaintOut])
def get_complaints(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role == "admin":

        return db.query(models.Complaint).order_by(
            models.Complaint.created_at.desc()
        ).all()

    return db.query(models.Complaint).filter(
        models.Complaint.user_id == current_user.id
    ).order_by(
        models.Complaint.created_at.desc()
    ).all()

@router.post("/", response_model=schemas.ComplaintOut)
def create_complaint(
    complaint: schemas.ComplaintCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    db_complaint = models.Complaint(
        user_id=current_user.id,
        title=complaint.title,
        category=complaint.category,
        description=complaint.description,
        status="pending"
    )

    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    return db_complaint

@router.patch("/{complaint_id}", response_model=schemas.ComplaintOut)
def update_complaint_status(
    complaint_id: int,
    status_update: schemas.ComplaintStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins allowed"
        )

    db_complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()

    if not db_complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    db_complaint.status = status_update.status

    db.commit()
    db.refresh(db_complaint)

    return db_complaint