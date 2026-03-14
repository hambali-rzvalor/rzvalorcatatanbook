'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Trash2, AlertCircle, TrendingUp, Info, ShoppingCart, Wallet } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getTransactions } from '@/app/actions';

// Generate notifications from transactions
function generateNotifications(transactions: any[]) {
  const notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    date: string;
    unread: boolean;
    icon: any;
  }> = [];

  // Add recent transactions as notifications
  transactions.slice(0, 10).forEach((tx, index) => {
    notifications.push({
      id: tx.id,
      type: tx.type === 'income' ? 'success' : 'warning',
      title: tx.type === 'income' ? 'Penjualan Baru' : 'Pengeluaran Baru',
      message: `${tx.description} - Rp ${parseInt(tx.amount).toLocaleString('id-ID')}`,
      time: new Date(tx.transactionDate).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }),
      date: new Date(tx.transactionDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }),
      unread: index < 3, // First 3 are unread
      icon: tx.type === 'income' ? ShoppingCart : Wallet,
    });
  });

  return notifications;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await getTransactions({ limit: 10 });
        if (response.success) {
          setNotifications(generateNotifications(response.data));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();

    // Handle scroll for header shadow effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.unread);

  const unreadCount = notifications.filter(n => n.unread).length;

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
            <p className="text-gray-500">
              {unreadCount > 0 ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-green-500 text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-green-500 text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat notifikasi...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Notifikasi akan muncul di sini'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                    notification.unread ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-linear-to-br from-green-400 to-green-500 text-white'
                            : 'bg-linear-to-br from-orange-400 to-orange-500 text-white'
                        }`}
                      >
                        <notification.icon className="w-6 h-6" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{notification.title}</h3>
                          {notification.unread && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">
                          {notification.time} • {notification.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.unread && (
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Tandai sudah dibaca"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
