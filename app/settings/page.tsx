'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Store, 
  Bell, 
  Palette, 
  Database, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  Languages
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Handle scroll for header shadow effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuGroups = [
    {
      title: 'Akun',
      items: [
        { icon: User, label: 'Profil Saya', href: '/settings/profile' },
        { icon: Store, label: 'Informasi Usaha', href: '/settings/business' },
      ],
    },
    {
      title: 'Preferensi',
      items: [
        { icon: Bell, label: 'Notifikasi', href: '/settings/notifications', badge: '3' },
        { icon: Palette, label: 'Tampilan', href: '/settings/appearance' },
        { icon: Languages, label: 'Bahasa', href: '/settings/language', value: 'Indonesia' },
      ],
    },
    {
      title: 'Data & Penyimpanan',
      items: [
        { icon: Database, label: 'Backup Data', href: '/settings/backup' },
        { icon: Database, label: 'Restore Data', href: '/settings/restore' },
      ],
    },
    {
      title: 'Bantuan',
      items: [
        { icon: HelpCircle, label: 'Pusat Bantuan', href: '/help' },
        { icon: Smartphone, label: 'Tentang Aplikasi', href: '/settings/about', value: 'v1.0.0' },
      ],
    },
  ];

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
          {/* Profile Card */}
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg shadow-green-200 text-white mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">Tahu Walik</h2>
                <p className="text-green-100 text-sm">Admin</p>
              </div>
              <ChevronRight className="w-6 h-6 text-green-100" />
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Moon className={`w-5 h-5 ${darkMode ? 'text-indigo-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mode Gelap</p>
                  <p className="text-sm text-gray-500">Hemat baterai & nyaman di mata</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  darkMode ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Settings Menu Groups */}
          <div className="space-y-6">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-2">
                  {group.title}
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {group.items.map((item, index) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                        index !== group.items.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-2.5 rounded-xl">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.value && (
                          <span className="text-sm text-gray-400">{item.value}</span>
                        )}
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <button className="w-full mt-8 bg-red-50 text-red-600 border border-red-200 rounded-2xl p-5 font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-3">
            <LogOut className="w-5 h-5" />
            Keluar dari Aplikasi
          </button>

          {/* App Version */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Tahu Walik
          </p>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
