package user

import (
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

type UserRepository struct{}

func (r *UserRepository) FindByEmail(email string) (*User, error) {
	var u User
	if err := config.DB.Where("email = ?", email).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Create(u *User) error {
	return config.DB.Create(u).Error
}