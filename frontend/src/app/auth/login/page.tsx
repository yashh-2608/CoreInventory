'use client';

import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Enter your credentials to access your dashboard"
    >
      <form className="space-y-6">
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <Link href="/auth/forgot-password" name="forgot-password" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded bg-white/5 border-white/10" id="remember" />
            <label htmlFor="remember" className="text-sm text-gray-400">Remember me</label>
        </div>

        <button 
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          Sign In
        </button>

        <p className="text-center text-sm text-gray-400">
          Don't have an account? <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">Create one</Link>
        </p>
      </form>
    </AuthCard>
  );
}
