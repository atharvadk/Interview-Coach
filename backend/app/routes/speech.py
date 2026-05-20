from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.modules.speech.transcriber import transcribe
from app.models.schemas import TranscriptionResponse

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio:      UploadFile = File(...),
    session_id: str        = Form(...)
):
    try:
        audio_bytes = await audio.read()

        if not audio_bytes:
            # Return empty instead of 400 error
            return TranscriptionResponse(
                transcript="",
                duration_seconds=0.0
            )

        result = transcribe(audio_bytes)

        # Always return 200 — even if transcript is empty
        # Frontend handles empty transcript gracefully
        return TranscriptionResponse(
            transcript=result.get("transcript", ""),
            duration_seconds=result.get("duration_seconds", 0.0)
        )

    except Exception as e:
        print(f"Speech route error: {e}")
        # Never return 500 — return empty transcript instead
        return TranscriptionResponse(
            transcript="",
            duration_seconds=0.0
        )