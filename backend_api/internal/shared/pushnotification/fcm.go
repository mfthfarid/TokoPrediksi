package pushnotification

import (
	"context"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

func getClient() (*messaging.Client, error) {
	ctx := context.Background()
	credPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	opt := option.WithCredentialsFile(credPath)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, err
	}
	return app.Messaging(ctx)
}

// SendToToken mengirim push notification ke 1 device tertentu.
// Return error khusus kalau token sudah tidak valid (device uninstall app, dll)
// supaya bisa dibersihkan dari database oleh pemanggilnya.
func SendToToken(token, title, body string) error {
	client, err := getClient()
	if err != nil {
		return err
	}

	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Token: token,
	}

	_, err = client.Send(context.Background(), message)
	return err
}