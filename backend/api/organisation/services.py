from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.models import Organisation
from api.organisation.schemas import OrganisationCreate, OrganisationUpdate


class OrganisationServiceError(Exception):
	status_code = 400


class OrganisationNotFoundError(OrganisationServiceError):
	status_code = 404


class OrganisationForbiddenError(OrganisationServiceError):
	status_code = 403


class OrganisationConflictError(OrganisationServiceError):
	status_code = 409


class InvalidOrganisationUpdateError(OrganisationServiceError):
	status_code = 422


def list_organisations(db: Session) -> list[Organisation]:
	return db.scalars(select(Organisation).order_by(Organisation.id)).all()


def read_organisation(db: Session, organisation_id: int) -> Organisation:
	organisation = db.get(Organisation, organisation_id)
	if organisation is None:
		raise OrganisationNotFoundError("Organization not found")
	return organisation


def _read_owned_organisation(db: Session, organisation_id: int, owner_id: int) -> Organisation:
	organisation = read_organisation(db, organisation_id)
	if organisation.owner_id != owner_id:
		raise OrganisationForbiddenError("You do not own this organization")
	return organisation


def create_organisation(db: Session, request: OrganisationCreate, owner_id: int) -> Organisation:
	existing = db.scalar(select(Organisation.id).where(Organisation.owner_id == owner_id))
	if existing is not None:
		raise OrganisationConflictError("This user already has an organization")

	values = request.model_dump()
	values["email"] = str(values["email"])
	organisation = Organisation(**values, owner_id=owner_id)
	db.add(organisation)
	try:
		db.commit()
	except IntegrityError as error:
		db.rollback()
		raise OrganisationConflictError("Organization conflicts with an existing record") from error
	db.refresh(organisation)
	return organisation


def update_organisation(
	db: Session,
	organisation_id: int,
	request: OrganisationUpdate,
	owner_id: int,
) -> Organisation:
	organisation = _read_owned_organisation(db, organisation_id, owner_id)
	updates = request.model_dump(exclude_unset=True)
	if any(value is None for field, value in updates.items() if field != "admin"):
		raise InvalidOrganisationUpdateError("Only admin may be cleared")

	for field, value in updates.items():
		if field == "email" and value is not None:
			value = str(value)
		setattr(organisation, field, value)

	try:
		db.commit()
	except IntegrityError as error:
		db.rollback()
		raise OrganisationConflictError("Organization conflicts with an existing record") from error
	db.refresh(organisation)
	return organisation


def delete_organisation(db: Session, organisation_id: int, owner_id: int) -> None:
	organisation = _read_owned_organisation(db, organisation_id, owner_id)
	db.delete(organisation)
	db.commit()
