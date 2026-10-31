import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url:
	raise RuntimeError("DATABASE_URL must be set in the backend environment")

if database_url.startswith("postgresql_psycopg://"):
	database_url = database_url.replace("postgresql_psycopg://", "postgresql+psycopg://", 1)

database_url = make_url(database_url)
if (
	database_url.get_backend_name() == "postgresql"
	and database_url.host in {"localhost", "127.0.0.1"}
	and database_url.username == "postres"
):
	database_url = database_url.set(username=os.getenv("POSTGRES_USER", "postgres"))

connect_args = {"check_same_thread": False} if database_url.get_backend_name() == "sqlite" else {}

engine = create_engine(database_url, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


