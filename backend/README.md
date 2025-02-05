# Backend Setup (FastAPI)

This is the backend for the project, built with [FastAPI](https://fastapi.tiangolo.com/)

## Getting Started

## Prerequisites
Before setting up the backend, ensure you have:
- Python 3.8+ installed ([Download](https://www.python.org/downloads/))
- pip (included with Python)
- Virtual environment (`venv`)
- uvicorn for running FastAPI

---

## Creating and Activating the Virtual Environment
Navigate to the backend directory:
- cd backend
- Create Virtual Environment
    - python -m venv venv 
        - venv\Scripts\activate (for Windows)
        - source venv/bin/activate (for Mac/Linux)


- Install Dependencies
    - pip install -r requirements.txt

## Create .env file in backend
- touch .env
- paste in 
    DATABASE_URL=postgresql://coleuyematsu:newpassword@localhost:5432/roommatch

    SECRET_KEY="Alohomora"


## Start the backend Server 
- uvicorn main:app --host 127.0.0.1 --port 8000 --reload
    - If you click on link it should say "RoomMatch API Running"

