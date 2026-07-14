package supplier

type CreateSupplierInput struct {
	Name    string  `json:"name" binding:"required,min=3,max=150"`
	Phone   *string `json:"phone" binding:"omitempty,max=20"`
	Address *string `json:"address" binding:"omitempty,max=255"`
}

type UpdateSupplierInput struct {
	Name    *string `json:"name" binding:"omitempty,min=3,max=150"`
	Phone   *string `json:"phone" binding:"omitempty,max=20"`
	Address *string `json:"address" binding:"omitempty,max=255"`
}