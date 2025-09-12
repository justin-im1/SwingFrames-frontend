'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    // <div className="h-screen w-screen bg-green-500 overflow-hidden">
    //   <Navbar />
    <main className="h-full overflow-auto">
      <div className="h-full">{children}</div>
    </main>
    // </div>
  );
}
