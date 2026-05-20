from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import uuid

router = APIRouter()

# Simple in-memory session storage (in production, use a database)
sessions = {}

@router.post("/start", response_class=JSONResponse)
def start_session(data: dict):
    """Start a new interview session"""
    try:
        session_id = str(uuid.uuid4())

        # Store session data
        sessions[session_id] = {
            "sessionId": session_id,
            "domain": data.get("domain"),
            "difficulty": data.get("difficulty"),
            "totalQuestions": data.get("totalQuestions"),
            "resumeUrl": data.get("resumeUrl"),
            "answers": []
        }

        return {
            "sessionId": session_id,
            "domain": data.get("domain"),
            "difficulty": data.get("difficulty"),
            "totalQuestions": data.get("totalQuestions")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}", response_class=JSONResponse)
def get_session(session_id: str):
    """Get session details"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return sessions[session_id]

@router.put("/{session_id}", response_class=JSONResponse)
def update_session(session_id: str, data: dict):
    """Update session data"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    sessions[session_id].update(data)
    return sessions[session_id]
