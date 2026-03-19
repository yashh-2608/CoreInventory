'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
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
        localStorage.setItem('demoMode', 'true');
        router.push('/admin/dashboard');
    } catch (err) {
        console.error('Demo error:', err);
    } finally {
        setLoading(false);
    }
  };

  const scrollToAuth = () => {
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent font-[var(--font-playfair)]">
          Digitize or Die: The Future of Inventory is Here.
        </h1>
        <p className="text-xl md:text-2xl text-[var(--ci-text-muted)] mb-10 max-w-2xl mx-auto font-normal leading-[1.7]">
          Centralize, automate, and scale your e-commerce operations with CoreInventory. 
          Stop tracking in spreadsheets. Start leading in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToAuth}
            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Start Managing Inventory <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDemo}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-[var(--ci-glass)] hover:opacity-80 text-[var(--ci-text)] border border-[var(--ci-border)] rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 backdrop-blur-md disabled:opacity-50"
          >
            {loading ? 'Entering Portal...' : 'View Dashboard Demo'} <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
