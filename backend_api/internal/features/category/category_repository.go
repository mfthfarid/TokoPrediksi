package category

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type CategoryRepository struct{}

func (r *CategoryRepository) FindAll() ([]Category, error) {
	var categories []Category
	if err := config.DB.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *CategoryRepository) FindByID(id uint) (*Category, error) {
	var c Category
	if err := config.DB.First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) Create(c *Category) error {
	return config.DB.Create(c).Error
}

func (r *CategoryRepository) Update(c *Category) error {
	return config.DB.Save(c).Error
}

func (r *CategoryRepository) Delete(id uint) error {
	return config.DB.Delete(&Category{}, id).Error
}