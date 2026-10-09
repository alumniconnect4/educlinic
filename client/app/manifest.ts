import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BFGI Connect - Baba Farid Group of Institutions Alumni Portal',
    short_name: 'BFGI Connect',
    description:
      'Official alumni networking platform for Baba Farid Group of Institutions (BFGI). Connect with alumni, mentors, events, and career opportunities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#800000',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo1.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
