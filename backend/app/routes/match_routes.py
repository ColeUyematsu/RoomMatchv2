from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.services.matching import get_best_matches
from app.schemas import MatchResponse
from app.models import User  # ✅ Import User model
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
    """Retrieve top 5 best matches for the logged-in user."""
    best_matches = get_best_matches(current_user.id, db)
    
    if not best_matches:
        raise HTTPException(status_code=404, detail="No match found")

    # Ensure we return matchId, match (email), and score
    match_results = []
    for match in best_matches:
        matched_user = db.query(User).filter(User.email == match["match"]).first()
        if matched_user:
            match_results.append({
                "matchId": matched_user.id,  # ✅ Get matchId
                "match": match["match"],
                "score": match["score"],  # ✅ Include score
            })

    return match_results  # ✅ Now includes matchId and score