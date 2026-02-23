'use client';

import { useState } from 'react';
import { ArrowLeft, Bell, Check, Trash2, AlertCircle, TrendingUp, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// Mock notifications (can be enhanced with real notifications from database)
const notificationsData: Array<{
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  date: string;
  unread: boolean;
}> = [];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications] = useState(notificationsData);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.unread);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* Header Section */}
          <div className="mb-6">
            <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </a>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifikasi</h1>
                <p className="text-gray-500 mt-1">
                  {unreadCount > 0 ? `${unreadCount} notifikasi baru` : 'Tidak ada notifikasi baru'}
                </p>
              </div>
            </div>
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
          {filteredNotifications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Tidak ada notifikasi</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Notifikasi akan muncul di sini'}
              </p>
            </div>
          ) : null}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
