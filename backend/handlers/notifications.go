package handlers

import (
	"encoding/json"
	"net/http"

	"astrana/db"
)

type AnalyticsStats struct {
	Total       int     `json:"total"`
	Unread      int     `json:"unread"`
	AckRate     float64 `json:"ackRate"`
	DailyVolume []DailyCount `json:"dailyVolume"`
}

type DailyCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

func GetAnalytics(w http.ResponseWriter, r *http.Request) {
	var stats AnalyticsStats

	err := db.DB.QueryRow(`
		SELECT
			COUNT(*),
			COUNT(CASE WHEN read_at IS NULL THEN 1 END)
		FROM notifications
		WHERE provider_id = 1 AND created_at >= DATE('now', '-6 days')
	`).Scan(&stats.Total, &stats.Unread)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if stats.Total > 0 {
		stats.AckRate = float64(stats.Total-stats.Unread) / float64(stats.Total) * 100
	}

	rows, err := db.DB.Query(`
		SELECT DATE(created_at), COUNT(*)
		FROM notifications
		WHERE provider_id = 1 AND created_at >= DATE('now', '-6 days')
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at) ASC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	stats.DailyVolume = []DailyCount{}
	for rows.Next() {
		var d DailyCount
		if err := rows.Scan(&d.Date, &d.Count); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		stats.DailyVolume = append(stats.DailyVolume, d)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

type Notification struct {
	ID          int     `json:"id"`
	ProviderID  int     `json:"providerId"`
	PatientID   int     `json:"patientId"`
	EventType   string  `json:"eventType"`
	EventSource string  `json:"eventSource"`
	EventID     int     `json:"eventId"`
	Title       string  `json:"title"`
	Body        string  `json:"body"`
	CreatedAt   string  `json:"createdAt"`
	ReadAt      *string `json:"readAt"`
}

func ListNotifications(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
		SELECT id, provider_id, patient_id, event_type, event_source, event_id, title, body, created_at, read_at
		FROM notifications
		WHERE provider_id = 1
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	notifications := []Notification{}
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.ProviderID, &n.PatientID, &n.EventType, &n.EventSource, &n.EventID, &n.Title, &n.Body, &n.CreatedAt, &n.ReadAt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		notifications = append(notifications, n)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	_, err := db.DB.Exec(`
		UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND read_at IS NULL
	`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
