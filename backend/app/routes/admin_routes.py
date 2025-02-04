from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_admin  
from app.models import User, Response

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