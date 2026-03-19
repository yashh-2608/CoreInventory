'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onToggleSignup: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-[var(--ci-card)] border border-[var(--ci-border)] rounded-3xl backdrop-blur-xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-2 text-[var(--ci-text)]">Welcome Back</h2>
      <p className="text-[var(--ci-text-muted)] mb-8 text-sm">Enter your credentials to access your dashboard</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[var(--ci-text-muted)] uppercase tracking-widest">Password</label>
            <button 
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-blue-500 hover:text-blue-400 font-bold"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ci-text-muted)]" />
            <input 
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-[var(--ci-text)] placeholder:text-[var(--ci-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ci-text-muted)] hover:text-[var(--ci-text)]">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-blue-600/30 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In to Portal'}
        </button>

        <p className="text-center text-sm text-[var(--ci-text-muted)] pt-4">
          New to the platform? <button type="button" onClick={onToggleSignup} className="text-blue-500 hover:text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">Create Account</button>
        </p>
      </form>
    </div>
  );
};
