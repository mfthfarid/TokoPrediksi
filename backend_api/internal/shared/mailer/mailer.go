package mailer

import (
	"fmt"
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
	return d.DialAndSend(m)
}