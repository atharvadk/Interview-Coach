from fastapi import APIRouter, HTTPException
from app.models.schemas import QuestionRequest, QuestionResponse, Difficulty
from app.modules.question_gen.generator import generate_question
import uuid

router = APIRouter()

# Track question number per session in memory
session_counters = {}


@router.post("/generate", response_model=QuestionResponse)
def generate(req: QuestionRequest):
    try:
        # Track question number
        if req.session_id not in session_counters:
            session_counters[req.session_id] = 1
        else:
            session_counters[req.session_id] += 1

        question_number = session_counters[req.session_id]

        # Generate question
        question = generate_question(
            domain     = req.domain.value,
            difficulty = req.difficulty.value,
            session_id = req.session_id
        )

        return QuestionResponse(
            question_id     = str(uuid.uuid4()),
            question        = question,
            domain          = req.domain,
            difficulty      = req.difficulty,
            question_number = question_number
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))