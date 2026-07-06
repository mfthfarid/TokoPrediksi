package validator

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

// FormatValidationError mengubah error dari ShouldBindJSON jadi pesan yang rapi & berbahasa Indonesia
func FormatValidationError(err error) map[string]string {
	errors := make(map[string]string)

	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		// bukan error validasi (misal JSON-nya rusak/malformed)
		errors["error"] = "Format data tidak valid"
		return errors
	}

	for _, fe := range validationErrors {
		field := strings.ToLower(fe.Field())
		errors[field] = messageFor(fe)
	}

	return errors
}

func messageFor(fe validator.FieldError) string {
	field := strings.ToLower(fe.Field())

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s wajib diisi", field)
	case "email":
		return "format email tidak valid"
	case "min":
		return fmt.Sprintf("%s minimal %s karakter", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s maksimal %s karakter", field, fe.Param())
	case "gt":
		return fmt.Sprintf("%s harus lebih besar dari %s", field, fe.Param())
	case "gte":
		return fmt.Sprintf("%s tidak boleh kurang dari %s", field, fe.Param())
	case "numeric":
		return fmt.Sprintf("%s harus berupa angka", field)
	default:
		return fmt.Sprintf("%s tidak valid", field)
	}
}