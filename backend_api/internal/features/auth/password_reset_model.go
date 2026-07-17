package auth

import "time"

type PasswordReset struct {
	ID        uint       `gorm:"primaryKey"`
	Email     string     `gorm:"type:varchar(255);not null"`
	OTPCode   string     `gorm:"type:varchar(255);not null"`
	ExpiresAt time.Time  `gorm:"not null"`
	UsedAt    *time.Time
	CreatedAt time.Time
}