package auth

import "github.com/gin-gonic/gin"

func RegisterRoutes(r *gin.Engine) {
	handler := NewAuthHandler()

	g := r.Group("/auth")
	{
		// Sengaja dinonaktifkan dulu — user (owner) didaftarkan langsung lewat database.
		// Aktifkan kembali kalau nanti dibutuhkan fitur pendaftaran mandiri.
		// g.POST("/register", handler.Register)
		g.POST("/login", handler.Login)
	}
}