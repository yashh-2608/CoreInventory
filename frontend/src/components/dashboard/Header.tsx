'use client';

import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-[#020617]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-400">
            <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search products, warehouses, or orders..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <Bell className="w-5 h-5" />
        </button>
        <div className="h-10 w-[1px] bg-white/5 mx-2" />
        <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-[1px]">
                <div className="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Yash S.</p>
                <p className="text-xs text-gray-500">Inventory Manager</p>
            </div>
        </div>
      </div>
    </header>
  );
};
