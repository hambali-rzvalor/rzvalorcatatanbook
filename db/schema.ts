import { pgTable, text, integer, decimal, timestamp, pgEnum, uuid, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum untuk tipe transaksi
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);

// Enum untuk kategori
export const categoryEnum = pgEnum('category', [
  'penjualan',
  'bahan_baku',
  'operasional',
  'listrik_air',
  'lain_lain'
]);

// Enum untuk status pembayaran QRIS
export const qrisPaymentStatusEnum = pgEnum('qris_payment_status', ['pending', 'success', 'failed', 'expired']);

// Tabel untuk bahan/stok ingredients
export const ingredients = pgTable('ingredients', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(), // Nama bahan (ayam, tahu, tepung, dll)
  quantity: integer('quantity').notNull().default(0), // Jumlah dalam satuan gram/pcs
  unit: text('unit').notNull(), // Satuan (kg, pcs, liter)
  minStock: integer('min_stock').notNull().default(0), // Stok minimum untuk alert
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
});

// Tabel untuk transaksi keuangan
export const transactions = pgTable('transactions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: transactionTypeEnum('type').notNull(), // income atau expense
  category: categoryEnum('category').notNull(), // Kategori transaksi
  description: text('description').notNull(), // Deskripsi/keterangan
  amount: decimal('amount', { precision: 12, scale: 0 }).notNull(), // Jumlah uang (tanpa desimal untuk rupiah)
  portions: integer('portions').default(0), // Jumlah porsi (untuk penjualan)
  transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(), // Tanggal transaksi
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Tabel untuk pembayaran QRIS
export const qrisPayments = pgTable('qris_payments', {
  id: uuid('id').primaryKey().defaultRandom(), // Unique ID untuk QRIS payment
  orderId: text('order_id').notNull().unique(), // Order ID dari Midtrans
  transactionId: integer('transaction_id').references(() => transactions.id), // Reference ke transactions table
  amount: decimal('amount', { precision: 12, scale: 0 }).notNull(), // Jumlah pembayaran
  status: qrisPaymentStatusEnum('status').notNull().default('pending'), // Status pembayaran
  qrString: text('qr_string'), // QR code string dari Midtrans
  qrUrl: text('qr_url'), // URL QR code (jika ada)
  actions: json('actions'), // Actions dari Midtrans (QRIS URL, dll)
  paidAt: timestamp('paid_at', { withTimezone: true }), // Waktu pembayaran berhasil
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Waktu kedaluwarsa QR
  metadata: json('metadata'), // Metadata tambahan
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const ingredientsRelations = relations(ingredients, ({}) => ({
  // Tidak ada relasi langsung ke transactions untuk simplicity
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  qrisPayment: one(qrisPayments, {
    fields: [transactions.id],
    references: [qrisPayments.transactionId],
  }),
}));

export const qrisPaymentsRelations = relations(qrisPayments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [qrisPayments.transactionId],
    references: [transactions.id],
  }),
}));

// Type inference
export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionType = 'income' | 'expense';
export type Category = 'penjualan' | 'bahan_baku' | 'operasional' | 'listrik_air' | 'lain_lain';
export type QrisPayment = typeof qrisPayments.$inferSelect;
export type NewQrisPayment = typeof qrisPayments.$inferInsert;
export type QrisPaymentStatus = 'pending' | 'success' | 'failed' | 'expired';
