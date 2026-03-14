'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Database, Globe, RefreshCcw, Mail, ShieldCheck } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Profile') {
      fetchUser();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: 'General', icon: Globe },
    { name: 'Profile', icon: User },
    { name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-400 text-sm font-medium">Configure your personal preferences and platform behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
            {tabs.map((item) => (
                <button 
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === item.name 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <item.icon className="w-4 h-4" /> {item.name}
                </button>
            ))}
        </div>

        <div className="md:col-span-3 p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md space-y-10 shadow-2xl">
            {activeTab === 'General' && (
                <section className="animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
                        <Globe className="w-6 h-6 text-blue-400" /> Platform Configuration
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                            <div>
                                <p className="text-sm font-bold text-white">Low Stock Threshold</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">Global alert limit for SKU replenishment.</p>
                            </div>
                            <input type="number" defaultValue={10} className="w-24 px-4 py-3 bg-[#020617] border border-white/10 rounded-xl text-sm font-black text-center text-blue-400" />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                            <div>
                                <p className="text-sm font-bold text-white">Base Currency</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">Primary format for financial valuations.</p>
                            </div>
                            <select className="w-32 px-4 py-3 bg-[#020617] border border-white/10 rounded-xl text-sm font-bold appearance-none text-center">
                                <option>USD ($)</option>
                                <option>INR (₹)</option>
                                <option>EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'Profile' && (
                <section className="animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
                        <User className="w-6 h-6 text-emerald-400" /> Account Identity
                    </h3>
                    {loading ? (
                        <div className="py-20 flex justify-center"><RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" /></div>
                    ) : user && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-8 p-8 bg-blue-600/5 rounded-3xl border border-blue-500/10">
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-600/30">
                                    {user.name[0]}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black">{user.name}</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 w-fit">
                                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{user.role}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Verified Email</label>
                                    <div className="flex items-center gap-3 text-white font-bold">
                                        <Mail className="w-4 h-4 text-gray-500" /> {user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'Notifications' && (
                <section className="animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
                        <Bell className="w-6 h-6 text-purple-400" /> Dispatch Registry
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Inventory Recap', desc: 'Daily automated stock summaries' },
                            { label: 'Critical Alerts', desc: 'Instant low stock notifications' },
                            { label: 'Logistics Sync', desc: 'Transfer and delivery updates' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.label}</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{item.desc}</p>
                                </div>
                                <div className="w-12 h-7 bg-blue-600 rounded-full flex items-center px-1.5 cursor-pointer shadow-lg shadow-blue-600/20">
                                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="pt-10 flex justify-end gap-4 border-t border-white/5">
                <button className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all text-gray-400">Discard</button>
                <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/30 active:scale-95">Synchronize Changes</button>
            </div>
        </div>
      </div>
    </div>
  );
}
