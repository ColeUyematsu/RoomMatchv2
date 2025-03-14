CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    match_id INT REFERENCES users(id) ON DELETE CASCADE,
    similarity_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);