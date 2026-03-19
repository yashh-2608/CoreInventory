'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
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
  Package2,
  Lock,
  LogOut
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
  const router = useRouter();
  const [isDemo, setIsDemo] = React.useState(false);

  React.useEffect(() => {
    setIsDemo(localStorage.getItem('demoMode') === 'true');
  }, []);

  const handleExitDemo = () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--ci-sidebar)] border-r border-[var(--ci-border)] flex flex-col z-50 transition-colors duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-[var(--ci-border)]">
        <div className="w-10 h-10 bg-[var(--ci-accent)] rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Package2 className="w-6 h-6 text-white" />
        </div>
        <span className="font-semibold text-xl tracking-tight text-[var(--ci-text)]">CoreInventory</span>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="mx-4 mt-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-xs font-semibold text-amber-400 text-center">👁 Demo Mode - Read only</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isDashboardOnly = isDemo && item.href !== '/admin/dashboard';

          return (
            <Link
              key={item.href}
              href={isDashboardOnly ? '#' : item.href}
              onClick={(e) => {
                if (isDashboardOnly) {
                  e.preventDefault();
                  alert('Create a free account to access all features!');
                }
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[var(--ci-accent)]/10 text-[var(--ci-accent)] border border-[var(--ci-accent)]/20"
                  : isDashboardOnly
                    ? "text-[var(--ci-text-muted)]/40 cursor-not-allowed border border-transparent"
                    : "text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] hover:bg-[var(--ci-accent)]/[0.08] border border-transparent"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-[var(--ci-accent)]" : isDashboardOnly ? "text-[var(--ci-text-muted)]/30" : "text-[var(--ci-text-muted)] group-hover:text-[var(--ci-text)]"
              )} />
              {item.name}
              {isDashboardOnly && (
                <Lock className="w-3 h-3 ml-auto text-[var(--ci-text-muted)]/30" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--ci-border)] space-y-3">
        {isDemo ? (
          <button
            onClick={handleExitDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-sm font-semibold text-amber-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Exit Demo
          </button>
        ) : (
          <div className="p-4 bg-[var(--ci-card)] rounded-xl border border-[var(--ci-border)]">
            <p className="text-xs text-[var(--ci-text-muted)] mb-1 font-normal">Signed in as</p>
            <p className="text-sm font-medium text-[var(--ci-text)] truncate">Administrator</p>
          </div>
        )}
      </div>
    </aside>
  );
};
