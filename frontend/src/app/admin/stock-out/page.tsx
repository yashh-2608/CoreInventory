'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Trash2, Package, Send, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';

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
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [deleteDraftConfirm, setDeleteDraftConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMeta();
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/operations/deliveries/drafts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDrafts(data);
    } catch (err) {
        console.error('Drafts fetch error:', err);
    }
  };

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

  const handleSaveDraft = async () => {
    if (!customer || !warehouseId || items.some(i => !i.productId || i.quantity <= 0)) {
        setError('Please fill in all fields correctly before saving draft.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('token');
        const createRes = await fetch('http://localhost:5000/api/operations/deliveries', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ customer, warehouseId, items, status: 'DRAFT' }),
        });

        const delivery = await createRes.json();
        if (!createRes.ok) throw new Error(delivery.message || 'Failed to save draft');

        setDraftId(delivery.id);
        setIsDraftSaved(true);
        setSuccess('Delivery saved as DRAFT. You can now confirm it for dispatch.');
        fetchDrafts();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/operations/deliveries/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            fetchDrafts();
            if (draftId === id) {
                setDraftId(null);
                setIsDraftSaved(false);
            }
        }
    } catch (err) {
        console.error('Delete draft error:', err);
    }
  };

  const handleConfirm = async () => {
    if (!draftId) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('token');
        const confirmRes = await fetch(`http://localhost:5000/api/operations/deliveries/${draftId}/confirm`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) throw new Error(confirmData.message || 'Failed to confirm delivery');

        setSuccess('Delivery Confirmed Successfully! Stock updated.');
        setItems([{ productId: '', quantity: 1 }]);
        setCustomer('');
        setWarehouseId('');
        setDraftId(null);
        setIsDraftSaved(false);
        fetchDrafts();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 px-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Delivery Order (Stock Out)</h1>
        <p className="text-[var(--ci-text-muted)]">Confirm goods departure for customers or external sales.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch">
        {/* Column 1: Dispatch Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md shadow-xl flex-1">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-[var(--ci-text-muted)]">
                <ShoppingBag className="w-5 h-5 text-purple-400" /> Dispatch Details
            </h3>
            
            <div className="space-y-6 mb-10">
                <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Customer Identity</label>
                    <input 
                        type="text" 
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        placeholder="e.g. Acme Corp Int."
                        className="w-full px-4 py-4 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Source Warehouse</label>
                    <SearchableSelect 
                        options={warehouses}
                        value={warehouseId}
                        onChange={(val) => setWarehouseId(val)}
                        placeholder="Select Origin..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em]">Itemized Manifest</label>
                    <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300">
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                </div>
                
                {items.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={index} 
                        className="grid grid-cols-12 gap-4 items-end bg-[var(--ci-glass)] p-4 rounded-2xl border border-[var(--ci-border)]"
                    >
                        <div className="col-span-7">
                            <label className="block text-[8px] font-bold text-gray-600 uppercase mb-2">Product</label>
                            <SearchableSelect 
                                options={products}
                                value={item.productId}
                                onChange={(val) => updateItem(index, 'productId', val)}
                                placeholder="Select Item..."
                            />
                        </div>
                        <div className="col-span-4">
                            <label className="block text-[8px] font-bold text-gray-600 uppercase mb-2">Qty</label>
                            <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                className="w-full px-3 py-3 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-xl text-[var(--ci-text)] text-sm text-center"
                            />
                        </div>
                        <button 
                            disabled={items.length === 1}
                            onClick={() => removeItem(index)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all disabled:opacity-30"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Column 2: Order Summary */}
        <div className="space-y-6 flex flex-col">
            <div className="p-8 bg-purple-600/10 border border-purple-500/20 rounded-3xl backdrop-blur-md shadow-xl flex-1 flex flex-col">
                <h4 className="text-purple-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Pick & Pack
                </h4>
                <div className="space-y-4 text-sm flex-1">
                    <div className="flex justify-between items-center bg-[var(--ci-glass)] p-4 rounded-2xl border border-[var(--ci-border)]">
                        <span className="text-[var(--ci-text-muted)] font-medium">SKU Lines</span>
                        <span className="font-bold text-lg">{items.filter(i => i.productId).length}</span>
                    </div>
                </div>
                <hr className="my-6 border-[var(--ci-border)]" />
                <div className="space-y-4">
                  {!isDraftSaved ? (
                    <button 
                        onClick={handleSaveDraft}
                        disabled={loading}
                        className="w-full py-5 bg-white/10 hover:bg-white/20 text-[var(--ci-text)] border border-white/20 border-dashed rounded-2xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5 text-purple-400" /> {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                  ) : (
                    <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-[var(--ci-text)] rounded-2xl font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" /> {loading ? 'Processing...' : 'Confirm Delivery'}
                    </button>
                  )}
                </div>
            </div>

            <div className="p-6 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-[var(--ci-text-muted)] mt-0.5" />
                    <p className="text-xs text-[var(--ci-text-muted)] leading-relaxed italic">
                        Commitment will verify the delivery and automatically decrease inventory across the global ledger for the selected hub.
                    </p>
                </div>
            </div>
        </div>

        {/* Column 3: Saved Drafts */}
        <div className="space-y-6 flex flex-col">
            <div className="p-6 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-md flex-1 overflow-hidden flex flex-col">
                <h4 className="text-amber-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Saved Drafts ({drafts.length})
                </h4>
                
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {drafts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-30">
                            <FileText className="w-12 h-12 mb-4" />
                            <p className="text-xs italic">No drafts found</p>
                        </div>
                    ) : (
                        drafts.map((d) => (
                            <div key={d.id} className="p-4 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl space-y-3 hover:border-amber-500/30 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-[var(--ci-text)] uppercase tracking-tight line-clamp-1">{d.customer}</p>
                                        <p className="text-[10px] text-[var(--ci-text-muted)] font-medium">Draft ID: ...{d.id.slice(-6)}</p>
                                    </div>
                                    <button 
                                        onClick={() => setDeleteDraftConfirm(d.id)}
                                        className="p-2 hover:bg-red-500/10 text-[var(--ci-text-muted)] hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-[var(--ci-text-muted)] border-t border-[var(--ci-border)] pt-2">
                                    <span>{d.items.length} Items</span>
                                    <button 
                                        onClick={() => {
                                            setCustomer(d.customer);
                                            setWarehouseId(d.warehouseId);
                                            setItems(d.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity })));
                                            setDraftId(d.id);
                                            setIsDraftSaved(true);
                                            setSuccess('Draft loaded for editing.');
                                        }}
                                        className="text-blue-400 font-bold hover:underline"
                                    >
                                        Load Draft
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteDraftConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteDraftConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#0f1115] border border-[var(--ci-border)] rounded-[2rem] shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ci-text)] mb-2">Discard Draft?</h3>
              <p className="text-[var(--ci-text-muted)] text-sm mb-8">This action cannot be undone. Are you sure you want to delete this draft delivery order?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteDraftConfirm(null)}
                  className="flex-1 py-4 bg-[var(--ci-glass)] hover:opacity-80 text-[var(--ci-text)] rounded-xl font-bold transition-all border border-[var(--ci-border)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteDraft(deleteDraftConfirm);
                    setDeleteDraftConfirm(null);
                  }}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-[var(--ci-text)] rounded-xl font-bold transition-all shadow-lg shadow-red-600/30"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
