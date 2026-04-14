import json
import os

# Path to knowledge base folder
KB_PATH = os.path.join(os.path.dirname(__file__))

# Domain to file mapping
DOMAIN_FILES = {
    "ai":        "ai.json",
    "ml":        "ml.json",
    "os":        "os.json",
    "java":      "java.json",
    "dsa":       "dsa.json",
    "fullstack": "fs.json"
}

# Load all JSON files once on startup
_knowledge_base = {}

def load_all():
    for domain, filename in DOMAIN_FILES.items():
        filepath = os.path.join(KB_PATH, filename)
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                _knowledge_base[domain] = json.load(f)
            print(f"✅ Loaded {filename}")
        else:
            print(f"⚠️  Missing {filename}")

# Run on import
load_all()


def get_expert_data(domain: str, question: str) -> dict:
    """
    Finds the closest matching question in the knowledge base
    and returns expert answer, keywords, and misconceptions.
    """
    domain = domain.lower()
    data   = _knowledge_base.get(domain, [])

    if not data:
        return _empty_response()

    # Find best matching question by counting word overlaps
    question_words = set(question.lower().split())
    best_match     = None
    best_score     = 0

    for entry in data:
        entry_words  = set(entry["Question"].lower().split())
        overlap      = len(question_words & entry_words)
        if overlap > best_score:
            best_score = overlap
            best_match = entry

    if not best_match:
        return _empty_response()

    # Parse keywords — split on comma
    keywords = [
        k.strip().lower()
        for k in best_match.get("Keywords", "").split(",")
        if k.strip()
    ]

    # Parse misconceptions — split on pipe
    misconceptions = [
        m.strip()
        for m in best_match.get("Misconceptions", "").split("|")
        if m.strip()
    ]

    return {
        "expert_answer":   best_match.get("Expert_Answer", ""),
        "keywords":        keywords,
        "misconceptions":  misconceptions,
        "topic":           best_match.get("Topic", ""),
        "follow_up":       best_match.get("Follow_up", ""),
        "difficulty":      best_match.get("Difficulty", "medium")
    }


def _empty_response() -> dict:
    return {
        "expert_answer":  "",
        "keywords":       [],
        "misconceptions": [],
        "topic":          "",
        "follow_up":      "",
        "difficulty":     "medium"
    }