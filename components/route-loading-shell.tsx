'use client'

import { LoaderCircle } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

interface RouteLoadingShellProps {
  label: string
}

export function RouteLoadingShell({ label }: RouteLoadingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div
          className="flex items-center gap-3 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>{label}</span>
        </div>
      </main>
      <Footer />
    </div>
  )
}
