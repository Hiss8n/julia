from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.models import Organisation, Post
from api.posts.schemas import PostCreate, PostUpdate


class PostServiceError(Exception):
	status_code = 400


class PostNotFoundError(PostServiceError):
	status_code = 404


class PostOrganisationNotFoundError(PostServiceError):
	status_code = 404


class PostForbiddenError(PostServiceError):
	status_code = 403


class PostConflictError(PostServiceError):
	status_code = 409


class InvalidPostUpdateError(PostServiceError):
	status_code = 422


def list_posts(db: Session) -> list[Post]:
	return db.scalars(select(Post).order_by(Post.created_at.desc())).all()


def read_post(db: Session, post_id: str) -> Post:
	post = db.get(Post, post_id)
	if post is None:
		raise PostNotFoundError("Post not found")
	return post


def _read_owned_post(db: Session, post_id: str, owner_id: int) -> Post:
	post = read_post(db, post_id)
	if post.organisation.owner_id != owner_id:
		raise PostForbiddenError("You do not own this post")
	return post


def create_post(db: Session, request: PostCreate, owner_id: int) -> Post:
	organisation = db.scalar(select(Organisation).where(Organisation.owner_id == owner_id))
	if organisation is None:
		raise PostOrganisationNotFoundError("Create an organization before publishing a post")

	post = Post(
		**request.model_dump(),
		organisation_id=organisation.id,
		organization=organisation.name,
	)
	db.add(post)
	try:
		db.commit()
	except IntegrityError as error:
		db.rollback()
		raise PostConflictError("A post with this id already exists") from error
	db.refresh(post)
	return post


def update_post(
	db: Session,
	post_id: str,
	request: PostUpdate,
	owner_id: int,
) -> Post:
	post = _read_owned_post(db, post_id, owner_id)
	updates = request.model_dump(exclude_unset=True)
	if any(value is None for value in updates.values()):
		raise InvalidPostUpdateError("Post fields cannot be cleared")

	for field, value in updates.items():
		setattr(post, field, value)

	try:
		db.commit()
	except IntegrityError as error:
		db.rollback()
		raise PostConflictError("Post conflicts with an existing record") from error
	db.refresh(post)
	return post


def delete_post(db: Session, post_id: str, owner_id: int) -> None:
	post = _read_owned_post(db, post_id, owner_id)
	db.delete(post)
	db.commit()
