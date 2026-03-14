'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

interface SignupFormProps {
  onToggleLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess(true);
      // User said "if i sign up then it back to home page"
      setTimeout(() => {
        window.location.href = '/'; // Go back to top of landing page
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="w-full max-w-md mx-auto p-12 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
            <p className="text-gray-400 mb-8">Your workspace has been initialized. You can now log in to the portal.</p>
            <button 
                onClick={onToggleLogin}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg"
            >
                Proceed to Login
            </button>
        </div>
      );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-2">Create Account</h2>
      <p className="text-gray-400 mb-8 text-sm">Join the next generation of inventory control</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@company.com"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Secure Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          <ShieldCheck className="w-5 h-5" /> {loading ? 'Initializing...' : 'Initialize Workspace'}
        </button>

        <p className="text-center text-sm text-gray-400 pt-4">
          Already have an account? <button type="button" onClick={onToggleLogin} className="text-blue-400 hover:text-blue-300 font-bold underline decoration-blue-500/30 underline-offset-4">Log In Instead</button>
        </p>
      </form>
    </div>
  );
};
