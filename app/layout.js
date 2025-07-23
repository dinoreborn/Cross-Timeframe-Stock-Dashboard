import './globals.css'

export const metadata = {
  title: 'Cross-Timeframe Stock Dashboard',
  description: 'Analyze stock performance across multiple timeframes with advanced sector insights',
  keywords: ['stock analysis', 'financial dashboard', 'investment research', 'market data'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Cross-Timeframe Stock Dashboard',
    description: 'Professional stock analysis tool with cross-timeframe insights',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cross-Timeframe Stock Dashboard',
    description: 'Professional stock analysis tool with cross-timeframe insights',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}