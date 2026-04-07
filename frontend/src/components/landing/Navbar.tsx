'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Package, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const scrollToAuth = () => {
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between ci-panel px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-[var(--ci-text)]">
          <Package className="w-8 h-8 text-[var(--ci-accent)]" />
          <span>CoreInventory</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ci-text-muted)]">
          <Link href="#features" className="hover:text-[var(--ci-text)] transition-colors">Features</Link>
          <Link href="#how-to-use" className="hover:text-[var(--ci-text)] transition-colors">How to Use</Link>
          <Link href="#solutions" className="hover:text-[var(--ci-text)] transition-colors">Solutions</Link>
          <Link href="#pricing" className="hover:text-[var(--ci-text)] transition-colors">Pricing</Link>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-[var(--ci-panel)] border border-[var(--ci-border)] hover:bg-[var(--ci-panel-strong)] transition-all text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={scrollToAuth}
            className="px-6 py-2.5 bg-[var(--ci-accent)] hover:brightness-110 text-white rounded-full text-sm font-semibold transition-all active:scale-95 shadow-[0_0_25px_var(--ci-shadow)]"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
