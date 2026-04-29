import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_engine import PipelineEngine, logger

load_dotenv()

app = FastAPI(
    title="AI Software Compiler",
    description="A deterministic multi-stage pipeline that compiles natural language into validated, executable software configurations.",
    version="2.0.0"
)

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": "gemini-2.5-flash",
        "pipeline_stages": ["intent_extraction", "system_design", "schema_generation", "refinement"],
        "api_key_set": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/generate")
async def generate_app(req: GenerateRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is missing. Please set it in backend/.env")
        
    engine = PipelineEngine()
    try:
        config_obj, logs, metadata = engine.run_pipeline(req.prompt)
        return {
            "success": True, 
            "config": config_obj.model_dump(), 
            "logs": logs,
            "metadata": metadata
        }
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=True)
