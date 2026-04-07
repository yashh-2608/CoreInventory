'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Info, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiUrl, getAuthHeaders, readApiResponse } from '@/lib/api';

interface InventoryRecord {
  warehouseId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  inventory: InventoryRecord[];
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
  const [quantity, setQuantity] = useState<number>(0);
  const [recordedQty, setRecordedQty] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentStock = products.find((product) => product.id === productId)?.inventory.find((inventory) => inventory.warehouseId === warehouseId)?.quantity || 0;

  useEffect(() => {
    setRecordedQty(currentStock);
    setQuantity(currentStock);
  }, [currentStock]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const headers = getAuthHeaders();
        const [prodRes, warRes] = await Promise.all([
          fetch(apiUrl('/api/products'), { headers }),
          fetch(apiUrl('/api/warehouses'), { headers }),
        ]);

        const prodData = await readApiResponse<Product[]>(prodRes);
        const warData = await readApiResponse<Warehouse[]>(warRes);
        setProducts(prodData);
        setWarehouses(warData);
      } catch (err: unknown) {
        console.error('Meta fetch error:', err);
      }
    };

    fetchMeta();
  }, []);

  const handleCommit = async () => {
    if (!productId || !warehouseId || !reason) {
      setError('Please select product, warehouse and provide a reason.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(apiUrl('/api/operations/adjustments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          recordedQty,
          countedQty: quantity,
          reason: `${type}: ${reason}`,
        }),
      });

      await readApiResponse<{ message: string }>(res);

      setSuccess('Inventory Adjustment Committed! Ledger updated.');
      setProductId('');
      setWarehouseId('');
      setReason('');
      setQuantity(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to commit adjustment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[var(--ci-text)]">Inventory Adjustments</h1>
        <p className="text-[var(--ci-text-muted)]">Correct stock levels based on physical counts or damage reports.</p>
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
          <div className="p-8 bg-[var(--ci-panel)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl space-y-6">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-[var(--ci-text-muted)]">
              <ClipboardCheck className="w-5 h-5 text-red-500" /> Manual Adjustment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Product Identity</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                >
                  <option value="">Select Product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Location Hub</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                >
                  <option value="">Select Warehouse...</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Adjustment Vector</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                >
                  <option value="COUNT_CORRECTION">Count Correction</option>
                  <option value="DAMAGE_LOSS">Damage / Loss</option>
                  <option value="RETURN">Returned Goods</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Live Recorded Stock</label>
                <div className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text-muted)] font-bold">
                  {recordedQty} Units
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">New Physical Count</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="Actual count found..."
                  className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Formal Reason</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the discrepancy for the immutable ledger..."
                  className="w-full px-4 py-4 bg-[var(--ci-panel-strong)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none font-medium"
                />
              </div>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-300 uppercase tracking-widest font-bold leading-relaxed">
                Warning: This action immediately modifies the stock balance and creates a permanent entry in the ledger.
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

          <div className="p-8 bg-[var(--ci-panel)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md">
            <h4 className="text-[var(--ci-text-muted)] font-bold text-[10px] mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Info className="w-4 h-4" /> Compliance Audit
            </h4>
            <p className="text-xs text-[var(--ci-text-muted)] leading-relaxed italic">
              All manual corrections are linked to your user profile and timestamped for compliance and audit history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
