from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
	id: str = Field(min_length=1, max_length=100)
	initials: str = Field(min_length=1, max_length=20)
	category: str = Field(min_length=1, max_length=100)
	title: str = Field(min_length=1, max_length=200)
	summary: str
	published: str = Field(min_length=1, max_length=100)
	image: str
	image_alt: str = Field(validation_alias=AliasChoices("image_alt", "imageAlt"))
	paragraphs: list[str] = Field(default_factory=list)


class PostUpdate(BaseModel):
	model_config = ConfigDict(populate_by_name=True)

	initials: str | None = Field(default=None, min_length=1, max_length=20)
	category: str | None = Field(default=None, min_length=1, max_length=100)
	title: str | None = Field(default=None, min_length=1, max_length=200)
	summary: str | None = None
	published: str | None = Field(default=None, min_length=1, max_length=100)
	image: str | None = None
	image_alt: str | None = Field(
		default=None,
		validation_alias=AliasChoices("image_alt", "imageAlt"),
	)
	paragraphs: list[str] | None = None


class PostResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True, populate_by_name=True)

	id: str
	organization: str
	initials: str
	category: str
	title: str
	summary: str
	published: str
	image: str
	image_alt: str = Field(serialization_alias="imageAlt")
	paragraphs: list[str]
