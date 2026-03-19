'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  ChevronRight, 
  Plus, 
  X, 
  Building2, 
  BarChart3,
  Search,
  AlertCircle
} from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  inventory: any[];
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '', capacity: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warehouses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warehouses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newWarehouse)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create warehouse');
      
      setIsModalOpen(false);
      setNewWarehouse({ name: '', location: '', capacity: 0 });
      fetchWarehouses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Warehouse Network</h1>
          <p className="text-[var(--ci-text-muted)]">Manage global storage hubs and monitor real-time utilization.</p>
        </div>
        <button 
          onClick={() => { setError(''); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Establish Hub
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={warehouse.id} 
            onClick={() => setSelectedWarehouse(warehouse)}
            className="group p-8 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md hover:opacity-80 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 className="w-24 h-24" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-1">{warehouse.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{warehouse.location}</p>
            
            {(() => {
                const currentStock = warehouse.inventory.reduce((acc, inv) => acc + inv.quantity, 0);
                const utilization = Math.min((currentStock / warehouse.capacity) * 100, 100);
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end text-sm mb-1">
                            <span className="text-gray-400 font-medium tracking-wide uppercase text-[10px]">Utilization</span>
                            <span className="font-bold text-blue-400">{utilization.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--ci-glass)] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${utilization}%` }}
                                className={`h-full ${utilization > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                            ></motion.div>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-[var(--ci-border)]">
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Capacity</p>
                                <p className="font-bold">{warehouse.capacity.toLocaleString()} Unit</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Current</p>
                                <p className="font-bold">{currentStock.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                );
            })()}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[2.5rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold flex items-center gap-3 italic">
                    <Plus className="w-8 h-8 text-blue-500" /> Establish Hub
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--ci-glass)] rounded-full transition-colors">
                  <X />
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Hub Name</label>
                  <input 
                    type="text" 
                    required
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                    placeholder="e.g. London Central Hub" 
                    className="w-full px-6 py-4 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-[var(--ci-text-muted)]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Geographic Location</label>
                  <input 
                    type="text" 
                    required
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                    placeholder="e.g. Greenwich, London SE10" 
                    className="w-full px-6 py-4 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-[var(--ci-text-muted)]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Volumetric Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newWarehouse.capacity}
                    onChange={(e) => setNewWarehouse({...newWarehouse, capacity: Number(e.target.value)})}
                    placeholder="Units (e.g. 50000)" 
                    className="w-full px-6 py-4 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-[var(--ci-text-muted)]/50"
                  />
                </div>
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Initializing...' : 'Establish Hub'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedWarehouse(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-500" /> {selectedWarehouse.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedWarehouse.location}</p>
                </div>
                <button onClick={() => setSelectedWarehouse(null)} className="p-2 hover:bg-[var(--ci-glass)] rounded-full transition-colors"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Stock Inventory</h3>
                {selectedWarehouse.inventory.map((item: any) => (
                    <div key={item.id} className="p-5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl flex items-center justify-between group hover:opacity-80 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--ci-glass)] rounded-xl border border-[var(--ci-border)] group-hover:bg-blue-500/10 transition-all">
                                <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--ci-text)]">{item.product.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase font-mono tracking-tighter">{item.product.sku}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-[var(--ci-text)]">{item.quantity} {item.product.uom}</p>
                            <div className="w-16 h-1 bg-[var(--ci-glass)] rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min((item.quantity/100)*100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
                {selectedWarehouse.inventory.length === 0 && (
                    <div className="text-center py-20 text-gray-600 italic">No products currently in stock at this hub</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
