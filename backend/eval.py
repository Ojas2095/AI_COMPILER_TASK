import os
import json
import time
from dotenv import load_dotenv
from ai_engine import PipelineEngine

load_dotenv()


PROMPTS = [
    "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.",
    "A simple blog site with posts and comments.",
    "A medical scheduling app where doctors set availability and patients book appointments. Needs HIPAA compliance mentions.",
    "Build a marketplace for selling digital assets.",
    "Design a social media app for pets.",
    "E-commerce store with shopping cart and paypal integration.",
    "Task management tool for agile teams with Kanban boards.",
    "Real estate listing platform with map view.",
    "A fitness tracking app.",
    "School management system for grades and attendance.",
    # Edge Cases
    "Build a thing.",  # Vague
    "System with users.", # Incomplete
    "Make an app that does both ride sharing and food delivery and crypto trading.", # Overly complex
    "Admin dashboard.", # Under-specified
    "I want an app.", # Vague
    "A completely serverless app without any database but users can save data.", # Conflicting
    "Create a banking app where everyone is an admin.", # Conflicting roles
    "Design a layout.", # Vague
    "Booking system.", # Incomplete
    "App that requires no frontend but has a UI.", # Contradictory
]

def run_evals():
    engine = PipelineEngine()
    results = []

    for idx, prompt in enumerate(PROMPTS):
        print(f"[{idx+1}/{len(PROMPTS)}] Evaluating prompt: {prompt}")
        start_time = time.time()
        
        try:
            config, logs = engine.run_pipeline(prompt)
            success = True
            error = None
        except Exception as e:
            success = False
            config = None
            logs = []
            error = str(e)
            
        latency = time.time() - start_time
        
        # Calculate retries
        total_retries = 0
        if logs:
            for stage in logs:
                stage_logs = stage.get("logs", [])
                if len(stage_logs) > 1:
                    total_retries += (len(stage_logs) - 1)
        
        results.append({
            "prompt": prompt,
            "success": success,
            "latency": latency,
            "total_retries": total_retries,
            "error": error
        })
        
        print(f"   Success: {success} | Latency: {latency:.2f}s | Retries: {total_retries}")
        
    # Summarize
    total_prompts = len(PROMPTS)
    successful = sum(1 for r in results if r["success"])
    avg_latency = sum(r["latency"] for r in results) / total_prompts
    avg_retries = sum(r["total_retries"] for r in results) / total_prompts
    
    print("\n\n=== EVALUATION REPORT ===")
    print(f"Total Evaluated: {total_prompts}")
    print(f"Success Rate: {(successful/total_prompts)*100}%")
    print(f"Avg Latency: {avg_latency:.2f} seconds")
    print(f"Avg Retries Needed: {avg_retries:.1f}")
    
    with open("eval_results.json", "w") as f:
        json.dump({
            "metrics": {
                "success_rate": successful/total_prompts,
                "avg_latency": avg_latency,
                "avg_retries": avg_retries
            },
            "runs": results
        }, f, indent=2)

if __name__ == "__main__":
    if not os.getenv("GEMINI_API_KEY"):
        print("GEMINI_API_KEY environment variable is required to run evaluations.")
        exit(1)
    run_evals()
