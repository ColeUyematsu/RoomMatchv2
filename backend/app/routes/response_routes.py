from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import Response, User
from app.schemas import ResponseCreate


router = APIRouter()

@router.post("/submit-preferences")
def submit_preferences(
    response_data: ResponseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Saves or updates user questionnaire responses."""
    
    # Check if the user already has a response
    existing_response = db.query(Response).filter(Response.user_id == current_user.id).first()

    if existing_response:
        # If response exists, update it instead of adding a new one
        for i in range(1, 26):
            setattr(existing_response, f"question{i}", getattr(response_data, f"question{i}"))
            db.commit()
            db.refresh(existing_response)
        
        return {"message": "Preferences updated successfully!"}


    else:
        # Create new response
        response_dict = response_data.dict()
        response_dict["user_id"] = current_user.id
        new_response = Response(**response_dict)
        
        db.add(new_response)
        db.commit()
        db.refresh(new_response)
        return {"message": "Preferences saved successfully!"}


@router.get("/responses")
def get_user_responses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow users to retrieve their own questionnaire responses."""
    responses = db.query(Response).filter(Response.user_id == current_user.id).all()
    if not responses:
        raise HTTPException(status_code=404, detail="No responses found")
    return {"responses": responses}

@router.put("/responses/{response_id}")
def update_response(
    response_data: ResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_response = db.query(Response).filter(Response.user_id == current_user.id).first()
    """Allow users to update their own roommate questionnaire responses."""
    response = db.query(Response).filter(Response.id == Response.user_id, Response.user_id == current_user.id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    for i in range(1, 26):
        if hasattr(existing_response, f"question{i}"):
            setattr(existing_response, f"question{i}", getattr(response_data, f"question{i}", None))


    db.commit()
    db.refresh(existing_response)
    return {"message": "Response updated!"}

@router.delete("/responses/{response_id}")
def delete_response(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow users to delete their own responses."""
    response = db.query(Response).filter(Response.id == Response.user_id, Response.user_id == current_user.id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    db.delete(response)
    db.commit()
    return {"message": "Response deleted!"}

@router.post("/submit-preferences")
def submit_preferences(
    response_data: ResponseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Saves user questionnaire responses."""
    response = Response(
        user_id=current_user.id,
        question1=response_data.question1,
        question2=response_data.question2,
        question3=response_data.question3
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return {"message": "Preferences saved successfully!"}