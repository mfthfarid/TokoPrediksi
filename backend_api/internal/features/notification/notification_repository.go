package notification

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type Repository struct{}

func (r *Repository) SaveToken(userID uint, token string) error {
	var existing FCMToken
	err := config.DB.Where("token = ?", token).First(&existing).Error
	if err == nil {
		return nil // token sudah terdaftar, tidak perlu duplikat
	}
	return config.DB.Create(&FCMToken{UserID: userID, Token: token}).Error
}

func (r *Repository) FindTokensByUserID(userID uint) ([]FCMToken, error) {
	var tokens []FCMToken
	err := config.DB.Where("user_id = ?", userID).Find(&tokens).Error
	return tokens, err
}

func (r *Repository) FindAllTokens() ([]FCMToken, error) {
	var tokens []FCMToken
	err := config.DB.Find(&tokens).Error
	return tokens, err
}

func (r *Repository) DeleteToken(token string) error {
	return config.DB.Where("token = ?", token).Delete(&FCMToken{}).Error
}

func (r *Repository) CreateNotification(n *Notification) error {
	return config.DB.Create(n).Error
}

func (r *Repository) FindAll() ([]Notification, error) {
	var notifications []Notification
	err := config.DB.Order("created_at DESC").Limit(50).Find(&notifications).Error
	return notifications, err
}

func (r *Repository) MarkAsRead(id uint) error {
	return config.DB.Model(&Notification{}).Where("id = ?", id).Update("is_read", true).Error
}

func (r *Repository) CountUnread() (int64, error) {
	var count int64
	err := config.DB.Model(&Notification{}).Where("is_read = ?", false).Count(&count).Error
	return count, err
}