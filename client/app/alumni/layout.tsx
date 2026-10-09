import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni Directory & Portal',
  description:
    'Connect directly with alumni members and access the BFGI Alumni Community.',
};

export default function AlumniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
