import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wasserballturnier – Spielübersicht',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="h-full overflow-hidden" lang="de">
      <body className="h-full overflow-hidden bg-[#f4f1ea] font-sans text-[#1c1c1c]">
        {children}
      </body>
    </html>
  );
}
