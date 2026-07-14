package unit

import "github.com/mfthfarid/TokoPrediksi/backend_api/internal/core/config"

type UnitRepository struct{}

func (r *UnitRepository) FindAll() ([]Unit, error) {
	var units []Unit
	if err := config.DB.Find(&units).Error; err != nil {
		return nil, err
	}
	return units, nil
}

func (r *UnitRepository) FindByID(id uint) (*Unit, error) {
	var u Unit
	if err := config.DB.First(&u, id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UnitRepository) FindByName(name string) (*Unit, error) {
	var u Unit
	if err := config.DB.Where("name = ?", name).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UnitRepository) Create(u *Unit) error {
	return config.DB.Create(u).Error
}

func (r *UnitRepository) Update(u *Unit) error {
	return config.DB.Save(u).Error
}

func (r *UnitRepository) Delete(id uint) error {
	return config.DB.Delete(&Unit{}, id).Error
}