from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    school = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # New fields for additional user details
    hometown = Column(String, nullable=True)
    major = Column(String, nullable=True)
    graduation_year = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    
    # Profile customization
    profile_picture = Column(String, nullable=True)  # Stores image URL or path
    prompt1 = Column(String, nullable=True)  # Stores the selected prompt
    response1 = Column(String, nullable=True)  # Stores the user response
    prompt2 = Column(String, nullable=True)
    response2 = Column(String, nullable=True)
    prompt3 = Column(String, nullable=True)
    response3 = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    responses = relationship("Response", back_populates="user", cascade="all, delete")

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # Ensure ForeignKey is linked properly
    question1 = Column(Integer) 
    question2 = Column(Integer)  
    question3 = Column(Integer)  
    question4 = Column(Integer)
    question5 = Column(Integer)
    question6 = Column(Integer)
    question7 = Column(Integer)
    question8 = Column(Integer)
    question9 = Column(Integer)
    question10 = Column(Integer)
    question11 = Column(Integer)
    question12 = Column(Integer)
    question13 = Column(Integer)
    question14 = Column(Integer)
    question15 = Column(Integer)
    question16 = Column(Integer)
    question17 = Column(Integer)
    question18 = Column(Integer)
    question19 = Column(Integer)
    question20 = Column(Integer)
    question21 = Column(Integer)
    question22 = Column(Integer)
    question23 = Column(Integer)
    question24 = Column(Integer)
    question25 = Column(Integer)

    # Relationship with user
    user = relationship("User", back_populates="responses")

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String, unique=True, index=True)  # JWT ID
    revoked_at = Column(DateTime, default=datetime.utcnow)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    similarity_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
    matched_user = relationship("User", foreign_keys=[match_id])
    
class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=func.now())