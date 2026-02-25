# 🗄️ Database Integration Guide - Tahu Walik Manager

## Setup Database dengan Drizzle ORM & Neon PostgreSQL

### 1️⃣ Langkah-langkah Setup

#### A. Dapatkan Connection String dari Neon

1. Buka [Neon Console](https://console.neon.tech/)
2. Login/Register akun Neon Anda
3. Buat project baru (misal: "Tahu Walik")
4. Copy **Connection String** yang ditampilkan
   - Format: `postgresql://user:password@host/database?sslmode=require`

#### B. Buat File Environment

1. Copy file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` dan paste connection string Neon Anda:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

#### C. Push Schema ke Database

Jalankan perintah ini untuk membuat tabel di database Neon:

```bash
npm run db:push
```

Perintah ini akan:
- ✅ Membuat tabel `ingredients` (untuk stok bahan)
- ✅ Membuat tabel `transactions` (untuk transaksi keuangan)
- ✅ Membuat enum types untuk `transaction_type` dan `category`

### 2️⃣ Struktur Database

#### Tabel `ingredients` (Stok Bahan)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | INTEGER | Primary key (auto increment) |
| `name` | TEXT | Nama bahan (ayam, tahu, tepung) |
| `quantity` | INTEGER | Jumlah stok (gram/pcs) |
| `unit` | TEXT | Satuan (kg, pcs, liter) |
| `min_stock` | INTEGER | Stok minimum untuk alert |
| `last_updated` | TIMESTAMP | Terakhir update |

#### Tabel `transactions` (Transaksi Keuangan)
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | INTEGER | Primary key (auto increment) |
| `type` | ENUM | `income` atau `expense` |
| `category` | ENUM | `penjualan`, `bahan_baku`, `operasional`, `listrik_air`, `lain_lain` |
| `description` | TEXT | Keterangan transaksi |
| `amount` | DECIMAL | Jumlah uang (Rupiah) |
| `portions` | INTEGER | Jumlah porsi (untuk penjualan) |
| `transaction_date` | TIMESTAMP | Tanggal transaksi |
| `created_at` | TIMESTAMP | Waktu dibuat |

### 3️⃣ Server Actions yang Tersedia

File: `app/actions.ts`

| Fungsi | Deskripsi |
|--------|-----------|
| `addTransaction(data)` | Tambah transaksi baru |
| `getDashboardData()` | Ambil data dashboard (stats hari ini + aktivitas) |
| `getTransactions(filters)` | Ambil transaksi dengan filter & pagination |
| `getIngredients()` | Ambil semua bahan/stok |
| `updateIngredientStock(id, qty)` | Update stok bahan |
| `addIngredient(data)` | Tambah bahan baru |

### 4️⃣ Contoh Penggunaan

#### Menambah Transaksi (Server Component)
```typescript
import { addTransaction } from '@/app/actions';

// Di dalam Server Component atau Server Action
const result = await addTransaction({
  type: 'income',
  category: 'penjualan',
  description: 'Jual 10 Porsi Tahu Walik',
  amount: 50000,
  portions: 10,
  transactionDate: new Date(),
});

if (result.success) {
  console.log('Transaksi berhasil!');
}
```

#### Mengambil Data Dashboard
```typescript
import { getDashboardData } from '@/app/actions';

// Di dalam Server Component
const dashboardData = await getDashboardData();

if (dashboardData.success) {
  const { todayStats, recentActivity } = dashboardData.data;
  console.log('Untung hari ini:', todayStats.profit);
}
```

### 5️⃣ Perintah Database Lainnya

```bash
# Generate migration files (jika ingin version control)
npm run db:generate

# Jalankan migration
npm run db:migrate

# Push schema langsung (tanpa migration files)
npm run db:push
```

### 6️⃣ Troubleshooting

#### Error: DATABASE_URL is not set
- Pastikan file `.env.local` sudah dibuat
- Pastikan `DATABASE_URL` sudah diisi dengan connection string yang benar

#### Error: Connection refused
- Pastikan connection string Neon sudah benar
- Cek apakah IP address Anda tidak diblokir di Neon dashboard
- Pastikan SSL mode aktif (`?sslmode=require`)

#### Tabel tidak muncul
- Jalankan ulang: `npm run db:push`
- Cek Neon Console untuk memverifikasi tabel sudah ada

### 7️⃣ Deployment ke Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Di Vercel Dashboard, tambahkan **Environment Variable**:
   - Name: `DATABASE_URL`
   - Value: (paste connection string Neon Anda)
4. Deploy!

Neon sudah support SSL secara default, jadi aman untuk production.

---

**🎉 Database integration complete!** Aplikasi Tahu Walik sekarang siap digunakan dengan database PostgreSQL real.
