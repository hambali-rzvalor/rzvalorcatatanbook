'use client';

import { usePathname } from 'next/navigation';
import { Home, PlusCircle, ShoppingCart, Receipt, BarChart3, Settings } from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

function NavItem({ icon: Icon, label, href }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-linear-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
      <span className={`font-medium ${active ? 'text-white' : ''}`}>{label}</span>
    </a>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-linear-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Tahu Walik</h1>
        <p className="text-sm text-gray-500">Manager Dashboard</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon={Home} label="Dashboard" href="/" />
        <NavItem icon={PlusCircle} label="Tambah Transaksi" href="/add" />
        <NavItem icon={ShoppingCart} label="Penjualan" href="/sales" />
        <NavItem icon={Receipt} label="Pengeluaran" href="/expenses" />
        <NavItem icon={BarChart3} label="Laporan" href="/reports" />
      </nav>

      <div className="mt-auto">
        <NavItem icon={Settings} label="Pengaturan" href="/settings" />
      </div>
    </aside>
  );
}
