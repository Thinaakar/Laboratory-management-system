import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

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
    siteName: 'Xangam LIMS',
    title: 'Xangam LIMS',
    description: 'Enterprise laboratory information management system',
  },
  icons: {
    icon: '/images/xangam-logo.png',
    apple: '/images/xangam-logo.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${manrope.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
