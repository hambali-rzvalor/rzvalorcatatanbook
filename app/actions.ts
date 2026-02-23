'use server';

import { db, transactions, ingredients, type NewTransaction, type TransactionType, type Category } from '@/db';
import { eq, desc, sql, and, gte, lt } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper function to get start and end of day in UTC
function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Add a new transaction to the database
 */
export async function addTransaction(data: {
  type: TransactionType;
  category: Category;
  description: string;
  amount: number;
  portions?: number;
  transactionDate: Date;
}) {
  try {
    const newTransaction: NewTransaction = {
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount.toString(),
      portions: data.portions || 0,
      transactionDate: data.transactionDate,
    };

    const [created] = await db.insert(transactions).values(newTransaction).returning();

    // If this is an expense for bahan_baku, update ingredients stock
    if (data.type === 'expense' && data.category === 'bahan_baku') {
      // You can add logic here to update ingredient stock
      // For now, we'll just revalidate the dashboard
    }

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/activity');
    revalidatePath('/reports');

    return {
      success: true,
      data: created,
      message: 'Transaksi berhasil ditambahkan',
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return {
      success: false,
      message: 'Gagal menambahkan transaksi',
    };
  }
}

/**
 * Get dashboard data for today
 */
export async function getDashboardData() {
  try {
    const today = new Date();
    const { start: startOfDay, end: endOfDay } = getDayBounds(today);

    // Get today's transactions
    const todayTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.transactionDate, startOfDay),
          lt(transactions.transactionDate, endOfDay)
        )
      )
      .orderBy(desc(transactions.transactionDate));

    // Calculate today's stats
    const todayStats = {
      revenue: 0,
      expense: 0,
      profit: 0,
      soldPortions: 0,
    };

    todayTransactions.forEach((tx) => {
      const amount = parseInt(tx.amount);
      if (tx.type === 'income') {
        todayStats.revenue += amount;
        todayStats.soldPortions += tx.portions || 0;
      } else {
        todayStats.expense += amount;
      }
    });

    todayStats.profit = todayStats.revenue - todayStats.expense;

    // Get recent activity (last 10 transactions)
    const recentActivity = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.transactionDate))
      .limit(10);

    // Get low stock ingredients
    const lowStockIngredients = await db
      .select()
      .from(ingredients)
      .where(sql`${ingredients.quantity} <= ${ingredients.minStock}`);

    return {
      success: true,
      data: {
        todayStats: {
          profit: todayStats.profit,
          revenue: todayStats.revenue,
          expense: todayStats.expense,
          soldPortions: todayStats.soldPortions,
        },
        recentActivity: recentActivity.map((tx) => ({
          id: tx.id,
          type: tx.type,
          desc: tx.description,
          amount: parseInt(tx.amount),
          time: new Date(tx.transactionDate).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          date: new Date(tx.transactionDate).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        })),
        lowStockIngredients,
      },
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      success: false,
      data: {
        todayStats: {
          profit: 0,
          revenue: 0,
          expense: 0,
          soldPortions: 0,
        },
        recentActivity: [],
        lowStockIngredients: [],
      },
      message: 'Gagal mengambil data dashboard',
    };
  }
}

/**
 * Get all transactions with pagination and filters
 */
export async function getTransactions(filters?: {
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    let whereConditions = [];
    
    if (filters?.type) {
      whereConditions.push(eq(transactions.type, filters.type));
    }
    
    if (filters?.startDate) {
      whereConditions.push(gte(transactions.transactionDate, filters.startDate));
    }
    
    if (filters?.endDate) {
      whereConditions.push(lt(transactions.transactionDate, filters.endDate));
    }

    const result = await db
      .select()
      .from(transactions)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(transactions.transactionDate))
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0);

    return {
      success: true,
      data: result.map((tx) => ({
        id: tx.id,
        type: tx.type,
        category: tx.category,
        description: tx.description,
        amount: parseInt(tx.amount),
        portions: tx.portions,
        transactionDate: tx.transactionDate,
        createdAt: tx.createdAt,
      })),
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    return {
      success: false,
      data: [],
      message: 'Gagal mengambil transaksi',
    };
  }
}

/**
 * Update transaction
 */
export async function updateTransaction(id: number, data: {
  description?: string;
  amount?: number;
  portions?: number;
  transactionDate?: Date;
}) {
  try {
    const updateData: Record<string, any> = {};
    
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.portions !== undefined) updateData.portions = data.portions;
    if (data.transactionDate !== undefined) updateData.transactionDate = data.transactionDate;

    const [updated] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    revalidatePath('/');
    revalidatePath('/activity');
    revalidatePath('/sales');
    revalidatePath('/expenses');

    return {
      success: true,
      data: updated,
      message: 'Transaksi berhasil diupdate',
    };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return {
      success: false,
      message: 'Gagal update transaksi',
    };
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id: number) {
  try {
    console.log('Deleting transaction with id:', id);
    
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    
    console.log('Delete result:', result);

    revalidatePath('/');
    revalidatePath('/activity');
    revalidatePath('/sales');
    revalidatePath('/expenses');

    return {
      success: true,
      message: 'Transaksi berhasil dihapus',
    };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return {
      success: false,
      message: 'Gagal menghapus transaksi: ' + (error as Error).message,
    };
  }
}

/**
 * Get all ingredients
 */
export async function getIngredients() {
  try {
    const result = await db.select().from(ingredients).orderBy(ingredients.name);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return {
      success: false,
      data: [],
      message: 'Gagal mengambil bahan',
    };
  }
}

/**
 * Update ingredient stock
 */
export async function updateIngredientStock(id: number, quantity: number) {
  try {
    const [updated] = await db
      .update(ingredients)
      .set({
        quantity,
        lastUpdated: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();

    revalidatePath('/');

    return {
      success: true,
      data: updated,
      message: 'Stok berhasil diupdate',
    };
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return {
      success: false,
      message: 'Gagal update stok',
    };
  }
}

/**
 * Add new ingredient
 */
export async function addIngredient(data: {
  name: string;
  quantity: number;
  unit: string;
  minStock?: number;
}) {
  try {
    const [created] = await db
      .insert(ingredients)
      .values({
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minStock: data.minStock || 0,
      })
      .returning();

    revalidatePath('/');

    return {
      success: true,
      data: created,
      message: 'Bahan berhasil ditambahkan',
    };
  } catch (error) {
    console.error('Error adding ingredient:', error);
    return {
      success: false,
      message: 'Gagal menambahkan bahan',
    };
  }
}
