import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

def preprocess_responses(df: pd.DataFrame):
    """Preprocess roommate questionnaire responses by normalizing data."""
    
    question_columns = [f"question{i}" for i in range(1, 26)]

    # Ensure all missing values are filled with 4
    df[question_columns] = df[question_columns].fillna(4).astype(float)


    # Normalize responses using StandardScaler
    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(df[question_columns])


    return pd.DataFrame(df_scaled, columns=question_columns, index=df.index)  # Keep it as a DataFrame