'use client';

import React, { useState, useEffect } from 'react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { useSettings } from '@/context/SettingsContext';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  RefreshCcw,
  Truck,
  ShoppingBag,
  ArrowRightLeft,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface Stats {
  totalProducts: number;
  lowStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}

interface Activity {
  id: string;
  qtyChange: number;
  opType: string;
  createdAt: string;
  product: { name: string };
  warehouse: { name: string };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

// ─── Static Demo Data ────────────────────────────────────────────
const DEMO_STATS: Stats = {
  totalProducts: 48,
  lowStockItems: 5,
  pendingReceipts: 3,
  pendingDeliveries: 7,
  scheduledTransfers: 2,
};
const DEMO_ACTIVITIES: Activity[] = [
  { id: '1', qtyChange: 120, opType: 'RECEIPT',   createdAt: new Date(Date.now() - 1000*60*10).toISOString(), product: { name: 'Sony WH-1000XM5 Headphones' }, warehouse: { name: 'Main Warehouse' } },
  { id: '2', qtyChange: -30, opType: 'DELIVERY',  createdAt: new Date(Date.now() - 1000*60*25).toISOString(), product: { name: 'Apple iPhone 15 Pro (256GB)' }, warehouse: { name: 'East Hub' } },
  { id: '3', qtyChange: 60,  opType: 'RECEIPT',   createdAt: new Date(Date.now() - 1000*60*45).toISOString(), product: { name: 'Samsung 4K QLED TV 55"' },       warehouse: { name: 'West Depot' } },
  { id: '4', qtyChange: -15, opType: 'DELIVERY',  createdAt: new Date(Date.now() - 1000*60*90).toISOString(), product: { name: 'Nike Air Max 270 (Size 10)' },     warehouse: { name: 'Main Warehouse' } },
  { id: '5', qtyChange: 50,  opType: 'TRANSFER_IN',createdAt: new Date(Date.now() - 1000*60*120).toISOString(), product: { name: 'Logitech MX Master 3S Mouse' }, warehouse: { name: 'East Hub' } },
  { id: '6', qtyChange: -8,  opType: 'ADJUSTMENT', createdAt: new Date(Date.now() - 1000*60*180).toISOString(), product: { name: 'Levi\'s 501 Original Jeans' },   warehouse: { name: 'West Depot' } },
];
const DEMO_DISTRIBUTION = [
  { name: 'Electronics',  value: 18 },
  { name: 'Apparel',      value: 12 },
  { name: 'Home & Living',value: 10 },
  { name: 'Accessories',  value: 8  },
];
// ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { settings } = useSettings();
  const [isDemo, setIsDemo] = React.useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drillDown, setDrillDown] = useState<{ type: string; data: any[] } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem('demoMode') === 'true';
    setIsDemo(demo);
    if (demo) {
      setStats(DEMO_STATS);
      setActivities(DEMO_ACTIVITIES);
      setDistribution(DEMO_DISTRIBUTION);
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const threshold = settings.lowStockThreshold;
      const [statsRes, activityRes, distRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports/stats?threshold=${threshold}`, { headers }),
        fetch('http://localhost:5000/api/reports/activity', { headers }),
        fetch('http://localhost:5000/api/reports/distribution', { headers })
      ]);

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      const distData = await distRes.json();

      setStats(statsData);
      setActivities(Array.isArray(activityData) ? activityData : []);
      setDistribution(Array.isArray(distData) ? distData : []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrillDown = async (type: string) => {
    setModalLoading(true);
    setDrillDown({ type, data: [] });
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const threshold = settings.lowStockThreshold;
      const urlMap: Record<string, string> = {
        'Total Products': 'http://localhost:5000/api/products',
        'Low Stock Items': `http://localhost:5000/api/reports/low-stock?threshold=${threshold}`,
        'Pending Receipts': 'http://localhost:5000/api/reports/pending-receipts',
        'Pending Deliveries': 'http://localhost:5000/api/reports/pending-deliveries',
        'Active Transfers': 'http://localhost:5000/api/reports/pending-transfers',
      };
      
      const url = urlMap[type];
      if (url) {
          const res = await fetch(url, { headers });
          const data = await res.json();
          setDrillDown({ type, data });
      }
    } catch (err) {
      console.error('Drilldown fetch error:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const getOpIcon = (type: string) => {
      switch(type) {
          case 'RECEIPT': return <Truck className="w-4 h-4 text-emerald-400" />;
          case 'DELIVERY': return <ShoppingBag className="w-4 h-4 text-purple-400" />;
          case 'TRANSFER_IN':
          case 'TRANSFER_OUT': return <ArrowRightLeft className="w-4 h-4 text-orange-400" />;
          case 'ADJUSTMENT': return <RotateCcw className="w-4 h-4 text-red-400" />;
          default: return <Package className="w-4 h-4 text-blue-400" />;
      }
  };

  if (loading && !stats) return (
    <div className="flex h-96 items-center justify-center">
        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[var(--ci-text)]">Inventory Intelligence</h1>
          <p className="text-[var(--ci-text-muted)]">Real-time metrics and warehouse activity.</p>
        </div>
        <button 
            onClick={fetchDashboardData}
            className="ci-btn-secondary p-3 !px-3 !py-3 rounded-[10px]"
        >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard title="Total Products" value={String(stats?.totalProducts ?? 0)} icon={Package} color="text-blue-500" trend="+12%" trendUp onClick={() => fetchDrillDown('Total Products')} />
        <KpiCard title="Low Stock Items" value={String(stats?.lowStockItems ?? 0)} icon={AlertTriangle} color="text-red-500" trend="Critical" onClick={() => fetchDrillDown('Low Stock Items')} />
        <KpiCard title="Pending Receipts" value={String(stats?.pendingReceipts ?? 0)} icon={ArrowDownLeft} color="text-emerald-500" onClick={() => fetchDrillDown('Pending Receipts')} />
        <KpiCard title="Pending Deliveries" value={String(stats?.pendingDeliveries ?? 0)} icon={ArrowUpRight} color="text-purple-500" onClick={() => fetchDrillDown('Pending Deliveries')} />
        <KpiCard title="Active Transfers" value={String(stats?.scheduledTransfers ?? 0)} icon={ArrowLeftRight} color="text-orange-500" onClick={() => fetchDrillDown('Active Transfers')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-[var(--ci-card)] backdrop-blur-[12px] border border-[var(--ci-border)] rounded-[14px] shadow-xl transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <h3 className="text-sm font-semibold mb-8 flex items-center gap-2 uppercase tracking-widest text-[var(--ci-text-muted)]">
                Category Distribution
            </h3>
            <div className="h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--ci-bg)', border: '1px solid var(--ci-border)', borderRadius: '10px' }}
                            itemStyle={{ color: 'var(--ci-text)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="p-8 bg-[var(--ci-card)] backdrop-blur-[12px] border border-[var(--ci-border)] rounded-[14px] shadow-xl transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <h3 className="text-sm font-semibold mb-8 flex items-center gap-2 uppercase tracking-widest text-[var(--ci-text-muted)]">
                Real-time Ledger
            </h3>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((act) => (
                    <div key={act.id} className="flex items-center gap-4 p-4 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-[10px] hover:bg-[var(--ci-glass)] hover:opacity-90 transition-all">
                        <div className="p-3 bg-white/[0.04] rounded-xl">
                            {getOpIcon(act.opType)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--ci-text)]">{act.product.name}</p>
                            <p className="text-[11px] text-[var(--ci-text-muted)] flex items-center gap-1 font-medium">
                                {act.warehouse.name} • {new Date(act.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className={`text-sm font-bold ${act.qtyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {act.qtyChange >= 0 ? '+' : ''}{act.qtyChange}
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-[var(--ci-text-muted)]/50">
                        <Package className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm italic">No recent movements detected</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      <AnimatePresence>
        {drillDown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrillDown(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--ci-text)]">
                    {drillDown.type === 'Total Products' && <Package className="w-8 h-8 text-blue-500" />}
                    {drillDown.type === 'Low Stock Items' && <AlertTriangle className="w-8 h-8 text-red-500" />}
                    {drillDown.type === 'Pending Receipts' && <ArrowDownLeft className="w-8 h-8 text-emerald-500" />}
                    {drillDown.type === 'Pending Deliveries' && <ArrowUpRight className="w-8 h-8 text-purple-500" />}
                    {drillDown.type === 'Active Transfers' && <ArrowLeftRight className="w-8 h-8 text-orange-500" />}
                    {drillDown.type}
                </h2>
                <button onClick={() => setDrillDown(null)} className="p-2 hover:bg-[var(--ci-glass)] rounded-full transition-colors text-[var(--ci-text-muted)]"><X /></button>
              </div>

              {modalLoading ? (
                  <div className="flex-1 flex items-center justify-center py-20"><RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" /></div>
              ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
                      {drillDown.data.map((item: any) => (
                          <div key={item.id} className="p-5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl flex items-center justify-between group hover:opacity-80 transition-all">
                              <div className="flex items-center gap-4">
                                  <div className={`p-3 bg-[var(--ci-glass)] rounded-xl border border-[var(--ci-border)] transition-all ${
                                    drillDown.type === 'Total Products' ? 'group-hover:bg-blue-500/10 group-hover:border-blue-500/20' :
                                    drillDown.type === 'Low Stock Items' ? 'group-hover:bg-red-500/10 group-hover:border-red-500/20' :
                                    drillDown.type === 'Pending Receipts' ? 'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20' :
                                    drillDown.type === 'Pending Deliveries' ? 'group-hover:bg-purple-500/10 group-hover:border-purple-500/20' :
                                    'group-hover:bg-orange-500/10 group-hover:border-orange-500/20'
                                  }`}>
                                      {drillDown.type === 'Total Products' && <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />}
                                      {drillDown.type === 'Low Stock Items' && <AlertTriangle className="w-5 h-5 text-gray-400 group-hover:text-red-400" />}
                                      {drillDown.type === 'Pending Receipts' && <ArrowDownLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />}
                                      {drillDown.type === 'Pending Deliveries' && <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />}
                                      {drillDown.type === 'Active Transfers' && <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-orange-400" />}
                                  </div>
                                  <div>
                                      {/* Total Products */}
                                      {drillDown.type === 'Total Products' && (
                                        <>
                                          <p className="font-bold text-[var(--ci-text)]">{item.name}</p>
                                          <p className="text-xs text-[var(--ci-text-muted)] uppercase tracking-widest font-bold font-mono">{item.sku}</p>
                                        </>
                                      )}
                                      {/* Low Stock Items */}
                                      {drillDown.type === 'Low Stock Items' && (
                                        <>
                                          <p className="font-bold text-[var(--ci-text)]">{item.product?.name}</p>
                                          <p className="text-xs text-[var(--ci-text-muted)] uppercase tracking-widest font-bold font-mono">{item.product?.sku}</p>
                                        </>
                                      )}
                                      {/* Pending Receipts */}
                                      {drillDown.type === 'Pending Receipts' && (
                                        <div className="space-y-1">
                                          <p className="font-bold text-[var(--ci-text)] leading-tight">From: {item.supplier}</p>
                                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{item.warehouse?.name}</p>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {item.items?.map((sub: any) => (
                                              <span key={sub.id} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                                                {sub.product?.name} ({sub.quantity})
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {/* Pending Deliveries */}
                                      {drillDown.type === 'Pending Deliveries' && (
                                        <div className="space-y-1">
                                          <p className="font-bold text-[var(--ci-text)] leading-tight">To: {item.customer}</p>
                                          <p className="text-[10px] text-[var(--ci-text-muted)] uppercase tracking-wider font-bold">{item.warehouse?.name}</p>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {item.items?.map((sub: any) => (
                                              <span key={sub.id} className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/10 px-2 py-0.5 rounded-md">
                                                {sub.product?.name} ({sub.quantity})
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {/* Active Transfers */}
                                      {drillDown.type === 'Active Transfers' && (
                                        <div className="space-y-1">
                                          <p className="font-bold text-[var(--ci-text)] leading-tight">{item.fromWarehouse?.name} → {item.toWarehouse?.name}</p>
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {item.items?.map((sub: any) => (
                                              <span key={sub.id} className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/10 px-2 py-0.5 rounded-md">
                                                {sub.product?.name} ({sub.quantity})
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-2">
                                  {drillDown.type === 'Low Stock Items' && (
                                      <>
                                          <p className="text-sm font-bold text-red-400">{item.quantity} {item.product?.uom}</p>
                                          <p className="text-[10px] text-gray-500 uppercase font-bold">{item.warehouse?.name}</p>
                                      </>
                                  )}
                                  {drillDown.type === 'Total Products' && (
                                      <p className="text-sm font-bold text-[var(--ci-text-muted)]">{item.category?.name}</p>
                                  )}
                                  {(drillDown.type === 'Pending Receipts' || drillDown.type === 'Pending Deliveries' || drillDown.type === 'Active Transfers') && (
                                      <>
                                          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                                          <p className="text-[10px] text-gray-500 font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                                      </>
                                  )}
                              </div>
                          </div>
                      ))}
                      {drillDown.data.length === 0 && <p className="text-center py-20 text-gray-600 font-medium italic">No items found</p>}
                  </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
