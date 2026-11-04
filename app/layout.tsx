import type { Metadata } from 'next';
import { Syne, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CineLumina - Rede Social de Filmes',
  description: 'Rede social cinematográfica para amantes de cinema compartilharem seus filmes favoritos, explorarem perfis e interagirem com comentários.',
  openGraph: {
    title: 'CineLumina - Rede Social de Filmes',
    description: 'Rede social cinematográfica para amantes de cinema compartilharem seus filmes favoritos, explorarem perfis e interagirem com comentários.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineLumina - Rede Social de Filmes',
    description: 'Rede social cinematográfica para amantes de cinema compartilharem seus filmes favoritos, explorarem perfis e interagirem com comentários.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${syne.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
    >
      <body
        className="bg-[#0A0A0E] text-[#F8FAFC] antialiased selection:bg-[#F43F5E] selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
