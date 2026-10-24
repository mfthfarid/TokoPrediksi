package pushnotification

import (
	"context"
	"fmt"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

func getClient() (*messaging.Client, error) {
	ctx := context.Background()

	var opt option.ClientOption

	// 1. Cek apakah ada kredensial JSON langsung dari Environment Variable (biasanya di Railway)
	credJSON := os.Getenv("FIREBASE_CREDENTIALS_JSON")
	if credJSON != "" {
		opt = option.WithCredentialsJSON([]byte(credJSON))
	} else {
		// 2. Fallback: baca dari file path (biasanya di komputer lokal)
		credPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
		if credPath == "" {
			return nil, fmt.Errorf("FIREBASE_CREDENTIALS_JSON atau FIREBASE_CREDENTIALS_PATH belum diset")
		}
		opt = option.WithCredentialsFile(credPath)
	}

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Printf("ERROR inisialisasi Firebase App: %v", err)
		return nil, err
	}
	return app.Messaging(ctx)
}

// SendToToken mengirim push notification ke 1 device tertentu.
func SendToToken(token, title, body, color string) error {
	client, err := getClient()
	if err != nil {
		return err
	}

	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Android: &messaging.AndroidConfig{
			Notification: &messaging.AndroidNotification{
				Color: color,
			},
		},
		Token: token,
	}

	_, err = client.Send(context.Background(), message)
	if err != nil {
		log.Printf("ERROR kirim FCM ke token %s: %v", token, err)
		return err
	}
	log.Printf("FCM berhasil dikirim ke token: %s", token)
	return nil
}
