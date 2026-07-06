package product

type CreateProductInput struct {
	Name  string `json:"name" binding:"required,min=3,max=100"`
	Price uint   `json:"price" binding:"required,gt=0"`
	Stock uint   `json:"stock" binding:"gte=0"`
}

type UpdateProductInput struct {
	Name  *string `json:"name" binding:"omitempty,min=3,max=100"`
	Price *uint   `json:"price" binding:"omitempty,gt=0"`
	Stock *uint   `json:"stock" binding:"omitempty,gte=0"`
}