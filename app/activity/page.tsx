'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Wallet, Search, Filter, Calendar, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Pagination from '@/components/Pagination';
import { getTransactions } from '@/app/actions';

const ITEMS_PER_PAGE = 5;

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const totalIncome = transactions
    .filter(a => a.type === 'income')
    .reduce((sum, a) => sum + parseInt(a.amount || 0), 0);

  const totalExpense = transactions
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + parseInt(a.amount || 0), 0);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter: typeof filterType) => {
    setFilterType(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </a>
          </div>

          {/* Summary Cards */}
          {transactions.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-200 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-green-100 text-sm font-medium">Pemasukan</span>
                </div>
                <p className="text-xl font-bold">{formatIDR(totalIncome)}</p>
              </div>
              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-5 shadow-lg shadow-red-200 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-red-100 text-sm font-medium">Pengeluaran</span>
                </div>
                <p className="text-xl font-bold">{formatIDR(totalExpense)}</p>
              </div>
            </div>
          ) : null}

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'Semua', color: 'gray' },
              { value: 'income', label: 'Pemasukan', color: 'green' },
              { value: 'expense', label: 'Pengeluaran', color: 'red' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value as typeof filterType)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filterType === filter.value
                    ? filter.color === 'green'
                      ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : filter.color === 'red'
                      ? 'bg-red-500 text-white shadow-md shadow-red-200'
                      : 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Activities List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada transaksi ditemukan</p>
              <p className="text-gray-400 text-sm mt-1">Coba ubah filter atau tambah transaksi pertama Anda</p>
              <a
                href="/add"
                className="inline-flex items-center gap-2 mt-4 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Tambah Transaksi
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTransactions.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 shrink-0 ${
                          activity.type === 'income'
                            ? 'bg-linear-to-br from-green-400 to-green-500 text-white'
                            : 'bg-linear-to-br from-red-400 to-red-500 text-white'
                        }`}
                      >
                        {activity.type === 'income' ? (
                          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                        ) : (
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{activity.description}</p>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.transactionDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              timeZone: 'Asia/Jakarta',
                            })}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.transactionDate).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Jakarta',
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm sm:text-lg whitespace-nowrap shrink-0 ${
                        activity.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {activity.type === 'income' ? '+' : '-'}{formatIDR(parseInt(activity.amount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Results count */}
          {filteredTransactions.length > 0 && (
            <p className="text-center text-gray-400 text-sm mt-6">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
            </p>
          )}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
