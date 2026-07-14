package user

type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" gorm:"type:varchar(100);not null"`
	Email    string `json:"email" gorm:"type:varchar(255);uniqueIndex;not null"`
	Password string `json:"-" gorm:"type:varchar(255);not null"`
}

// package user

// import "gorm.io/gorm"

// type User struct {
// 	gorm.Model
// 	Email    string `gorm:"unique;not null" json:"email"`
// 	Password string `json:"-"` // jangan pernah ikut ter-serialize ke JSON
// }