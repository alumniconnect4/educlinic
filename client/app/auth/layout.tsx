import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Login & Registration',
  description:
    'Sign in to BFGI Connect alumni portal or register your alumni profile to connect with classmates, mentors, and the alumni chat network.',
  openGraph: {
    title: 'Alumni Login & Registration | BFGI Connect',
    description:
      'Access your BFGI Alumni account to join discussions, browse events, and network with fellow alumni.',
    url: 'https://bfgiconnect.com/auth',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/auth',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
