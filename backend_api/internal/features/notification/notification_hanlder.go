package notification

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler() *Handler {
	return &Handler{service: NewService()}
}

func (h *Handler) RegisterToken(c *gin.Context) {
	var input RegisterTokenInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token tidak valid"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tidak terautentikasi"})
		return
	}

	if err := h.service.RegisterToken(userID.(uint), input.Token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftarkan token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Token berhasil didaftarkan"})
}

func (h *Handler) GetAll(c *gin.Context) {
	notifications, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil notifikasi"})
		return
	}

	unreadCount, _ := h.service.CountUnread()

	c.JSON(http.StatusOK, gin.H{
		"unread_count":  unreadCount,
		"notifications": notifications,
	})
}

func (h *Handler) MarkAsRead(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.service.MarkAsRead(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menandai notifikasi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notifikasi ditandai sudah dibaca"})
}