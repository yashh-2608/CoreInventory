'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearch } from '@/context/SearchContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { apiUrl, getAuthHeaders, readApiResponse } from '@/lib/api';

type NotificationEntry = {
  id: string;
  createdAt?: string;
  quantity?: number;
  supplier?: string;
  customer?: string;
  product?: { name?: string; uom?: string };
  warehouse?: { name?: string };
  fromWarehouse?: { name?: string };
  toWarehouse?: { name?: string };
  items?: Array<{ id: string }>;
};

interface NotificationData {
  lowStock: NotificationEntry[];
  pendingReceipts: NotificationEntry[];
  pendingDeliveries: NotificationEntry[];
  pendingTransfers: NotificationEntry[];
}

export const Header: React.FC = () => {
  const { settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<NotificationData>({
    lowStock: [],
    pendingReceipts: [],
    pendingDeliveries: [],
    pendingTransfers: [],
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const totalNotifs = notifData.lowStock.length + notifData.pendingReceipts.length + notifData.pendingDeliveries.length + notifData.pendingTransfers.length;
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'Pending');

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const headers = getAuthHeaders();
      const threshold = settings.lowStockThreshold;

      const [lsRes, prRes, pdRes, ptRes] = await Promise.all([
        fetch(apiUrl(`/api/reports/low-stock?threshold=${threshold}`), { headers }),
        fetch(apiUrl('/api/reports/pending-receipts'), { headers }),
        fetch(apiUrl('/api/reports/pending-deliveries'), { headers }),
        fetch(apiUrl('/api/reports/pending-transfers'), { headers }),
      ]);

      const [lowStock, pendingReceipts, pendingDeliveries, pendingTransfers] = await Promise.all([
        readApiResponse<NotificationEntry[]>(lsRes),
        readApiResponse<NotificationEntry[]>(prRes),
        readApiResponse<NotificationEntry[]>(pdRes),
        readApiResponse<NotificationEntry[]>(ptRes),
      ]);

      setNotifData({ lowStock, pendingReceipts, pendingDeliveries, pendingTransfers });
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotifData({ lowStock: [], pendingReceipts: [], pendingDeliveries: [], pendingTransfers: [] });
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-20 bg-[var(--ci-header)] backdrop-blur-[18px] border-b border-[var(--ci-border)] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300 shadow-[0_18px_40px_var(--ci-shadow)]">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-[var(--ci-text-muted)]">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ci-text-muted)]" />
          <input
            type="text"
            placeholder="Search products, warehouses, or orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--ci-panel)] border border-[var(--ci-border)] rounded-[10px] text-sm text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ci-accent)]/35 placeholder:text-[var(--ci-text-muted)] transition-all shadow-[inset_0_1px_0_var(--ci-shadow-soft)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 bg-[var(--ci-panel)] hover:bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-[10px] text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div ref={bellRef} className="relative">
          <button
            onClick={() => {
              if (!notifOpen) fetchNotifications();
              setNotifOpen((open) => !open);
            }}
            className="relative p-2.5 bg-[var(--ci-panel)] hover:bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-[10px] text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {totalNotifs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalNotifs > 9 ? '9+' : totalNotifs}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-14 w-96 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-[18px] shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ci-border)]">
                  <p className="text-sm font-semibold text-[var(--ci-text)]">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {notifLoading ? (
                  <div className="py-10 text-center text-[var(--ci-text-muted)] text-sm">Loading...</div>
                ) : totalNotifs === 0 ? (
                  <div className="py-10 text-center text-[var(--ci-text-muted)] text-sm">All clear! No alerts.</div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    {notifData.lowStock.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-red-500/8 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Low Stock ({notifData.lowStock.length})</p>
                        </div>
                        {notifData.lowStock.map((item) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)] hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">{item.product?.name}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} • <span className="text-red-400 font-bold">{item.quantity} {item.product?.uom} left</span></p>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifData.pendingReceipts.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-emerald-500/8 flex items-center gap-2">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pending Receipts ({notifData.pendingReceipts.length})</p>
                        </div>
                        {notifData.pendingReceipts.map((item) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)] hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">From: {item.supplier}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} • {formatDate(item.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifData.pendingDeliveries.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-violet-500/8 flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-violet-400" />
                          <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Pending Deliveries ({notifData.pendingDeliveries.length})</p>
                        </div>
                        {notifData.pendingDeliveries.map((item) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)] hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">To: {item.customer}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} • {formatDate(item.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifData.pendingTransfers.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-amber-500/8 flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Transfers ({notifData.pendingTransfers.length})</p>
                        </div>
                        {notifData.pendingTransfers.map((item) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)] hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">{item.fromWarehouse?.name} → {item.toWarehouse?.name}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.items?.length} items • {formatDate(item.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 w-px bg-[var(--ci-border)] mx-2" />
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--ci-accent)] to-[var(--ci-accent-2)] rounded-[10px] p-px shadow-lg shadow-[var(--ci-shadow)]">
            <div className="w-full h-full bg-[var(--ci-panel)] rounded-[10px] flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--ci-text)]" />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--ci-text)] group-hover:text-[var(--ci-accent)] transition-colors">Admin</p>
            <p className="text-xs text-[var(--ci-text-muted)]">Inventory Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
