from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import QuestionRequest, QuestionResponse, Difficulty
from app.modules.question_gen.generator import generate_question
from app.modules.question_gen.project_questions import extract_project_topics, generate_project_question
import uuid
import random

router = APIRouter()

# Track question number per session in memory
session_counters = {}


@router.post("/project-question")
async def project_question(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file.file)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        # Extract project lines
        projects = []
        lines = text.splitlines()
        in_projects = False
        for line in lines:
            if 'project' in line.lower():
                in_projects = True
            if in_projects:
                projects.append(line.strip())
                if line.strip() == '' and len(projects) > 2:
                    break
        topics = extract_project_topics(projects)
        if not topics:
            return {"question": "No project topics found in resume."}
        # Pick a random project topic and generate a question
        question = generate_project_question(random.choice(topics))
        return {"question": question, "project_topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        # Extract project lines
        projects = []
        lines = text.splitlines()
        in_projects = False
        for line in lines:
            if 'project' in line.lower():
                in_projects = True
            if in_projects:
                projects.append(line.strip())
                if line.strip() == '' and len(projects) > 2:
                    break
        topics = extract_project_topics(projects)
        if not topics:
            return {"question": "No project topics found in resume."}
        # Pick a random project topic and generate a question
        question = generate_project_question(random.choice(topics))
        return {"question": question, "project_topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
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