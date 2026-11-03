import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research & Development (R&D) Cell',
  description:
    'Discover Research & Development initiatives, Centers of Excellence (CoE), research publications, patents, and faculty innovation at Baba Farid Group of Institutions.',
  openGraph: {
    title: 'Research & Development (R&D) Cell | BFGI Connect',
    description:
      'Learn about cutting-edge research projects, international collaborations, and patents at Baba Farid Group of Institutions.',
    url: 'https://bfgiconnect.com/research/rnd-cell',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/research/rnd-cell',
  },
};

export default function RNDCellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
