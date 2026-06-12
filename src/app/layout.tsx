import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#53BDEB',
};

export const metadata: Metadata = {
  title: {
    default: 'LabCore — Laboratory Information Management System',
    template: '%s | LabCore LIMS',
  },
  description:
    'Production-grade LIMS for diagnostic centers, pathology labs, and health checkup facilities. Workflow-driven, audit-ready, SaaS-ready.',
  openGraph: {
    type: 'website',
    siteName: 'LabCore',
    title: 'LabCore LIMS',
    description: 'Enterprise laboratory information management system',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>{children}</body>
    </html>
  );
}
