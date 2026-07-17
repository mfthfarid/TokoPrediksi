package auth

import (
	"time"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

type PasswordResetRepository struct{}

func (r *PasswordResetRepository) Create(pr *PasswordReset) error {
	return config.DB.Create(pr).Error
}

func (r *PasswordResetRepository) FindLatestValid(email string) (*PasswordReset, error) {
	var pr PasswordReset
	err := config.DB.
		Where("email = ? AND used_at IS NULL AND expires_at > NOW()", email).
		Order("created_at DESC").
		First(&pr).Error
	if err != nil {
		return nil, err
	}
	return &pr, nil
}

func (r *PasswordResetRepository) MarkAsUsed(id uint) error {
	return config.DB.Model(&PasswordReset{}).Where("id = ?", id).Update("used_at", time.Now()).Error
}