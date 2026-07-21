package cloudinary

import "strings"

// TransformURL menyisipkan parameter transformasi Cloudinary (resize/kompres/format)
// ke URL asli hasil upload. Format URL Cloudinary selalu punya segmen "/upload/"
// tempat parameter transformasi disisipkan.
func TransformURL(originalURL, transformation string) string {
	return strings.Replace(originalURL, "/upload/", "/upload/"+transformation+"/", 1)
}

func ThumbnailURL(originalURL string) string {
	return TransformURL(originalURL, "w_150,h_150,c_fill,q_auto,f_auto")
}

func DetailURL(originalURL string) string {
	return TransformURL(originalURL, "w_800,q_auto,f_auto")
}