package product

import "errors"

type ProductService struct {
	repo *ProductRepository
}

func NewProductService() *ProductService {
	return &ProductService{repo: &ProductRepository{}}
}

func (s *ProductService) GetAll() ([]Product, error) {
	return s.repo.FindAll()
}

func (s *ProductService) GetByID(id uint) (*Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}

func (s *ProductService) Create(name string, price, stock uint) (*Product, error) {
	p := &Product{Name: name, Price: price, Stock: stock}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *ProductService) Update(id uint, input UpdateProductInput) (*Product, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	// hanya update field yang benar-benar dikirim (tidak nil)
	if input.Name != nil {
		p.Name = *input.Name
	}
	if input.Price != nil {
		p.Price = *input.Price
	}
	if input.Stock != nil {
		p.Stock = *input.Stock
	}

	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}