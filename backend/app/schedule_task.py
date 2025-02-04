from celery_worker import run_matching_algorithm
from datetime import datetime, timedelta

# Schedule the task for 15 minutes from now
eta_time = datetime.utcnow() + timedelta(minutes=2)

# Queue the task
result = run_matching_algorithm.apply_async(eta=eta_time)

print(f"✅ Roommate matching algorithm scheduled to run at: {eta_time} UTC")
print(f"Task ID: {result.id}")