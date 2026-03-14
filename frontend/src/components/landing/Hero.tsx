'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Hero: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'demo@coreinventory.com', 
                password: 'demo123' 
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Demo access failed');

        localStorage.setItem('token', data.token);
        router.push('/admin/dashboard');
    } catch (err) {
        console.error('Demo error:', err);
    } finally {
        setLoading(false);
    }
  };
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
          Digitize or Die: The Future of Inventory is Here.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Centralize, automate, and scale your e-commerce operations with **CoreInventory**. 
          Stop tracking in spreadsheets. Start leading in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Start Managing Inventory <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <button 
            onClick={handleDemo}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 backdrop-blur-md disabled:opacity-50"
          >
            {loading ? 'Entering Portal...' : 'View Dashboard Demo'} <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </motion.div>

      {/* Hero Glass Card Decoration */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-20 w-full max-w-6xl h-64 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10" />
        <div className="flex items-center justify-center h-full">
            <span className="text-gray-500 font-mono">DASHBOARD_PREVIEW_PLACEHOLDER</span>
        </div>
      </motion.div>
    </section>
  );
};
