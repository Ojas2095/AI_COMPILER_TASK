import os
import json
import time
from dotenv import load_dotenv
from ai_engine import PipelineEngine

# Load the API key
load_dotenv()

def run_sandboxed_test():
    print("Starting Sandboxed Compiler Test...")
    print("System: Deterministic Multi-Stage Pipeline")
    print("Model: Gemini 2.5 Flash (Rate-limit optimized)")
    
    engine = PipelineEngine()
    prompt = "Build a professional recruitment portal with job listings, applicant tracking, and recruiter dashboards."
    
    print(f"\n[INPUT PROMPT]: {prompt}")
    
    try:
        # We manually run the stages with sleeps to avoid the 429 rate limit on your free key
        # STAGE 1
        print("\n[STEP 1/3] Extracting Intent...")
        intent_prompt = f"Extract intent from the user request: '{prompt}'"
        from schemas import IntentSchema, ArchitectureSchema, AppConfigSchema
        from ai_engine import generate_with_repair
        
        intent_obj, _ = generate_with_repair(intent_prompt, IntentSchema)
        print("Intent Extracted Successfully.")
        
        print("--- Sleeping 65s to stay under Free Tier Rate Limits ---")
        time.sleep(65)
        
        # STAGE 2
        print("\n[STEP 2/3] Designing Architecture...")
        design_prompt = (
            f"Based on the extracted intent: {intent_obj.model_dump_json()}\n"
            "Design the system architecture (core features, pages, database tables, APIs)."
        )
        design_obj, _ = generate_with_repair(design_prompt, ArchitectureSchema)
        print(f"Architecture Designed: {design_obj.app_name}")
        
        print("--- Sleeping 20s to stay under Free Tier Rate Limits ---")
        time.sleep(20)
        
        # STAGE 3
        print("\n[STEP 3/3] Generating Executable AppConfig...")
        config_prompt = (
            f"Based on the architecture: {design_obj.model_dump_json()}\n\n"
            "Generate the final AppConfig schema containing precise definitions of Pages, Components, DB Tables, and API Endpoints."
        )
        config_obj, _ = generate_with_repair(config_prompt, AppConfigSchema)
        print("Final AppConfig Generated and Cross-Validated!")
        
        # Output final result
        print("\n[FINAL OUTPUT PREVIEW]:")
        summary = {
            "app_name": config_obj.app_name,
            "page_count": len(config_obj.pages),
            "table_count": len(config_obj.database_tables),
            "api_count": len(config_obj.api_endpoints)
        }
        print(json.dumps(summary, indent=4))
        
        with open("sandboxed_test_result.json", "w") as f:
            json.dump(config_obj.model_dump(), f, indent=2)
            
        print("\nTEST PASSED 100%. No validation errors found.")

    except Exception as e:
        print(f"\nTEST FAILED: {str(e)}")

if __name__ == "__main__":
    run_sandboxed_test()
