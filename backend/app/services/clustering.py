import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from app.models import Response

def generate_preference_lists(cluster_users):
    """Create ranked preference lists using cosine similarity."""
    similarities = cosine_similarity(cluster_users)
    user_ids = cluster_users.index.tolist()

    # Rank users by similarity
    preference_lists = {
        user_ids[i]: [user_ids[j] for j in np.argsort(similarities[i])[::-1] if i != j]
        for i in range(len(user_ids))
    }
    
    return preference_lists

def cluster_users(db: Session, num_clusters=3):
    """Clusters users and generates preference lists."""
    if not isinstance(db, Session):
        raise ValueError("Invalid database session passed to cluster_users.")

    responses = db.query(Response).all()
    if not responses:
        return None  

    # Convert responses into a DataFrame
    response_data = [
        {
            "user_id": r.user_id,
            **{f"question{i}": getattr(r, f"question{i}") for i in range(1, 26)}
        }
        for r in responses
    ]

    df = pd.DataFrame(response_data).set_index("user_id")
    df.fillna(4, inplace=True)  # Fill missing values with a neutral response

    # Apply k-Means Clustering
    kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
    df["cluster"] = kmeans.fit_predict(df)

    # Store cluster assignments
    clusters = {user_id: cluster for user_id, cluster in zip(df.index, df["cluster"])}

    # Generate preference lists for each cluster
    preferences_by_cluster = {}
    for cluster in range(num_clusters):
        cluster_users = df[df["cluster"] == cluster].drop(columns=["cluster"])
        if len(cluster_users) >= 2:
            preferences_by_cluster[cluster] = generate_preference_lists(cluster_users)

    return clusters, preferences_by_cluster