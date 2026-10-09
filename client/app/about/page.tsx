import React from 'react';
import type { Metadata } from 'next';
import LeadershipMessagesSection from '@/components/About/LeadershipMessage';
import { leadershipMessages } from '@/components/About/messagesData';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Baba Farid Group of Institutions (BFGI), leadership messages from Chairman Dr. Gurmeet Singh Dhaliwal and Campus Director Prof. (Dr.) M.P. Poonia, and the vision of BFGI Alumni Association.',
  openGraph: {
    title: 'About BFGI Alumni Association | Baba Farid Group of Institutions',
    description:
      'Learn about the mission, heritage, and leadership of Baba Farid Group of Institutions (BFGI) and the BFGI Connect Alumni Network.',
    url: 'https://bfgiconnect.com/about',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <LeadershipMessagesSection messages={leadershipMessages} />
    </main>
  );
}
