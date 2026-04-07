'use client';

import React, { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { apiUrl, readApiResponse } from '@/lib/api';

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
      if (!email) {
        throw new Error('Reset session not found. Please request a new code.');
      }

      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await readApiResponse<{ message: string; resetToken: string }>(res);
      sessionStorage.setItem('resetToken', data.resetToken);
      window.location.href = '/auth/reset-password';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (Number.isNaN(Number(element.value))) return false;
    setOtp(otp.map((digit, idx) => (idx === index ? element.value : digit)));
    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousSibling as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      const email = sessionStorage.getItem('resetEmail');
      if (!email) {
        throw new Error('Reset session not found. Please request a new code.');
      }

      const res = await fetch(apiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await readApiResponse<{ message: string }>(res);
      alert('A new code has been sent to your email.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Resend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Verify Identity"
      subtitle="We've sent a 6-digit code to your email address"
    >
      <div className="space-y-8">
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-full h-14 bg-[var(--ci-glass)] border border-[var(--ci-border)] rounded-xl text-center text-xl font-bold text-[var(--ci-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
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
              className="text-[var(--ci-text-muted)] hover:text-[var(--ci-text)] flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
            <span className="text-[var(--ci-border)]">|</span>
            <p className="text-[var(--ci-text-muted)] flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" /> Secure verification
            </p>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
