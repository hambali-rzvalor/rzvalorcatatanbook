# AI PROMPT: EKSEKUSI FRONTEND - Modern Dashboard UI

**Role:** Senior Frontend Developer (Next.js & Tailwind CSS Specialist).
**Objective:** Membangun halaman Dashboard utama (`/`) untuk aplikasi "Tahu Walik Manager" dengan tampilan modern, bersih, dan responsif (mobile-first).

## 🛠️ Tech Stack Specification
* **Framework:** Next.js 16+ (App Router)
* **Styling:** Tailwind CSS (Gunakan utility classes untuk semua styling)
* **Icons:** `lucide-react` (Install ini dulu jika belum ada)
* **Component Type:** React Server Components (RSC) sebagai default, gunakan `'use client'` hanya jika diperlukan interaktivitas (misal: toggle sidebar).

## 🎨 Design & UI Requirements (Modern Aesthetic)
1.  **Layout:**
    * **Mobile:** Top Header sederhana + Bottom Navigation Bar (fixed di bawah) untuk menu utama.
    * **Desktop:** Sidebar permanen di sebelah kiri + Header di atas + Konten utama di kanan.
2.  **Styling Cards (Statistik):**
    * Gunakan `bg-white` dengan border tipis (`border-gray-100`) dan shadow yang sangat halus (`shadow-sm`).
    * Gunakan sudut membulat modern (`rounded-xl` atau `rounded-2xl`).
    * Padding yang lega agar tidak terkesan padat (`p-6`).
3.  **Typography:**
    * Gunakan font bawaan Tailwind (Inter/Sans).
    * Angka penting (Profit) harus besar dan tebal (`text-3xl font-bold text-gray-900`).
    * Label harus lebih kecil dan warnanya diredam (`text-sm text-gray-500`).
4.  **Warna Indikator:**
    * Pemasukan/Untung: Hijau (`text-green-600`, `bg-green-100` untuk ikon).
    * Pengeluaran: Merah (`text-red-600`, `bg-red-100` untuk ikon).

## 📦 Component Structure Blueprint

Tugas kamu adalah membuat struktur file dan kode berikut:

### 1. Mock Data (Data Tiruan Sementara)
Buat data ini di dalam `app/page.tsx` agar UI bisa langsung dirender.

```typescript
// Mock Data untuk Dashboard
const dashboardData = {
  todayStats: {
    profit: 150000, // Rp 150.000 Untung Bersih
    revenue: 250000, // Omzet Penjualan
    expense: 100000, // Modal Harian Keluar
    soldPortions: 50, // Porsi Terjual
  },
  recentActivity: [
    { id: 1, type: 'sale', desc: 'Jual 10 Porsi', amount: 50000, time: '10:30 AM' },
    { id: 2, type: 'expense', desc: 'Beli Ayam 2kg', amount: 80000, time: '08:15 AM' },
    { id: 3, type: 'sale', desc: 'Jual 5 Porsi', amount: 25000, time: '11:45 AM' },
  ]
};