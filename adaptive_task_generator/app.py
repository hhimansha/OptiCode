# backend/app.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from adaptive_task_generator.utils import load_dataset
from adaptive_task_generator.generator import generate_task_for_skill



app = FastAPI(title="OptiCode Adaptive Task Generator")

class GenerateRequest(BaseModel):
    skill_level: str  # "Beginner", "Intermediate", "Advanced"

@app.on_event("startup")
def startup_event():
    # Ensure dataset loads (generator already loads it)
    pass

@app.post("/generate-task")
def generate_task(req: GenerateRequest):
    # Validate
    if req.skill_level not in ["Beginner", "Intermediate", "Advanced"]:
        raise HTTPException(status_code=400, detail="skill_level must be Beginner/Intermediate/Advanced")
    result = generate_task_for_skill(req.skill_level)
    return {"status": "ok", "task": result}

# Simple health
@app.get("/health")
def health():
    return {"status": "ok"}
