# Tahu Walik Manager - ERD & Database Documentation

## Entity Relationship Diagram

### Visual ERD (Mermaid)

```mermaid
erDiagram
    TRANSACTIONS {
        int id PK
        enum type "income|expense"
        enum category "penjualan|bahan_baku|operasional|listrik_air|lain_lain"
        text description
        decimal amount
        int portions
        timestamp transaction_date
        timestamp created_at
    }
    
    INGREDIENTS {
        int id PK
        text name
        int quantity
        text unit
        int min_stock
        timestamp last_updated
    }
```

### Physical ERD (PostgreSQL)

```sql
-- ============================================
-- ENUM TYPES
-- ============================================

-- Tipe transaksi: income (pemasukan) atau expense (pengeluaran)
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Kategori transaksi
CREATE TYPE category AS ENUM (
    'penjualan',      -- Untuk income dari penjualan
    'bahan_baku',     -- Untuk expense pembelian bahan
    'operasional',    -- Untuk expense operasional harian
    'listrik_air',    -- Untuk expense listrik dan air
    'lain_lain'       -- Untuk expense lainnya
);

-- ============================================
-- TABLE: transactions
-- ============================================
-- Menyimpan semua transaksi keuangan (pemasukan & pengeluaran)

CREATE TABLE transactions (
    -- Primary Key: Auto-increment ID
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    
    -- Tipe transaksi (income/expense)
    type transaction_type NOT NULL,
    
    -- Kategori transaksi
    category category NOT NULL,
    
    -- Deskripsi/keterangan transaksi
    description TEXT NOT NULL,
    
    -- Jumlah uang (tanpa desimal, dalam rupiah)
    -- Precision 12 digit, scale 0 (bilangan bulat)
    amount DECIMAL(12, 0) NOT NULL,
    
    -- Jumlah porsi terjual (khusus untuk transaksi income/penjualan)
    portions INTEGER DEFAULT 0,
    
    -- Tanggal dan waktu transaksi terjadi
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamp otomatis saat record dibuat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index untuk performa query berdasarkan tanggal
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Index untuk query berdasarkan tipe
CREATE INDEX idx_transactions_type ON transactions(type);

-- Index untuk query berdasarkan kategori
CREATE INDEX idx_transactions_category ON transactions(category);

-- Composite index untuk query laporan (date + type)
CREATE INDEX idx_transactions_date_type ON transactions(transaction_date, type);

-- ============================================
-- TABLE: ingredients
-- ============================================
-- Mengelola stok bahan baku usaha

CREATE TABLE ingredients (
    -- Primary Key: Auto-increment ID
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    
    -- Nama bahan (ayam, tahu, tepung, bumbu, dll)
    name TEXT NOT NULL,
    
    -- Jumlah stok (dalam gram/pcs/liter sesuai unit)
    quantity INTEGER NOT NULL DEFAULT 0,
    
    -- Satuan: kg, pcs, liter, gram, dll
    unit TEXT NOT NULL,
    
    -- Stok minimum untuk alert restock
    min_stock INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamp otomatis saat record dibuat/diupdate
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index untuk pencarian bahan berdasarkan nama
CREATE INDEX idx_ingredients_name ON ingredients(name);

-- ============================================
-- RELATIONSHIPS
-- ============================================
-- Saat ini tidak ada foreign key relation langsung
-- antara transactions dan ingredients.
-- 
-- Future enhancement dapat menambahkan:
-- 1. Transaction details table untuk link multiple ingredients ke 1 transaction
-- 2. Auto-update ingredients.quantity saat ada expense kategori bahan_baku
-- 3. Auto-update ingredients.quantity saat ada penjualan (mengurangi stok)
-- ============================================
```

---

## Data Dictionary

### Table: transactions

| Column | Type | Nullable | Default | Description | Example |
|--------|------|----------|---------|-------------|---------|
| `id` | INTEGER | NO | AUTO | Primary key | 1, 2, 3 |
| `type` | ENUM | NO | - | Tipe transaksi | 'income', 'expense' |
| `category` | ENUM | NO | - | Kategori transaksi | 'penjualan', 'bahan_baku' |
| `description` | TEXT | NO | - | Keterangan transaksi | 'Penjualan 10 porsi', 'Beli ayam 5kg' |
| `amount` | DECIMAL(12,0) | NO | - | Jumlah uang (Rp) | 670000, 150000 |
| `portions` | INTEGER | YES | 0 | Jumlah porsi (untuk penjualan) | 10, 25 |
| `transaction_date` | TIMESTAMP | NO | - | Waktu transaksi | 2026-02-25 14:30:00+07 |
| `created_at` | TIMESTAMP | NO | NOW() | Waktu insert record | 2026-02-25 14:30:05+07 |

**Enum Values:**
- `type`: `'income'` (pemasukan), `'expense'` (pengeluaran)
- `category`: `'penjualan'`, `'bahan_baku'`, `'operasional'`, `'listrik_air'`, `'lain_lain'`

**Business Rules:**
1. Jika `type = 'income'`, maka `category` harus `'penjualan'` atau `'lain_lain'`
2. Jika `type = 'expense'`, maka `category` dapat salah satu dari: `'bahan_baku'`, `'operasional'`, `'listrik_air'`, `'lain_lain'`
3. `portions` hanya digunakan untuk transaksi dengan `type = 'income'` dan `category = 'penjualan'`
4. `amount` selalu positif (tidak ada nilai negatif)

---

### Table: ingredients

| Column | Type | Nullable | Default | Description | Example |
|--------|------|----------|---------|-------------|---------|
| `id` | INTEGER | NO | AUTO | Primary key | 1, 2, 3 |
| `name` | TEXT | NO | - | Nama bahan | 'Ayam', 'Tahu', 'Tepung' |
| `quantity` | INTEGER | NO | 0 | Stok saat ini | 5000 (gram), 100 (pcs) |
| `unit` | TEXT | NO | - | Satuan | 'kg', 'pcs', 'liter' |
| `min_stock` | INTEGER | NO | 0 | Stok minimum alert | 1000 (gram) |
| `last_updated` | TIMESTAMP | NO | NOW() | Waktu update terakhir | 2026-02-25 10:00:00+07 |

**Business Rules:**
1. `quantity` tidak boleh negatif (minimal 0)
2. `min_stock` digunakan untuk trigger alert saat stok menipis
3. `unit` harus konsisten untuk setiap bahan (tidak boleh berubah-ubah)

---

## Sample Data

### transactions

```sql
-- Penjualan (Income)
INSERT INTO transactions (type, category, description, amount, portions, transaction_date)
VALUES 
    ('income', 'penjualan', 'Penjualan siang', 670000, 15, '2026-02-25 12:30:00+07'),
    ('income', 'penjualan', 'Penjualan malam', 850000, 20, '2026-02-25 19:45:00+07');

-- Pengeluaran - Bahan Baku
INSERT INTO transactions (type, category, description, amount, transaction_date)
VALUES 
    ('expense', 'bahan_baku', 'Beli ayam 10kg', 350000, '2026-02-25 08:00:00+07'),
    ('expense', 'bahan_baku', 'Beli tahu 50pcs', 75000, '2026-02-25 08:15:00+07');

-- Pengeluaran - Operasional
INSERT INTO transactions (type, category, description, amount, transaction_date)
VALUES 
    ('expense', 'operasional', 'Beli gas LPG', 150000, '2026-02-24 10:00:00+07'),
    ('expense', 'listrik_air', 'Bayar listrik bulan Februari', 450000, '2026-02-20 14:00:00+07');
```

### ingredients

```sql
INSERT INTO ingredients (name, quantity, unit, min_stock)
VALUES 
    ('Ayam', 15000, 'gram', 5000),
    ('Tahu', 100, 'pcs', 30),
    ('Tepung Terigu', 10000, 'gram', 2000),
    ('Minyak Goreng', 5000, 'gram', 1000),
    ('Bumbu Halus', 2000, 'gram', 500);
```

---

## Query Examples

### 1. Total Pendapatan Hari Ini

```sql
SELECT 
    SUM(amount) as total_revenue,
    SUM(portions) as total_portions
FROM transactions
WHERE type = 'income'
  AND DATE(transaction_date) = CURRENT_DATE;
```

### 2. Total Pengeluaran Bulan Ini

```sql
SELECT 
    category,
    SUM(amount) as total_expense
FROM transactions
WHERE type = 'expense'
  AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category;
```

### 3. Laba Rugi Harian

```sql
SELECT 
    DATE(transaction_date) as date,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as profit
FROM transactions
GROUP BY DATE(transaction_date)
ORDER BY date DESC
LIMIT 7;
```

### 4. Stok Bahan Baku yang Menipis

```sql
SELECT 
    name,
    quantity,
    unit,
    min_stock,
    (quantity - min_stock) as remaining
FROM ingredients
WHERE quantity <= min_stock
ORDER BY remaining ASC;
```

### 5. Transaksi Terbaru

```sql
SELECT 
    id,
    type,
    category,
    description,
    amount,
    portions,
    transaction_date
FROM transactions
ORDER BY transaction_date DESC
LIMIT 10;
```

---

## Future Database Enhancements

### 1. Transaction Details Table (Planned)

```sql
CREATE TABLE transaction_details (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(12, 0) NOT NULL,
    subtotal DECIMAL(12, 0) NOT NULL
);
```

**Purpose:** Track penggunaan bahan baku per transaksi penjualan

### 2. Users Table (Planned)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    full_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Multi-user support dengan role-based access

### 3. Audit Log Table (Planned)

```sql
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_value JSONB,
    new_value JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose:** Track semua perubahan data untuk keamanan

---

## Database Connection

### Configuration

File: `db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

### Environment Variables

File: `.env.local`

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

---

**Last Updated:** 2026-02-25  
**Database Version:** 1.0.0  
**ORM:** Drizzle ORM v0.38.x
