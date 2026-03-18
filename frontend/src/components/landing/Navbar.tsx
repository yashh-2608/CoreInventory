'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Sun, Moon } from 'lucide-react';
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
      className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between max-w-7xl mx-auto"
    >
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
        <Package className="w-8 h-8 text-blue-500" />
        <span>CoreInventory</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ci-text-muted)]">
        <Link href="#features" className="hover:text-[var(--ci-text)] transition-colors">Features</Link>
        <Link href="#how-to-use" className="hover:text-[var(--ci-text)] transition-colors">How to Use</Link>
        <Link href="#solutions" className="hover:text-[var(--ci-text)] transition-colors">Solutions</Link>
        <Link href="#pricing" className="hover:text-[var(--ci-text)] transition-colors">Pricing</Link>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-[var(--ci-glass)] border border-[var(--ci-border)] hover:opacity-80 transition-all text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={scrollToAuth}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all px-6 py-2.5 active:scale-95"
        >
          Get Started
        </button>
      </div>
    </motion.nav>
  );
};
