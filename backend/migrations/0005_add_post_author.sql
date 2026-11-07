BEGIN;

ALTER TABLE posts
    ADD COLUMN created_by_id INTEGER;

UPDATE posts
SET created_by_id = organisations.owner_id
FROM organisations
WHERE posts.organisation_id = organisations.id;

ALTER TABLE posts
    ALTER COLUMN created_by_id SET NOT NULL,
    ADD CONSTRAINT fk_posts_created_by_id_users
        FOREIGN KEY (created_by_id) REFERENCES users(id);

CREATE INDEX ix_posts_created_by_id ON posts (created_by_id);

COMMIT;