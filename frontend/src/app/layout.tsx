import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { WaveAnimation } from '@/components/landing/WaveAnimation';

export const metadata: Metadata = {
  title: 'CoreInventory - Smart Inventory Management',
  description: 'Centralize, automate, and scale your warehouse operations with CoreInventory.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased app-shell"
        style={{ fontFamily: 'var(--font-questrial), ui-sans-serif, system-ui, sans-serif' }}
      >
        <ThemeProvider>
          <div className="app-background" aria-hidden="true">
            <WaveAnimation />
          </div>
          <div className="app-content">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
