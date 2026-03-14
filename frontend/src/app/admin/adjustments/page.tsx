'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Info, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function AdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('COUNT_CORRECTION');
  const [quantity, setQuantity] = useState<number>(0); // This will be the NEW Counted Qty
  const [recordedQty, setRecordedQty] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentStock = products.find(p => p.id === productId)?.inventory?.find((inv: any) => inv.warehouseId === warehouseId)?.quantity || 0;

  useEffect(() => {
    setRecordedQty(currentStock);
    setQuantity(currentStock);
  }, [productId, warehouseId, products]);

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

  const handleCommit = async () => {
    if (!productId || !warehouseId || !reason) {
        setError('Please select product, warehouse and provide a reason.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/operations/adjustments', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                productId, 
                warehouseId, 
                recordedQty, 
                countedQty: quantity, 
                reason 
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to commit adjustment');

        setSuccess('Inventory Adjustment Committed! Ledger updated.');
        setProductId('');
        setWarehouseId('');
        setReason('');
        setQuantity(0);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventory Adjustments</h1>
        <p className="text-gray-400">Correct stock levels based on physical counts or damage reports.</p>
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
        <div className="md:col-span-2">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-xl space-y-6">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-gray-500">
                <ClipboardCheck className="w-5 h-5 text-red-500" /> Manual Adjustment
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Product Identity</label>
                    <select 
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                    >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Location Hub</label>
                    <select 
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                    >
                        <option value="">Select Warehouse...</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Adjustment Vector</label>
                    <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                    >
                        <option value="COUNT_CORRECTION">Count Correction</option>
                        <option value="DAMAGE_LOSS">Damage / Loss</option>
                        <option value="RETURN">Returned Goods</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Live Recorded Stock</label>
                    <div className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold">
                        {recordedQty} Units
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">New Physical Count</label>
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder="Actual count found..."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Formal Reason</label>
                    <textarea 
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain the discrepancy for the immutable ledger..."
                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none font-medium"
                    ></textarea>
                </div>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-200/80 uppercase tracking-widest font-bold leading-relaxed">
                    Warning: This action immediately modifies the global stock balance and creates a permanent entry in the security-hardened ledger.
                </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <button 
                onClick={handleCommit}
                disabled={loading}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
                <Save className="w-5 h-5" /> {loading ? 'Committing...' : 'Commit to Ledger'}
            </button>

            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                <h4 className="text-gray-500 font-bold text-[10px] mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <Info className="w-4 h-4" /> Compliance Audit
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                    All manual corrections are cryptographically linked to your user profile and timestamped for regulatory compliance.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
