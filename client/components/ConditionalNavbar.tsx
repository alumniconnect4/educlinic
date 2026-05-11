'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Home/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (pathname === '/auth') return null;
  return <Navbar />;
}
