'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Filter, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
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

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPortions, setEditPortions] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const response = await getTransactions({ type: 'income' });
      if (response.success) {
        setSales(response.data);
      }
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseInt(sale.amount || 0), 0);
  const totalPortions = sales.reduce((sum, sale) => sum + (sale.portions || 0), 0);

  async function handleDelete(id: number) {
    if (!confirm('Yakin ingin menghapus penjualan ini?')) return;

    setDeletingId(id);
    
    try {
      const result = await deleteTransaction(id);
      
      if (result.success) {
        setSales((prev) => prev.filter(s => s.id !== id));
        alert('✅ Penjualan berhasil dihapus');
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

  function handleEdit(sale: any) {
    setEditingId(sale.id);
    setEditAmount(sale.amount.toString());
    setEditPortions(sale.portions?.toString() || '0');
  }

  async function handleSaveEdit(id: number) {
    try {
      const result = await updateTransaction(id, {
        amount: parseInt(editAmount),
        portions: parseInt(editPortions),
      });

      if (result.success) {
        setSales((prev) => prev.map(s => s.id === id ? { ...s, amount: editAmount, portions: editPortions } : s));
        setEditingId(null);
        alert('✅ ' + result.message);
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Gagal update penjualan');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Penjualan</h1>
            <p className="text-gray-500 mt-1">Riwayat semua transaksi penjualan</p>
          </div>

          {/* Summary Cards */}
          {sales.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-200 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-green-100 text-sm font-medium">Total Omzet</span>
                </div>
                <p className="text-2xl font-bold">{formatIDR(totalSales)}</p>
              </div>
              <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-200 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-blue-100 text-sm font-medium">Porsi Terjual</span>
                </div>
                <p className="text-2xl font-bold">{totalPortions}</p>
              </div>
            </div>
          ) : null}

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari penjualan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    ? 'bg-green-500 text-white shadow-md shadow-green-200'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter === 'today' ? 'Hari Ini' : filter === 'week' ? 'Minggu Ini' : filter === 'month' ? 'Bulan Ini' : 'Semua'}
              </button>
            ))}
          </div>

          {/* Sales List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada penjualan</p>
              <p className="text-gray-400 text-sm mt-1">Catat penjualan pertama Anda</p>
              <a
                href="/add"
                className="inline-flex items-center gap-2 mt-4 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all"
              >
                <Plus className="w-5 h-5" />
                Tambah Penjualan
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-linear-to-br from-green-400 to-green-500 p-3 rounded-xl shadow-sm">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      {editingId === sale.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="Jumlah"
                          />
                          <input
                            type="number"
                            value={editPortions}
                            onChange={(e) => setEditPortions(e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="Porsi"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-900">{sale.portions || 0} Porsi</p>
                          <p className="text-sm text-gray-500">
                            {new Date(sale.transactionDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            •{' '}
                            {new Date(sale.transactionDate).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === sale.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(sale.id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Simpan"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Batal"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-green-600">{formatIDR(parseInt(sale.amount))}</span>
                          <button
                            onClick={() => handleEdit(sale)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            disabled={deletingId === sale.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
                            {deletingId === sale.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
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
            className="lg:hidden fixed bottom-24 right-6 bg-linear-to-br from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg shadow-green-300 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-6 h-6" />
          </a>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
