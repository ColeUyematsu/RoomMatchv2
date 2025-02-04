from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    school: str

    @classmethod
    def validate_school_email(cls, email):
        """Ensure email ends with @mymail.pomona.edu"""
        if not email.endswith("@mymail.pomona.edu"):
            raise ValueError("Only @mymail.pomona.edu emails are allowed")
        return email


class ResponseCreate(BaseModel):
    """Schema for user questionnaire responses."""
    question1: int
    question2: int
    question3: int
    question4: int
    question5: int
    question6: int
    question7: int
    question8: int
    question9: int
    question10: int
    question11: int
    question12: int
    question13: int
    question14: int
    question15: int
    question16: int
    question17: int
    question18: int
    question19: int
    question20: int
    question21: int
    question22: int
    question23: int
    question24: int
    question25: int


class MatchResponse(BaseModel):
    """Schema for returning match results."""
    matchId: int
    match: str
    score: float

    class Config:
        json_schema_extra = {
            "example": {
                "match": "student@mymail.pomona.edu",
                "score": 0.9108
            }
        }
        
class MessageCreate(BaseModel):
    content: str