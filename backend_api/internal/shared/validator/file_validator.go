package validator

import (
	"errors"
	"mime/multipart"
	"net/http"
)

const MaxImageSize = 5 * 1024 * 1024 // 5MB, jaga-jaga walau RN sudah compress duluan

var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
}

// ValidateImageFile cek ukuran DAN isi file sebenarnya (bukan cuma percaya ekstensi nama file)
func ValidateImageFile(fileHeader *multipart.FileHeader) error {
	if fileHeader.Size > MaxImageSize {
		return errors.New("ukuran file maksimal 5MB")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return errors.New("gagal membaca file")
	}
	defer file.Close()

	buffer := make([]byte, 512) // cukup 512 byte pertama untuk deteksi jenis file
	if _, err := file.Read(buffer); err != nil {
		return errors.New("gagal membaca isi file")
	}

	contentType := http.DetectContentType(buffer)
	if !allowedImageTypes[contentType] {
		return errors.New("file bukan gambar yang valid (harus JPEG atau PNG)")
	}

	return nil
}