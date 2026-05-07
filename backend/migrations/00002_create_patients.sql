-- +goose Up
CREATE TABLE IF NOT EXISTS patients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    dob         TEXT    NOT NULL
);

-- +goose Down
DROP TABLE patients;
