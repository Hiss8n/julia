BEGIN;

ALTER TABLE organisations
    ADD COLUMN subscribed JSON NOT NULL DEFAULT '[]'::json;

COMMIT;
