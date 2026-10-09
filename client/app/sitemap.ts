import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bfgiconnect.com';
  const currentDate = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery/events`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery/campus-life`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research/rnd-cell`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research/incubation`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic routes (fetched if backend API is available)
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://api.bfgiconnect.com/api';
    const eventsRes = await fetch(`${apiUrl}/events`, {
      next: { revalidate: 3600 },
    });
    if (eventsRes.ok) {
      const data = await eventsRes.json();
      const events = Array.isArray(data) ? data : data.events || [];
      const eventEntries: MetadataRoute.Sitemap = events.map((event: any) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updatedAt ? new Date(event.updatedAt) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      dynamicRoutes = [...dynamicRoutes, ...eventEntries];
    }
  } catch {
    // Fallback gracefully without breaking sitemap generation
  }

  return [...staticRoutes, ...dynamicRoutes];
}
