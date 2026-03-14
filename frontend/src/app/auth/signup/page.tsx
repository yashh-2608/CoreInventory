'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';

export default function SignUpPage() {
  return (
    <AuthCard 
      title="Create Account" 
      subtitle="Join CoreInventory and streamline your warehouse"
    >
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <button 
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Log In</Link>
        </p>
      </form>
    </AuthCard>
  );
}
