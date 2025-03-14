# app/__init__.py
from fastapi import FastAPI

app = FastAPI()

# Import routes here to ensure they are registered with FastAPI
from app.routes import user_routes, match_routes, response_routes, admin_routes

# Include API routes
app.include_router(user_routes.router)
app.include_router(match_routes.router)
app.include_router(response_routes.router)
app.include_router(admin_routes.router)
