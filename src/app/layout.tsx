import type { Metadata } from 'next';
import { Rajdhani, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// Display face — condensed, technical, HUD-like. Used for headings only.
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

// Body face — neutral and highly readable.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

// Utility face — prices, timers, station codes. Gives numbers a HUD feel.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Arena 51 Gaming Lounge | Book PS5, PC & VR Gaming Sessions',
  description: 'Book premium gaming stations at Arena 51 — PS5, Gaming PCs, VR & more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
