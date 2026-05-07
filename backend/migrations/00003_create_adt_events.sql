-- +goose Up
CREATE TABLE IF NOT EXISTS adt_events (
    id                            INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type                    TEXT     NOT NULL,
    event_label                   TEXT     NOT NULL,
    event_time                    DATETIME NOT NULL,
    patient_id                    INTEGER  REFERENCES patients(id),
    patient_external_id           TEXT     NOT NULL,
    patient_mrn                   TEXT     NOT NULL,
    patient_first_name            TEXT     NOT NULL,
    patient_last_name             TEXT     NOT NULL,
    patient_dob                   TEXT     NOT NULL,
    encounter_id                  TEXT     NOT NULL,
    encounter_facility            TEXT     NOT NULL,
    encounter_unit                TEXT     NOT NULL,
    encounter_room                TEXT     NOT NULL,
    provider_id                   TEXT     NOT NULL,
    provider_name                 TEXT     NOT NULL,
    provider_notification_channel TEXT     NOT NULL,
    source_system                 TEXT     NOT NULL,
    source_message_id             TEXT     NOT NULL UNIQUE,
    created_at                    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE adt_events;
