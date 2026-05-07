package notify

import "log"

type Provider struct {
	ID                  int64
	Phone               string
	PushToken           string
	PushPlatform        string
	NotificationChannel string
}

func Send(p Provider, title, body string) error {
	switch p.NotificationChannel {
	case "sms":
		return sendSMS(p.Phone, body)
	case "push":
		return sendPush(p.PushToken, p.PushPlatform, title, body)
	default:
		log.Printf("[notify] no channel configured for provider %d", p.ID)
	}
	return nil
}

func sendSMS(phone, body string) error {
	log.Printf("[notify] SMS → %s: %s", phone, body)
	return nil
}

func sendPush(token, platform, title, body string) error {
	log.Printf("[notify] push (%s) → %s | %s: %s", platform, token, title, body)
	return nil
}
