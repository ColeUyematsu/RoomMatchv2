from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

# Use the same DATABASE_URL as your app (replace 'yourpassword' if necessary)
DATABASE_URL = "postgresql://coleuyematsu:newpassword@localhost:5432/roommatch"

# Set up SQLAlchemy
engine = create_engine(DATABASE_URL)
Base = declarative_base()

# Define a test table
class TestTable(Base):
    __tablename__ = "test_table"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

# Create the table
Base.metadata.create_all(bind=engine)
print("Table created successfully!")