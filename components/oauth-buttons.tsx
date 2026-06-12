'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/use-auth'
import { oauthProviders as regionProviders, type OAuthProvider } from '@/lib/region'

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.15v3.18c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

/**
 * Social sign-in buttons, shared by /login and /signup.
 * `next` is the relative path to return to after the OAuth round-trip.
 * `providers` defaults to the region's set (empty in CN → renders nothing).
 */
export function OAuthButtons({
  next = '/',
  disabled,
  providers = regionProviders
}: {
  next?: string
  disabled?: boolean
  providers?: OAuthProvider[]
}) {
  const { signInWithGitHub, signInWithGoogle } = useAuth()
  const [busy, setBusy] = useState<'github' | 'google' | null>(null)

  if (providers.length === 0) return null

  const go = async (provider: 'github' | 'google') => {
    setBusy(provider)
    const redirect =
      typeof window !== 'undefined'
        ? `${window.location.origin}${next.startsWith('/') ? next : '/'}`
        : undefined
    if (provider === 'github') await signInWithGitHub(redirect)
    else await signInWithGoogle(redirect)
    // The page is about to redirect away; clear the spinner just in case.
    setTimeout(() => setBusy(null), 4000)
  }

  return (
    <div className="space-y-2.5">
      {providers.includes('github') && (
        <button
          type="button"
          onClick={() => go('github')}
          disabled={disabled || busy !== null}
          className="group relative flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border/70 bg-card/60 px-4 text-sm font-medium transition-all hover:border-border hover:bg-card disabled:opacity-60"
        >
          {busy === 'github' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitHubMark className="size-4" />
          )}
          <span>使用 GitHub 继续</span>
          <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </button>
      )}

      {providers.includes('google') && (
        <button
          type="button"
          onClick={() => go('google')}
          disabled={disabled || busy !== null}
          className="group relative flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border/70 bg-card/60 px-4 text-sm font-medium transition-all hover:border-border hover:bg-card disabled:opacity-60"
        >
          {busy === 'google' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleMark className="size-4" />
          )}
          <span>使用 Google 继续</span>
          <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </button>
      )}
    </div>
  )
}
