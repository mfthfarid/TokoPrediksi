package unit

type CreateUnitInput struct {
	Name string `json:"name" binding:"required,min=1,max=20"`
}

type UpdateUnitInput struct {
	Name *string `json:"name" binding:"omitempty,min=1,max=20"`
}