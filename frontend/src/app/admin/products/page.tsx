'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Download, MoreVertical, X, Package,
  AlertCircle, Trash2, FileText, ChevronDown, AlertTriangle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  uom: string;
  initialStock: number;
  category: { name: string };
  inventory: any[];
}

interface Category {
  id: string;
  name: string;
}

interface DraftProduct {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  uom: string;
  initialStock: number;
  savedAt: string;
}

const DRAFT_KEY = 'ci_product_drafts';

function loadDrafts(): DraftProduct[] {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]'); } catch { return []; }
}
function saveDrafts(drafts: DraftProduct[]) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleteDraftConfirm, setDeleteDraftConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', categoryId: '', uom: 'PCS', initialStock: 0
  });
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    setDrafts(loadDrafts());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/products/categories', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!prodRes.ok || !catRes.ok) throw new Error('Failed to fetch data');
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
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
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product');
      setIsModalOpen(false);
      setNewProduct({ name: '', sku: '', categoryId: '', uom: 'PCS', initialStock: 0 });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!newProduct.name && !newProduct.sku) return;
    const cat = categories.find(c => c.id === newProduct.categoryId);
    const draft: DraftProduct = {
      id: Date.now().toString(),
      ...newProduct,
      categoryName: cat?.name || '',
      savedAt: new Date().toISOString(),
    };
    const updated = [...drafts, draft];
    setDrafts(updated);
    saveDrafts(updated);
    setIsModalOpen(false);
    setNewProduct({ name: '', sku: '', categoryId: '', uom: 'PCS', initialStock: 0 });
  };

  const handleSubmitDraft = async (draft: DraftProduct) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: draft.name, sku: draft.sku, categoryId: draft.categoryId, uom: draft.uom, initialStock: draft.initialStock })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit draft');
      const updated = drafts.filter(d => d.id !== draft.id);
      setDrafts(updated);
      saveDrafts(updated);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    saveDrafts(updated);
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/products/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/export/products', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'products_inventory.csv';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err: any) { setError(err.message); }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || p.category.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1700px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[var(--ci-text)]">Product Catalog</h1>
          <p className="text-[var(--ci-text-muted)] text-sm font-medium">Global SKU directory and inventory distribution hub.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl text-sm font-bold hover:opacity-80 transition-all text-[var(--ci-text-muted)]">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setError(''); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-[var(--ci-text)] rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Plus className="w-5 h-5" /> Register SKU
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Column 1: Filters & Search */}
        <div className="flex flex-col space-y-6">
          <div className="p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[2rem] backdrop-blur-md shadow-xl flex-1">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2 uppercase tracking-widest text-[var(--ci-text-muted)]">
                <Search className="w-5 h-5 text-blue-500" /> Refinement
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Search Catalog</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ci-text-muted)]" />
                      <input 
                        type="text" placeholder="Name or SKU..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-[var(--ci-text-muted)]/30"
                      />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Filter by Category</label>
                    <select 
                      value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-4 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-12 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Quick Stats</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--ci-text-muted)]">Total SKUs</span>
                        <span className="font-bold text-[var(--ci-text)]">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-[var(--ci-text-muted)]">Filtered View</span>
                        <span className="font-bold text-[var(--ci-text)]">{filteredProducts.length}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Column 2: Main Table */}
        <div className="flex flex-col space-y-6">
          <div className="bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[2rem] overflow-hidden backdrop-blur-md shadow-xl flex-1 flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h3 className="text-sm font-bold text-[var(--ci-text-muted)] flex items-center gap-2 uppercase tracking-widest">
                    <Package className="w-4 h-4" /> Global Ledger
                </h3>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[8px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em]">Product Details</th>
                    <th className="px-6 py-4 text-[8px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em]">Stock Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p) => (
                    <tr 
                      key={p.id} 
                      onClick={() => setSelectedProduct(p)}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-[var(--ci-text)] text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[8px] text-[var(--ci-text-muted)] font-mono tracking-wider">{p.sku}</p>
                          <span className="text-[8px] mt-1 inline-block text-blue-400 opacity-60 font-bold uppercase">{p.category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {(() => {
                          const totalStock = p.initialStock + p.inventory.reduce((acc, inv) => acc + inv.quantity, 0);
                          const isLow = totalStock < 10;
                          return (
                            <div className="flex flex-col gap-1.5 min-w-[100px]">
                              <div className="flex justify-between items-end">
                                <span className={`text-[8px] font-bold ${isLow ? 'text-red-400' : 'text-blue-500/50'}`}>
                                  {totalStock} {p.uom}
                                </span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((totalStock / 1000) * 100, 100)}%` }} />
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="relative" ref={openMenuId === p.id ? menuRef : null}>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                          >
                            <MoreVertical className="w-4 h-4 text-[var(--ci-text-muted)]" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === p.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 mt-1 w-40 bg-[#0f1115] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
                              >
                                <button
                                  onClick={() => { setDeleteConfirm(p); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-700 opacity-30">
                  <Package className="w-10 h-10 mb-3" />
                  <p className="text-xs italic tracking-widest uppercase">Null Set</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Saved Drafts */}
        <div className="flex flex-col space-y-6">
          <div className="p-6 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[2rem] backdrop-blur-md shadow-xl flex-1 overflow-hidden flex flex-col">
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
                  <div key={d.id} className="p-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl space-y-4 group hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--ci-text)] text-sm line-clamp-1">{d.name || 'Unnamed Product'}</p>
                        <p className="text-[10px] text-[var(--ci-text-muted)] font-mono mt-0.5 tracking-tight">{d.sku || 'NO-SKU'}</p>
                      </div>
                      <button 
                        onClick={() => setDeleteDraftConfirm(d.id)}
                        className="p-2 hover:bg-red-500/10 text-[var(--ci-text-muted)] hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="px-2 py-1 bg-white/5 rounded-md border border-white/5">
                        <span className="text-[var(--ci-text-muted)] block">Category</span>
                        <span className="text-gray-300 font-bold truncate block">{d.categoryName || '—'}</span>
                      </div>
                      <div className="px-2 py-1 bg-white/5 rounded-md border border-white/5">
                        <span className="text-[var(--ci-text-muted)] block">Stock</span>
                        <span className="text-[var(--ci-text)] font-bold block">{d.initialStock} {d.uom}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button 
                        onClick={() => handleSubmitDraft(d)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-[var(--ci-text)] text-[10px] font-bold rounded-xl transition-all active:scale-95"
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => {
                          setNewProduct({ name: d.name, sku: d.sku, categoryId: d.categoryId, uom: d.uom, initialStock: d.initialStock });
                          setIsModalOpen(true);
                          setError('');
                        }}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] text-[10px] font-bold rounded-xl transition-all border border-white/10"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[2rem] backdrop-blur-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--ci-text-muted)] mt-0.5" />
              <p className="text-[10px] text-[var(--ci-text-muted)] leading-relaxed italic">
                Product drafts are stored locally in your browser. Submitting a draft will register it permanently in the global SKU directory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-2xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[3rem] shadow-2xl overflow-hidden p-12">
              <div className="flex justify-between items-center mb-10 text-[var(--ci-text)]">
                <h2 className="text-3xl font-black italic tracking-tight flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30"><Plus className="w-8 h-8 text-[var(--ci-text)]" /></div>
                  Register SKU
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium mb-8">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Product Name</label>
                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. iPhone 15 Pro Titanium" className="w-full px-6 py-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[1.5rem] text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Unique SKU</label>
                    <input type="text" required value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} placeholder="SKU-XXXX-XXXX" className="w-full px-6 py-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[1.5rem] text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-bold placeholder:text-gray-700 uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Category</label>
                    <select required value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})} className="w-full px-6 py-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[1.5rem] text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold">
                      <option value="">Select Category...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Unit of Measure</label>
                    <select value={newProduct.uom} onChange={(e) => setNewProduct({...newProduct, uom: e.target.value})} className="w-full px-6 py-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[1.5rem] text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold">
                      <option value="PCS">Pieces (PCS)</option>
                      <option value="KG">Kilograms (KG)</option>
                      <option value="LTR">Liters (LTR)</option>
                      <option value="BOX">Boxes (BOX)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-[0.2em] mb-3">Opening Stock</label>
                    <input type="number" value={newProduct.initialStock} onChange={(e) => setNewProduct({...newProduct, initialStock: Number(e.target.value)})} placeholder="0" className="w-full px-6 py-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-[1.5rem] text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-center" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleSaveDraft} className="flex-1 py-5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" /> Save Draft
                  </button>
                  <button disabled={submitting} type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-[var(--ci-text)] rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 text-lg">
                    {submitting ? 'Registering...' : 'Register SKU'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                    <Package className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--ci-text)] uppercase tracking-tight">{selectedProduct?.name}</h2>
                    <p className="text-xs text-[var(--ci-text-muted)] uppercase tracking-widest font-black font-mono mt-1">{selectedProduct?.sku}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-widest mb-4">Stock Distribution</h3>
                  <div className="space-y-3">
                    {selectedProduct?.inventory && selectedProduct.inventory.length > 0 ? selectedProduct.inventory.map((inv: any) => (
                      <div key={inv.id} className="p-5 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl flex items-center justify-between hover:border-blue-500/30 transition-all border-l-4 border-l-blue-500">
                        <div>
                          <p className="font-bold text-[var(--ci-text)]">{inv.warehouse.name}</p>
                          <p className="text-[10px] text-[var(--ci-text-muted)] uppercase font-bold mt-1">{inv.warehouse.location}</p>
                        </div>
                        <p className="text-lg font-black text-blue-400">{inv.quantity} <span className="text-[10px] text-[var(--ci-text-muted)] font-bold uppercase">{selectedProduct?.uom}</span></p>
                      </div>
                    )) : (
                      <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <Package className="w-10 h-10 text-gray-800 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 italic">No distribution recorded</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl">
                    <span className="text-sm font-bold text-[var(--ci-text-muted)]">Opening (Base) Stock</span>
                    <span className="font-black text-[var(--ci-text)]">{selectedProduct?.initialStock} {selectedProduct?.uom}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !deleting && setDeleteConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-[var(--ci-bg)] border border-red-500/20 rounded-[2rem] shadow-2xl overflow-hidden p-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-[var(--ci-text)]">Delete Product?</h2>
              <p className="text-[var(--ci-text-muted)] mb-2">You are about to permanently delete <span className="text-[var(--ci-text)] font-bold">{deleteConfirm?.name}</span>.</p>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 py-4 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-2xl font-bold text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-all disabled:opacity-50">Cancel</button>
                <button onClick={handleDeleteProduct} disabled={deleting} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-[var(--ci-text)] rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deleteDraftConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteDraftConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[var(--ci-bg)] border border-[var(--ci-border)] rounded-[2.5rem] shadow-2xl p-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ci-text)] mb-2">Discard Draft?</h3>
              <p className="text-[var(--ci-text-muted)] text-sm mb-8">This will remove the product draft from your local storage.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteDraftConfirm(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-[var(--ci-text)] rounded-2xl font-bold transition-all border border-white/5">Cancel</button>
                <button 
                  onClick={() => { handleDeleteDraft(deleteDraftConfirm); setDeleteDraftConfirm(null); }}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-[var(--ci-text)] rounded-2xl font-bold transition-all shadow-lg shadow-red-600/30"
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
