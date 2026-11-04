from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from api.auth.security import get_token_user_id
from api.database import get_db
from api.models import User
from api.organisation import services as organisation_service
from api.organisation.schemas import (
	OrganisationCreate,
	OrganisationCreateResponse,
	OrganisationResponse,
	OrganisationUpdate,
)
from api.organisation.services import OrganisationServiceError


router = APIRouter(prefix="/organizations", tags=["organizations"])
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


def _raise_service_error(error: OrganisationServiceError) -> None:
	raise HTTPException(status_code=error.status_code, detail=str(error)) from error


@router.get("/", response_model=list[OrganisationResponse])
def list_organisations(db: Session = Depends(get_db)):
	return organisation_service.list_organisations(db)


@router.get("/{organisation_id}", response_model=OrganisationResponse)
def get_organisation(organisation_id: int, db: Session = Depends(get_db)):
	try:
		return organisation_service.read_organisation(db, organisation_id)
	except OrganisationServiceError as error:
		_raise_service_error(error)


@router.post("/create", response_model=OrganisationCreateResponse, status_code=status.HTTP_201_CREATED)
def create_organisation(
	request: OrganisationCreate,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		organisation = organisation_service.create_organisation(db, request, user.id)
	except OrganisationServiceError as error:
		_raise_service_error(error)
	return {
		**OrganisationResponse.model_validate(organisation).model_dump(),
		"success": True,
		"message": "Organization created successfully",
	}


@router.patch("/{organisation_id}", response_model=OrganisationResponse)
def update_organisation(
	organisation_id: int,
	request: OrganisationUpdate,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		return organisation_service.update_organisation(db, organisation_id, request, user.id)
	except OrganisationServiceError as error:
		_raise_service_error(error)


@router.delete("/delete/{organisation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organisation(
	organisation_id: int,
	db: Session = Depends(get_db),
	user: User = Depends(get_current_user),
):
	try:
		organisation_service.delete_organisation(db, organisation_id, user.id)
	except OrganisationServiceError as error:
		_raise_service_error(error)
