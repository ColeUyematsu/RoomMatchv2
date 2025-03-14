from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.models import User
from app.auth import get_password_hash, authenticate_user, create_access_token
from datetime import timedelta
from app.auth import get_current_user, verify_password
from app.services.matching import get_best_matches
import os
import shutil
import re

router = APIRouter()

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 30

SCHOOL_EMAIL_DOMAINS = {
    "Pomona College": "mymail.pomona.edu",
    "Claremont McKenna College": "cmc.edu",
    "Harvey Mudd College": "hmc.edu",
    "Scripps College": "scrippscollege.edu",
    "Pitzer College": "students.pitzer.edu",
    "Stanford University": "stanford.edu",
    "UC Berkeley": "berkeley.edu",
    "MIT": "mit.edu",
    "Harvard University": "harvard.edu",
    # Add more schools and their domains as needed
}


# Profile picture upload directory
UPLOAD_DIR = "static/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure directory exists

PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$"

def validate_password(password: str):
    """Ensure password meets security criteria."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    if not re.search(r"[@$!%*?&#]", password):
        return False, "Password must contain at least one special character (@, $, !, %, *, ?, &)."
    return True, ""

# -----------------------
# User Registration
# -----------------------
@router.post("/register")
def register_user(
    email: str = Form(...),
    password: str = Form(...),
    school: str = Form(...),
    hometown: str = Form(None),
    major: str = Form(None),
    graduation_year: str = Form(None),
    interests: str = Form(None),
    prompt1: str = Form(None),
    response1: str = Form(None),
    prompt2: str = Form(None),
    response2: str = Form(None),
    prompt3: str = Form(None),
    response3: str = Form(None),
    profile_picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Registers a new user with optional profile details."""

    # 🔹 Check if email format is valid
    if "@" not in email or "." not in email.split("@")[-1]:
        return JSONResponse(status_code=400, content={"success": False, "message": "Invalid email format. Please enter a valid email."})

    email_domain = email.split("@")[-1]
    expected_domain = SCHOOL_EMAIL_DOMAINS.get(school)

    # 🔹 Check if email matches the school's domain
    if expected_domain and email_domain != expected_domain:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": f"Email does not match {school}. Use an email ending with @{expected_domain}."}
        )

    # 🔹 Validate password strength
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return JSONResponse(status_code=400, content={"success": False, "message": password_error})

    # 🔹 Check if email is already registered
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": "This email is already registered. Try logging in."}
        )

    try:
        hashed_password = get_password_hash(password)

        # 🔹 Save profile picture if uploaded
        profile_pic_path = None
        if profile_picture:
            try:
                filename = f"user_{email.replace('@', '_').replace('.', '_')}.jpg"
                file_path = os.path.join(UPLOAD_DIR, filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(profile_picture.file, buffer)
                profile_pic_path = f"/static/profile_pics/{filename}"
            except Exception as e:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "message": f"Error uploading profile picture: {str(e)}"}
                )

        # 🔹 Create user in the database
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            school=school,
            hometown=hometown,
            major=major,
            graduation_year=graduation_year,
            interests=interests,
            prompt1=prompt1,
            response1=response1,
            prompt2=prompt2,
            response2=response2,
            prompt3=prompt3,
            response3=response3,
            profile_picture=profile_pic_path,
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return JSONResponse(status_code=201, content={"success": True, "message": "User registered successfully! You can now log in."})

    except Exception as e:
        db.rollback()
        return JSONResponse(status_code=500, content={"success": False, "message": f"Registration failed: {str(e)}"})

# -----------------------
# Login (Token Generation)
# -----------------------
@router.post("/token")
def login_for_access_token(
    username: str = Form(...),  # OAuth expects "username"
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id, "is_admin": user.is_admin})  # Include user_id
    
    return {"access_token": access_token, "user_id": user.id}  # Send user_id 

# The rest of your routes remain unchanged
# -----------------------
# Retrieve User Profile
# -----------------------
@router.get("/user-profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve user profile information with fallback values."""
    return {
        "email": current_user.email,
        "school": current_user.school,
        "hometown": current_user.hometown or "",
        "major": current_user.major or "",
        "graduation_year": current_user.graduation_year or "",
        "interests": current_user.interests or "",
        "profile_picture": current_user.profile_picture or "/static/profile_pics/default-avatar.png",  
        "prompts": [
            {"prompt": current_user.prompt1 or "", "response": current_user.response1 or ""},
            {"prompt": current_user.prompt2 or "", "response": current_user.response2 or ""},
            {"prompt": current_user.prompt3 or "", "response": current_user.response3 or ""},
        ]
    }
# -----------------------
# Update User Profile
# -----------------------
@router.post("/update-profile")
async def update_profile(
    hometown: str = Form(""),
    major: str = Form(""),
    graduation_year: str = Form(""),
    interests: str = Form(""),
    selected_prompt1: str = Form(""),
    response1: str = Form(""),
    selected_prompt2: str = Form(""),
    response2: str = Form(""),
    selected_prompt3: str = Form(""),
    response3: str = Form(""),
    profile_picture: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user profile fields
    user.hometown = hometown
    user.major = major
    user.graduation_year = graduation_year
    user.interests = interests
    user.prompt1 = selected_prompt1
    user.response1 = response1
    user.prompt2 = selected_prompt2
    user.response2 = response2
    user.prompt3 = selected_prompt3
    user.response3 = response3

    # Handle profile picture upload
    if profile_picture:
        filename = f"user_{current_user.id}.jpg"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
        
        user.profile_picture = f"/static/profile_pics/{filename}"  # Store relative path

    # Save to database
    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully!",
        "profile_picture": user.profile_picture,
        "hometown": user.hometown,
        "major": user.major,
        "graduation_year": user.graduation_year,
        "interests": user.interests,
        "prompt1": user.prompt1,
        "prompt2": user.prompt2,
        "prompt3": user.prompt3,
    }


# -----------------------
# Retrieve Available Prompts
# -----------------------
@router.get("/prompts", response_model=list[str])
def get_available_prompts():
    """Returns a list of predefined prompt options."""
    prompts = [
        "What's something unique about you?",
        "What's your ideal weekend?",
        "Describe your perfect roommate situation.",
        "What's a fun fact about yourself?",
        "What's your favorite hobby?",
        "What's a dealbreaker in a roommate?",
        "How do you handle conflict?",
        "What's your sleep schedule like?",
        "What's your go-to comfort meal?",
        "Do you prefer a quiet or social living space?"
    ]
    return prompts

@router.get("/user-profile/{user_id}")
def get_match_profile(user_id: int, db: Session = Depends(get_db)):
    """Retrieve a matched user's profile using their email."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "email": user.email,
        "school": user.school,
        "hometown": user.hometown or "",
        "major": user.major or "",
        "graduation_year": user.graduation_year or "",
        "interests": user.interests or "",
        "profile_picture": user.profile_picture or "/static/profile_pics/default-avatar.png",
        "prompts": [
            {"prompt": user.prompt1 or "", "response": user.response1 or ""},
            {"prompt": user.prompt2 or "", "response": user.response2 or ""},
            {"prompt": user.prompt3 or "", "response": user.response3 or ""},
        ]
    }
@router.get("/matches")
def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return roommate matches for the logged-in user."""
    user_id = current_user.id
    matches = get_best_matches(user_id, db)

    if not matches:
        raise HTTPException(status_code=404, detail="No matches found")

    return {"matches": matches}

@router.post("/request-new-match")
def request_new_match(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allows a user to request a new match."""
    
    current_user.requested_new_match = True
    db.commit()
    return {"message": "You have requested a new match."}
