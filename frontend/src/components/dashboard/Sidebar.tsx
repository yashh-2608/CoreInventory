'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  Package2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Products', icon: Package, href: '/admin/products' },
  { name: 'Warehouses', icon: Warehouse, href: '/admin/warehouses' },
  { name: 'Stock In', icon: ArrowDownLeft, href: '/admin/stock-in' },
  { name: 'Stock Out', icon: ArrowUpRight, href: '/admin/stock-out' },
  { name: 'Internal Transfers', icon: ArrowLeftRight, href: '/admin/transfers' },
  { name: 'Inventory Adjustments', icon: ClipboardCheck, href: '/admin/adjustments' },
  { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--ci-sidebar)] border-r border-[var(--ci-border)] flex flex-col z-50 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-[var(--ci-border)]">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Package2 className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-[var(--ci-text)]">CoreInventory</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                  : "text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] hover:bg-[var(--ci-glass)] border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-[var(--ci-text-muted)] group-hover:text-[var(--ci-text)]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--ci-border)]">
        <div className="p-4 bg-[var(--ci-glass)] rounded-2xl border border-[var(--ci-border)]">
            <p className="text-xs text-[var(--ci-text-muted)] mb-1">Signed in as</p>
            <p className="text-sm font-medium text-[var(--ci-text)] truncate">Administrator</p>
        </div>
      </div>
    </aside>
  );
};
