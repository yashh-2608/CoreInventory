'use client';

import React, { useState, useEffect } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      window.location.href = '/auth/forgot-password';
    } else {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setSuccess(true);
      sessionStorage.removeItem('resetEmail');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard title="Password Reset" subtitle="Your security credentials have been updated">
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <p className="text-[var(--ci-text-muted)]">You can now sign in to your dashboard with your new password.</p>
          <Link 
            href="/" 
            className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all"
          >
            Go to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="New Password" subtitle="Enter a strong, unique password for your account">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
        
        <div>
          <label className="block text-xs font-bold text-[var(--ci-text-muted)] uppercase tracking-widest mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ci-text-muted)]" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-[var(--ci-text)] placeholder:text-[var(--ci-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--ci-text-muted)] uppercase tracking-widest mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ci-text-muted)]" />
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-[var(--ci-text)] placeholder:text-[var(--ci-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Set New Password'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthCard>
  );
}
