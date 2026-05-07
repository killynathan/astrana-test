-- +goose Up
CREATE TABLE IF NOT EXISTS notifications (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id  INTEGER  NOT NULL REFERENCES providers(id),
    patient_id   INTEGER  NOT NULL REFERENCES patients(id),
    event_type   TEXT     NOT NULL,
    event_source TEXT     NOT NULL,
    event_id     INTEGER  NOT NULL,
    title        TEXT     NOT NULL,
    body         TEXT     NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at      DATETIME
);

-- +goose Down
DROP TABLE notifications;
