'use client';

import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  AlertCircle
} from 'lucide-react';

const mockLedger = [
  { id: '1', product: 'iPhone 15 Pro', type: 'Receipt', change: '+50', warehouse: 'London East', ref: 'REC-2026-001', date: '2026-03-14 10:30' },
  { id: '2', product: 'MacBook Air M2', type: 'Delivery', change: '-5', warehouse: 'Manchester North', ref: 'DEL-2026-042', date: '2026-03-14 09:12' },
  { id: '3', product: 'iPhone 15 Pro', type: 'Transfer Out', change: '-10', warehouse: 'London East', ref: 'TRF-2026-005', date: '2026-03-13 16:45' },
  { id: '4', product: 'iPhone 15 Pro', type: 'Transfer In', change: '+10', warehouse: 'Birmingham Central', ref: 'TRF-2026-005', date: '2026-03-13 16:45' },
  { id: '5', product: 'Sony WH-1000XM5', type: 'Adjustment', change: '-2', warehouse: 'London East', ref: 'ADJ-2026-012', date: '2026-03-13 14:20' },
];

export default function LedgerPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventory Ledger</h1>
          <p className="text-gray-400">Immutable audit log of every stock movement in the system.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">
            <Archive className="w-4 h-4" /> Export Audit Log
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search ledger by product, reference, or warehouse..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300">
                <Calendar className="w-4 h-4" /> Date Range
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300">
                <Filter className="w-4 h-4" /> Op Type
            </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5">
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Entry ID</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Product</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Type</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Change</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Warehouse</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Reference</th>
                        <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                    {mockLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-5 font-mono text-gray-500">#{entry.id.padStart(4, '0')}</td>
                            <td className="px-6 py-5 font-semibold">{entry.product}</td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    {entry.type.includes('Receipt') && <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                                    {entry.type.includes('Delivery') && <ArrowUpRight className="w-4 h-4 text-purple-400" />}
                                    {entry.type.includes('Transfer') && <ArrowLeftRight className="w-4 h-4 text-orange-400" />}
                                    {entry.type.includes('Adjustment') && <AlertCircle className="w-4 h-4 text-red-400" />}
                                    <span className="text-gray-400 uppercase text-[10px] font-bold tracking-tight">{entry.type}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className={`font-bold ${entry.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {entry.change}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-gray-400 text-xs">{entry.warehouse}</td>
                            <td className="px-6 py-5 text-blue-400 font-medium cursor-pointer hover:underline">{entry.ref}</td>
                            <td className="px-6 py-5 text-gray-500 text-xs whitespace-nowrap">{entry.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
