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
            raise HTTPException(status_code=400, detail="Empty audio file")

        result = transcribe(audio_bytes)

        if not result["transcript"]:
            raise HTTPException(status_code=422, detail="Could not transcribe audio")

        return TranscriptionResponse(
            transcript        = result["transcript"],
            duration_seconds  = result["duration_seconds"]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))