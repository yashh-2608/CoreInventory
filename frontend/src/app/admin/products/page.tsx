'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  X, 
  ChevronRight,
  Package,
  AlertCircle
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    categoryId: '',
    uom: 'PCS',
    initialStock: 0
  });

  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/products/categories', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!prodRes.ok || !catRes.ok) throw new Error('Failed to fetch data');
      
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      setProducts(prodData);
      setCategories(catData);
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/export/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_inventory.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || p.category.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Catalog</h1>
          <p className="text-gray-400 text-sm font-medium">Global SKU directory and inventory distribution hub.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all text-gray-300"
            >
                <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
                onClick={() => { setError(''); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
                <Plus className="w-5 h-5" /> Register SKU
            </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium placeholder:text-gray-600"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold min-w-[200px]"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Live Inventory</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">UOM</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)}
                  className="hover:bg-white/[0.04] transition-colors group cursor-pointer active:bg-white/[0.06]"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Package className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg">{p.name}</p>
                            <p className="text-xs text-gray-500 font-mono tracking-wider">{p.sku}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-400">{p.category.name}</td>
                  <td className="px-8 py-6">
                    {(() => {
                        const totalStock = p.initialStock + p.inventory.reduce((acc, inv) => acc + inv.quantity, 0);
                        return (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-bold text-blue-500/50 uppercase">Total Inventory</span>
                                    <span className="text-sm font-bold">{totalStock}</span>
                                </div>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-500" 
                                        style={{ width: `${Math.min((totalStock / 1000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })()}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400">
                        {p.uom}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-12"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic tracking-tight flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    Register SKU
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium mb-8">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Product Identity</label>
                        <input 
                            type="text" 
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            placeholder="e.g. iPhone 15 Pro Titanium" 
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Unique SKU</label>
                        <input 
                            type="text" 
                            required
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                            placeholder="SKU-XXXX-XXXX" 
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-bold placeholder:text-gray-700 uppercase"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Classification</label>
                        <select 
                            required
                            value={newProduct.categoryId}
                            onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        >
                            <option value="">Select Category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Unit of Measure</label>
                        <select 
                            value={newProduct.uom}
                            onChange={(e) => setNewProduct({...newProduct, uom: e.target.value})}
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                        >
                            <option value="PCS">Pieces (PCS)</option>
                            <option value="KG">Kilograms (KG)</option>
                            <option value="LTR">Liters (LTR)</option>
                            <option value="BOX">Boxes (BOX)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Opening Stock</label>
                        <input 
                            type="number" 
                            value={newProduct.initialStock}
                            onChange={(e) => setNewProduct({...newProduct, initialStock: Number(e.target.value)})}
                            placeholder="0" 
                            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-center"
                        />
                    </div>
                </div>
                <button 
                  disabled={submitting}
                  type="submit" 
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-50 text-lg"
                >
                  {submitting ? 'Authenticating SKU...' : 'Register SKU'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-10 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl shadow-xl shadow-blue-500/5">
                        <Package className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-black font-mono mt-1">{selectedProduct.sku}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                 <div>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Stock Distribution</h3>
                    <div className="space-y-3">
                        {selectedProduct.inventory.length > 0 ? selectedProduct.inventory.map((inv: any) => (
                            <div key={inv.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all border-l-4 border-l-blue-500">
                                <div>
                                    <p className="font-bold text-white">{inv.warehouse.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-tight">{inv.warehouse.location}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-blue-400">{inv.quantity} <span className="text-[10px] text-gray-500 font-bold uppercase">{selectedProduct.uom}</span></p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                                <Package className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-20" />
                                <p className="text-sm text-gray-600 italic">Not distributed in any warehouse hubs yet</p>
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                     <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl">
                         <span className="text-sm font-bold text-gray-400">Opening (Base) Stock</span>
                         <span className="font-black text-white">{selectedProduct.initialStock} {selectedProduct.uom}</span>
                     </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
