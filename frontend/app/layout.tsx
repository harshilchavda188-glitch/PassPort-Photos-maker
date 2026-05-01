import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Passport-Size-Image-Maker - Create Perfect Passport Photos with AI',
  description: 'Say goodbye to the hassle of creating passport size images. Built with Python, Flask, HTML, CSS & JavaScript. Remove backgrounds and add solid colors in seconds!',
  keywords: 'passport size image maker, passport photo maker, background remover, AI photo editor, passport photo, visa photo, ID photo, Python, Flask',
  authors: [{ name: 'Passport-Size-Image-Maker' }],
  openGraph: {
    title: 'Passport-Size-Image-Maker - AI-Powered Photo Tools',
    description: 'Create perfect passport photos with cutting-edge technology. Built with Python, Flask, HTML, CSS & JavaScript.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
