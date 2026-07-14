package unit

import "errors"

type UnitService struct {
	repo *UnitRepository
}

func NewUnitService() *UnitService {
	return &UnitService{repo: &UnitRepository{}}
}

func (s *UnitService) GetAll() ([]Unit, error) {
	return s.repo.FindAll()
}

func (s *UnitService) GetByID(id uint) (*Unit, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("satuan tidak ditemukan")
	}
	return u, nil
}

func (s *UnitService) Create(input CreateUnitInput) (*Unit, error) {
	existing, _ := s.repo.FindByName(input.Name)
	if existing != nil {
		return nil, errors.New("satuan dengan nama ini sudah ada")
	}

	u := &Unit{Name: input.Name}
	if err := s.repo.Create(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *UnitService) Update(id uint, input UpdateUnitInput) (*Unit, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("satuan tidak ditemukan")
	}

	if input.Name != nil {
		u.Name = *input.Name
	}

	if err := s.repo.Update(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *UnitService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("satuan tidak ditemukan")
	}
	// Catatan: kalau satuan ini masih dipakai product_units,
	// penghapusan akan otomatis gagal karena FK ON DELETE RESTRICT di database.
	return s.repo.Delete(id)
}