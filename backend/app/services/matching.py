import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sklearn.metrics.pairwise import cosine_similarity
from scipy.optimize import linear_sum_assignment
from app.models import Response, User

def get_best_matches(user_id: int, db: Session, top_n=5):
    """Find the top N best reciprocal roommate matches for a user using bipartite matching."""

    # Fetch all responses from the database
    responses = db.query(Response).all()
    if not responses:
        return None  # No responses in DB

    # Convert responses into a DataFrame
    response_data = [
        {
            "user_id": r.user_id,
            **{f"question{i}": getattr(r, f"question{i}") for i in range(1, 26)}
        }
        for r in responses
    ]
    
    df = pd.DataFrame(response_data).set_index("user_id")
    df = df.groupby("user_id").last()  # Ensure we get the latest responses

    print("User response DataFrame (Before Filling NaNs):\n", df.head())  # Debugging print

    # Fill missing values with 4 (neutral response)
    df.fillna(4, inplace=True)

    print("User response DataFrame (After Filling NaNs):\n", df.head())  # Debugging print

    # Compute cosine similarity between all users
    similarity_matrix = cosine_similarity(df.values)

    # Set diagonal (self-matching) to a low value to prevent self-matching
    np.fill_diagonal(similarity_matrix, -np.inf)

    # Convert to a cost matrix for Hungarian algorithm (we minimize cost, so we negate similarity)
    cost_matrix = -similarity_matrix

    # Solve the bipartite matching problem (optimal one-to-one pairing)
    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    # Create match pairs (ensure no self-matching)
    matches_dict = {}
    for row, col in zip(row_ind, col_ind):
        if df.index[row] != df.index[col]:  # Prevent self-matching
            matches_dict[df.index[row]] = df.index[col]

    # Ensure reciprocal matching for top-N
    reciprocal_matches = {user: [] for user in df.index}

    for user in df.index:
        user_idx = df.index.get_loc(user)
        similarity_scores = similarity_matrix[user_idx]

        # Get the top N highest similarity scores (excluding self)
        sorted_indices = np.argsort(similarity_scores)[::-1]  # Sort in descending order

        for idx in sorted_indices:
            match_id = df.index[idx]
            if match_id != user and len(reciprocal_matches[user]) < top_n:
                # Ensure that the match is also listing this user in their top-N
                match_idx = df.index.get_loc(match_id)
                match_scores = similarity_matrix[match_idx]
                match_sorted_indices = np.argsort(match_scores)[::-1]

                if user in df.index[match_sorted_indices[:top_n]]:  # Check if user is in match's top-N
                    reciprocal_matches[user].append((match_id, similarity_scores[idx]))

    # Get the best reciprocal matches for the given user
    if user_id not in reciprocal_matches or not reciprocal_matches[user_id]:
        return None  # No matches

    best_matches = []
    for match_id, score in reciprocal_matches[user_id]:
        matched_user = db.query(User).filter(User.id == int(match_id)).first()
        if matched_user:
            best_matches.append({
                "match": matched_user.email,
                "score": float(score)
            })

    return best_matches if best_matches else None