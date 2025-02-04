from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Message
from app.schemas import MessageCreate
from app.auth import get_current_user
from typing import List


router = APIRouter()

active_connections: List[WebSocket] = []


# In-memory active WebSocket connections

@router.get("/messages/{user_id}/{match_id}")
def get_messages(user_id: int, match_id: int, db: Session = Depends(get_db)):
    """Retrieve chat messages between two users."""
    messages = db.query(Message).filter(
        ((Message.sender_id == user_id) & (Message.receiver_id == match_id)) |
        ((Message.sender_id == match_id) & (Message.receiver_id == user_id))
    ).order_by(Message.timestamp).all()
    return [{"sender": msg.sender_id, "content": msg.content, "timestamp": msg.timestamp} for msg in messages]

@router.post("/messages/{user_id}/{match_id}")
def send_message(
    user_id: int, match_id: int, message: MessageCreate, 
    db: Session = Depends(get_db), current_user = Depends(get_current_user)
):
    """Send a message to a match."""
    new_message = Message(sender_id=user_id, receiver_id=match_id, content=message.content)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Send real-time update to WebSocket
    if match_id in active_connections:
        active_connections[match_id].send_json({"sender": user_id, "content": message.content})

    return {"message": "Message sent"}

@router.websocket("/chat/{user_id}/{match_id}")
async def websocket_chat(websocket: WebSocket, user_id: int, match_id: int):
    """WebSocket connection for real-time chat updates."""
    await websocket.accept()
    active_connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            message = Message(sender_id=user_id, receiver_id=match_id, content=data["content"])
            
            # Store message in DB
            db = next(get_db())
            db.add(message)
            db.commit()

            # Send message to receiver if connected
            if match_id in active_connections:
                await active_connections[match_id].send_json(data)
    except WebSocketDisconnect:
        del active_connections[user_id]