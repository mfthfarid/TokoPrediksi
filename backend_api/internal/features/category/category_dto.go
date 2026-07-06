package category

type CreateCategoryInput struct {
	Name string `json:"name" binding:"required,min=3,max=100"`
}

type UpdateCategoryInput struct {
	Name *string `json:"name" binding:"omitempty,min=3,max=100"`
}