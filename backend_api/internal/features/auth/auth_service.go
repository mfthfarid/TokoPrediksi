package auth

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/user"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *user.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{userRepo: &user.UserRepository{}}
}

func (s *AuthService) Register(email, password string) error {
	if _, err := s.userRepo.FindByEmail(email); err == nil {
		return errors.New("email sudah terdaftar")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return errors.New("gagal memproses password")
	}

	newUser := &user.User{Email: email, Password: string(hashed)}
	return s.userRepo.Create(newUser)
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