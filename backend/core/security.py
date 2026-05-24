from typing import Optional

from fastapi import Header, HTTPException, Depends
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.database import get_db
from core.config import SECRET_KEY, ALGORITHM
import models.models as models

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    try:

        token_type, token = authorization.split(" ")

        if token_type.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )

    except (JWTError, ValueError):

        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )

    user = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user