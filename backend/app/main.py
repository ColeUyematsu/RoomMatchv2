from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import engine, Base
from app.routes import user_routes, match_routes, response_routes, admin_routes, logout_route, questionnaire_routes
from app.routes import chat_routes

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RoomMatch API",
    description="API for RoomMatch, a smart roommate matching system.",
    version="1.0.0",
    docs_url="/docs",  
    redoc_url="/redoc"  
)

app.include_router(questionnaire_routes.router, prefix="/questionnaire", tags=["Questionnaire"])
app.include_router(user_routes.router)
app.include_router(match_routes.router)
app.include_router(response_routes.router)
app.include_router(admin_routes.router)
app.include_router(logout_route.router)# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(chat_routes.router, prefix="/chat")

@app.get("/")
def read_root():
    return {"message": "p-RoomMatch API is running!"}