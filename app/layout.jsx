import './globals.css';

export const metadata = {
  title: 'Bellwether — AI API reliability index',
  description:
    'Independent, continuously measured latency and availability for OpenAI, Anthropic, Google, Groq, Mistral and Cohere. Free to read, always.',
  metadataBase: new URL('https://venditas.in'),
  openGraph: {
    title: 'Bellwether — AI API reliability index',
    description:
      'Independent latency and availability measurements for the major AI provider APIs.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
