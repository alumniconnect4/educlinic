import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, MapPin, Compass, Calendar, Image as ImageIcon, BookOpen, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HTML Sitemap',
  description:
    'Overview and index of all pages, alumni directories, event galleries, and research portals on BFGI Connect (Baba Farid Group of Institutions).',
  alternates: {
    canonical: 'https://bfgiconnect.com/sitemap',
  },
};

interface SitemapLink {
  name: string;
  href: string;
  description: string;
  external?: boolean;
}

interface SitemapSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  links: SitemapLink[];
}

const sitemapSections: SitemapSection[] = [
  {
    title: 'Main Navigation',
    icon: Compass,
    links: [
      { name: 'Home', href: '/', description: 'Alumni portal homepage, featured stories, and map' },
      { name: 'About Us', href: '/about', description: 'Leadership messages and about Baba Farid Group of Institutions' },
      { name: 'Events & Reunions', href: '/events', description: 'Upcoming alumni gatherings, webinars, and conferences' },
      { name: 'Alumni Directory / Portal', href: '/alumni', description: 'Search and connect with BFGI alumni' },
      { name: 'Contact Alumni Cell', href: '/contact', description: 'Reach out to BFGI Alumni Relations Office' },
      { name: 'Alumni Login / Registration', href: '/auth', description: 'Sign in or register your alumni profile' },
    ],
  },
  {
    title: 'Galleries & Memories',
    icon: ImageIcon,
    links: [
      { name: 'Campus & Event Gallery', href: '/gallery', description: 'Full photo galleries and album collections' },
      { name: 'Event Albums', href: '/gallery/events', description: 'Convocations, tech fests, and alumni meets' },
      { name: 'Campus Life Gallery', href: '/gallery/campus-life', description: 'Campus infrastructure, labs, and student activities' },
    ],
  },
  {
    title: 'Research, Innovation & Incubation',
    icon: BookOpen,
    links: [
      { name: 'Research & Development Cell', href: '/research/rnd-cell', description: 'Patents, publications, and Centers of Excellence' },
      { name: 'Incubation & Entrepreneurship', href: '/research/incubation', description: 'Startup incubation, mentorship, and seed grants' },
    ],
  },
  {
    title: 'Community & Chat',
    icon: Users,
    links: [
      { name: 'BFGI Alumni Chat App (app.bfgiconnect.com)', href: 'https://app.bfgiconnect.com', external: true, description: 'Real-time chat and networking platform' },
      { name: 'XML Sitemap Feed (sitemap.xml)', href: '/sitemap.xml', external: true, description: 'Machine-readable XML sitemap for search engines' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-wider text-[#a62025] uppercase mb-2">
            Site Navigation & Index
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
            BFGI Connect Sitemap
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
            Find everything on the official Baba Farid Group of Institutions Alumni Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sitemapSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
                  <div className="p-2.5 rounded-lg bg-red-50 text-[#a62025]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>

                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="group">
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-base font-semibold text-gray-800 group-hover:text-[#a62025] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{link.name}</span>
                        {link.external && <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#a62025]" />}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
