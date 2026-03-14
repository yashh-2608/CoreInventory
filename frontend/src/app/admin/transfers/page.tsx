'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Plus, Trash2, Package, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function TransfersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
        const token = localStorage.getItem('token');
        const [prodRes, warRes] = await Promise.all([
          fetch('http://localhost:5000/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/warehouses', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const prodData = await prodRes.json();
        const warData = await warRes.json();
        setProducts(prodData);
        setWarehouses(warData);
    } catch (err) {
        console.error('Meta fetch error:', err);
    }
  };

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (index: number) => {
      if (items.length > 1) {
          setItems(items.filter((_, i) => i !== index));
      }
  };

  const updateItem = (index: number, field: string, value: any) => {
      const newItems = [...items];
      (newItems[index] as any)[field] = value;
      setItems(newItems);
  };

  const handleExecute = async () => {
    if (!fromWarehouseId || !toWarehouseId || fromWarehouseId === toWarehouseId || items.some(i => !i.productId || i.quantity <= 0)) {
        setError('Please select different warehouses and fill in all items correctly.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('token');
        
        // 1. Create Transfer
        const createRes = await fetch('http://localhost:5000/api/operations/transfers', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fromWarehouseId, toWarehouseId, items }),
        });

        const transfer = await createRes.json();
        if (!createRes.ok) throw new Error(transfer.message || 'Failed to create transfer');

        // 2. Complete Transfer
        const completeRes = await fetch(`http://localhost:5000/api/operations/transfers/${transfer.id}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!completeRes.ok) {
            const completeData = await completeRes.json();
            throw new Error(completeData.message || 'Failed to complete transfer');
        }

        setSuccess('Inter-warehouse Transfer Executed! Inventory balanced.');
        setItems([{ productId: '', quantity: 1 }]);
        setFromWarehouseId('');
        setToWarehouseId('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Internal Stock Transfer</h1>
        <p className="text-gray-400">Move products between warehouses while maintaining total stock levels.</p>
      </div>

      {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
      )}

      {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-gray-500">
                <ArrowLeftRight className="w-5 h-5 text-orange-400" /> Transfer Route
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Origin Hub</label>
                    <select 
                        value={fromWarehouseId}
                        onChange={(e) => setFromWarehouseId(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                    >
                        <option value="">Select Warehouse...</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Target Hub</label>
                    <select 
                        value={toWarehouseId}
                        onChange={(e) => setToWarehouseId(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                    >
                        <option value="">Select Warehouse...</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Inventory Items</label>
                    <button onClick={addItem} className="text-[10px] text-orange-400 font-bold flex items-center gap-1.5 hover:text-orange-300 transition-colors uppercase tracking-widest">
                        <Plus className="w-3.5 h-3.5" /> Append Row
                    </button>
                </div>

                {items.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index} 
                        className="flex gap-4 items-end"
                    >
                        <div className="flex-[4]">
                            <select 
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                placeholder="Qty"
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold text-center"
                            />
                        </div>
                        <button 
                            disabled={items.length === 1}
                            onClick={() => removeItem(index)}
                            className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </motion.div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="p-8 bg-orange-600/10 border border-orange-500/20 rounded-3xl backdrop-blur-md shadow-xl sticky top-8">
                <h4 className="text-orange-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Transit
                </h4>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">Total Lines</span>
                        <span className="font-bold text-lg">{items.length}</span>
                    </div>
                </div>
                <hr className="my-6 border-white/5" />
                <button 
                    onClick={handleExecute}
                    disabled={loading}
                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    <Check className="w-5 h-5" /> {loading ? 'Transferring...' : 'Execute Transfer'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
