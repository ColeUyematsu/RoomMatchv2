from celery import Celery
from datetime import datetime, timedelta

celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",  # Ensure Redis is running
    backend="redis://localhost:6379/0",
)

@celery.task
def run_matching_algorithm():
    """This function executes the roommate matching algorithm."""
    
    # Your matching logic here
    # Example: Fetch users, compare questionnaire responses, and assign matches
    # ...

    return "Matching process finished."