import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile & Academic Records | BFGI Connect',
  description:
    'Manage your official institutional profile, contact details, academic batch, and department records at Baba Farid Group of Institutions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

