BEGIN;

ALTER TABLE organisations
    DROP COLUMN second_name,
    DROP COLUMN password_hash;

COMMIT;