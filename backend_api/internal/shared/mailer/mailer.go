package mailer

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

func SendOTPEmail(toEmail, otpCode string) error {
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("SMTP_FROM")

	// Log konfigurasi SMTP (tanpa password) untuk debugging
	log.Printf("SMTP Config -> Host: %s, Port: %s, Username: %s, From: %s, To: %s",
		host, portStr, username, from, toEmail)

	// Validasi: pastikan semua variabel SMTP terisi
	if host == "" || username == "" || password == "" || from == "" {
		log.Println("ERROR: Konfigurasi SMTP tidak lengkap. Periksa environment variables SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM")
		return fmt.Errorf("konfigurasi SMTP tidak lengkap")
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = 587
	}

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Kode Reset Password - TokoPrediksi")
	m.SetBody("text/html", fmt.Sprintf(`
		<p>Kode OTP untuk reset password akun TokoPrediksi kamu:</p>
		<h2>%s</h2>
		<p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini ke siapa pun.</p>
	`, otpCode))

	d := gomail.NewDialer(host, port, username, password)

	if err := d.DialAndSend(m); err != nil {
		log.Printf("ERROR kirim email ke %s: %v", toEmail, err)
		return err
	}

	log.Printf("Email OTP berhasil dikirim ke %s", toEmail)
	return nil
}