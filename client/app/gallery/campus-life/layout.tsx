import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Life Gallery',
  description:
    'Experience the vibrant campus atmosphere, modern labs, lush green grounds, library, and student activities across Baba Farid Group of Institutions.',
  openGraph: {
    title: 'Campus Life Gallery | Baba Farid Group of Institutions',
    description:
      'A visual journey through student life, world-class infrastructure, and memorable experiences at BFGI.',
    url: 'https://bfgiconnect.com/gallery/campus-life',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/gallery/campus-life',
  },
};

export default function CampusLifeGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
