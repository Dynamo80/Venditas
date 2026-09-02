import './globals.css';
import { Newsreader, Public_Sans } from 'next/font/google';
import { Nav, SiteFooter } from './Chrome.jsx';

/**
 * Fonts are fetched at build time and served from our own origin.
 *
 * Linking Google's CSS directly would send every visitor's IP address to Google
 * purely to load a typeface — a real complaint under EU data protection law and
 * an odd thing to do on a site whose selling point is careful data handling.
 */
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata = {
  title: 'Venditas — branded CVs in four seconds',
  description:
    "Drop in a candidate CV, get it back in your agency template with the contact details stripped. Built for recruitment agencies.",
  metadataBase: new URL('https://venditas.in'),
  openGraph: {
    title: 'Venditas — branded CVs in four seconds',
    description:
      "Candidate CVs in your template, with the contact details stripped. Five a day free.",
    type: 'website',
    url: 'https://venditas.in',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body>
        <Nav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
