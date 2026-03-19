'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Globe, RefreshCcw, Mail, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('General');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for inputs
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

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
    { name: 'Logout', icon: LogOut },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    router.push('/');
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-[var(--ci-text)]">System Settings</h1>
        <p className="text-[var(--ci-text-muted)] text-sm font-medium">Configure your personal preferences and platform behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
            {tabs.map((item) => (
                <button 
                    key={item.name}
                    onClick={() => {
                        if (item.name === 'Logout') { handleLogout(); return; }
                        setActiveTab(item.name);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-[10px] text-sm font-semibold transition-all duration-200 ${
                        item.name === 'Logout'
                        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        : activeTab === item.name 
                        ? 'bg-[var(--ci-accent)] text-white shadow-lg shadow-blue-600/20' 
                        : 'text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] hover:bg-[rgba(59,130,246,0.08)]'
                    }`}
                >
                    <item.icon className="w-4 h-4" /> {item.name}
                </button>
            ))}
        </div>

        <div className="md:col-span-3 p-10 bg-[var(--ci-card)] backdrop-blur-[12px] border border-[var(--ci-border)] rounded-[14px] space-y-10 shadow-2xl">
            {activeTab === 'General' && (
                <section className="animate-in fade-in duration-300">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3 italic">
                        <Globe className="w-6 h-6 text-blue-400" /> Platform Configuration
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-[var(--ci-glass)] rounded-[10px] border border-[var(--ci-border)] group hover:opacity-90 transition-all">
                            <div>
                                <p className="text-sm font-semibold text-[var(--ci-text)]">Low Stock Threshold</p>
                                <p className="text-xs text-[var(--ci-text-muted)] font-medium mt-1">Global alert limit for SKU replenishment.</p>
                            </div>
                            <input 
                                type="number" 
                                value={localSettings.lowStockThreshold} 
                                onChange={(e) => setLocalSettings({...localSettings, lowStockThreshold: parseInt(e.target.value)})}
                                className="w-24 px-4 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-[10px] text-sm font-bold text-center text-[var(--ci-accent)] focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                            />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-[var(--ci-glass)] rounded-[10px] border border-[var(--ci-border)] group hover:opacity-90 transition-all">
                            <div>
                                <p className="text-sm font-semibold text-[var(--ci-text)]">Base Currency</p>
                                <p className="text-xs text-[var(--ci-text-muted)] font-medium mt-1">Primary format for financial valuations.</p>
                            </div>
                            <select 
                                value={localSettings.currency}
                                onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
                                className="w-40 px-4 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-[10px] text-sm font-semibold appearance-none text-center text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option>USD ($)</option>
                                <option>INR (₹)</option>
                                <option>EUR (€)</option>
                                <option>GBP (£)</option>
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
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-[var(--ci-text)] shadow-2xl shadow-blue-600/30">
                                    {user.name[0]}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black">{user.name}</h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[var(--ci-glass)] rounded-lg border border-[var(--ci-border)] w-fit">
                                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{user.role}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-[var(--ci-glass)] rounded-2xl border border-[var(--ci-border)]">
                                    <label className="block text-[10px] font-bold text-[var(--ci-text-muted)] uppercase tracking-widest mb-3">Verified Email</label>
                                    <div className="flex items-center gap-3 text-[var(--ci-text)] font-bold">
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
                            <div key={i} className="flex items-center justify-between p-6 bg-[var(--ci-glass)] rounded-2xl border border-[var(--ci-border)]">
                                <div>
                                    <p className="text-sm font-bold text-[var(--ci-text)]">{item.label}</p>
                                    <p className="text-xs text-[var(--ci-text-muted)] font-medium mt-1">{item.desc}</p>
                                </div>
                                <div 
                                    onClick={() => {
                                        const key = i === 0 ? 'inventoryRecap' : i === 1 ? 'criticalAlerts' : 'logisticsSync';
                                        setLocalSettings({
                                            ...localSettings,
                                            notifications: { ...localSettings.notifications, [key]: !(localSettings.notifications as any)[key] }
                                        });
                                    }}
                                    className={`w-12 h-7 rounded-full flex items-center px-1.5 cursor-pointer transition-all ${
                                        (localSettings.notifications as any)[i === 0 ? 'inventoryRecap' : i === 1 ? 'criticalAlerts' : 'logisticsSync']
                                        ? 'bg-blue-600 shadow-lg shadow-blue-600/20'
                                        : 'bg-white/10'
                                    }`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                                        (localSettings.notifications as any)[i === 0 ? 'inventoryRecap' : i === 1 ? 'criticalAlerts' : 'logisticsSync']
                                        ? 'ml-auto'
                                        : 'ml-0'
                                    }`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {saveSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Changes synchronized successfully
                </motion.div>
            )}
            <div className="pt-10 flex justify-end gap-4 border-t border-[var(--ci-border)]">
                <button 
                    onClick={() => setLocalSettings(settings)}
                    className="px-8 py-3.5 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-2xl text-sm font-bold hover:opacity-80 transition-all text-[var(--ci-text-muted)]"
                >
                    Discard
                </button>
                <button 
                    onClick={() => {
                        updateSettings(localSettings);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                    }}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                >
                    Synchronize Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
