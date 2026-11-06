BEGIN;

ALTER TABLE users
    ADD COLUMN has_organisation BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE users
SET has_organisation = TRUE
WHERE EXISTS (
    SELECT 1
    FROM organisations
    WHERE organisations.owner_id = users.id
);

COMMIT;