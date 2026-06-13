import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${playfair.variable} min-h-screen auth-premium-layout`}>{children}</div>;
}
