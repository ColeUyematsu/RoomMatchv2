from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from app.database import get_db
from app.auth import get_current_user, revoke_token, SECRET_KEY, ALGORITHM

router = APIRouter()

@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_current_user)
):
    """Revoke user's JWT token, logging them out."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        if jti:
            revoke_token(db, jti)  # ✅ This should work now
            return {"message": "Logged out successfully!"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")