from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
import uuid
from PyPDF2 import PdfReader

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "../../../../server/uploads")

@router.post("/upload", response_class=JSONResponse)
def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"resumeUrl": f"/uploads/{filename}", "filePath": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-projects", response_class=JSONResponse)
def extract_projects(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        reader = PdfReader(file.file)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        # Simple heuristic: look for 'Project' or 'PROJECTS' sections
        projects = []
        lines = text.splitlines()
        in_projects = False
        for line in lines:
            if 'project' in line.lower():
                in_projects = True
            if in_projects:
                projects.append(line.strip())
                # End after a blank line or too many lines
                if line.strip() == '' and len(projects) > 2:
                    break
        return {"projects": projects, "rawText": text[:1000]}  # Return first 1000 chars for debug
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
