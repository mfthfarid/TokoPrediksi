package category

import (
	"errors"
	"fmt"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"
)

type CategoryService struct {
	repo *CategoryRepository
}

func NewCategoryService() *CategoryService {
	return &CategoryService{repo: &CategoryRepository{}}
}

func (s *CategoryService) GetAll() ([]Category, error) {
	return s.repo.FindAll()
}

func (s *CategoryService) GetByID(id uint) (*Category, error) {
	c, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}
	return c, nil
}

func (s *CategoryService) Create(input CreateCategoryInput) (*Category, error) {
	c := &Category{Name: input.Name}
	if err := s.repo.Create(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CategoryService) Update(id uint, input UpdateCategoryInput) (*Category, error) {
	c, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}

	if input.Name != nil {
		c.Name = *input.Name
	}

	if err := s.repo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CategoryService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("kategori tidak ditemukan")
	}

	var count int64
	if err := config.DB.Table("products").Where("id_kategori = ?", id).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("kategori tidak dapat dihapus, masih digunakan oleh %d produk", count)
	}

	return s.repo.Delete(id)
}