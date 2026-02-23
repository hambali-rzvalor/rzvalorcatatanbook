import { TrendingUp, Wallet, ShoppingCart, DollarSign, PlusCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import StatCard from '@/components/StatCard';
import { getDashboardData } from '@/app/actions';

// Format currency to IDR
function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Empty state data
const emptyStats = {
  profit: 0,
  revenue: 0,
  expense: 0,
  soldPortions: 0,
};

const emptyActivity: Array<{ id: number; type: 'income' | 'expense'; desc: string; amount: number; time: string }> = [];

export default async function Home() {
  let todayStats = emptyStats;
  let recentActivity = emptyActivity;

  try {
    // Try to fetch real data from database
    const response = await getDashboardData();
    if (response.success) {
      todayStats = response.data.todayStats;
      recentActivity = response.data.recentActivity;
    }
  } catch (error) {
    // Show empty state if database is not available
    console.log('Database not configured, showing empty state');
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Sidebar untuk Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* Section: Total Untung Hari Ini (Highlight) */}
          <section className="mb-8">
            <div className="relative overflow-hidden bg-linear-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl p-8 shadow-lg shadow-green-200">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      Total Untung Hari Ini
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {formatIDR(todayStats.profit)}
                    </h1>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl shadow-inner">
                    <TrendingUp className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                {todayStats.profit > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="bg-white/25 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" strokeWidth={3} />
                      +12%
                    </span>
                    <span className="text-green-100 text-sm font-medium">dari hari kemarin</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: Statistik Cards */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Statistik Hari Ini
              </h3>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Omzet"
                value={formatIDR(todayStats.revenue)}
                icon={DollarSign}
                iconBgColor="bg-linear-to-br from-blue-400 to-blue-500"
                iconColor="text-white"
                shadowColor="shadow-blue-200"
              />
              <StatCard
                title="Pengeluaran"
                value={formatIDR(todayStats.expense)}
                icon={Wallet}
                iconBgColor="bg-linear-to-br from-red-400 to-red-500"
                iconColor="text-white"
                shadowColor="shadow-red-200"
              />
              <StatCard
                title="Porsi Terjual"
                value={`${todayStats.soldPortions}`}
                icon={ShoppingCart}
                iconBgColor="bg-linear-to-br from-purple-400 to-purple-500"
                iconColor="text-white"
                shadowColor="shadow-purple-200"
              />
              <StatCard
                title="Untung Bersih"
                value={formatIDR(todayStats.profit)}
                icon={TrendingUp}
                iconBgColor="bg-linear-to-br from-green-400 to-green-500"
                iconColor="text-white"
                shadowColor="shadow-green-200"
              />
            </div>
          </section>

          {/* Section: Aktivitas Terbaru */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                Aktivitas Terbaru
              </h3>
              <a href="/activity" className="text-sm text-green-600 font-semibold hover:text-green-700 flex items-center gap-1 transition-colors">
                Lihat Semua
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Belum ada aktivitas hari ini</p>
                  <p className="text-gray-400 text-sm mt-1">Mulai dengan menambah transaksi pertama Anda</p>
                  <a
                    href="/add"
                    className="inline-flex items-center gap-2 mt-4 bg-linear-to-br from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-200 transition-all"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Tambah Transaksi
                  </a>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`group flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                      index !== recentActivity.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                          activity.type === 'income'
                            ? 'bg-linear-to-br from-green-400 to-green-500 text-white'
                            : 'bg-linear-to-br from-red-400 to-red-500 text-white'
                        }`}
                      >
                        {activity.type === 'income' ? (
                          <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                          <Wallet className="w-5 h-5" strokeWidth={2.5} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{activity.desc}</p>
                        <p className="text-sm text-gray-400 font-medium">{activity.time}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        activity.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {activity.type === 'income' ? '+' : '-'}{formatIDR(activity.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Bottom Navigation untuk Mobile */}
      <BottomNav />
    </div>
  );
}
