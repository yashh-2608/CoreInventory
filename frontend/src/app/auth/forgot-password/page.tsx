'use client';

import React, { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      sessionStorage.setItem('resetEmail', email);
      window.location.href = '/auth/otp-verification';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Reset Password" 
      subtitle="Enter your email to receive a 6-digit verification code"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-[var(--ci-text-muted)] uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ci-text-muted)]" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-[var(--ci-text)] placeholder:text-[var(--ci-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP Code'} <ArrowRight className="w-4 h-4" />
        </button>

        <Link href="/" className="flex items-center justify-center gap-2 text-sm text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </form>
    </AuthCard>
  );
}
