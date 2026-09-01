package notification

import "time"

type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"type:varchar(150);not null"`
	Body      string    `json:"body" gorm:"type:varchar(255);not null"`
	Type      string    `json:"type" gorm:"type:varchar(50);not null"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

type FCMToken struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	Token     string    `json:"token" gorm:"type:varchar(255);uniqueIndex;not null"`
	CreatedAt time.Time `json:"created_at"`
}