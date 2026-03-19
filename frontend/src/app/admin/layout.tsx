'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

import { SearchProvider } from '@/context/SearchContext';
import { SettingsProvider } from '@/context/SettingsContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <SearchProvider>
      <div className="min-h-screen bg-[var(--ci-bg)] text-[var(--ci-text)] transition-colors duration-300">
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
