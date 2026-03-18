'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Menu, X, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationData {
  lowStock: any[];
  pendingReceipts: any[];
  pendingDeliveries: any[];
}

export const Header: React.FC = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<NotificationData>({ lowStock: [], pendingReceipts: [], pendingDeliveries: [] });
  const [notifLoading, setNotifLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const totalNotifs = notifData.lowStock.length + notifData.pendingReceipts.length + notifData.pendingDeliveries.length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [lsRes, prRes, pdRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports/low-stock', { headers }),
        fetch('http://localhost:5000/api/reports/pending-receipts', { headers }),
        fetch('http://localhost:5000/api/reports/pending-deliveries', { headers }),
      ]);
      const [lowStock, pendingReceipts, pendingDeliveries] = await Promise.all([
        lsRes.json(), prRes.json(), pdRes.json()
      ]);
      setNotifData({ lowStock, pendingReceipts, pendingDeliveries });
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
    <header className="h-20 bg-[var(--ci-header)] backdrop-blur-md border-b border-[var(--ci-border)] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-400">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full">
          <input 
            type="text" 
            placeholder="Search products, warehouses, or orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-sm text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-[var(--ci-text-muted)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={handleBellClick}
            className="relative p-2.5 bg-[var(--ci-glass)] hover:opacity-80 border border-[var(--ci-border)] rounded-xl text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all"
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
                className="absolute right-0 top-14 w-96 bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ci-border)]">
                  <p className="text-sm font-bold text-[var(--ci-text)]">Notifications</p>
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
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)]/50 hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">{item.product?.name}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} — <span className="text-red-400 font-bold">{item.quantity} {item.product?.uom} left</span></p>
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
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)]/50 hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">From: {item.supplier}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} • {new Date(item.createdAt).toLocaleDateString()}</p>
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
                          <div key={item.id} className="px-5 py-3.5 border-b border-[var(--ci-border)]/50 hover:bg-[var(--ci-glass)] transition-colors">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">To: {item.customer}</p>
                            <p className="text-xs text-[var(--ci-text-muted)] mt-0.5">{item.warehouse?.name} • {new Date(item.createdAt).toLocaleDateString()}</p>
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
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-[1px]">
            <div className="w-full h-full bg-[var(--ci-bg)] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--ci-text)] group-hover:text-blue-400 transition-colors">Admin</p>
            <p className="text-xs text-[var(--ci-text-muted)]">Inventory Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
