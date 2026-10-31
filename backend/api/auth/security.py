import os
import secrets
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import bcrypt
import jwt
from fastapi import HTTPException, status
from jwt.exceptions import InvalidTokenError

load_dotenv()

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY") or secrets.token_urlsafe(32)
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "60"))
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        AUTH_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def get_token_user_id(token: str) -> int:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired access token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, AUTH_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (InvalidTokenError, KeyError, TypeError, ValueError):
        raise unauthorized from None