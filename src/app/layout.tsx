import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

// Premium heading font: Poppins for modern, clean aesthetics
const headingFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

// Body font: Inter for excellent readability and accessibility
const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Optional: Accent font for special emphasis (e.g., taglines, badges)
const accentFont = localFont({
  src: [
    {
      path: '../../public/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-accent',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Revenue Leak Funnel - Stop Losing Money to Response Delays',
  description:
    'Calculate your monthly revenue leak caused by slow lead response times. Discover how fast follow-up can transform your sales operations and close the gap between ad spend and revenue.',
  keywords: [
    'revenue recovery',
    'lead response',
    'sales operations',
    'revenue leak calculator',
    'lead generation',
    'sales funnel',
    'conversion optimization',
  ],
  authors: [{ name: 'Revenue Operations' }],
  creator: 'Revenue Operations',
  publisher: 'Revenue Operations',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://revenue-leak-funnel.com',
    siteName: 'Revenue Leak Funnel',
    title: 'Revenue Leak Funnel - Stop Losing Money to Response Delays',
    description:
      'Calculate your monthly revenue leak caused by slow lead response times. Discover how fast follow-up can transform your sales operations.',
    images: [
      {
        url: 'https://revenue-leak-funnel.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Revenue Leak Funnel Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Leak Funnel - Stop Losing Money to Response Delays',
    description:
      'Calculate your monthly revenue leak caused by slow lead response times.',
    images: ['https://revenue-leak-funnel.com/og-image.png'],
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        'scroll-smooth',
        headingFont.variable,
        bodyFont.variable,
        accentFont.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <meta charSet='utf-8' />
        <meta name='theme-color' content='#0a0a0b' />
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/site.webmanifest' />
      </head>
      <body className='min-h-full flex flex-col bg-background text-foreground'>
        {children}
      </body>
    </html>
  );
}
