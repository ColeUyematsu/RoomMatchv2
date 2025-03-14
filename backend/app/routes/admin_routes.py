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
    """Match users based on similarity scores and store results in the database.
    Continues matching until no more optimal matches can be found."""

    # Track all matched pairs across all iterations
    all_matched_pairs = []
    
    # Fetch all existing matches (in both directions)
    existing_matches_query = db.query(Match.user_id, Match.match_id).all()
    existing_matches = set()
    
    # Add both directions to the set to ensure we catch all previous matches
    for user_id, match_id in existing_matches_query:
        existing_matches.add((user_id, match_id))
        existing_matches.add((match_id, user_id))

    # Continue matching in iterations until no more matches can be made
    iterations = 0
    max_iterations = 10  # Safety limit to prevent infinite loops
    
    while iterations < max_iterations:
        iterations += 1
        
        # Fetch users who are still unmatched
        unmatched_users = db.query(User).filter(User.is_matched == False).all()
        
        if len(unmatched_users) < 2:
            break  # Exit if not enough users to match
            
        # Keep track of users available in this iteration
        available_users = {user.id: user for user in unmatched_users}
        matched_this_round = []
        matches_made_this_round = False
        
        # Convert available_users dict to list for iteration
        users_to_check = list(available_users.values())
        
        for user in users_to_check:
            if user.id not in available_users:
                continue  # Skip if this user was matched in this iteration
                
            best_matches = get_best_matches(user.id, db, top_n=10)
            
            if not best_matches:
                continue  # Skip if no valid matches
                
            for match in best_matches:
                matched_user = db.query(User).filter(User.email == match["match"]).first()
                
                if (
                    matched_user
                    and matched_user.id in available_users
                    and matched_user.id != user.id  # Ensure not matching with self
                    and (user.id, matched_user.id) not in existing_matches  # Check if they've already matched
                ):
                    # Create a new match entry in the database
                    new_match = Match(user_id=user.id, match_id=matched_user.id, similarity_score=match["score"])
                    db.add(new_match)
                    
                    # Add to our local tracking of existing matches
                    existing_matches.add((user.id, matched_user.id))
                    existing_matches.add((matched_user.id, user.id))
                    
                    # Update match info for return data
                    match_info = {"user1": user.email, "user2": matched_user.email, "score": match["score"]}
                    matched_this_round.append(match_info)
                    all_matched_pairs.append(match_info)
                    
                    # Update requested_new_match to False after matching
                    user.requested_new_match = False
                    matched_user.requested_new_match = False
                    
                    # Remove both users from available pool
                    del available_users[user.id]
                    del available_users[matched_user.id]
                    
                    matches_made_this_round = True
                    break  # Move to the next user after a successful match
        
        # Commit after each round to save progress
        db.commit()
        
        print(f"Round {iterations}: Matched {len(matched_this_round)} pairs")
        
        # If no matches were made this round, we're done
        if not matches_made_this_round:
            break
    
    # Final commit to ensure all changes are saved
    db.commit()
    
    if not all_matched_pairs:
        return []
        
    return {"matches": all_matched_pairs}


@router.get("/admin/user-status")
def get_user_status(db: Session = Depends(get_db)):
    unmatched_users = db.query(User).filter(User.is_matched == False).all()
    matched_users = db.query(User).filter(User.is_matched == True).all()

    return {
        "unmatched_users": [user.email for user in unmatched_users],
        "matched_users": [user.email for user in matched_users],
    }