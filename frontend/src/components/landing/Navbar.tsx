'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Package, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToAuth = () => {
    setIsMobileMenuOpen(false);
    document.getElementById('auth-portal')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between ci-panel px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl tracking-tighter text-[var(--ci-text)]">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--ci-accent)]" />
          <span>CoreInventory</span>
        </Link>

        {/* Desktop Navigation */}
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

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={scrollToAuth}
            className="px-6 py-2.5 bg-[var(--ci-accent)] hover:brightness-110 text-white rounded-full text-sm font-semibold transition-all active:scale-95 shadow-[0_0_25px_var(--ci-shadow)]"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-[var(--ci-panel)] border border-[var(--ci-border)] hover:bg-[var(--ci-panel-strong)] transition-all text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-[var(--ci-panel)] border border-[var(--ci-border)] hover:bg-[var(--ci-panel-strong)] text-[var(--ci-text-muted)]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 p-5 ci-panel flex flex-col gap-4 shadow-2xl md:hidden"
          >
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#features" className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] font-medium">Features</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#how-to-use" className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] font-medium">How to Use</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#solutions" className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] font-medium">Solutions</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href="#pricing" className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] font-medium">Pricing</Link>
            <button
              onClick={scrollToAuth}
              className="w-full mt-2 px-6 py-3 bg-[var(--ci-accent)] text-white rounded-full text-sm font-semibold flex items-center justify-center"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
