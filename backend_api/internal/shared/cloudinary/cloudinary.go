package cloudinary

import (
	"context"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func getClient() (*cloudinary.Cloudinary, error) {
	return cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
}

// Resize/compress diatur di dashboard Cloudinary
func UploadImage(file multipart.File, folder string) (string, error) {
	cld, err := getClient()
	if err != nil {
		return "", err
	}

	result, err := cld.Upload.Upload(context.Background(), file, uploader.UploadParams{
		Folder: folder,
	})
	if err != nil {
		return "", err
	}

	return result.SecureURL, nil
}