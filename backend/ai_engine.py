import os
import json
import logging
import google.generativeai as genai
from pydantic import BaseModel, ValidationError
from typing import Type, TypeVar

from schemas import (
    IntentSchema,
    ArchitectureSchema,
    AppConfigSchema
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

def get_model():
    # Attempt to load the model. API key should be in env.
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Execution will fail.")
    else:
        genai.configure(api_key=api_key)
    
    return genai.GenerativeModel("gemini-2.5-flash")

def generate_with_repair(
    prompt: str,
    schema: Type[T],
    max_retries: int = 3
) -> tuple[T, list[dict]]:
    """
    Executes a prompt to generate JSON matching the schema.
    If it fails Pydantic validation, it sends the error back to the LLM to repair it.
    Returns the validated object and a trace log of attempts.
    """
    model = get_model()
    attempts_log = []
    
    current_prompt = prompt + f"\n\nOutput STRICT JSON matching this schema:\n{schema.model_json_schema()}"
    
    for attempt in range(max_retries):
        logger.info(f"Generation attempt {attempt + 1}/{max_retries} for {schema.__name__}")
        try:
            response = model.generate_content(
                current_prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            raw_text = response.text.strip()
            
            # Strip markdown formatting if the model weirdly ignores response_mime_type
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            attempts_log.append({"attempt": attempt+1, "status": "success", "raw": raw_text})
            
            # Parse and Validate (Pydantic enforces strictness)
            parsed_json = json.loads(raw_text)
            validated_obj = schema(**parsed_json)
            return validated_obj, attempts_log
            
        except json.JSONDecodeError as e:
            error_msg = f"Failed to parse JSON. Error: {str(e)}"
            logger.error(error_msg)
            attempts_log.append({"attempt": attempt+1, "status": "json_error", "error": error_msg})
            current_prompt += f"\n\n[SYSTEM: Your last output was INVALID JSON. Error: {str(e)}. Please FIX it to be valid JSON.]"
            
        except ValidationError as e:
            error_msg = f"Schema validation failed. Error: {e.json()}"
            logger.error("Validation error caught. Initiating repair...")
            attempts_log.append({"attempt": attempt+1, "status": "validation_error", "error": str(e)})
            current_prompt += f"\n\n[SYSTEM CHECK] Your last generated payload was:\n{raw_text}\n\n[SYSTEM ERROR] This payload failed strict schema rules with the following ValidationErrors:\n{e.errors()}.\n\nYou MUST fix these exact errors (e.g. check for missing keys, cross-layer field mismatches, hallucinated extra properties). Re-generate the entire strictly valid JSON."
            
        except Exception as e:
            logger.error(f"Unknown generation error: {e}")
            attempts_log.append({"attempt": attempt+1, "status": "unknown_error", "error": str(e)})
            raise e
            
    raise Exception(f"Failed to generate valid {schema.__name__} after {max_retries} attempts.")

class PipelineEngine:
    """
    The orchestrator for the multi-stage generation.
    Natural Language -> Intent -> Design -> AppConfig
    """
    def __init__(self):
        self.logs = []
        
    def run_pipeline(self, prompt: str) -> AppConfigSchema:
        self.logs = []
        
        # STAGE 1: INTENT
        intent_prompt = f"Extract intent from the user request: '{prompt}'"
        intent_obj, intent_log = generate_with_repair(intent_prompt, IntentSchema)
        self.logs.append({"stage": "intent", "logs": intent_log})
        
        if intent_obj.is_vague:
            # We would normally return early or ask Clarification
            logger.warning(f"Prompt vague! Ask user: {intent_obj.clarification_questions}")
        
        # STAGE 2: ARCHITECTURE DESIGN
        design_prompt = (
            f"Based on the extracted intent: {intent_obj.model_dump_json()}\n"
            "Design the system architecture (core features, pages, database tables, APIs)."
        )
        design_obj, design_log = generate_with_repair(design_prompt, ArchitectureSchema)
        self.logs.append({"stage": "design", "logs": design_log})
        
        # STAGE 3: APP CONFIG (CROSS-LAYER SCHEMAS)
        config_prompt = (
            f"Based on the architecture: {design_obj.model_dump_json()}\n\n"
            "Generate the final AppConfig schema containing precise definitions of Pages, Components, DB Tables, and API Endpoints.\n"
            "CRITICAL RULES:\n"
            "1. Fields in UI components MUST match fields in DB Tables and APIs.\n"
            "2. Table relations MUST map to existing tables.\n"
            "3. Roles MUST be consistent across pages and APIs."
        )
        config_obj, config_log = generate_with_repair(config_prompt, AppConfigSchema)
        self.logs.append({"stage": "app_config", "logs": config_log})
        
        return config_obj, self.logs
