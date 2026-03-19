'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Menu, X, AlertTriangle, ArrowDownLeft, ArrowUpRight, Search, ArrowLeftRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/context/SearchContext';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';

interface NotificationData {
  lowStock: any[];
  pendingReceipts: any[];
  pendingDeliveries: any[];
  pendingTransfers: any[];
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
    pendingTransfers: []
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const totalNotifs = notifData.lowStock.length + notifData.pendingReceipts.length + notifData.pendingDeliveries.length + notifData.pendingTransfers.length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const threshold = settings.lowStockThreshold;
      
      const [lsRes, prRes, pdRes, ptRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports/low-stock?threshold=${threshold}`, { headers }),
        fetch('http://localhost:5000/api/reports/pending-receipts', { headers }),
        fetch('http://localhost:5000/api/reports/pending-deliveries', { headers }),
        fetch('http://localhost:5000/api/reports/pending-transfers', { headers }),
      ]);
      const [lowStock, pendingReceipts, pendingDeliveries, pendingTransfers] = await Promise.all([
        lsRes.json(), prRes.json(), pdRes.json(), ptRes.json()
      ]);
      setNotifData({ lowStock, pendingReceipts, pendingDeliveries, pendingTransfers });
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!notifOpen) fetchNotifications();
    setNotifOpen(prev => !prev);
  };

  // Close on outside click
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
    <header className="h-20 bg-[var(--ci-header)] backdrop-blur-[12px] border-b border-[var(--ci-border)] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
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
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-[10px] text-sm text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ci-accent)]/50 placeholder:text-[var(--ci-text-muted)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 bg-[var(--ci-glass)] hover:bg-[var(--ci-accent)]/[0.08] border border-[var(--ci-border)] rounded-[10px] text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={handleBellClick}
            className="relative p-2.5 bg-[var(--ci-glass)] hover:bg-[var(--ci-accent)]/[0.08] border border-[var(--ci-border)] rounded-[10px] text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {totalNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
                className="absolute right-0 top-14 w-96 bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[14px] shadow-2xl overflow-hidden z-50"
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
                    {/* Low Stock */}
                    {notifData.lowStock.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-red-500/5 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Low Stock ({notifData.lowStock.length})</p>
                        </div>
                        {notifData.lowStock.map((item: any) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[#1F2937]/50 hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                            <p className="text-sm font-semibold text-white">{item.product?.name}</p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{item.warehouse?.name} — <span className="text-red-400 font-bold">{item.quantity} {item.product?.uom} left</span></p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Pending Receipts */}
                    {notifData.pendingReceipts.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-emerald-500/5 flex items-center gap-2">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pending Receipts ({notifData.pendingReceipts.length})</p>
                        </div>
                        {notifData.pendingReceipts.map((item: any) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[#1F2937]/50 hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                            <p className="text-sm font-semibold text-white">From: {item.supplier}</p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{item.warehouse?.name} • {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Pending Deliveries */}
                    {notifData.pendingDeliveries.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-purple-500/5 flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-purple-400" />
                          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Pending Deliveries ({notifData.pendingDeliveries.length})</p>
                        </div>
                        {notifData.pendingDeliveries.map((item: any) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[#1F2937]/50 hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                            <p className="text-sm font-semibold text-white">To: {item.customer}</p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{item.warehouse?.name} • {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Pending Transfers */}
                    {notifData.pendingTransfers.length > 0 && (
                      <div>
                        <div className="px-5 py-2.5 bg-orange-500/5 flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Active Transfers ({notifData.pendingTransfers.length})</p>
                        </div>
                        {notifData.pendingTransfers.map((item: any) => (
                          <div key={item.id} className="px-5 py-3.5 border-b border-[#1F2937]/50 hover:bg-[rgba(148,163,184,0.05)] transition-colors">
                            <p className="text-sm font-semibold text-white">{item.fromWarehouse?.name} → {item.toWarehouse?.name}</p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{item.items?.length} items • {new Date(item.createdAt).toLocaleDateString()}</p>
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

        <div className="h-10 w-[1px] bg-[var(--ci-border)] mx-2" />
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[10px] p-[1px]">
            <div className="w-full h-full bg-[var(--ci-bg)] rounded-[10px] flex items-center justify-center">
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
