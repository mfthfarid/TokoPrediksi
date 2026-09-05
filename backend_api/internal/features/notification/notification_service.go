package notification

import (
	"log"

	"github.com/mfthfarid/TokoPrediksi/backend_api/internal/shared/pushnotification"
)

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
        return
    }

    tokens, err := s.repo.FindAllTokens()
    if err != nil {
        log.Println("Gagal ambil daftar token FCM:", err)
        return
    }

    for _, t := range tokens {
    if err := pushnotification.SendToToken(t.Token, title, body); err != nil {
        log.Printf(
            "Gagal kirim push ke token %s: %v\n",
            t.Token,
            err,
        )

        s.repo.DeleteToken(t.Token)
    } else {
        log.Printf(
            "Push notification berhasil dikirim ke token: %s\n",
            t.Token,
        )
    }
}
}