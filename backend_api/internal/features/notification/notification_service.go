package notification

import (
	"fmt"
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/features/reorder"
	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/pushnotification"
)

func colorForType(notifType string) string {
	switch notifType {
	case "stock_out":
		return "#F44336" // Merah
	case "safety_stock":
		return "#DC2626" // Merah Darurat
	case "reorder_point":
		return "#F59E0B" // Kuning / Amber
	case "stock_low":
		return "#FFC107" // Kuning Terang
	default:
		return "" // warna default aplikasi
	}
}

type Service struct {
	repo *Repository
}

func NewService() *Service {
	return &Service{repo: &Repository{}}
}

func (s *Service) RegisterToken(userID uint, token string) error {
	return s.repo.SaveToken(userID, token)
}

func (s *Service) GetAll() ([]Notification, error) {
	return s.repo.FindAll()
}

func (s *Service) MarkAsRead(id uint) error {
	return s.repo.MarkAsRead(id)
}

func (s *Service) CountUnread() (int64, error) {
	return s.repo.CountUnread()
}

// Broadcast mengirim notifikasi ke SEMUA device terdaftar (karena aplikasi ini
// single-owner, semua token dianggap milik owner yang sama), sekaligus
// menyimpan riwayatnya di tabel notifications untuk ditampilkan di in-app history.
func (s *Service) Broadcast(title, body, notifType string) {
	if err := s.repo.CreateNotification(&Notification{
		Title: title,
		Body:  body,
		Type:  notifType,
	}); err != nil {
		log.Println("Gagal menyimpan riwayat notifikasi:", err)
	}

	tokens, err := s.repo.FindAllTokens()
	if err != nil {
		log.Println("Gagal ambil daftar token FCM:", err)
		return
	}

	color := colorForType(notifType)
	for _, t := range tokens {
		if err := pushnotification.SendToToken(t.Token, title, body, color); err != nil {
			log.Printf("Gagal kirim push ke token %s: %v (kemungkinan token sudah tidak valid, dihapus)\n", t.Token, err)
			s.repo.DeleteToken(t.Token)
		}
	}
}

// formatProductList menggabungkan nama produk jadi 1 kalimat ringkas,
func formatProductList(names []string) string {
	switch len(names) {
	case 0:
		return ""
	case 1:
		return names[0]
	case 2:
		return names[0] + " dan " + names[1]
	default:
		return fmt.Sprintf("%s, %s, dan %d lainnya", names[0], names[1], len(names)-2)
	}
}

// CheckStockAndNotify dipanggil cron harian & setelah prediksi — cek stok habis,
// safety stock, reorder point, dan stok menipis.
// Mengelompokkan produk menjadi ringkasan (maksimal 1 notifikasi per kategori urgensi).
func (s *Service) CheckStockAndNotify() {
	alertRepo := &StockAlertRepository{}

	// 1. Stok habis
	outOfStock, err := alertRepo.GetOutOfStock()
	if err == nil && len(outOfStock) > 0 {
		body := fmt.Sprintf(
			"Stok %s habis!",
			formatProductList(outOfStock),
		)
		s.Broadcast("⛔ Stok Habis", body, "stock_out")
	}

	// 2. Cek Reorder Point & Safety Stock berbasis Prediksi
	reorderService := reorder.NewService()
	safetyStockAlerts, reorderPointAlerts, checkedIDs, _ := reorderService.GetAllReorderAlerts()

	// Notifikasi masuk zona Safety Stock (Kritis - buffer stock terpakai)
	if len(safetyStockAlerts) > 0 {
		var names []string
		for _, a := range safetyStockAlerts {
			names = append(names, a.ProductName)
		}
		body := fmt.Sprintf(
			"Stok %s telah menyentuh batas aman (safety stock). Segera lakukan pemesanan ulang!",
			formatProductList(names),
		)
		s.Broadcast("🚨 Kritis: Masuk Safety Stock", body, "safety_stock")
	}

	// Notifikasi mencapai Reorder Point (Waktunya pesan kembali)
	if len(reorderPointAlerts) > 0 {
		var names []string
		for _, a := range reorderPointAlerts {
			names = append(names, a.ProductName)
		}
		body := fmt.Sprintf(
			"Stok %s telah mencapai Reorder Point. Waktunya memesan kembali ke supplier!",
			formatProductList(names),
		)
		s.Broadcast("📦 Waktunya Reorder (ROP)", body, "reorder_point")
	}

	// 3. Stok menipis konvensional (khusus produk yang BELUM punya data prediksi)
	lowStock, err := alertRepo.GetLowStockExcluding(checkedIDs)
	if err == nil && len(lowStock) > 0 {
		body := fmt.Sprintf(
			"Stok %s hampir habis.",
			formatProductList(lowStock),
		)
		s.Broadcast("⚠️ Stok Menipis", body, "stock_low")
	}
}