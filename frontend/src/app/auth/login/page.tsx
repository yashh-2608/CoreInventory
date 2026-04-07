'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 z-20">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--ci-accent-2)]/20 blur-[120px] rounded-full" />
      <LoginForm
        onToggleSignup={() => {
          window.location.href = '/auth/signup';
        }}
        onForgotPassword={() => {
          window.location.href = '/auth/forgot-password';
        }}
      />
    </div>
  );
}
