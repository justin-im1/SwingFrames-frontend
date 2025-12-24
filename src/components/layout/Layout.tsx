'use client';

import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="h-full overflow-auto bg-black">
      <div className="h-full">{children}</div>
    </main>
  );
}
