import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus & Event Gallery',
  description:
    'Explore memories, campus life, convocation ceremonies, academic blocks, sports tournaments, and alumni events at Baba Farid Group of Institutions (BFGI).',
  openGraph: {
    title: 'Campus & Event Gallery | BFGI Connect',
    description:
      'Browse through dynamic photo galleries of Baba Farid Group of Institutions campus life, student achievements, and alumni meets.',
    url: 'https://bfgiconnect.com/gallery',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
