from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_admin  
from app.models import User, Response, Match
from app.services.matching import get_best_matches

router = APIRouter()

@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Only admins can view platform statistics."""
    user_count = db.query(User).count()
    response_count = db.query(Response).count()

    return {
        "total_users": user_count,
        "total_responses": response_count
    }


@router.post("/admin/match-users")
def match_users(db: Session = Depends(get_db)):
    """Match users and store results in the database."""
    
    unmatched_users = db.query(User).filter(User.is_matched == False).all()
    if len(unmatched_users) < 2:
        raise HTTPException(status_code=400, detail="Not enough unmatched users to create a match.")

    matched_pairs = []

    while len(unmatched_users) > 1:
        user1 = unmatched_users.pop()
        user2 = unmatched_users.pop()

        new_match = Match(user_id=user1.id, match_id=user2.id, similarity_score=0.9)
        db.add(new_match)
        matched_pairs.append({"user1": user1.email, "user2": user2.email})

    db.commit()
    return {"matches": matched_pairs}

@router.get("/admin/user-status")
def get_user_status(db: Session = Depends(get_db)):
    unmatched_users = db.query(User).filter(User.is_matched == False).all()
    matched_users = db.query(User).filter(User.is_matched == True).all()

    return {
        "unmatched_users": [user.email for user in unmatched_users],
        "matched_users": [user.email for user in matched_users],
    }