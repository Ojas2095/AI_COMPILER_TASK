# AI Software Compiler

> A deterministic, multi-stage pipeline that compiles natural language into validated, executable software configurations — like a compiler, but for entire applications.

**Reference:** Inspired by [base44.com](https://base44.com/)

## Architecture

```
Natural Language Prompt
        │
        ▼
┌───────────────────┐
│  Stage 1: Intent  │  Extract entities, roles, assumptions, detect conflicts
│    Extraction      │  Output: IntentSchema (Pydantic-validated)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Stage 2: System  │  Map intent → pages, tables, APIs
│    Design          │  Output: ArchitectureSchema
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Stage 3: Schema  │  Generate UI components, DB columns, API details,
│    Generation      │  auth rules, and business logic
└───────┬───────────┘  Output: AppConfigSchema (cross-layer validated)
        │
        ▼
┌───────────────────┐
│  Stage 4: Refine  │  Semantic consistency check across all layers
│    & Validate      │  Catches orphan pages, missing endpoints, role gaps
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Runtime Renderer │  React-based execution simulator
│  (Frontend)        │  Renders forms, tables, auth, business rules
└───────────────────┘
```

## Stack
- **Backend:** Python + FastAPI + Pydantic + Google Gemini 2.0 Flash
- **Frontend:** Next.js 14 + Tailwind CSS + React
- **Validation:** Pydantic `ConfigDict(extra="forbid")` + cross-layer `@model_validator`
- **Cost Tracking:** Per-stage token usage and estimated USD cost

## Key Design Decisions

### Why Multi-Stage (Not Single Prompt)?
Single prompts produce inconsistent, hallucination-prone outputs. Our compiler breaks the problem into focused stages where each stage's output is **strictly validated** before feeding the next. This mirrors how real compilers work: lexing → parsing → semantic analysis → code generation.

### Intelligent Repair (Not Brute Retry)
When Pydantic validation fails, we don't blindly retry. Instead, we extract the **exact** `ValidationError` traceback and inject it back into the LLM context as a targeted repair instruction. This means the model knows exactly what field was wrong and why.

### Cross-Layer Consistency
Our `@model_validator` enforces:
- UI component fields must exist in DB tables
- Foreign keys must reference existing tables
- Auth rules must reference existing pages and API paths
- Page role restrictions must match defined auth rules

### Failure Handling
- **Vague prompts:** Detected via `is_vague` flag, assumptions documented
- **Conflicting requirements:** Detected via `has_conflicts` flag, resolutions documented
- **Rate limiting:** Exponential backoff with graceful degradation to validated mock

### Cost vs Quality Tradeoff
We use `gemini-2.0-flash` for optimal cost-efficiency. The pipeline tracks:
- Input/output tokens per stage
- Estimated cost in USD per request
- Latency per stage

This enables data-driven decisions about which stages need more tokens vs. which can be optimized.

### Runtime Simulation
The frontend includes a fully interactive runtime simulator that:
- **Renders generated pages** with forms, tables, and dashboard widgets using live mock data
- **Simulates authentication** — users can switch roles and see page access restrictions enforced
- **Interactive actions** — form submissions, table row operations, all with toast feedback
- **Architecture visualization** — database schemas, API endpoints, auth matrices, and business rules

## Setup Instructions

### 1. Backend
```bash
cd backend
pip install fastapi uvicorn pydantic python-dotenv google-generativeai
```

Set your Gemini API key in `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```

Run:
```bash
python app.py
# Backend starts at http://localhost:8001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:3000
```

## Running Evaluations
```bash
cd backend
python eval.py
```

Tests 20 prompts (10 real + 10 edge cases) and outputs:
- Success rate (overall, real, edge cases)
- Average latency
- Retry counts
- Failure type classification
- Per-request cost breakdown
- Results saved to `eval_results.json`

## Schemas

| Schema | Purpose |
|--------|---------|
| `IntentSchema` | Entities, roles, assumptions, conflicts |
| `ArchitectureSchema` | App name, features, pages, tables, APIs |
| `AppConfigSchema` | Full executable config with auth + business rules |
| `AuthRule` | Role-based page and API access control |
| `BusinessRule` | Conditional logic (e.g., premium gating) |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | Runs the full 4-stage compiler pipeline |
| `GET` | `/health` | Returns system status and configuration |
