# AI Platform Compiler Demo Task

This repository contains an end-to-end multi-stage deterministic "AI compiler" pipeline that translates natural language into executable frontend and backend system specifications.

## 🏗 Stack
- **Backend:** Python + FastAPI + Pydantic + Google Gemini (`gemini-1.5-pro`)
- **Frontend:** Next.js 14 + Tailwind CSS + React
- **Validation**: Pydantic for rigid cross-layer schema validation and auto-repair feedback loops.

## 🚀 Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (assuming it's already created):
   ```bash
   .\venv\Scripts\activate
   ```
3. Install dependencies (if not already installed):
   ```bash
   pip install fastapi uvicorn pydantic python-dotenv google-generativeai tenacity
   ```
4. **CRITICAL:** Set your Gemini API Key in the `.env` file.
   - Open `backend/.env`
   - Paste your API key: `GEMINI_API_KEY=AIzaSy...`
5. Run the FastAPI Server:
   ```bash
   python app.py
   ```
   *The backend will start at http://localhost:8000*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The UI will start at http://localhost:3000*

## 🧪 Running the Evaluation
To test the deterministic capability across 20 diverse prompts including edge cases (vague, confusing, contrarian):
1. Navigate to the backend directory.
2. Run the evaluation script:
   ```bash
   python eval.py
   ```
3. The script will output latency, retry counts, and success rates to `eval_results.json`.

## 💎 Architecture Details
The pipeline executes in 3 stages + self-repair loop:
1. **Intent Extraction**: Strips vagueness and establishes core entities.
2. **System Design Layer**: Maps entities to pages, tables, and endpoints.
3. **AppConfig Validation**: Fleshes out exact API/UI variables.
4. **Self-Repair Core (Pydantic)**: Ensures strict schemas. If hallucination occurs, the traceback is re-injected automatically into the LLM context to correct the issue without broad generic retries.
