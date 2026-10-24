package mailer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type brevoEmail struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type brevoRequest struct {
	Sender      brevoEmail   `json:"sender"`
	To          []brevoEmail `json:"to"`
	Subject     string       `json:"subject"`
	HTMLContent string       `json:"htmlContent"`
}

func SendOTPEmail(toEmail, otpCode string) error {
	apiKey := os.Getenv("BREVO_API_KEY")
	senderEmail := os.Getenv("SMTP_FROM")
	senderName := os.Getenv("SMTP_SENDER_NAME")

	if senderName == "" {
		senderName = "TokoPrediksi"
	}

	// Log untuk debugging (tanpa API key)
	log.Printf("Brevo API -> From: %s, To: %s", senderEmail, toEmail)

	if apiKey == "" {
		log.Println("ERROR: BREVO_API_KEY tidak diset. Periksa environment variables.")
		return fmt.Errorf("konfigurasi email tidak lengkap")
	}

	if senderEmail == "" {
		log.Println("ERROR: SMTP_FROM tidak diset. Periksa environment variables.")
		return fmt.Errorf("konfigurasi email tidak lengkap")
	}

	htmlContent := fmt.Sprintf(`
		<p>Kode OTP untuk reset password akun TokoPrediksi kamu:</p>
		<h2>%s</h2>
		<p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini ke siapa pun.</p>
	`, otpCode)

	reqBody := brevoRequest{
		Sender:      brevoEmail{Email: senderEmail, Name: senderName},
		To:          []brevoEmail{{Email: toEmail}},
		Subject:     "Kode Reset Password - TokoPrediksi",
		HTMLContent: htmlContent,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("gagal membuat request: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("gagal membuat HTTP request: %v", err)
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("content-type", "application/json")
	req.Header.Set("api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("ERROR kirim email ke %s: %v", toEmail, err)
		return fmt.Errorf("gagal mengirim email: %v", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		log.Printf("ERROR Brevo API (status %d): %s", resp.StatusCode, string(body))
		return fmt.Errorf("gagal mengirim email (status %d)", resp.StatusCode)
	}

	log.Printf("Email OTP berhasil dikirim ke %s (status %d)", toEmail, resp.StatusCode)
	return nil
}


