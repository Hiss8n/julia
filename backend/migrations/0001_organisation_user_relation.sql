BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM organisations) THEN
        RAISE EXCEPTION 'organisations is not empty; assign each existing organisation to a user before migrating';
    END IF;
END
$$;

ALTER TABLE organisations RENAME COLUMN organisation_name TO name;
ALTER TABLE organisations ADD COLUMN type VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN description VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN website VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN phone VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN logo TEXT NOT NULL DEFAULT '';
ALTER TABLE organisations ADD COLUMN admin VARCHAR(200);
ALTER TABLE organisations ADD COLUMN owner_id INTEGER NOT NULL REFERENCES users(id);
CREATE UNIQUE INDEX ix_organisations_owner_id ON organisations (owner_id);

COMMIT;