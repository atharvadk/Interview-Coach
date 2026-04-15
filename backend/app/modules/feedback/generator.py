import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_URL    = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}"
}


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

    return f"""<s>[INST]
You are an expert technical interview coach giving feedback to a student.

Question asked: {question}

Student's answer: {user_answer}

Expert answer: {expert_answer}

Evaluation results:
- Score: {composite_score}/10
- Missing keywords: {missing_kw_str}
- Misconceptions found: {misconceptions_str}

Give personalized feedback in 3-4 sentences:
1. Start with what the student got right
2. Point out what important concepts were missing
3. Give one specific tip to improve the answer
4. End with encouragement

Keep it conversational, helpful, and specific to the {domain} domain.
Do not repeat the question. Do not give the full answer away.
Only return the feedback text, nothing else.
[/INST]</s>"""


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

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens":     200,
            "temperature":        0.7,
            "do_sample":          True,
            "repetition_penalty": 1.2,
            "return_full_text":   False    # only return generated part not the prompt
        }
    }

    try:
        response = requests.post(MODEL_URL, headers=HEADERS, json=payload, timeout=60)
        response.raise_for_status()

        data     = response.json()
        feedback = data[0]["generated_text"].strip()

        # Clean up any leftover instruction tags
        for tag in ["[INST]", "[/INST]", "<s>", "</s>"]:
            feedback = feedback.replace(tag, "").strip()

        if not feedback or len(feedback) < 20:
            return fallback_feedback(composite_score, missing_keywords)

        return feedback

    except Exception as e:
        print(f"Feedback generation error: {e}")
        return fallback_feedback(composite_score, missing_keywords)


def fallback_feedback(composite_score: float, missing_keywords: list) -> str:
    """
    Used when Mistral API fails.
    Returns a generic but useful feedback message.
    """
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