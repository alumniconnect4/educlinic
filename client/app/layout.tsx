import type { Metadata } from 'next';
import { Roboto, Lora } from 'next/font/google';
import './globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import ToastProvider from '@/utils/ToastProvider';
import SplashScreen from '@/components/SplashScreen';
import AuthProvider from '@/components/AuthProvider';
import FloatingBell from '@/components/FloatingBell';
import FloatingChatbot from '@/components/FloatingChatbot';

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
});

const siteUrl = 'https://bfgiconnect.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BFGI Connect | Baba Farid Group of Institutions Alumni Network',
    template: '%s | BFGI Connect',
  },
  description:
    'BFGI Connect is the official alumni network portal for Baba Farid Group of Institutions (BFGI). Connect with fellow alumni, discover networking events, explore campus life, research & incubation programs, and advance your career.',
  keywords: [
    'BFGI',
    'Baba Farid Group of Institutions',
    'BFGI Connect',
    'BFGI Alumni',
    'BFCET',
    'Baba Farid College Bathinda',
    'BFGI Alumni Network',
    'BFGI Placements',
    'BFGI Events',
    'BFGI Research and Development',
    'BFGI Incubation Centre',
    'Alumni Community',
    'Bathinda Colleges',
  ],
  authors: [
    {
      name: 'Baba Farid Group of Institutions',
      url: siteUrl,
    },
  ],
  creator: 'Baba Farid Group of Institutions',
  publisher: 'Baba Farid Group of Institutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'BFGI Connect',
    title: 'BFGI Connect | Baba Farid Group of Institutions Alumni Network',
    description:
      'Official alumni networking platform for Baba Farid Group of Institutions (BFGI). Reconnect with classmates, find mentors, join reunions, and explore research & career opportunities.',
    images: [
      {
        url: '/logo1.png',
        width: 800,
        height: 250,
        alt: 'Baba Farid Group of Institutions Official Logo',
      },
      {
        url: '/logo3.png',
        width: 600,
        height: 200,
        alt: 'BFGI Connect Emblem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BFGI Connect | Baba Farid Group of Institutions Alumni Network',
    description:
      'Official alumni network for Baba Farid Group of Institutions (BFGI). Connect with alumni, mentors, events, and career opportunities.',
    images: ['/logo1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.jpg' },
      { url: '/logo1.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.jpg' },
      { url: '/logo1.png', type: 'image/png' },
    ],
    shortcut: ['/icon.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${siteUrl}/#organization`,
        name: 'Baba Farid Group of Institutions',
        alternateName: 'BFGI',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo1.png`,
          caption: 'Baba Farid Group of Institutions Logo',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Muktsar Road, Deon',
          addressLocality: 'Bathinda',
          addressRegion: 'Punjab',
          postalCode: '151001',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Alumni Relations',
          email: 'alumni@bfcet.com',
          availableLanguage: ['English', 'Hindi', 'Punjabi'],
        },
        sameAs: [
          'https://www.facebook.com/bfgiofficial',
          'https://www.instagram.com/bfgiofficial',
          'https://www.linkedin.com/school/baba-farid-group-of-institutions/',
          'https://twitter.com/bfgiofficial',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'BFGI Connect',
        description:
          'Official alumni network portal for Baba Farid Group of Institutions (BFGI).',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SplashScreen />
          <ConditionalNavbar />
          <ToastProvider>{children}</ToastProvider>
          <ConditionalFooter />
          <FloatingBell />
          <FloatingChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
