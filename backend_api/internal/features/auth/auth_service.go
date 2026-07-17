package auth

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/mailer"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo          *user.UserRepository
	passwordResetRepo *PasswordResetRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo:          &user.UserRepository{},
		passwordResetRepo: &PasswordResetRepository{},
	}
}

func (s *AuthService) Login(email, password string) (string, error) {
	u, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.New("email atau password salah")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		return "", errors.New("email atau password salah")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": u.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		log.Println("Gagal membuat token:", err)
		return "", errors.New("internal server error")
	}
	return tokenString, nil
}

func (s *AuthService) ForgotPassword(email string) error {
	u, err := s.userRepo.FindByEmail(email)
	if err != nil {
		// Sengaja tidak kasih tahu "email tidak ditemukan" secara eksplisit,
		// supaya orang tidak bisa dipakai untuk menebak-nebak email mana yang terdaftar.
		return nil
	}

	otp := generateOTP()
	hashedOTP, err := bcrypt.GenerateFromPassword([]byte(otp), 10)
	if err != nil {
		return errors.New("gagal memproses permintaan")
	}

	reset := &PasswordReset{
		Email:     u.Email,
		OTPCode:   string(hashedOTP),
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	if err := s.passwordResetRepo.Create(reset); err != nil {
		return err
	}

	if err := mailer.SendOTPEmail(u.Email, otp); err != nil {
		log.Println("Gagal kirim email OTP:", err)
		return errors.New("gagal mengirim email, coba lagi nanti")
	}

	return nil
}

func (s *AuthService) ResetPassword(input ResetPasswordInput) error {
	reset, err := s.passwordResetRepo.FindLatestValid(input.Email)
	if err != nil {
		return errors.New("kode OTP tidak valid atau sudah kedaluwarsa")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(reset.OTPCode), []byte(input.Otp)); err != nil {
		return errors.New("kode OTP salah")
	}

	u, err := s.userRepo.FindByEmail(input.Email)
	if err != nil {
		return errors.New("user tidak ditemukan")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), 12)
	if err != nil {
		return errors.New("gagal memproses password baru")
	}

	u.Password = string(hashedPassword)
	if err := s.userRepo.Update(u); err != nil {
		return err
	}

	return s.passwordResetRepo.MarkAsUsed(reset.ID)
}

func generateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}