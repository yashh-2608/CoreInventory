'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download,
  Calendar,
  RefreshCcw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { LayoutGrid, Warehouse as WarehouseIcon, PackageSearch } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchFilters();
    fetchReports();
  }, [selectedWarehouse, selectedCategory]);

  const fetchFilters = async () => {
    try {
      const token = localStorage.getItem('token');
      const [wRes, cRes] = await Promise.all([
        fetch('http://localhost:5000/api/warehouses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/products/categories', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setWarehouses(await wRes.json());
      setCategories(await cRes.json());
    } catch (err) {
      console.error('Filter fetch error:', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedWarehouse) params.append('warehouseId', selectedWarehouse);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      const res = await fetch(`http://localhost:5000/api/reports/stats?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result.stockByWarehouse || []);
      setStats(result);
    } catch (err) {
      console.error('Reports fetch error:', err);
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

      const res = await fetch(`http://localhost:5000/api/export/global?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      console.error('Export error:', err);
    }
  };

  const totalStock = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight text-white flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-500" />
            Strategic Reports
          </h1>
          <p className="text-gray-500 font-medium">Deep dive into inventory distribution and global hub performance.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] rounded-xl border border-white/5 group shadow-inner">
                <WarehouseIcon className="w-4 h-4 text-blue-400 group-focus-within:text-blue-500 transition-colors" />
                <select 
                    value={selectedWarehouse} 
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-300 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
                >
                    <option value="" className="bg-[#0f172a]">All Warehouses</option>
                    {warehouses.map(w => <option key={w.id} value={w.id} className="bg-[#0f172a]">{w.name}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] rounded-xl border border-white/5 group shadow-inner">
                <PackageSearch className="w-4 h-4 text-purple-400 group-focus-within:text-purple-500 transition-colors" />
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-300 focus:outline-none min-w-[140px] appearance-none cursor-pointer"
                >
                    <option value="" className="bg-[#0f172a]">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>)}
                </select>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-1" />

            <div className="flex gap-2">
                <button 
                    onClick={fetchReports}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Package className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Hub Stock</h4>
            </div>
            <p className="text-4xl font-black text-white">{totalStock.toLocaleString()}</p>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Aggregated across {data.length} warehouses</p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">SKU Coverage</h4>
            </div>
            <p className="text-4xl font-black text-white">{stats?.totalProducts || 0}</p>
            <p className="text-xs text-blue-400 mt-2 font-medium">Active unique identifiers</p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Critical Alerts</h4>
            </div>
            <p className="text-4xl font-black text-white">{stats?.lowStockItems || 0}</p>
            <p className="text-xs text-purple-400 mt-2 font-medium">Items requiring replenishment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-gray-500">Stock Distribution by Warehouse</h3>
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-gray-500">Hub Insights</h3>
            <div className="space-y-6">
                {data.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{h.name}</p>
                            <p className="font-bold text-white text-lg">{h.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className="text-center text-gray-600 italic py-12">No warehouse data available</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, Package } from 'lucide-react';
