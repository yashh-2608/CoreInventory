'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { SearchProvider } from '@/context/SearchContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const isDemo = localStorage.getItem('demoMode') === 'true';

    if (!token && !isDemo) {
      window.location.href = '/';
    } else {
      setIsAuthorized(true);
    }
  }, []);

  if (!mounted || !isAuthorized) {
    return (
      <div className="min-h-screen text-[var(--ci-text)] flex items-center justify-center">
        <div className="ci-panel px-6 py-5 text-sm text-[var(--ci-text-muted)]">Loading workspace...</div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <SearchProvider>
        <div className="min-h-screen text-[var(--ci-text)] transition-colors duration-300">
          <Sidebar />
          <div className="pl-64 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SearchProvider>
    </SettingsProvider>
  );
}
