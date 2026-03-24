package repository

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/config"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/models"
)

type UserRepository struct{}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := config.DB.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *UserRepository) Create(user *models.User) error {
	return config.DB.Create(user).Error
}