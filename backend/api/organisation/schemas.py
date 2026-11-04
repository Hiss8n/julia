from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrganisationCreate(BaseModel):
	name: str = Field(min_length=1, max_length=100)
	type: str = Field(min_length=1, max_length=100)
	description: str = Field(min_length=1, max_length=500)
	location: str = Field(min_length=1, max_length=255)
	website: str = Field(default="", max_length=500)
	phone: str = Field(min_length=1, max_length=50)
	email: EmailStr
	logo: str = ""
	admin: str | None = Field(default=None, max_length=200)


class OrganisationUpdate(BaseModel):
	name: str | None = Field(default=None, min_length=1, max_length=100)
	type: str | None = Field(default=None, min_length=1, max_length=100)
	description: str | None = Field(default=None, min_length=1, max_length=500)
	location: str | None = Field(default=None, min_length=1, max_length=255)
	website: str | None = Field(default=None, max_length=500)
	phone: str | None = Field(default=None, min_length=1, max_length=50)
	email: EmailStr | None = None
	logo: str | None = None
	admin: str | None = Field(default=None, max_length=200)


class OrganisationResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: int
	name: str
	type: str
	description: str
	location: str
	website: str
	phone: str
	email: str
	logo: str
	admin: str | None


class OrganisationCreateResponse(OrganisationResponse):
	success: bool = True
	message: str = "Organization created successfully"
