import os
from app.modules.models_loader import get_flan_t5_model, get_tokenizer
import torch
from dotenv import load_dotenv

load_dotenv()


def build_feedback_prompt(
    question:         str,
    user_answer:      str,
    expert_answer:    str,
    missing_keywords: list,
    misconceptions:   list,
    composite_score:  float,
    domain:           str
) -> str:

    missing_kw_str     = ", ".join(missing_keywords) if missing_keywords else "none"
    misconceptions_str = ", ".join(misconceptions)   if misconceptions   else "none"

    return f"""You are an expert {domain} interview coach giving feedback to a student.

Question: {question}

Student answer: {user_answer}

Expert answer: {expert_answer}

Score: {composite_score}/10
Missing keywords: {missing_kw_str}
Misconceptions: {misconceptions_str}

Give helpful feedback in 3-4 sentences. Mention what was good, what was missing, and one improvement tip."""


def generate_feedback(
    question:         str,
    user_answer:      str,
    expert_answer:    str,
    missing_keywords: list,
    misconceptions:   list,
    composite_score:  float,
    domain:           str
) -> str:

    prompt = build_feedback_prompt(
        question         = question,
        user_answer      = user_answer,
        expert_answer    = expert_answer,
        missing_keywords = missing_keywords,
        misconceptions   = misconceptions,
        composite_score  = composite_score,
        domain           = domain
    )

    try:
        tokenizer = get_tokenizer()
        model = get_flan_t5_model()
        
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512
        )

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=200,
                do_sample=True,
                temperature=0.7,
                repetition_penalty=1.2
            )

        feedback = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        if not feedback or len(feedback) < 20:
            return fallback_feedback(composite_score, missing_keywords)

        return feedback

    except Exception as e:
        print(f"Flan-T5 feedback error: {e}")
        return fallback_feedback(composite_score, missing_keywords)


def fallback_feedback(composite_score: float, missing_keywords: list) -> str:
    missing_str = ", ".join(missing_keywords[:3]) if missing_keywords else "some key concepts"

    if composite_score >= 8.0:
        return (
            f"Excellent answer! You demonstrated strong understanding of the topic. "
            f"To make it perfect, consider also mentioning {missing_str}. Keep it up!"
        )
    elif composite_score >= 5.0:
        return (
            f"Good attempt! You covered the basics but missed some important concepts like {missing_str}. "
            f"Try to be more specific and use technical terminology in your answers."
        )
    else:
        return (
            f"You are on the right track but your answer needs more depth. "
            f"Make sure to cover {missing_str} in your response. "
            f"Review the core concepts and try again — you will get there!"
        )