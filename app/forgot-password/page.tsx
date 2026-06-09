'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Mail, MailCheck, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/use-auth'
import { isValidEmail } from '@/lib/email-utils'

export default function ForgotPasswordPage() {
  const { enabled, resetPasswordForEmail } = useAuth()

  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (resendIn <= 0) return
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => window.clearTimeout(id)
  }, [resendIn])

  const trimmed = email.trim()
  const validEmail = isValidEmail(trimmed)
  const emailError = touched && trimmed.length > 0 && !validEmail

  const send = async () => {
    setTouched(true)
    if (!validEmail) {
      toast.error('请输入有效邮箱')
      return
    }
    setSubmitting(true)
    const { error } = await resetPasswordForEmail(trimmed)
    setSubmitting(false)
    if (error) {
      toast.error(error)
      return
    }
    setSentTo(trimmed)
    setResendIn(45)
  }

  if (!enabled) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="重置你的 LVJIN 密码">
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

  if (sentTo) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="重置你的 LVJIN 密码">
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <MailCheck className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">查收重置邮件</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              如果 <strong className="break-all text-foreground">{sentTo}</strong>{' '}
              对应一个账号,我们已发送一封含重置链接的邮件。点击链接即可设置新密码。
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              {resendIn > 0 ? `${resendIn} 秒后可重发` : '没收到?检查垃圾邮件或重新发送'}
            </span>
            <button
              type="button"
              onClick={send}
              disabled={resendIn > 0 || submitting}
              className="shrink-0 font-medium text-foreground underline underline-offset-4 hover:text-primary disabled:opacity-50 disabled:no-underline"
            >
              {submitting ? '发送中…' : '重新发送'}
            </button>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="size-4" />
              返回登录
            </Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle="重置你的 LVJIN 密码">
      <div className="space-y-7">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">忘记密码</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            输入注册邮箱,我们会发送一封重置链接的邮件。
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            send()
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

          <Button
            type="submit"
            disabled={submitting || !validEmail}
            className="glow-primary-hover group relative h-11 w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                发送中…
              </>
            ) : (
              <>
                发送重置链接
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

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
