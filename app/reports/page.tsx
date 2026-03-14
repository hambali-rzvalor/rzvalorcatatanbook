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

// Helper function to get day name in Indonesian
function getDayName(date: Date): string {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return days[date.getDay()];
}

// Helper function to get start of day
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [chartType, setChartType] = useState<'revenue' | 'profit'>('revenue');
  const [isScrolled, setIsScrolled] = useState(false);

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

    // Handle scroll for header shadow effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter transactions based on selected period
  const filteredTransactions = (() => {
    const today = new Date();
    const startDate = new Date(today);

    if (selectedPeriod === 'today') {
      // Only today's transactions
      return transactions.filter(t => {
        const txDate = new Date(t.transactionDate);
        return txDate.toDateString() === today.toDateString();
      });
    } else if (selectedPeriod === 'week') {
      // Last 7 days
      startDate.setDate(today.getDate() - 7);
      return transactions.filter(t => new Date(t.transactionDate) >= startDate);
    } else if (selectedPeriod === 'month') {
      // Last 30 days
      startDate.setDate(today.getDate() - 30);
      return transactions.filter(t => new Date(t.transactionDate) >= startDate);
    }
    return transactions;
  })();

  // Calculate stats from filtered transactions
  const periodTotalRevenue = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);

  const periodTotalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);

  const periodTotalProfit = periodTotalRevenue - periodTotalExpense;
  const periodTotalSales = filteredTransactions.filter((t) => t.type === 'income').length;

  // Calculate weekly data from filtered transactions
  const weeklyData = (() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate start of week (Monday)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const startOfWeek = getStartOfDay(new Date(today));
    startOfWeek.setDate(today.getDate() + mondayOffset);

    // Initialize data for each day
    const data: Array<{ day: string; revenue: number; profit: number; expense: number }> = days.map(day => ({
      day,
      revenue: 0,
      profit: 0,
      expense: 0,
    }));

    // Fill in transaction data
    filteredTransactions.forEach((tx) => {
      const txDate = new Date(tx.transactionDate);
      const txStartOfDay = getStartOfDay(txDate);

      // Check if transaction is within this week (on or after startOfWeek and not in the future)
      if (txStartOfDay >= startOfWeek && txStartOfDay <= today) {
        const amount = parseInt(tx.amount || 0);
        const txDayIndex = txDate.getDay();
        const dayIndex = txDayIndex === 0 ? 6 : txDayIndex - 1; // Convert to 0-6 (Mon-Sun)

        if (dayIndex >= 0 && dayIndex < 7) {
          if (tx.type === 'income') {
            data[dayIndex].revenue += amount;
            data[dayIndex].profit += amount;
          } else {
            data[dayIndex].expense += amount;
            data[dayIndex].profit -= amount;
          }
        }
      }
    });

    return data;
  })();

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
        totalRevenue: periodTotalRevenue,
        totalExpense: periodTotalExpense,
        totalProfit: periodTotalProfit,
        totalSales: periodTotalSales,
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
    <div className="flex h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <div className={`sticky top-0 z-50 bg-linear-to-br from-gray-50 to-gray-100/95 backdrop-blur-sm transition-shadow duration-300 ${
          isScrolled ? 'shadow-lg shadow-gray-200/50' : ''
        }`}>
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-500">Analisis keuangan usaha Anda</p>
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
              {/* Period Summary */}
              <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg shadow-purple-200 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">
                      Ringkasan {selectedPeriod === 'today' ? 'Hari Ini' : selectedPeriod === 'week' ? '7 Hari Terakhir' : '30 Hari Terakhir'}
                    </p>
                    <p className="text-2xl font-bold">{formatIDR(periodTotalProfit)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Pemasukan</p>
                    <p className="font-bold">{formatIDR(periodTotalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Pengeluaran</p>
                    <p className="font-bold">{formatIDR(periodTotalExpense)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Penjualan</p>
                    <p className="font-bold">{periodTotalSales}</p>
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
                  <select 
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as 'revenue' | 'profit')}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="revenue">Pendapatan</option>
                    <option value="profit">Keuntungan</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', height: '160px', paddingBottom: '8px' }}>
                  {weeklyData.map((data, index) => {
                    // Determine value based on selected chart type
                    const value = chartType === 'revenue' ? data.revenue : data.profit;
                    const maxValue = chartType === 'revenue' 
                      ? Math.max(...weeklyData.map(d => d.revenue), 1)
                      : Math.max(...weeklyData.map(d => Math.abs(d.profit)), 1);
                    const heightPercentage = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
                    const hasData = value !== 0;
                    const isPositive = value >= 0;
                    const barHeight = hasData ? Math.max(heightPercentage, 15) : 4;

                    return (
                      <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                        <div 
                          style={{ 
                            width: '100%', 
                            height: `${barHeight}%`, 
                            background: hasData 
                              ? isPositive 
                                ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)' 
                                : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'
                              : 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'all 0.3s ease',
                            boxShadow: hasData ? '0 4px 6px -1px rgba(34, 197, 94, 0.3)' : 'none',
                          }}
                        ></div>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{data.day}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)' }}></div>
                    <span className="text-xs text-gray-600">{chartType === 'revenue' ? 'Pendapatan' : 'Keuntungan'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)' }}></div>
                    <span className="text-xs text-gray-600">Rugi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)' }}></div>
                    <span className="text-xs text-gray-600">Tidak ada data</span>
                  </div>
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
                  <p className="text-xl font-bold text-gray-900">
                    {formatIDR(periodTotalRevenue / (selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 7 : 30) || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-500 text-sm">Total Transaksi</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{filteredTransactions.length}</p>
                </div>
              </div>

              {/* Date Range Selector */}
              <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">Pilih Periode</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'today', label: 'Hari Ini' },
                    { id: 'week', label: '7 Hari' },
                    { id: 'month', label: '30 Hari' }
                  ].map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        selectedPeriod === period.id
                          ? 'bg-green-500 text-white shadow-md shadow-green-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
