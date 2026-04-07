'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiUrl, readApiResponse } from '@/lib/api';

export const Hero: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@coreinventory.com',
          password: 'demo123',
        }),
      });

      const data = await readApiResponse<{ token: string }>(res);
      localStorage.setItem('token', data.token);
      localStorage.setItem('demoMode', 'true');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = () => {
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--ci-panel)] border border-[var(--ci-border)] text-xs font-semibold tracking-[0.18em] uppercase text-[var(--ci-text-muted)] mb-8 shadow-[0_16px_40px_var(--ci-shadow)]">
          <Sparkles className="w-4 h-4 text-[var(--ci-accent)]" />
          Real-time inventory intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[var(--ci-text)] font-[var(--font-playfair)] leading-[0.95]">
          A Frozen Explosion of
          <span className="block bg-gradient-to-r from-[var(--ci-accent)] via-[var(--ci-accent-2)] to-[#38bdf8] bg-clip-text text-transparent">
            Products, Motion, and Data.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-[var(--ci-text-muted)] mb-10 max-w-3xl mx-auto font-normal leading-[1.7]">
          CoreInventory turns every box, transfer, receipt, alert, and warehouse signal into one high-energy operating surface,
          so your team can control inventory with speed, accuracy, and confidence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToAuth}
            className="w-full sm:w-auto px-8 py-4 bg-[var(--ci-accent)] hover:brightness-110 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_30px_var(--ci-shadow)]"
          >
            Start Managing Inventory <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-[var(--ci-panel)] hover:bg-[var(--ci-panel-strong)] text-[var(--ci-text)] border border-[var(--ci-border)] rounded-full font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 backdrop-blur-md disabled:opacity-50"
          >
            {loading ? 'Entering Portal...' : 'View Dashboard Demo'} <Play className="w-5 h-5 fill-current" />
          </button>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            ['Hundreds of product signals', 'Products, data particles, and flows synchronized in one control plane.'],
            ['Cinematic operational visibility', 'Receipts, deliveries, transfers, and alerts stay connected in real time.'],
            ['Dark and light mode parity', 'Every panel, card, and surface now inherits a consistent theme language.'],
          ].map(([title, text]) => (
            <div key={title} className="ci-panel p-5">
              <p className="text-sm font-semibold text-[var(--ci-text)] mb-2">{title}</p>
              <p className="text-sm text-[var(--ci-text-muted)] leading-6">{text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
