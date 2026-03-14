'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
};
