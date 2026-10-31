from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from api.auth.schemas import LoginRequest, RegisterRequest
from api.auth.security import hash_password, verify_password
from api.models import User
load_dotenv()

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def register_user(db: Session, request: RegisterRequest) -> User:
    user = User(
        first_name=request.first_name,
        second_name=request.second_name,
        email=str(request.email),
        password_hash=hash_password(request.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("An account with this email already exists") from None
    db.refresh(user)
    return user


def authenticate_user(db: Session, request: LoginRequest) -> User | None:
    user = get_user_by_email(db, str(request.email))
    if user is None or not verify_password(request.password, user.password_hash):
        return None
    return user