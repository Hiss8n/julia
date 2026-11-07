from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from api.auth.security import get_token_user_id
from api.database import get_db
from api.models import User
from api.posts import services as post_service
from api.posts.schemas import PostCreate, PostResponse, PostUpdate
from api.posts.services import PostServiceError


router = APIRouter(prefix="/posts", tags=["posts"])
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
	credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
	db: Session = Depends(get_db),
) -> User:
	if credentials is None:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Bearer token required",
			headers={"WWW-Authenticate": "Bearer"},
		)

	user_id = get_token_user_id(credentials.credentials)
	user = db.get(User, user_id)
	if user is None:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
	return user


def _raise_service_error(error: PostServiceError) -> None:
	raise HTTPException(status_code=error.status_code, detail=str(error)) from error


@router.get("/", response_model=list[PostResponse])
def list_posts(db: Session = Depends(get_db)):
	return post_service.list_posts(db)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: str, db: Session = Depends(get_db)):
	try:
		return post_service.read_post(db, post_id)
	except PostServiceError as error:
		_raise_service_error(error)


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
	request: PostCreate,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		return post_service.create_post(db, request, user.id)
	except PostServiceError as error:
		_raise_service_error(error)


@router.patch("/{post_id}", response_model=PostResponse)
def update_post(
	post_id: str,
	request: PostUpdate,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		return post_service.update_post(db, post_id, request, user.id)
	except PostServiceError as error:
		_raise_service_error(error)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
	post_id: str,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		post_service.delete_post(db, post_id, user.id)
	except PostServiceError as error:
		_raise_service_error(error)
	return Response(status_code=status.HTTP_204_NO_CONTENT)
