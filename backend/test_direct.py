import os
import time
import requests
import json

def test_pipeline():
    url = "http://localhost:8001/api/generate"
    payload = {
        "prompt": "Build a CRM with login, dashboard, contacts, and a premium plan with analytics. Admins can manage everything, users can only view their own data."
    }
    headers = {"Content-Type": "application/json"}
    
    print(f"Sending request to {url}...")
    print(f"Prompt: {payload['prompt']}")
    
    start_time = time.time()
    try:
        # Increase timeout to 5 minutes
        response = requests.post(url, json=payload, headers=headers, timeout=300)
        elapsed = time.time() - start_time
        
        print(f"\nResponse received in {elapsed:.2f} seconds.")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n=== SUCCESS ===")
            print("Metadata:")
            print(json.dumps(data.get("metadata", {}), indent=2))
            
            print("\nApp Name:", data.get("config", {}).get("app_name"))
            print("Total Pages:", len(data.get("config", {}).get("pages", [])))
            print("Total DB Tables:", len(data.get("config", {}).get("database_tables", [])))
            print("Total APIs:", len(data.get("config", {}).get("api_endpoints", [])))
            print("Auth Rules:", len(data.get("config", {}).get("auth_rules", [])))
            print("Business Rules:", len(data.get("config", {}).get("business_rules", [])))
            
            print("\nCost Summary:")
            cost = data.get("metadata", {}).get("cost", {})
            print(f"  Total Cost: ${cost.get('total_cost_usd', 0):.4f}")
            print(f"  Total Tokens: {cost.get('total_input_tokens', 0) + cost.get('total_output_tokens', 0)}")
            
        else:
            print("Error Details:", response.text)
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_pipeline()
