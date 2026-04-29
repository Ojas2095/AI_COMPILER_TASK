import os
import json
import time
from dotenv import load_dotenv
from ai_engine import PipelineEngine

load_dotenv()


PROMPTS = [
    # 10 Real Product Prompts
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
    # 10 Edge Cases
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
            config, logs, metadata = engine.run_pipeline(prompt)
            success = True
            error = None
            cost_data = metadata.get("cost", {})
        except Exception as e:
            success = False
            config = None
            logs = []
            metadata = {}
            error = str(e)
            cost_data = {}
            
        latency = time.time() - start_time
        
        # Calculate retries
        total_retries = 0
        if logs:
            for stage in logs:
                stage_logs = stage.get("logs", [])
                if len(stage_logs) > 1:
                    total_retries += (len(stage_logs) - 1)
        
        # Classify failure type
        failure_type = None
        if not success and error:
            if "429" in error:
                failure_type = "rate_limited"
            elif "ValidationError" in error or "Cross-Layer" in error:
                failure_type = "validation_failure"
            elif "JSON" in error:
                failure_type = "json_parse_error"
            else:
                failure_type = "unknown"
        
        results.append({
            "prompt": prompt,
            "success": success,
            "latency": latency,
            "total_retries": total_retries,
            "failure_type": failure_type,
            "error": error,
            "cost": cost_data,
            "is_edge_case": idx >= 10
        })
        
        print(f"   Success: {success} | Latency: {latency:.2f}s | Retries: {total_retries} | Cost: ${cost_data.get('total_cost_usd', 'N/A')}")
        
        # Rate limit protection between prompts
        if idx < len(PROMPTS) - 1:
            print("   Waiting 15s for rate limit cooldown...")
            time.sleep(15)
        
    # Summarize
    total_prompts = len(PROMPTS)
    successful = sum(1 for r in results if r["success"])
    real_prompts = [r for r in results if not r["is_edge_case"]]
    edge_prompts = [r for r in results if r["is_edge_case"]]
    avg_latency = sum(r["latency"] for r in results) / total_prompts
    avg_retries = sum(r["total_retries"] for r in results) / total_prompts
    total_cost = sum(r["cost"].get("total_cost_usd", 0) for r in results if r["cost"])
    
    # Failure type breakdown
    failure_types = {}
    for r in results:
        if r["failure_type"]:
            failure_types[r["failure_type"]] = failure_types.get(r["failure_type"], 0) + 1
    
    print("\n\n=== EVALUATION REPORT ===")
    print(f"Total Evaluated: {total_prompts}")
    print(f"Overall Success Rate: {(successful/total_prompts)*100:.1f}%")
    print(f"Real Prompt Success: {sum(1 for r in real_prompts if r['success'])}/{len(real_prompts)}")
    print(f"Edge Case Success: {sum(1 for r in edge_prompts if r['success'])}/{len(edge_prompts)}")
    print(f"Avg Latency: {avg_latency:.2f} seconds")
    print(f"Avg Retries Needed: {avg_retries:.1f}")
    print(f"Total Estimated Cost: ${total_cost:.4f}")
    print(f"Failure Types: {failure_types}")
    
    with open("eval_results.json", "w") as f:
        json.dump({
            "metrics": {
                "success_rate": successful/total_prompts,
                "real_prompt_success_rate": sum(1 for r in real_prompts if r["success"])/len(real_prompts),
                "edge_case_success_rate": sum(1 for r in edge_prompts if r["success"])/len(edge_prompts),
                "avg_latency": avg_latency,
                "avg_retries": avg_retries,
                "total_cost_usd": total_cost,
                "failure_types": failure_types
            },
            "runs": results
        }, f, indent=2)

if __name__ == "__main__":
    if not os.getenv("GEMINI_API_KEY"):
        print("GEMINI_API_KEY environment variable is required to run evaluations.")
        exit(1)
    run_evals()
