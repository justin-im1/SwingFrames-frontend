import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from '../components/providers/Providers';
import { ErrorBoundary } from '../components/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Golf Swing Analyzer',
  description: 'Analyze and compare your golf swings with AI-powered insights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full w-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 h-screen w-screen overflow-hidden`}
        >
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
