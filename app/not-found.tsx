import Link from 'next/link'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 mesh-bg" />
        <div className="relative z-10 mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
            <Compass className="h-10 w-10 text-primary animate-slow-pulse" />
          </div>
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            404 · Not Found
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">页面走丢了</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            这里没有你要找的页面。也许它被移动了、还没出现，或者你刚刚走错了 USB 口 🔌
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-1.5 h-4 w-4" />
                回到首页
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/learn">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                查看学习路径
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
