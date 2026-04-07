'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowToUse } from '@/components/landing/HowToUse';
import { Solutions } from '@/components/landing/Solutions';
import { Pricing } from '@/components/landing/Pricing';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <main className="relative min-h-screen text-[var(--ci-text)] overflow-x-hidden transition-colors duration-300">
      <Navbar />
      
      <div className="relative z-10 w-full">
        <Hero />
        
        {/* Integrated Authentication Section */}
        <section id="auth-portal" className="py-24 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        One Secure Entry Point for Your <span className="text-blue-500">Inventory Ecosystem.</span>
                    </h2>
                    <p className="text-lg text-[var(--ci-text-muted)]">
                        Join thousands of warehouse managers who have transformed their manual operations into a high-octane digital engine.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--ci-border)] bg-[var(--ci-panel)] text-[var(--ci-text)] flex items-center justify-center text-[10px] font-bold shadow-[0_8px_20px_var(--ci-shadow)]">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-[var(--ci-text-muted)] flex items-center">
                            Trusted by 500+ global warehouses
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -inset-4 bg-[radial-gradient(circle,_var(--ci-shadow)_0%,_transparent_70%)] blur-3xl opacity-70" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={authMode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {authMode === 'login' ? (
                                <LoginForm 
                                    onToggleSignup={() => setAuthMode('signup')} 
                                    onForgotPassword={() => window.location.href = '/auth/forgot-password'}
                                />
                            ) : (
                                <SignupForm 
                                    onToggleLogin={() => setAuthMode('login')} 
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>

        <Features />
        <HowToUse />
        <Solutions />
        <Pricing />
      </div>
      
      <footer className="py-12 border-t border-[var(--ci-border)] text-center text-[var(--ci-text-muted)] text-sm relative z-10 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.04))]">
        <p>&copy; 2026 CoreInventory SaaS. All rights reserved.</p>
      </footer>
    </main>
  );
}
