# 🍢 Tahu Walik Manager

Aplikasi manajemen keuangan untuk usaha Tahu Walik dengan fitur lengkap untuk mencatat penjualan, pengeluaran, dan laporan keuangan.

## 🚀 Fitur

- **Dashboard** - Lihat total untung, omzet, pengeluaran, dan porsi terjual hari ini
- **Penjualan** - Catat dan kelola semua transaksi penjualan
- **Pengeluaran** - Catat modal dan pengeluaran operasional
- **Laporan** - Analisis keuangan dengan grafik dan export PDF
- **Aktivitas** - Riwayat semua transaksi dengan filter dan pagination
- **Notifikasi** - Notifikasi untuk stok menipis dan update penting

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **PDF Export:** jsPDF
- **Deployment:** Vercel

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/Rzvalor/tahu-walik-manager.git
cd tahu-walik-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

1. Buka [Neon Console](https://console.neon.tech/)
2. Buat project baru
3. Copy connection string
4. Buat file `.env.local`:

```bash
cp .env.example .env.local
```

5. Edit `.env.local` dan paste connection string:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

6. Push schema ke database:

```bash
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📖 Database Commands

```bash
# Push schema ke database
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

## 📁 Struktur Folder

```
tahu-walik-manager/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── add/                  # Tambah transaksi
│   ├── sales/                # Penjualan
│   ├── expenses/             # Pengeluaran
│   ├── reports/              # Laporan
│   ├── activity/             # Aktivitas
│   └── notifications/        # Notifikasi
├── components/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── StatCard.tsx
│   └── Pagination.tsx
├── db/
│   ├── schema.ts             # Database schema
│   └── index.ts              # Database connection
├── lib/
│   └── pdfExport.ts          # PDF export utility
├── app/
│   └── actions.ts            # Server actions
└── .env.local                # Environment variables (JANGAN COMMIT!)
```

## 🔐 Environment Variables

File `.env.local` berisi informasi sensitif dan **TIDAK BOLEH** di-commit ke Git.

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

## 🚀 Deploy ke Vercel

1. Push code ke GitHub
2. Buka [Vercel](https://vercel.com/)
3. Import repository GitHub kamu
4. Tambahkan environment variable `DATABASE_URL` di Vercel
5. Deploy!

## 📝 License

MIT License

## 👨‍💻 Author

Created by **Rzvalor**
