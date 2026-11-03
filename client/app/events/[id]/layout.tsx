import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details',
  description:
    'View full details, schedules, speakers, venue, and registration information for BFGI alumni events and workshops.',
  openGraph: {
    title: 'BFGI Alumni Event Details | BFGI Connect',
    description:
      'Register for upcoming Baba Farid Group of Institutions alumni events, webinars, and networking meetups.',
    images: ['/logo1.png'],
  },
};

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
