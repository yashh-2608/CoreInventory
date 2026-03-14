'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { WaveAnimation } from '@/components/landing/WaveAnimation';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Solutions } from '@/components/landing/Solutions';
import { Pricing } from '@/components/landing/Pricing';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <main className="relative min-h-screen text-white overflow-x-hidden">
      <Navbar />
      <WaveAnimation />
      
      <div className="relative z-10 w-full">
        <Hero />
        
        {/* Integrated Authentication Section */}
        <section id="auth-portal" className="py-24 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        One Secure Entry Point for Your <span className="text-blue-500">Inventory Ecosystem.</span>
                    </h2>
                    <p className="text-lg text-gray-400">
                        Join thousands of warehouse managers who have transformed their manual operations into a high-octane digital engine.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                            Trusted by 500+ global warehouses
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 blur-3xl opacity-20" />
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
        <Solutions />
        <Pricing />
      </div>
      
      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm relative z-10">
        <p>&copy; 2026 CoreInventory SaaS. All rights reserved.</p>
      </footer>
    </main>
  );
}
