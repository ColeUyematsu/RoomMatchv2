from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.services.matching import get_best_matches
from app.schemas import MatchResponse
from app.models import User, Match
from typing import List

router = APIRouter()

@router.get(
    "/match-results",
    response_model=List[MatchResponse],
    summary="Get best roommate matches",
    description="""
    Retrieves the **top roommate matches** for the currently logged-in user.

    - **Authorization**: Requires a valid Bearer token.
    - **Response**: Returns a list of best matches with `matchId`, `email`, and `similarity score`.

    **Example Response:**
    ```json
    [
        {
            "matchId": 10,
            "match": "student@mymail.pomona.edu",
            "score": 0.9108
        },
        {
            "matchId": 11,
            "match": "newuser@mymail.pomona.edu",
            "score": 0.8075
        }
    ]
    ```
    """
)
@router.get("/match-results", response_model=List[MatchResponse])
def match_results(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Retrieve matches from the `matches` table for the logged-in user."""
    
    # Query the matches table for this user
    matches = db.query(Match).filter(
        (Match.user_id == current_user.id) | (Match.match_id == current_user.id)
    ).all()

    if not matches:
        raise HTTPException(status_code=404, detail="No matches found.")

    match_results = []
    for match in matches:
        # Identify the matched user's ID
        matched_user_id = match.match_id if match.user_id == current_user.id else match.user_id

        # Fetch matched user details
        matched_user = db.query(User).filter(User.id == matched_user_id).first()
        if matched_user:
            match_results.append({
                "matchId": int(matched_user.id),  # Ensure numeric matchId
                "match": matched_user.email,  # Display email as match name
                "score": match.similarity_score,  # Score from DB
            })

    return match_results

@router.post("/match/notify")
def notify_user_about_match(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Notify a user when their match wants a new match."""
    
    existing_match = db.query(Match).filter(
        (Match.user_id == current_user.id) | (Match.match_id == current_user.id)
    ).first()

    if not existing_match:
        raise HTTPException(status_code=404, detail="No active match found.")

    match_partner = db.query(User).filter(User.id == existing_match.match_id).first()

    return {
        "message": f"Your match {match_partner.email} wants a new match. Do you also want a new match?",
        "match_id": match_partner.id
    }
