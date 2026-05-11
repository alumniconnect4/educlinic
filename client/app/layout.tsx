import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import ToastProvider from '@/utils/ToastProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = { 
  title: 'Alumni Portal',
  description: 'Alumni Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ConditionalNavbar />
        <ToastProvider>
        {children}
      </ToastProvider>
        <ConditionalFooter />
      </body>
    </html>
  );
}
