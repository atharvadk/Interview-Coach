import os
import random
from dotenv import load_dotenv

load_dotenv()

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

print("Loading question generation model...")
_tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
_model     = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
_model.eval()
print("✅ Question generation model loaded")

# ── Domain Topics ─────────────────────────────────────────────────────────────
DOMAIN_TOPICS = {
    "ai": {
        "easy":   ["search algorithms", "agents", "heuristics", "knowledge representation"],
        "medium": ["adversarial search", "constraint satisfaction", "Bayesian networks", "planning"],
        "hard":   ["reinforcement learning theory", "multi-agent systems", "NLP pipelines", "AI ethics tradeoffs"]
    },
    "ml": {
        "easy":   ["supervised learning", "overfitting", "train test split", "linear regression"],
        "medium": ["gradient descent", "decision trees", "SVM", "cross validation", "regularization"],
        "hard":   ["neural architecture design", "attention mechanisms", "ensemble methods", "bias variance tradeoff"]
    },
    "dsa": {
        "easy":   ["arrays", "linked lists", "stacks", "queues", "basic sorting"],
        "medium": ["binary trees", "hash maps", "recursion", "BFS DFS", "dynamic programming basics"],
        "hard":   ["graph algorithms", "segment trees", "advanced DP", "tries", "system design with DSA"]
    },
    "os": {
        "easy":   ["processes vs threads", "CPU scheduling basics", "memory types", "file systems"],
        "medium": ["deadlocks", "virtual memory", "semaphores", "inter process communication"],
        "hard":   ["page replacement algorithms", "kernel architecture", "distributed OS concepts", "concurrency bugs"]
    },
    "java": {
        "easy":   ["OOP concepts", "data types", "loops", "basic collections", "exception basics"],
        "medium": ["interfaces vs abstract classes", "generics", "multithreading basics", "JVM internals"],
        "hard":   ["design patterns", "concurrency utilities", "garbage collection", "Java memory model"]
    },
    "fullstack": {
        "easy":   ["HTML semantics", "CSS box model", "basic JavaScript", "DOM basics", "REST basics"],
        "medium": ["React hooks", "state management", "async JavaScript", "REST API calls", "database design", "JWT auth"],
        "hard":   ["React performance optimization", "microservices", "distributed systems", "database optimization", "system design"]
    },
    "frontend": {
        "easy":   ["HTML semantics", "CSS box model", "basic JavaScript", "DOM basics"],
        "medium": ["React hooks", "state management", "async JavaScript", "REST API calls", "responsive design"],
        "hard":   ["React performance optimization", "webpack config", "accessibility", "micro frontends"]
    },
    "backend": {
        "easy":   ["REST basics", "HTTP methods", "JSON", "basic authentication"],
        "medium": ["database design", "middleware", "caching strategies", "JWT auth", "API versioning"],
        "hard":   ["microservices", "message queues", "rate limiting", "distributed systems", "database optimization"]
    },
    "hr": {
        "easy":   ["introduce yourself", "strengths and weaknesses", "why this company"],
        "medium": ["conflict resolution", "teamwork examples", "handling failure", "time management"],
        "hard":   ["leadership under pressure", "difficult stakeholder management", "career vision", "ethical dilemmas"]
    }
}

# ── Question Types per Difficulty ─────────────────────────────────────────────
QUESTION_TYPES = {
    "easy":   ["definition", "explain the concept of", "what is"],
    "medium": ["compare and contrast", "how does", "explain with an example", "what happens when"],
    "hard":   ["design a system that", "what are the tradeoffs of", "debug this scenario", "explain the internals of"]
}

# ── Fallback Questions ────────────────────────────────────────────────────────
FALLBACKS = {
    "ai": {
        "easy":   "What is the difference between a BFS and DFS search algorithm?",
        "medium": "Explain how a constraint satisfaction problem works with an example.",
        "hard":   "What are the key tradeoffs between model-based and model-free reinforcement learning?"
    },
    "ml": {
        "easy":   "What is overfitting and how do you detect it?",
        "medium": "Explain the difference between L1 and L2 regularization.",
        "hard":   "What are the tradeoffs between bias and variance in model design?"
    },
    "dsa": {
        "easy":   "What is the difference between a stack and a queue?",
        "medium": "How does a hash map handle collisions internally?",
        "hard":   "How would you design a rate limiter using DSA concepts?"
    },
    "os": {
        "easy":   "What is the difference between a process and a thread?",
        "medium": "What are the four necessary conditions for a deadlock to occur?",
        "hard":   "Explain the working of the LRU page replacement algorithm."
    },
    "java": {
        "easy":   "What is the difference between an abstract class and an interface?",
        "medium": "How does the Java garbage collector work?",
        "hard":   "Explain the Java memory model and how it handles thread visibility."
    },
    "fullstack": {
        "easy":   "What is the difference between GET and POST HTTP methods?",
        "medium": "How does JWT authentication work in a full stack application?",
        "hard":   "How would you design a scalable full stack application with a React frontend and Node.js backend?"
    },
    "frontend": {
        "easy":   "What is the difference between inline and block elements in HTML?",
        "medium": "Explain the difference between useEffect and useLayoutEffect in React.",
        "hard":   "How would you optimize a React app that is rendering too slowly?"
    },
    "backend": {
        "easy":   "What is the difference between GET and POST HTTP methods?",
        "medium": "How does JWT authentication work in a REST API?",
        "hard":   "How would you design a rate limiting system for a high traffic API?"
    },
    "hr": {
        "easy":   "Tell me about yourself and your background.",
        "medium": "Describe a time you had a conflict with a teammate and how you resolved it.",
        "hard":   "Tell me about a time you had to make a difficult decision with incomplete information."
    }
}


# ── Session Tracker (in-memory) ───────────────────────────────────────────────
class SessionTracker:
    def __init__(self):
        self._sessions = {}

    def init_session(self, session_id: str, domain: str):
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                "domain":         domain,
                "asked_topics":   [],
                "scores":         [],
                "weak_topics":    [],
                "question_count": 0
            }

    def record_question(self, session_id: str, topic: str):
        if session_id in self._sessions:
            self._sessions[session_id]["asked_topics"].append(topic)
            self._sessions[session_id]["question_count"] += 1

    def record_score(self, session_id: str, topic: str, score: float):
        if session_id in self._sessions:
            self._sessions[session_id]["scores"].append(score)
            if score < 5.0:
                weak = self._sessions[session_id]["weak_topics"]
                if topic not in weak:
                    weak.append(topic)

    def get_asked_topics(self, session_id: str) -> list:
        return self._sessions.get(session_id, {}).get("asked_topics", [])

    def get_weak_topics(self, session_id: str) -> list:
        return self._sessions.get(session_id, {}).get("weak_topics", [])

    def get_average_score(self, session_id: str) -> float:
        scores = self._sessions.get(session_id, {}).get("scores", [])
        return round(sum(scores) / len(scores), 2) if scores else 0.0

    def get_question_count(self, session_id: str) -> int:
        return self._sessions.get(session_id, {}).get("question_count", 0)


# Global tracker instance
tracker = SessionTracker()


# ── Prompt Builder ────────────────────────────────────────────────────────────
def build_prompt(domain: str, difficulty: str, topic: str) -> str:
    q_type = random.choice(QUESTION_TYPES[difficulty])

    if domain == "hr":
        return (
            f"You are an experienced HR interviewer.\n"
            f"Generate ONE {difficulty} behavioral interview question about {topic}.\n"
            f"The question should be open ended and test soft skills.\n"
            f"Return ONLY the question. No explanation. No numbering."
        )

    # Map fullstack to a friendly display name in the prompt
    display_domain = "full stack" if domain == "fullstack" else domain

    return (
        f"You are a senior {display_domain} engineer conducting a technical interview.\n"
        f"Generate ONE {difficulty} level interview question about {topic}.\n"
        f"Question style: {q_type}\n\n"
        f"Difficulty guidelines:\n"
        f"- easy: test basic definitions and understanding\n"
        f"- medium: test practical application and reasoning\n"
        f"- hard: test deep knowledge, edge cases, and tradeoffs\n\n"
        f"Rules:\n"
        f"- Return ONLY the question\n"
        f"- No numbering, no explanation, no prefix\n"
        f"- Maximum 2 sentences\n"
        f"- End with a question mark"
    )


# ── Smart Topic Picker ────────────────────────────────────────────────────────
def pick_topic(session_id: str, domain: str, difficulty: str) -> str:
    all_topics     = DOMAIN_TOPICS.get(domain, {}).get(difficulty, ["general concepts"])
    asked          = tracker.get_asked_topics(session_id)
    weak_topics    = tracker.get_weak_topics(session_id)
    avg_score      = tracker.get_average_score(session_id)
    question_count = tracker.get_question_count(session_id)

    fresh_topics = [t for t in all_topics if t not in asked]

    # All topics exhausted — reset
    if not fresh_topics:
        fresh_topics = all_topics

    # Every 3rd question revisit a weak topic if score is low
    if weak_topics and question_count % 3 == 0 and avg_score < 6.0:
        weak_and_fresh = [t for t in weak_topics if t in fresh_topics]
        if weak_and_fresh:
            return random.choice(weak_and_fresh)

    return random.choice(fresh_topics)


# ── Fallback ──────────────────────────────────────────────────────────────────
def fallback_question(domain: str, difficulty: str) -> str:
    return FALLBACKS.get(domain, {}).get(difficulty, "Explain a core concept in your chosen domain.")


# ── Main Generator ────────────────────────────────────────────────────────────
def generate_question(domain: str, difficulty: str, session_id: str) -> str:
    tracker.init_session(session_id, domain)

    topic  = pick_topic(session_id, domain, difficulty)
    prompt = build_prompt(domain, difficulty, topic)

    try:
        inputs   = _tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = _model.generate(
                **inputs,
                max_new_tokens=120,
                do_sample=True,
                temperature=0.8,
                repetition_penalty=1.3
            )
        question = _tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        # Validate quality
        if not question or len(question) < 15 or "?" not in question:
            question = fallback_question(domain, difficulty)

        tracker.record_question(session_id, topic)
        return question

    except Exception as e:
        print(f"HuggingFace API error: {e}")
        tracker.record_question(session_id, topic)
        return fallback_question(domain, difficulty)