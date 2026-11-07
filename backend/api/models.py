from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship

from api.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    second_name = Column(String(100), nullable=False)
    email = Column(String(320), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    has_organisation = Column(Boolean, nullable=False, default=False, server_default="false")
    organisation = relationship("Organisation", back_populates="owner", uselist=False)

class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    location = Column(String(255), nullable=False)
    website = Column(String(500), nullable=False, default="")
    phone = Column(String(50), nullable=False)
    email = Column(String(320), nullable=False)
    logo = Column(Text, nullable=False, default="")
    admin = Column(String(200), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    owner = relationship("User", back_populates="organisation")
    posts = relationship("Post", back_populates="organisation", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id = Column(String(100), primary_key=True)
    organisation_id = Column(
        Integer,
        ForeignKey("organisations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization = Column(String(100), nullable=False)
    initials = Column(String(20), nullable=False)
    category = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    published = Column(String(100), nullable=False)
    image = Column(Text, nullable=False)
    image_alt = Column(Text, nullable=False)
    paragraphs = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    organisation = relationship("Organisation", back_populates="posts")
	
   

