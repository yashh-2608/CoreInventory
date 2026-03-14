'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Trash2, Package, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function StockOutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [customer, setCustomer] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
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

  const handleConfirm = async () => {
    if (!customer || !warehouseId || items.some(i => !i.productId || i.quantity <= 0)) {
        setError('Please fill in all fields correctly.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('token');
        
        // 1. Create Delivery
        const createRes = await fetch('http://localhost:5000/api/operations/deliveries', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ customer, warehouseId, items }),
        });

        const delivery = await createRes.json();
        if (!createRes.ok) throw new Error(delivery.message || 'Failed to create delivery');

        // 2. Confirm Delivery
        const confirmRes = await fetch(`http://localhost:5000/api/operations/deliveries/${delivery.id}/confirm`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!confirmRes.ok) {
            const confirmData = await confirmRes.json();
            throw new Error(confirmData.message || 'Failed to confirm delivery');
        }

        setSuccess('Delivery Confirmed Successfully! Stock updated.');
        setItems([{ productId: '', quantity: 1 }]);
        setCustomer('');
        setWarehouseId('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Order (Stock Out)</h1>
        <p className="text-gray-400">Confirm goods departure for customers or external sales.</p>
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
                <ShoppingBag className="w-5 h-5 text-purple-400" /> Dispatch Details
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Customer Identity</label>
                    <input 
                        type="text" 
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        placeholder="e.g. Acme Corp Int."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Source Warehouse</label>
                    <select 
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
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
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Reserved Items</label>
                    <button onClick={addItem} className="text-[10px] text-purple-400 font-bold flex items-center gap-1.5 hover:text-purple-300 transition-colors uppercase tracking-widest">
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
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
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
                                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold text-center"
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
            <div className="p-8 bg-purple-600/10 border border-purple-500/20 rounded-3xl backdrop-blur-md shadow-xl sticky top-8">
                <h4 className="text-purple-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Pick & Pack
                </h4>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-medium">SKU Lines</span>
                        <span className="font-bold text-lg">{items.filter(i => i.productId).length}</span>
                    </div>
                </div>
                <hr className="my-6 border-white/5" />
                <button 
                    onClick={handleConfirm}
                    disabled={loading}
                    className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    <Send className="w-5 h-5" /> {loading ? 'Processing...' : 'Confirm Delivery'}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed font-medium uppercase tracking-widest">
                    Real-time Deductions Enabled
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
