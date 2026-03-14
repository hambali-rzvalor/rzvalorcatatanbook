# QRIS Payment Integration Guide

## 📋 Overview

Aplikasi Tahu Walik Manager sekarang terintegrasi dengan **QRIS Payment Gateway** menggunakan **Midtrans**. Fitur ini memungkinkan Anda untuk:

- Generate QR Code QRIS untuk pembayaran
- Mencatat transaksi otomatis setelah pembayaran berhasil
- Memantau status pembayaran QRIS
- Mendukung berbagai e-wallet (GoPay, OVO, DANA, ShopeePay, dll)

## 🔧 Konfigurasi

### 1. Daftar Midtrans

1. Kunjungi [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Buat akun baru (jika belum punya)
3. Aktivasikan QRIS payment di dashboard

### 2. Dapatkan API Keys

1. Login ke Midtrans Dashboard
2. Masuk ke menu **Settings** > **Access Keys**
3. Copy **Server Key** dan **Client Key**

### 3. Setup Environment Variables

Edit file `.env.local` di root project:

```bash
# Midtrans QRIS Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Application URL (untuk webhook)
# Gunakan ngrok untuk development
APP_URL=https://your-ngrok-url.ngrok.io
```

**Catatan:**
- Gunakan prefix `SB-` untuk **Sandbox** (testing)
- Gunakan prefix tanpa `SB-` untuk **Production** (live)
- `MIDTRANS_IS_PRODUCTION=false` untuk sandbox, `true` untuk production

### 4. Setup Webhook URL di Midtrans

1. Login ke Midtrans Dashboard
2. Masuk ke menu **Settings** > **Configuration**
3. Di bagian **Payment Notification URL**, masukkan:
   ```
   https://your-domain.com/api/qris/notification
   ```
4. Untuk development dengan ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/qris/notification
   ```

### 5. Jalankan Migration Database

```bash
npm run db:push
```

## 🚀 Cara Menggunakan

### Untuk Admin/Pemilik Toko

1. **Buka halaman Tambah Transaksi**
   - Klik menu "Tambah" atau pergi ke `/add`
   - Atau dari halaman Sales, klik tombol "Tambah Penjualan"

2. **Isi Detail Penjualan**
   - Pilih "Pemasukan"
   - Masukkan jumlah uang
   - Pilih kategori "Penjualan"
   - Isi jumlah porsi (opsional)
   - Tambahkan keterangan (opsional)

3. **Bayar dengan QRIS**
   - Setelah mengisi jumlah, akan muncul tombol **"Bayar dengan QRIS"**
   - Klik tombol tersebut
   - Modal QRIS akan muncul dengan QR Code

4. **Scan QR Code**
   - Buka aplikasi e-wallet (Gojek, OVO, DANA, ShopeePay, dll)
   - Pilih fitur scan QR
   - Scan QR Code yang ditampilkan
   - Selesaikan pembayaran di aplikasi e-wallet

5. **Pembayaran Berhasil**
   - Sistem akan otomatis mendeteksi pembayaran berhasil
   - Transaksi akan otomatis tercatat di database
   - Anda akan diarahkan ke halaman Sales

### Untuk Customer (yang membayar)

1. Admin memasukkan jumlah pembayaran
2. Admin menampilkan QR Code QRIS
3. Customer scan QR Code dengan e-wallet apapun yang mendukung QRIS
4. Customer masukkan PIN/konfirmasi pembayaran
5. Selesai! Pembayaran otomatis tercatat

## 📱 Fitur QRIS Modal

- **QR Code Dinamis**: QR Code baru untuk setiap transaksi
- **Timer 15 Menit**: QR Code berlaku selama 15 menit
- **Auto-detect Payment**: Sistem otomatis mendeteksi pembayaran berhasil
- **Polling Status**: Cek status pembayaran setiap 3 detik
- **Copy Order ID**: Salin ID order untuk referensi
- **Status Visual**: Indikator status pembayaran

## 🗄️ Database Schema

Tabel baru `qris_payments`:

```sql
CREATE TABLE qris_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  transaction_id INTEGER REFERENCES transactions(id),
  amount DECIMAL(12,0) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  qr_string TEXT,
  qr_url TEXT,
  actions JSON,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSON,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Pembayaran:**
- `pending` - Menunggu pembayaran
- `success` - Pembayaran berhasil
- `failed` - Pembayaran gagal
- `expired` - QR Code kadaluarsa

## 🔌 API Endpoints

### POST /api/qris
Membuat pembayaran QRIS baru.

**Request Body:**
```json
{
  "amount": 50000,
  "description": "Penjualan 5 porsi Tahu Walik",
  "portions": 5,
  "transactionDate": "2024-01-01T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "TAHUWALIK-1234567890-abc123",
    "qrString": "000201010211...",
    "actions": [...],
    "amount": "50000",
    "expiresAt": "2024-01-01T10:15:00Z"
  }
}
```

### GET /api/qris?orderId={orderId}
Cek status pembayaran QRIS.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "orderId": "TAHUWALIK-1234567890-abc123",
    "status": "success",
    "amount": "50000",
    "paidAt": "2024-01-01T10:05:00Z"
  }
}
```

### POST /api/qris/notification
Webhook untuk notifikasi pembayaran dari Midtrans.

**Dipanggil otomatis oleh Midtrans** ketika status pembayaran berubah.

## 🧪 Testing (Sandbox Mode)

1. Pastikan `MIDTRANS_IS_PRODUCTION=false`
2. Gunakan QRIS simulator dari Midtrans
3. Atau gunakan e-wallet sungguhan (akan charge beneran!)

**Test Card/QRIS:**
- Untuk sandbox, Midtrans menyediakan test QRIS
- Lihat dokumentasi Midtrans untuk detail testing

## 🛠️ Troubleshooting

### QR Code tidak muncul
- Pastikan API keys sudah benar
- Cek koneksi internet
- Lihat console browser untuk error

### Pembayaran tidak terdeteksi
- Pastikan webhook URL sudah diset di Midtrans
- Untuk development, gunakan ngrok
- Cek log di `/api/qris/notification`

### Error "Invalid API Key"
- Verify Server Key dan Client Key
- Pastikan tidak ada spasi di .env.local
- Restart development server

### Database Error
- Jalankan `npm run db:push`
- Pastikan DATABASE_URL benar

## 📚 Resources

- [Midtrans Documentation](https://docs.midtrans.com)
- [Midtrans QRIS Guide](https://docs.midtrans.com/docs/qr-is)
- [Midtrans API Reference](https://api-docs.midtrans.com)

## 💡 Tips

1. **Selalu test di Sandbox** sebelum production
2. **Simpan Order ID** untuk referensi dan troubleshooting
3. **Monitor webhook logs** untuk memastikan notifikasi berjalan
4. **Backup database** secara berkala
5. **Gunakan HTTPS** untuk production

## 🔐 Security

- Jangan commit `.env.local` ke Git
- Rotasi API keys secara berkala
- Gunakan HTTPS untuk production
- Validate semua input dari client
- Implementasi rate limiting untuk API

---

**Dibuat untuk Tahu Walik Manager**
Untuk pertanyaan lebih lanjut, silakan hubungi developer.
