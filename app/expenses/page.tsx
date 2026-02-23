'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Search, Filter, ChevronRight, Pencil, Trash2, Check, X, Calendar, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getTransactions, deleteTransaction, updateTransaction } from '@/app/actions';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      const response = await getTransactions({ type: 'expense' });
      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseInt(exp.amount || 0), 0);

  async function handleDelete(id: number) {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;

    setDeletingId(id);
    
    try {
      const result = await deleteTransaction(id);
      
      if (result.success) {
        setExpenses((prev) => prev.filter(e => e.id !== id));
        alert('✅ Pengeluaran berhasil dihapus');
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Gagal menghapus: ' + (error as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(expense: any) {
    setEditingId(expense.id);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description);
  }

  async function handleSaveEdit(id: number) {
    try {
      const result = await updateTransaction(id, {
        amount: parseInt(editAmount),
        description: editDescription,
      });

      if (result.success) {
        setExpenses((prev) => prev.map(e => e.id === id ? { ...e, amount: editAmount, description: editDescription } : e));
        setEditingId(null);
        alert('✅ ' + result.message);
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Gagal update pengeluaran');
    }
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengeluaran</h1>
            <p className="text-gray-500 mt-1">Catat dan kelola pengeluaran harian</p>
          </div>

          {/* Summary Card */}
          {expenses.length > 0 ? (
            <div className="mb-6">
              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg shadow-red-200 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-red-100 text-sm font-medium">Total Pengeluaran</span>
                </div>
                <p className="text-3xl font-bold">{formatIDR(totalExpenses)}</p>
                <p className="text-red-100 text-sm mt-2">Bulan ini</p>
              </div>
            </div>
          ) : null}

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pengeluaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Date Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['today', 'week', 'month', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedDate(filter)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedDate === filter
                    ? 'bg-red-500 text-white shadow-md shadow-red-200'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter === 'today' ? 'Hari Ini' : filter === 'week' ? 'Minggu Ini' : filter === 'month' ? 'Bulan Ini' : 'Semua'}
              </button>
            ))}
          </div>

          {/* Expenses List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada pengeluaran</p>
              <p className="text-gray-400 text-sm mt-1">Catat pengeluaran pertama Anda</p>
              <a
                href="/add"
                className="inline-flex items-center gap-2 mt-4 bg-linear-to-br from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-200 transition-all"
              >
                <Plus className="w-5 h-5" />
                Tambah Pengeluaran
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="bg-linear-to-br from-red-400 to-red-500 p-3 rounded-xl shadow-sm shrink-0">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      {editingId === expense.id ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="flex-1 min-w-0 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-sm shrink-0"
                            placeholder="Deskripsi"
                          />
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24 sm:w-32 px-2 sm:px-3 py-2 border border-gray-200 rounded-lg text-sm shrink-0"
                            placeholder="Jumlah"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{expense.description}</p>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(expense.transactionDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                timeZone: 'Asia/Jakarta',
                              })}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(expense.transactionDate).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Jakarta',
                              })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {editingId === expense.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(expense.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Simpan"
                          >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Batal"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm sm:text-lg font-bold text-red-600 whitespace-nowrap">-{formatIDR(parseInt(expense.amount))}</span>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
                            {deletingId === expense.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 shrink-0" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Add Button (Mobile) */}
          <a
            href="/add"
            className="lg:hidden fixed bottom-24 right-6 bg-linear-to-br from-red-500 to-red-600 text-white p-4 rounded-full shadow-lg shadow-red-300 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-6 h-6" />
          </a>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
