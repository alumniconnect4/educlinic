'use client';
import { usePathname } from 'next/navigation';
import Footer from './Home/Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === '/auth') return null;
  return <Footer />;
}
