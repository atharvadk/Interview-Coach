from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluationRequest, EvaluationResponse, Difficulty
from app.modules.evaluator.scorer import evaluate
from app.modules.feedback.generator import generate_feedback
from app.modules.adaptive.difficulty import adaptive_engine

router = APIRouter()


@router.post("/", response_model=EvaluationResponse)
def evaluate_answer(req: EvaluationRequest):
    try:
        # Step 1 — Run evaluation
        result = evaluate(
            question    = req.question,
            user_answer = req.answer,
            domain      = req.domain.value
        )

        # Step 2 — Generate feedback
        feedback = generate_feedback(
            question         = req.question,
            user_answer      = req.answer,
            expert_answer    = result["expert_answer"],
            missing_keywords = result["missing_keywords"],
            misconceptions   = result["misconceptions"],
            composite_score  = result["composite_score"],
            domain           = req.domain.value
        )

        # Step 3 — Update adaptive engine with new score
        adaptive_engine.init_session(req.session_id)
        adaptive_engine.add_score(req.session_id, result["composite_score"])

        # Step 4 — Get next difficulty
        next_difficulty = adaptive_engine.get_next_difficulty(req.session_id)

        return EvaluationResponse(
            question_id      = req.question_id,
            semantic_score   = result["semantic_score"],
            keyword_score    = result["keyword_score"],
            grammar_score    = result["grammar_score"],
            composite_score  = result["composite_score"],
            missing_keywords = result["missing_keywords"],
            misconceptions   = result["misconceptions"],
            feedback         = feedback,
            model_answer     = result["expert_answer"],
            next_difficulty  = next_difficulty
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))