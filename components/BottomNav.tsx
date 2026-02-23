'use client';

import { usePathname } from 'next/navigation';
import { Home, PlusCircle, ShoppingCart, Receipt, BarChart3 } from 'lucide-react';

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
      className={`flex flex-col items-center justify-center gap-1 py-2 transition-colors relative ${
        active ? 'text-green-600' : 'text-gray-400'
      }`}
    >
      {active && (
        <span className="absolute -top-2 w-8 h-1 bg-green-500 rounded-full"></span>
      )}
      <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
      <span className="text-xs font-medium">{label}</span>
    </a>
  );
}

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 safe-area-pb shadow-lg shadow-gray-200/50">
      <div className="flex justify-around items-center">
        <NavItem icon={Home} label="Home" href="/" />
        <NavItem icon={ShoppingCart} label="Jual" href="/sales" />
        <div className="relative -top-6">
          <a
            href="/add"
            className="flex items-center justify-center w-14 h-14 bg-linear-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-300 text-white hover:shadow-xl hover:shadow-green-400 transition-shadow"
          >
            <PlusCircle className="w-7 h-7" strokeWidth={2.5} />
          </a>
        </div>
        <NavItem icon={Receipt} label="Keluarkan" href="/expenses" />
        <NavItem icon={BarChart3} label="Laporan" href="/reports" />
      </div>
    </nav>
  );
}
