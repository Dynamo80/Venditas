import './globals.css';

export const metadata = {
  title: 'Venditas — branded CVs in four seconds',
  description:
    'Drop in a candidate CV, get it back in your agency template with contact details stripped. Built for recruitment agencies.',
  metadataBase: new URL('https://venditas.in'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Public+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
