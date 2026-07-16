package user

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo *UserRepository
}

func NewUserService() *UserService {
	return &UserService{repo: &UserRepository{}}
}

func (s *UserService) GetProfile(userID uint) (*User, error) {
	u, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}
	return u, nil
}

func (s *UserService) UpdateProfile(userID uint, input UpdateProfileInput) (*User, error) {
	u, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user tidak ditemukan")
	}

	if input.Email != nil && *input.Email != u.Email {
		existing, _ := s.repo.FindByEmail(*input.Email)
		if existing != nil {
			return nil, errors.New("email sudah dipakai user lain")
		}
		u.Email = *input.Email
	}

	if input.Name != nil {
		u.Name = *input.Name
	}

	if err := s.repo.Update(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *UserService) UpdatePassword(userID uint, input UpdatePasswordInput) error {
	u, err := s.repo.FindByID(userID)
	if err != nil {
		return errors.New("user tidak ditemukan")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(input.OldPassword)); err != nil {
		return errors.New("password lama tidak sesuai")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), 12)
	if err != nil {
		return errors.New("gagal memproses password baru")
	}

	u.Password = string(hashed)
	return s.repo.Update(u)
}