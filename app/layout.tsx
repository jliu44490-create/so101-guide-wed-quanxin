import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CommandPalette } from '@/components/command-palette'
import { HtmlLangSync } from '@/components/html-lang-sync'
import { siteConfig } from '@/lib/site-config'
import { analyticsEnabled } from '@/lib/region'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  applicationName: siteConfig.name,
  category: 'education',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ]
  },
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      'ja-JP': '/ja'
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1626' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-clip bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <HtmlLangSync />
          {children}
          <CommandPalette />
          <ScrollToTop />
          <Toaster position="bottom-right" richColors closeButton />
          {process.env.NODE_ENV === 'production' && analyticsEnabled && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
