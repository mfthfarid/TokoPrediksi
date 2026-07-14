package supplier

import "errors"

type SupplierService struct {
	repo *SupplierRepository
}

func NewSupplierService() *SupplierService {
	return &SupplierService{repo: &SupplierRepository{}}
}

func (s *SupplierService) GetAll() ([]Supplier, error) {
	return s.repo.FindAll()
}

func (s *SupplierService) GetByID(id uint) (*Supplier, error) {
	sup, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("supplier tidak ditemukan")
	}
	return sup, nil
}

func (s *SupplierService) Create(input CreateSupplierInput) (*Supplier, error) {
	sup := &Supplier{Name: input.Name, Phone: input.Phone, Address: input.Address}
	if err := s.repo.Create(sup); err != nil {
		return nil, err
	}
	return sup, nil
}

func (s *SupplierService) Update(id uint, input UpdateSupplierInput) (*Supplier, error) {
	sup, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("supplier tidak ditemukan")
	}

	if input.Name != nil {
		sup.Name = *input.Name
	}
	if input.Phone != nil {
		sup.Phone = input.Phone
	}
	if input.Address != nil {
		sup.Address = input.Address
	}

	if err := s.repo.Update(sup); err != nil {
		return nil, err
	}
	return sup, nil
}

func (s *SupplierService) Delete(id uint) error {
	if _, err := s.repo.FindByID(id); err != nil {
		return errors.New("supplier tidak ditemukan")
	}
	// Aman dihapus meski masih dipakai purchases lama,
	// karena FK purchases.supplier_id sudah ON DELETE SET NULL
	return s.repo.Delete(id)
}