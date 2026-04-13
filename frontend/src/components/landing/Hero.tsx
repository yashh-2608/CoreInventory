'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
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
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl w-full"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-[var(--ci-text)] font-[var(--font-playfair)] leading-[1.1] sm:leading-[0.95] tracking-tight">
          Stop Managing Inventory.
          <span className="block bg-gradient-to-r from-[var(--ci-accent)] via-[var(--ci-accent-2)] to-[#38bdf8] bg-clip-text text-transparent">
            Start Commanding It.
          </span>
        </h1>

        <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-[var(--ci-text-muted)] mt-6 mb-8 sm:mb-10 max-w-3xl mx-auto font-normal leading-relaxed transform-none not-italic px-2">
          CoreInventory unifies every product, movement, and warehouse signal into a single real-time control system&mdash;giving your team speed, accuracy, and complete clarity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl mx-auto px-4 sm:px-0">
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

        <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left w-full">
          {[
            ['Real-Time Sync', 'Everything updates instantly across all warehouses.'],
            ['Smart Insights', 'Turn raw inventory into actionable decisions.'],
            ['Enterprise-Ready', 'Secure, scalable, and built for growth.'],
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
