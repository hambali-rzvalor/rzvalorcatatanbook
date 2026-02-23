'use client';

import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, Download } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getTransactions } from '@/app/actions';
import { useEffect, useState } from 'react';
import { exportReportToPDF } from '@/lib/pdfExport';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await getTransactions({ limit: 100 });
        if (response.success) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  // Calculate stats from transactions
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);

  const totalProfit = totalRevenue - totalExpense;
  const totalSales = transactions.filter((t) => t.type === 'income').length;

  // Weekly data (mock for now, can be enhanced with real date filtering)
  const weeklyData = [
    { day: 'Sen', revenue: 0, profit: 0 },
    { day: 'Sel', revenue: 0, profit: 0 },
    { day: 'Rab', revenue: 0, profit: 0 },
    { day: 'Kam', revenue: 0, profit: 0 },
    { day: 'Jum', revenue: 0, profit: 0 },
    { day: 'Sab', revenue: 0, profit: 0 },
    { day: 'Min', revenue: 0, profit: 0 },
  ];

  const handleExportPDF = () => {
    const reportData = {
      businessName: 'Tahu Walik Manager',
      period: 'Februari 2026',
      generatedDate: new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
      summary: {
        totalRevenue,
        totalExpense,
        totalProfit,
        totalSales,
      },
      weeklyData,
      transactions: transactions.slice(0, 10).map((t) => ({
        date: new Date(t.transactionDate).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Jakarta',
        }),
        description: t.description,
        type: t.type,
        amount: parseInt(t.amount),
      })),
    };

    exportReportToPDF(reportData);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laporan</h1>
              <p className="text-gray-500 mt-1">Analisis keuangan usaha Anda</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 bg-linear-to-br from-green-500 to-green-600 text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada data laporan</p>
              <p className="text-gray-400 text-sm mt-1">Mulai transaksi untuk melihat laporan keuangan</p>
              <a
                href="/add"
                className="inline-flex items-center gap-2 mt-4 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                Tambah Transaksi
              </a>
            </div>
          ) : (
            <>
              {/* Monthly Summary */}
              <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg shadow-purple-200 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">Ringkasan Bulan Ini</p>
                    <p className="text-2xl font-bold">{formatIDR(totalProfit)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Pemasukan</p>
                    <p className="font-bold">{formatIDR(totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Pengeluaran</p>
                    <p className="font-bold">{formatIDR(totalExpense)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Penjualan</p>
                    <p className="font-bold">{totalSales}</p>
                  </div>
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Grafik Minggu Ini
                  </h3>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Pendapatan</option>
                    <option>Keuntungan</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-40">
                  {weeklyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative h-full flex items-end">
                        <div
                          className="w-full bg-gray-200 rounded-t-lg"
                          style={{ height: '10%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 p-2.5 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-500 text-sm">Rata-rata Harian</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatIDR(totalProfit / 7 || 0)}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-500 text-sm">Total Transaksi</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{transactions.length}</p>
                </div>
              </div>

              {/* Date Range Selector */}
              <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">Pilih Periode</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['Hari Ini', '7 Hari', '30 Hari'].map((period, index) => (
                    <button
                      key={period}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        index === 1
                          ? 'bg-green-500 text-white shadow-md shadow-green-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
