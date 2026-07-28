import type { Metadata } from 'next';
import { Roboto, Lora } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import ToastProvider from '@/utils/ToastProvider';
import SplashScreen from '@/components/SplashScreen';
import AuthProvider from '@/components/AuthProvider';
import FloatingBell from '@/components/FloatingBell';
import FloatingChatbot from '@/components/FloatingChatbot';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BFGI Alumni Association',
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
      className={`${roboto.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SplashScreen />
          <ConditionalNavbar />
          <ToastProvider>{children}</ToastProvider>
          <ConditionalFooter />
          <FloatingBell />
          <FloatingChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
