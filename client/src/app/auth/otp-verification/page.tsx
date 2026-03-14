'use client';

import React, { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;

    setLoading(true);
    setError('');
    
    try {
      const email = sessionStorage.getItem('resetEmail');
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      // Success - Redirect to Reset Password Page
      window.location.href = '/auth/reset-password';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value !== "") {
        (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = (e.currentTarget.previousSibling as HTMLInputElement);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      const email = sessionStorage.getItem('resetEmail');
      const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Resend failed');
      alert('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
        <AuthCard 
        title="Verify Identity" 
        subtitle="We've sent a 6-digit code to your email address"
        >
        <div className="space-y-8">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
            <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
                <input
                key={index}
                type="text"
                maxLength={1}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                />
            ))}
            </div>

            <div className="space-y-4">
                <button 
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length < 6}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-4 text-xs">
                    <button 
                        onClick={handleResend}
                        disabled={loading}
                        className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                    </button>
                    <span className="text-gray-700">|</span>
                    <p className="text-gray-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-500" /> Secure verification
                    </p>
                </div>
            </div>
        </div>
        </AuthCard>
    </div>
  );
}
