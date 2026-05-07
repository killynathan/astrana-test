package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"astrana/db"
	"astrana/notify"
)

type ADTEvent struct {
	ID         int    `json:"id"`
	EventType  string `json:"eventType"`
	EventLabel string `json:"eventLabel"`
	EventTime  string `json:"eventTime"`
	Patient    struct {
		ID        string `json:"id"`
		MRN       string `json:"mrn"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		DOB       string `json:"dob"`
	} `json:"patient"`
	Encounter struct {
		ID       string `json:"id"`
		Facility string `json:"facility"`
		Unit     string `json:"unit"`
		Room     string `json:"room"`
	} `json:"encounter"`
	Provider struct {
		ID                  string `json:"id"`
		Name                string `json:"name"`
		NotificationChannel string `json:"notificationChannel"`
	} `json:"provider"`
	Source struct {
		System    string `json:"system"`
		MessageID string `json:"messageId"`
	} `json:"source"`
	CreatedAt string `json:"createdAt,omitempty"`
}

func captureError(err error) {
	// TODO: create a error logger than sends to external error tracking (e.g. Sentry, Datadog)
}

func CreateADTEvent(w http.ResponseWriter, r *http.Request) {
	var e ADTEvent
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// try to match a patient record; null if not found
	var patientID sql.NullInt64
	var patientProviderID sql.NullInt64
	var matchedID int64
	var matchedProviderID int64
	err := db.DB.QueryRow(`
		SELECT id, provider_id FROM patients
		WHERE first_name = ? AND last_name = ? AND dob = ?
	`, e.Patient.FirstName, e.Patient.LastName, e.Patient.DOB).Scan(&matchedID, &matchedProviderID)
	if err == nil {
		patientID = sql.NullInt64{Int64: matchedID, Valid: true}
		patientProviderID = sql.NullInt64{Int64: matchedProviderID, Valid: true}
	}

	tx, err := db.DB.Begin()
	if err != nil {
		captureError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO adt_events (
			event_type, event_label, event_time,
			patient_id, patient_external_id, patient_mrn, patient_first_name, patient_last_name, patient_dob,
			encounter_id, encounter_facility, encounter_unit, encounter_room,
			provider_id, provider_name, provider_notification_channel,
			source_system, source_message_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		e.EventType, e.EventLabel, e.EventTime,
		patientID, e.Patient.ID, e.Patient.MRN, e.Patient.FirstName, e.Patient.LastName, e.Patient.DOB,
		e.Encounter.ID, e.Encounter.Facility, e.Encounter.Unit, e.Encounter.Room,
		e.Provider.ID, e.Provider.Name, e.Provider.NotificationChannel,
		e.Source.System, e.Source.MessageID,
	)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			http.Error(w, "duplicate event", http.StatusConflict)
			return
		}
		captureError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	newID, _ := result.LastInsertId()
	e.ID = int(newID)

	var notifyProvider notify.Provider
	var notifyTitle, notifyBody string
	if patientProviderID.Valid {
		notifyTitle, notifyBody = adtNotificationContent(e)
		_, err = tx.Exec(`
			INSERT INTO notifications (provider_id, patient_id, event_type, event_source, event_id, title, body)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, patientProviderID.Int64, patientID.Int64, e.EventType, "adt_events", newID, notifyTitle, notifyBody)
		if err != nil {
			captureError(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		notifyProvider = notify.Provider{
			ID:                  patientProviderID.Int64,
			NotificationChannel: e.Provider.NotificationChannel,
		}
	}

	if err := tx.Commit(); err != nil {
		captureError(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if patientProviderID.Valid {
		go notify.Send(notifyProvider, notifyTitle, notifyBody)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(e)
}

func adtNotificationContent(e ADTEvent) (title, body string) {
	patient := e.Patient.FirstName + " " + e.Patient.LastName
	facility := e.Encounter.Facility
	unit := e.Encounter.Unit

	t, _ := time.Parse(time.RFC3339, e.EventTime)
	formattedTime := t.Format("Jan 2 at 3:04 PM")

	switch e.EventType {
	case "ADT_A01":
		title = "Patient Admitted — " + patient
		body = patient + " was admitted to " + facility + " on " + formattedTime + "."
	case "ADT_A02":
		title = "Patient Transferred — " + patient
		body = patient + " was transferred to " + unit + " at " + facility + " on " + formattedTime + "."
	case "ADT_A03":
		title = "Patient Discharged — " + patient
		body = patient + " was discharged from " + facility + " on " + formattedTime + "."
	}
	return
}
