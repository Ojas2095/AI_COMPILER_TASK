from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import List, Dict, Optional, Any

# ==========================================
# 1. Intent Extraction Layer
# ==========================================
class IntentSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")
    intent_summary: str = Field(description="A brief summary of what the user wants to build.")
    primary_goal: str = Field(description="The main problem this application solves.")
    entities: List[str] = Field(description="Main business entities detected (e.g., User, Product, Contact).")
    roles: List[str] = Field(description="User roles needed, e.g., 'admin', 'customer'.")
    is_vague: bool = Field(description="True if the prompt lacks critical details to build a functional app.")
    clarification_questions: List[str] = Field(default=[], description="Questions to ask the user if the prompt is vague. Empty if not vague.")
    assumptions: List[str] = Field(default=[], description="Reasonable assumptions made when user input is ambiguous or underspecified.")
    has_conflicts: bool = Field(default=False, description="True if the prompt contains conflicting or contradictory requirements.")
    conflict_resolution: List[str] = Field(default=[], description="How each detected conflict was resolved or interpreted.")

# ==========================================
# 2. System Design Layer
# ==========================================
class ArchitectureSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")
    app_name: str = Field(description="A generated catchy name for the app.")
    core_features: List[str] = Field(description="List of core functional features.")
    frontend_pages_needed: List[str] = Field(description="List of routes/pages to build.")
    database_tables_needed: List[str] = Field(description="List of database tables required.")
    api_endpoints_needed: List[str] = Field(description="List of REST API routes required.")

# ==========================================
# 3. Schema Generation & Refinement Layer
# ==========================================
class UIComponent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(description="Component name (e.g., 'LoginForm', 'UserTable').")
    type: str = Field(description="Component type (e.g., 'form', 'table', 'hero', 'list', 'navbar').")
    fields: List[str] = Field(description="List of data fields to display. Must match API/DB fields.")
    actions: List[str] = Field(description="List of interactive actions (e.g., 'submit', 'delete', 'navigate').")

class Page(BaseModel):
    model_config = ConfigDict(extra="forbid")
    route: str = Field(description="Frontend route path (e.g., '/dashboard').")
    title: str = Field(description="Human readable title of the page.")
    components: List[UIComponent] = Field(description="List of UI components included on this page.")
    requires_auth: bool = Field(description="True if the page is behind a login.")
    roles_allowed: List[str] = Field(default=[], description="Which roles can access this page.")

class DBColumn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    type: str = Field(description="Data type (e.g., 'string', 'integer', 'boolean', 'datetime').")
    primary_key: bool = False
    nullable: bool = False
    relations: Optional[str] = Field(None, description="Foreign key table reference if any (e.g., 'users.id').")

class DBTable(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(description="Name of the table.")
    columns: List[DBColumn] = Field(description="Columns in the table.")

class APIEndpoint(BaseModel):
    model_config = ConfigDict(extra="forbid")
    path: str = Field(description="Endpoint URL (e.g., '/api/users').")
    method: str = Field(description="HTTP method (GET, POST, PUT, DELETE).")
    description: str = Field(description="What this endpoint does.")
    requires_auth: bool = Field(description="True if a token is required.")
    roles_allowed: List[str] = Field(default=[], description="Roles with permission to call.")
    request_fields: List[str] = Field(default=[], description="List of expected request payload fields.")
    response_fields: List[str] = Field(default=[], description="List of expected response payload fields.")

# ==========================================
# 4. Auth & Business Logic Layer
# ==========================================
class AuthRule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: str = Field(description="The role name (e.g., 'admin', 'customer').")
    can_access_pages: List[str] = Field(description="List of page routes this role can access.")
    can_call_apis: List[str] = Field(description="List of API paths this role can call.")
    special_permissions: List[str] = Field(default=[], description="Special permissions like 'view_analytics', 'manage_users'.")

class BusinessRule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(description="Rule name (e.g., 'premium_gating').")
    description: str = Field(description="What this rule does.")
    condition: str = Field(description="When this rule activates (e.g., 'user.plan != premium').")
    action: str = Field(description="What happens when triggered (e.g., 'block access to analytics').")

# ==========================================
# Final Executable Config
# ==========================================
class AppConfigSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")
    app_name: str
    pages: List[Page]
    database_tables: List[DBTable]
    api_endpoints: List[APIEndpoint]
    auth_rules: List[AuthRule] = Field(default=[], description="Role-based access control rules.")
    business_rules: List[BusinessRule] = Field(default=[], description="Business logic rules like premium gating.")

    @model_validator(mode='after')
    def validate_cross_layer_consistency(self) -> 'AppConfigSchema':
        errors = []

        # 1. Gather all defined tables
        table_names = {t.name for t in self.database_tables}
        
        # 2. Check foreign key table relations 
        for table in self.database_tables:
            for col in table.columns:
                if col.relations:
                    target_table = col.relations.split('.')[0]
                    if target_table not in table_names:
                        errors.append(f"FK '{col.relations}' in table '{table.name}' references non-existent table '{target_table}'.")

        # 3. Check that UI Component fields map to some conceptual DB column
        all_db_columns = {col.name for t in self.database_tables for col in t.columns}
        allowed_ui_extras = {'password_confirmation', 'submit', 'id', 'action', 'confirm_password', 'search', 'filter'}
        
        for page in self.pages:
            for comp in page.components:
                for field in comp.fields:
                    if field not in all_db_columns and field.lower() not in allowed_ui_extras:
                        errors.append(f"UI '{comp.name}' uses field '{field}' not found in any DB table.")

        # 4. Check auth rules reference valid pages and APIs
        all_page_routes = {p.route for p in self.pages}
        all_api_paths = {a.path for a in self.api_endpoints}
        
        for rule in self.auth_rules:
            for page_route in rule.can_access_pages:
                if page_route not in all_page_routes:
                    errors.append(f"Auth rule for '{rule.role}' references non-existent page '{page_route}'.")
            for api_path in rule.can_call_apis:
                if api_path not in all_api_paths:
                    errors.append(f"Auth rule for '{rule.role}' references non-existent API '{api_path}'.")

        # 5. Check page role consistency with auth rules
        auth_roles = {r.role for r in self.auth_rules}
        for page in self.pages:
            for role in page.roles_allowed:
                if auth_roles and role not in auth_roles:
                    errors.append(f"Page '{page.route}' allows role '{role}' which has no auth rule defined.")

        if errors:
            raise ValueError("Cross-Layer Validation Errors:\n" + "\n".join(errors))

        return self
