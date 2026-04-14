from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import questions, evaluate
import os

load_dotenv()

app = FastAPI(title="AI Interview Coach API", version="1.0.0")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(evaluate.router, prefix="/evaluate", tags=["Evaluate"])
app.include_router(questions.router, prefix="/questions", tags=["Questions"])

@app.get("/")
def root():
    return {"status": "AI Interview Coach backend running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}