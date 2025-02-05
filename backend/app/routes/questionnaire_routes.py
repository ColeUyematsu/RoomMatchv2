import logging
from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Response
from app.auth import get_current_user

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/submit-questionnaire")
def submit_questionnaire(
    question1: int = Form(...), question2: int = Form(...), question3: int = Form(...),
    question4: int = Form(...), question5: int = Form(...), question6: int = Form(...),
    question7: int = Form(...), question8: int = Form(...), question9: int = Form(...),
    question10: int = Form(...), question11: int = Form(...), question12: int = Form(...),
    question13: int = Form(...), question14: int = Form(...), question15: int = Form(...),
    question16: int = Form(...), question17: int = Form(...), question18: int = Form(...),
    question19: int = Form(...), question20: int = Form(...), question21: int = Form(...),
    question22: int = Form(...), question23: int = Form(...), question24: int = Form(...),
    question25: int = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Ensures the questionnaire responses are always updated properly."""
    
    user_id = current_user.id
    existing_response = db.query(Response).filter(Response.user_id == user_id).first()

    if existing_response:
        db.query(Response).filter(Response.user_id == user_id).update({
            "question1": question1, "question2": question2, "question3": question3,
            "question4": question4, "question5": question5, "question6": question6,
            "question7": question7, "question8": question8, "question9": question9,
            "question10": question10, "question11": question11, "question12": question12,
            "question13": question13, "question14": question14, "question15": question15,
            "question16": question16, "question17": question17, "question18": question18,
            "question19": question19, "question20": question20, "question21": question21,
            "question22": question22, "question23": question23, "question24": question24,
            "question25": question25,
        })
    else:
        response_entry = Response(
            user_id=user_id,
            question1=question1, question2=question2, question3=question3,
            question4=question4, question5=question5, question6=question6,
            question7=question7, question8=question8, question9=question9,
            question10=question10, question11=question11, question12=question12,
            question13=question13, question14=question14, question15=question15,
            question16=question16, question17=question17, question18=question18,
            question19=question19, question20=question20, question21=question21,
            question22=question22, question23=question23, question24=question24,
            question25=question25
        )
        db.add(response_entry)

    db.commit()
    return {"message": "Questionnaire submitted successfully!"}


@router.get("/get-responses")
def get_user_responses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # Ensure authenticated user
):
    """Retrieve the user's stored questionnaire responses."""
    user_id = current_user.id
    response = db.query(Response).filter(Response.user_id == user_id).first()

    if not response:
        raise HTTPException(status_code=404, detail="No questionnaire responses found")

    return {
        "question1": response.question1,
        "question2": response.question2,
        "question3": response.question3,
        "question4": response.question4,
        "question5": response.question5,
        "question6": response.question6,
        "question7": response.question7,
        "question8": response.question8,
        "question9": response.question9,
        "question10": response.question10,
        "question11": response.question11,
        "question12": response.question12,
        "question13": response.question13,
        "question14": response.question14,
        "question15": response.question15,
        "question16": response.question16,
        "question17": response.question17,
        "question18": response.question18,
        "question19": response.question19,
        "question20": response.question20,
        "question21": response.question21,
        "question22": response.question22,
        "question23": response.question23,
        "question24": response.question24,
        "question25": response.question25,
    }