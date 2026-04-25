from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Domain(str, Enum):
    AI = "ai"
    ML = "ml"
    DSA = "dsa"
    OS = "os"
    JAVA = "java"
    FRONTEND = "frontend"
    BACKEND = "backend"
    HR = "hr"
    FULLSTACK = "fullstack"

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# Question
class QuestionRequest(BaseModel):
    domain: Domain
    difficulty: Difficulty = Difficulty.MEDIUM
    session_id: str
    previous_scores: Optional[List[float]] = []

class QuestionResponse(BaseModel):
    question_id: str
    question: str
    domain: Domain
    difficulty: Difficulty
    question_number: int

# Speech
class TranscriptionResponse(BaseModel):
    transcript: str
    duration_seconds: Optional[float] = None

# Evaluation
class EvaluationRequest(BaseModel):
    session_id: str
    question_id: str
    question: str
    answer: str
    domain: Domain

class EvaluationResponse(BaseModel):
    question_id: str
    semantic_score: float
    keyword_score: float
    grammar_score: float
    composite_score: float
    missing_keywords: List[str]
    misconceptions: List[str]
    feedback: str
    answer_model: str  # renamed from model_answer
    next_difficulty: Difficulty

# Face
class FaceAnalysisResponse(BaseModel):
    dominant_emotion: str
    emotion_scores: dict
    confidence_level: str

# Report
class QuestionReport(BaseModel):
    question_number: int
    question: str
    user_answer: str
    composite_score: float
    semantic_score: float
    keyword_score: float
    grammar_score: float
    missing_keywords: List[str]
    misconceptions: List[str]
    feedback: str
    model_answer: str
    dominant_emotion: str
    emotion_timeline: List[str]

class SessionReport(BaseModel):
    session_id: str
    domain: Domain
    total_questions: int
    average_score: float
    improvement_trend: str
    questions: List[QuestionReport]
    overall_feedback: str
    strengths: List[str]
    areas_to_improve: List[str]