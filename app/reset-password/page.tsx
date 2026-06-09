'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/use-auth'
import { scorePassword } from '@/lib/email-utils'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { enabled, ready, isLoggedIn, updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Give the implicit flow a moment to consume the recovery token from the URL
  // hash before we decide the link is invalid.
  const [grace, setGrace] = useState(true)
  useEffect(() => {
    const id = window.setTimeout(() => setGrace(false), 1200)
    return () => window.clearTimeout(id)
  }, [])

  const validPassword = password.length >= 6
  const matches = confirm.length > 0 && confirm === password
  const strength = scorePassword(password)
  const passwordError = touched && password.length > 0 && !validPassword
  const confirmError = touched && confirm.length > 0 && !matches
  const canSubmit = validPassword && matches

  const submit = async () => {
    setTouched(true)
    if (!validPassword) return toast.error('密码至少 6 位')
    if (!matches) return toast.error('两次输入的密码不一致')
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) {
      toast.error(error)
      return
    }
    setDone(true)
  }

  // ── Backend missing ──
  if (!enabled) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="设置新的 LVJIN 密码">
        <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" />
            <h2 className="text-lg font-semibold">社区暂未开放</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            账号服务还没接通。教程内容仍可正常访问。
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  // ── Success ──
  if (done) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="设置新的 LVJIN 密码">
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">密码已更新</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              你的密码已成功修改,并且已登录。
            </p>
          </div>
          <Button
            onClick={() => router.replace('/')}
            className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25"
          >
            进入站点
          </Button>
        </div>
      </AuthShell>
    )
  }

  // ── Still verifying the recovery link ──
  if (!ready || grace) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="设置新的 LVJIN 密码">
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在验证重置链接…</p>
        </div>
      </AuthShell>
    )
  }

  // ── Link invalid / expired (no session was established) ──
  if (!isLoggedIn) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="设置新的 LVJIN 密码">
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 ring-1 ring-destructive/30">
            <ShieldAlert className="size-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">链接无效或已过期</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              这个重置链接可能已过期或已被使用。请重新申请一封重置邮件。
            </p>
          </div>
          <Button asChild className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25">
            <Link href="/forgot-password">重新申请重置</Link>
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            返回登录
          </Link>
        </div>
      </AuthShell>
    )
  }

  // ── New password form ──
  return (
    <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="设置新的 LVJIN 密码">
      <div className="space-y-7">
        <div className="space-y-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">设置新密码</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            为你的账号设置一个新密码,设置后将立即生效。
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              新密码
            </Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
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
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex h-1 flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-full flex-1 rounded-full transition-colors',
                        i < strength.score ? strength.barClass : 'bg-border'
                      )}
                    />
                  ))}
                </div>
                <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
              确认新密码
            </Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="再次输入新密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={confirmError || undefined}
                className="h-11 pl-10 pr-10"
              />
              {matches && (
                <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-400" />
              )}
            </div>
            {confirmError && <p className="text-xs text-destructive">两次输入的密码不一致</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting || !canSubmit}
            className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                更新中…
              </>
            ) : (
              '更新密码'
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}
