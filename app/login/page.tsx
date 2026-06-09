'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { OAuthButtons } from '@/components/oauth-buttons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/use-auth'
import { isValidEmail } from '@/lib/email-utils'

function LoginContent() {
  const router = useRouter()
  const search = useSearchParams()
  const { enabled, ready, isLoggedIn, signInWithPassword } = useAuth()

  const next = search.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // If the user is already signed in, bounce them to the destination.
  useEffect(() => {
    if (ready && isLoggedIn) router.replace(next)
  }, [ready, isLoggedIn, next, router])

  const trimmed = email.trim()
  const validEmail = isValidEmail(trimmed)
  const validPassword = password.length >= 6
  const emailError = touched && trimmed.length > 0 && !validEmail
  const passwordError = touched && password.length > 0 && !validPassword

  const handlePasswordLogin = async () => {
    setTouched(true)
    if (!validEmail || !validPassword) {
      toast.error('请检查邮箱与密码(密码至少 6 位)')
      return
    }
    setSubmitting(true)
    const { error } = await signInWithPassword(trimmed, password)
    setSubmitting(false)
    if (error) {
      toast.error(error === 'Invalid login credentials' ? '邮箱或密码错误' : error)
      return
    }
    toast.success('登录成功')
    router.replace(next)
  }

  const signupHref = `/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`

  // Backend not configured → friendly placeholder so the page never 500s.
  if (!enabled) {
    return (
      <AuthShell>
        <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" />
            <h2 className="text-lg font-semibold">社区暂未开放</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            登录服务还没接通(<code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code>{' '}
            未配置)。教程内容仍可正常访问。
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="space-y-7">
        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">登录 LVJIN</h2>
          <p className="text-sm text-muted-foreground">
            还没账号?{' '}
            <Link
              href={signupHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              立即注册
            </Link>
          </p>
        </div>

        <OAuthButtons next={next} disabled={submitting} />

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            或使用邮箱
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* Email + password form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handlePasswordLogin()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              邮箱
            </Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={emailError || undefined}
                className="h-11 pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                密码
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                忘记密码?
              </Link>
            </div>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={passwordError || undefined}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="glow-primary-hover group relative h-11 w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                登录中…
              </>
            ) : (
              <>
                登录
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          继续即表示同意我们的
          <a href="#" className="mx-1 underline underline-offset-2 hover:text-foreground">
            服务条款
          </a>
          与
          <a href="#" className="mx-1 underline underline-offset-2 hover:text-foreground">
            隐私政策
          </a>
          。
        </p>
      </div>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
