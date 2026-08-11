import type { Metadata } from 'next';
import { Archivo, Oswald } from 'next/font/google';
import Footer from '@/lib/components/Footer';
import Navbar from '@/lib/components/Navbar';
import I18nProvider from '@/app/components/I18nProvider';

import '@/app/globals.css';

const archivo = Archivo({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wasserballturnier 2026',
  description:
    '🚨 Das Wasserballturnier 2026 in Elten. Wir sehen uns am 15.08.2026! 💦',
  openGraph: {
    title: 'Wasserballturnier 2026',
    description:
      '🚨 Das Wasserballturnier 2026 in Elten. Wir sehen uns am 15.08.2026! 💦',
    url: 'https://wasserball.feuerwehremmerich.de',
    siteName: 'Wasserballturnier 2026',
    images: [
      {
        url: 'https://wasserball.feuerwehremmerich.de/cms/uploads/Social_Media_Post_2c37bbdd91.png',
        width: 1080,
        height: 1080,
        alt: 'Flyer zum Wasserballturnier 2026 in Elten',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body
        className={`${archivo.variable} ${oswald.variable} antialiased min-h-screen flex flex-col`}
      >
        <I18nProvider locale={locale ?? 'en'}>
          <Navbar />
          <div className="pointer-events-none fixed inset-0 -z-10 flyer-grid opacity-55" />
          <main className="mx-auto flex w-full max-w-7xl flex-grow px-4 pb-10 pt-6 sm:px-3 lg:px-8 lg:pb-14 lg:pt-8">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
