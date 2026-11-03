import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Albums & Photo Galleries',
  description:
    'Browse photo albums of past convocations, alumni meets, tech fests, guest lectures, and cultural celebrations at Baba Farid Group of Institutions.',
  openGraph: {
    title: 'Event Photo Albums | BFGI Connect',
    description:
      'Relive special moments and events at Baba Farid Group of Institutions with our curated photo albums.',
    url: 'https://bfgiconnect.com/gallery/events',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/gallery/events',
  },
};

export default function EventsGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
