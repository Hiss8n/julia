BEGIN;

CREATE TABLE posts (
    id VARCHAR(100) PRIMARY KEY,
    organisation_id INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    organization VARCHAR(100) NOT NULL,
    initials VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    published VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    paragraphs JSON NOT NULL DEFAULT '[]'::json,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_posts_organisation_id ON posts (organisation_id);

COMMIT;