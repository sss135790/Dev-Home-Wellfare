from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models.models as models
import schema.schemas as schemas

from core.database import get_db
from core.security import get_current_user

router = APIRouter(
    prefix="/api/notices",
    tags=["Notices"]
)

@router.get("/", response_model=List[schemas.NoticeOut])
def get_notices(
    db: Session = Depends(get_db)
):

    return db.query(models.Notice).all()

@router.post("/", response_model=schemas.NoticeOut)
def create_notice(
    notice: schemas.NoticeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins allowed"
        )

    db_notice = models.Notice(
        title=notice.title,
        content=notice.content,
        tag=notice.tag
    )

    db.add(db_notice)

    db.commit()

    db.refresh(db_notice)

    return db_notice