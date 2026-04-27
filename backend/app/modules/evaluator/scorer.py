import language_tool_python
from sentence_transformers import util
from app.knowledge_base.loader import get_expert_data
from app.modules.models_loader import get_similarity_model, get_grammar_tool


# ── Semantic Similarity ───────────────────────────────────────────────────────
def semantic_score(user_answer: str, expert_answer: str) -> float:
    """
    Compares user answer to expert answer using cosine similarity.
    Returns score between 0 and 10.
    """
    if not user_answer or not expert_answer:
        return 0.0

    model = get_similarity_model()
    
    user_embedding   = model.encode(user_answer,   convert_to_tensor=True)
    expert_embedding = model.encode(expert_answer, convert_to_tensor=True)

    similarity = util.cos_sim(user_embedding, expert_embedding).item()

    # Convert from 0-1 range to 0-10
    return round(similarity * 10, 2)


# ── Keyword Matching ──────────────────────────────────────────────────────────
def keyword_score(user_answer: str, keywords: list) -> tuple:
    """
    Checks how many keywords are present in user answer.
    Returns score 0-10 and list of missing keywords.
    """
    if not keywords:
        return 5.0, []

    user_lower    = user_answer.lower()
    matched       = [kw for kw in keywords if kw.lower() in user_lower]
    missing       = [kw for kw in keywords if kw.lower() not in user_lower]

    score = (len(matched) / len(keywords)) * 10
    return round(score, 2), missing


# ── Grammar Score ─────────────────────────────────────────────────────────────
def grammar_score(user_answer: str) -> float:
    """
    Checks grammar quality of user answer.
    Penalizes based on number of grammar errors found.
    Returns score between 0 and 10.
    """
    if not user_answer:
        return 0.0

    grammar_tool = get_grammar_tool()
    matches    = grammar_tool.check(user_answer)
    errors     = len(matches)
    words      = len(user_answer.split())

    # Error rate — errors per word
    error_rate = errors / max(words, 1)

    if error_rate == 0:
        return 10.0
    elif error_rate < 0.05:
        return 8.0
    elif error_rate < 0.10:
        return 6.0
    elif error_rate < 0.20:
        return 4.0
    else:
        return 2.0


# ── Misconception Detection ───────────────────────────────────────────────────
def detect_misconceptions(user_answer: str, misconceptions: list) -> list:
    """
    Checks if user answer contains any known misconceptions.
    Returns list of misconceptions found.
    """
    if not misconceptions:
        return []

    user_lower = user_answer.lower()
    found      = []

    for misconception in misconceptions:
        # Check if key words of misconception appear in answer
        misconception_words = set(misconception.lower().split())
        # If more than half the misconception words appear, flag it
        overlap = sum(1 for w in misconception_words if w in user_lower)
        if overlap >= len(misconception_words) // 2 + 1:
            found.append(misconception)

    return found


# ── Composite Score ───────────────────────────────────────────────────────────
def composite_score(sem_score: float, kw_score: float, gram_score: float) -> float:
    """
    Weighted average of all 3 scores.
    Semantic similarity carries the most weight.
    """
    weights = {
        "semantic": 0.50,
        "keyword":  0.35,
        "grammar":  0.15
    }

    score = (
        sem_score  * weights["semantic"] +
        kw_score   * weights["keyword"]  +
        gram_score * weights["grammar"]
    )

    return round(score, 2)


# ── Main Evaluate Function ────────────────────────────────────────────────────
def evaluate(question: str, user_answer: str, domain: str) -> dict:
    # Get expert data from knowledge base
    expert_data   = get_expert_data(domain, question)
    expert_answer = expert_data["expert_answer"]
    keywords      = expert_data["keywords"]
    misconceptions = expert_data["misconceptions"]

    # Run all scoring layers
    sem_score              = semantic_score(user_answer, expert_answer)
    kw_score, missing_kws  = keyword_score(user_answer, keywords)
    gram_score             = grammar_score(user_answer)
    found_misconceptions   = detect_misconceptions(user_answer, misconceptions)
    final_score            = composite_score(sem_score, kw_score, gram_score)

    return {
        "semantic_score":   sem_score,
        "keyword_score":    kw_score,
        "grammar_score":    gram_score,
        "composite_score":  final_score,
        "missing_keywords": missing_kws,
        "misconceptions":   found_misconceptions,
        "expert_answer":    expert_answer,
        "topic":            expert_data["topic"],
        "follow_up":        expert_data["follow_up"]
    }