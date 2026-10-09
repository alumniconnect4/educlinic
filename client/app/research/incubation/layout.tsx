import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Incubation & Entrepreneurship Centre',
  description:
    'BFGI Incubation Centre nurtures student and alumni startups through mentorship, seed funding, lab facilities, and industry partnerships in Punjab.',
  openGraph: {
    title: 'Incubation & Entrepreneurship Centre | BFGI Connect',
    description:
      'Explore startup incubation, student entrepreneurship, and innovation grants at Baba Farid Group of Institutions.',
    url: 'https://bfgiconnect.com/research/incubation',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/research/incubation',
  },
};

export default function IncubationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
