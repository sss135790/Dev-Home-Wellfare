import json

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models.models as models
import schema.schemas as schemas

from core.database import get_db
from core.security import get_current_user

router = APIRouter(
    prefix="/api/polls",
    tags=["Polls"]
)

@router.get("/", response_model=List[schemas.VotePollOut])
def get_polls(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    polls = db.query(models.VotePoll).all()

    results = []

    for poll in polls:

        options_list = json.loads(poll.options)

        votes = db.query(models.VoteCast).filter(
            models.VoteCast.poll_id == poll.id
        ).all()

        votes_count = {opt: 0 for opt in options_list}

        for vote in votes:
            if vote.selected_option in votes_count:
                votes_count[vote.selected_option] += 1

        user_vote = db.query(models.VoteCast).filter(
            models.VoteCast.poll_id == poll.id,
            models.VoteCast.user_id == current_user.id
        ).first()

        results.append({
            "id": poll.id,
            "title": poll.title,
            "description": poll.description,
            "options": options_list,
            "closed": poll.closed,
            "created_at": poll.created_at,
            "results": votes_count,
            "has_voted": user_vote is not None,
            "voted_option": (
                user_vote.selected_option
                if user_vote else None
            )
        })

    return results

@router.post("/", response_model=schemas.VotePollOut)
def create_poll(
    poll: schemas.VotePollCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins allowed"
        )

    db_poll = models.VotePoll(
        title=poll.title,
        description=poll.description,
        options=json.dumps(poll.options),
        closed=False
    )

    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)

    return {
        "id": db_poll.id,
        "title": db_poll.title,
        "description": db_poll.description,
        "options": poll.options,
        "closed": db_poll.closed,
        "created_at": db_poll.created_at,
        "results": {opt: 0 for opt in poll.options},
        "has_voted": False,
        "voted_option": None
    }

@router.post("/{poll_id}/vote", response_model=schemas.VoteCastOut)
def cast_vote(
    poll_id: int,
    vote: schemas.VoteCastCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    poll = db.query(models.VotePoll).filter(
        models.VotePoll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Poll not found"
        )

    if poll.closed:
        raise HTTPException(
            status_code=400,
            detail="Poll closed"
        )

    existing_vote = db.query(models.VoteCast).filter(
        models.VoteCast.poll_id == poll_id,
        models.VoteCast.user_id == current_user.id
    ).first()

    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="Already voted"
        )

    options_list = json.loads(poll.options)

    if vote.selected_option not in options_list:
        raise HTTPException(
            status_code=400,
            detail="Invalid option"
        )

    db_vote = models.VoteCast(
        poll_id=poll_id,
        user_id=current_user.id,
        selected_option=vote.selected_option
    )

    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)

    return db_vote