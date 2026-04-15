'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle,
  BarChart3,
  Download,
  LayoutGrid,
  Package,
  PackageSearch,
  RefreshCcw,
  TrendingUp,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface WarehouseOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface WarehouseStat {
  name: string;
  value: number;
}

interface ReportStats {
  totalProducts: number;
  lowStockItems: number;
  stockByWarehouse: WarehouseStat[];
}

export default function ReportsPage() {
  const [data, setData] = useState<WarehouseStat[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [warehouseData, categoryData] = await Promise.all([
        apiRequest<WarehouseOption[]>('/api/warehouses'),
        apiRequest<CategoryOption[]>('/api/products/categories'),
      ]);
      setWarehouses(warehouseData);
      setCategories(categoryData);
    } catch (err) {
      console.error('Filter fetch error:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedWarehouse, selectedCategory, reloadKey]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedWarehouse) params.append('warehouseId', selectedWarehouse);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      const result = await apiRequest<ReportStats>(`/api/reports/stats?${params.toString()}`);
      setData(result.stockByWarehouse || []);
      setStats(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
      setData([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedWarehouse) params.append('warehouseId', selectedWarehouse);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      // Using fetch directly for blobs to handle file download
      const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'https://coreinventory-rwe1.onrender.com').replace(/\/$/, '')}/api/export/global?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    }
  };

  const totalStock = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-[var(--ci-border)]">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight text-[var(--ci-text)] flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
            Strategic Reports
          </h1>
          <p className="text-[var(--ci-text-muted)] font-medium">Deep dive into inventory distribution and hub performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-[var(--ci-card)] p-2 rounded-2xl border border-[var(--ci-border)] backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--ci-glass)] rounded-xl border border-[var(--ci-border)] group shadow-inner">
            <WarehouseIcon className="w-4 h-4 text-blue-400" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-transparent text-sm font-bold text-[var(--ci-text-muted)] focus:outline-none min-w-[140px] appearance-none cursor-pointer"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--ci-glass)] rounded-xl border border-[var(--ci-border)] group shadow-inner">
            <PackageSearch className="w-4 h-4 text-purple-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm font-bold text-[var(--ci-text-muted)] focus:outline-none min-w-[140px] appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-[var(--ci-border)] mx-1" />

          <div className="flex gap-2">
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              className="p-2.5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl hover:opacity-80 transition-all text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium animate-in slide-in-from-top-2 duration-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-[var(--ci-text-muted)] uppercase tracking-wider">Total Hub Stock</h4>
          </div>
          <p className="text-4xl font-black text-[var(--ci-text)]">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2 font-medium">Aggregated across {data.length} warehouses</p>
        </div>

        <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-[var(--ci-text-muted)] uppercase tracking-wider">SKU Coverage</h4>
          </div>
          <p className="text-4xl font-black text-[var(--ci-text)]">{stats?.totalProducts || 0}</p>
          <p className="text-xs text-blue-400 mt-2 font-medium">Active unique identifiers</p>
        </div>

        <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-[var(--ci-text-muted)] uppercase tracking-wider">Critical Alerts</h4>
          </div>
          <p className="text-4xl font-black text-[var(--ci-text)]">{stats?.lowStockItems || 0}</p>
          <p className="text-xs text-purple-400 mt-2 font-medium">Items requiring replenishment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl">
          <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-[var(--ci-text-muted)]">Stock Distribution by Warehouse</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  contentStyle={{ backgroundColor: 'var(--ci-card)', border: '1px solid var(--ci-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--ci-text)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl flex flex-col">
          <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-[var(--ci-text-muted)]">Hub Insights</h3>
          <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {data.map((hub, index) => (
              <div key={`${hub.name}-${index}`} className="flex items-center gap-4 p-4 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl hover:bg-white/[0.02] transition-all">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[var(--ci-text-muted)] uppercase tracking-wider">{hub.name}</p>
                  <p className="font-bold text-[var(--ci-text)] text-lg">{hub.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!loading && data.length === 0 && (
              <p className="text-center text-[var(--ci-text-muted)] italic py-12">No warehouse data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
