import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import { PwaInstaller } from '@/components/pwa-installer';

export const metadata: Metadata = {
  title: 'Lens - Daily Photo Challenge',
  description: 'Join daily photo challenges, vote on submissions, and climb the leaderboard.',
  manifest: '/site.webmanifest',
  icons: {
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=Lobster&family=Merriweather&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
          <PwaInstaller />
        </AuthProvider>
      </body>
    </html>
  );
}
