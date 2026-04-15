from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.modules.face_analysis.analyzer import analyze_frame
from app.models.schemas import FaceAnalysisResponse

router = APIRouter()


@router.post("/analyze", response_model=FaceAnalysisResponse)
async def analyze_face(
    frame:      UploadFile = File(...),
    session_id: str        = Form(...)
):
    try:
        image_bytes = await frame.read()

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image")

        result = analyze_frame(image_bytes)

        return FaceAnalysisResponse(
            dominant_emotion = result["dominant_emotion"],
            emotion_scores   = result["emotion_scores"],
            confidence_level = result["confidence_level"]
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))