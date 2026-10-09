import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Baba Farid Group of Institutions Alumni Relations Office. Reach out for alumni queries, transcripts, events, and campus visits.',
  openGraph: {
    title: 'Contact BFGI Alumni Relations | BFGI Connect',
    description:
      'Contact Baba Farid Group of Institutions Alumni Office at Muktsar Road, Bathinda, Punjab.',
    url: 'https://bfgiconnect.com/contact',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
