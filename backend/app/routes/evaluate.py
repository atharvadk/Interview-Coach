from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluationRequest, EvaluationResponse, Difficulty
from app.modules.evaluator.scorer import evaluate

router = APIRouter()


def determine_next_difficulty(composite_score: float, current_difficulty: str) -> Difficulty:
    if composite_score >= 8.0:
        return Difficulty.HARD
    elif composite_score >= 5.0:
        return Difficulty.MEDIUM
    else:
        return Difficulty.EASY


@router.post("/", response_model=EvaluationResponse)
def evaluate_answer(req: EvaluationRequest):
    try:
        result = evaluate(
            question    = req.question,
            user_answer = req.answer,
            domain      = req.domain.value
        )

        next_difficulty = determine_next_difficulty(
            result["composite_score"],
            req.difficulty if hasattr(req, "difficulty") else "medium"
        )

        return EvaluationResponse(
            question_id      = req.question_id,
            semantic_score   = result["semantic_score"],
            keyword_score    = result["keyword_score"],
            grammar_score    = result["grammar_score"],
            composite_score  = result["composite_score"],
            missing_keywords = result["missing_keywords"],
            misconceptions   = result["misconceptions"],
            feedback         = "",           # will be filled in Phase 5
            model_answer     = result["expert_answer"],
            next_difficulty  = next_difficulty
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))