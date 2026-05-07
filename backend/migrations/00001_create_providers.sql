-- +goose Up
CREATE TABLE IF NOT EXISTS providers (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT    NOT NULL UNIQUE
);

-- +goose Down
DROP TABLE providers;
