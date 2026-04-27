from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# ==========================================
# 1. Intent Extraction Layer
# ==========================================
class IntentSchema(BaseModel):
    intent_summary: str = Field(description="A brief summary of what the user wants to build.")
    primary_goal: str = Field(description="The main problem this application solves.")
    entities: List[str] = Field(description="Main business entities detected (e.g., User, Product, Contact).")
    roles: List[str] = Field(description="User roles needed, e.g., 'admin', 'customer'.")
    is_vague: bool = Field(description="True if the prompt lacks critical details to build a functional app.")
    clarification_questions: List[str] = Field(default=[], description="Questions to ask the user if the prompt is vague. Empty if not vague.")

# ==========================================
# 2. System Design Layer
# ==========================================
class ArchitectureSchema(BaseModel):
    app_name: str = Field(description="A generated catchy name for the app.")
    core_features: List[str] = Field(description="List of core functional features.")
    frontend_pages_needed: List[str] = Field(description="List of routes/pages to build.")
    database_tables_needed: List[str] = Field(description="List of database tables required.")
    api_endpoints_needed: List[str] = Field(description="List of REST API routes required.")

# ==========================================
# 3. Schema Generation & Refinement Layer
# ==========================================
class UIComponent(BaseModel):
    name: str = Field(description="Component name (e.g., 'LoginForm', 'UserTable').")
    type: str = Field(description="Component type (e.g., 'form', 'table', 'hero', 'list', 'navbar').")
    fields: List[str] = Field(description="List of data fields to display. Must match API/DB fields.")
    actions: List[str] = Field(description="List of interactive actions (e.g., 'submit', 'delete', 'navigate').")

class Page(BaseModel):
    route: str = Field(description="Frontend route path (e.g., '/dashboard').")
    title: str = Field(description="Human readable title of the page.")
    components: List[UIComponent] = Field(description="List of UI components included on this page.")
    requires_auth: bool = Field(description="True if the page is behind a login.")
    roles_allowed: List[str] = Field(default=[], description="Which roles can access this page.")

class DBColumn(BaseModel):
    name: str
    type: str = Field(description="Data type (e.g., 'string', 'integer', 'boolean', 'datetime').")
    primary_key: bool = False
    nullable: bool = False
    relations: Optional[str] = Field(None, description="Foreign key table reference if any (e.g., 'users.id').")

class DBTable(BaseModel):
    name: str = Field(description="Name of the table.")
    columns: List[DBColumn] = Field(description="Columns in the table.")

class APIEndpoint(BaseModel):
    path: str = Field(description="Endpoint URL (e.g., '/api/users').")
    method: str = Field(description="HTTP method (GET, POST, PUT, DELETE).")
    description: str = Field(description="What this endpoint does.")
    requires_auth: bool = Field(description="True if a token is required.")
    roles_allowed: List[str] = Field(default=[], description="Roles with permission to call.")
    request_fields: List[str] = Field(default=[], description="List of expected request payload fields.")
    response_fields: List[str] = Field(default=[], description="List of expected response payload fields.")

# Final Executable Config
class AppConfigSchema(BaseModel):
    app_name: str
    pages: List[Page]
    database_tables: List[DBTable]
    api_endpoints: List[APIEndpoint]
