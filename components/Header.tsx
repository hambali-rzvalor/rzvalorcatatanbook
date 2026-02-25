'use client';

import { Bell, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Jakarta',
  });

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/activity') return 'Aktivitas';
    if (pathname === '/add') return 'Tambah Transaksi';
    if (pathname === '/sales') return 'Penjualan';
    if (pathname === '/expenses') return 'Pengeluaran';
    if (pathname === '/reports') return 'Laporan';
    if (pathname === '/settings') return 'Pengaturan';
    if (pathname === '/notifications') return 'Notifikasi';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/settings"
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6" />
          </a>
          <a
            href="/notifications"
            className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </a>
        </div>
      </div>
    </header>
  );
}
