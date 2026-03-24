package service

import (
	"errors"
	"log"
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/models"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/repository"

	"os"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{userRepo: &repository.UserRepository{}}
}

func (s *AuthService) Register(email, password string) error {
	_, err := s.userRepo.FindByEmail(email)
	if err == nil {
		return errors.New("email already exists")
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 12)
	user := &models.User{Email: email, Password: string(hashed)}
	return s.userRepo.Create(user)
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return "", errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid email or password")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	jwtSecret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Println("Gagal membuat token:", err)
		return "", errors.New("internal server error")
	}
	return tokenString, nil
}