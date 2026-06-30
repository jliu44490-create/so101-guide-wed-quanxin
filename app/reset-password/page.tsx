'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const isJa = usePathname()?.startsWith('/ja') ?? false

  const t = isJa
    ? {
        brandTitle: 'LVJIN の新しいパスワードを設定',
        pwShort: 'パスワードは 6 文字以上',
        mismatch: 'パスワードが一致しません',
        commClosed: 'コミュニティは準備中',
        backendOff: 'アカウント機能はまだ接続されていません。チュートリアルは通常どおり閲覧できます。',
        backHome: 'ホームへ戻る',
        updated: 'パスワードを更新しました',
        updatedSub: 'パスワードを変更し、ログインしました。',
        enterSite: 'サイトへ進む',
        verifying: 'リセットリンクを確認中…',
        invalid: 'リンクが無効または期限切れ',
        invalidSub: 'このリセットリンクは期限切れか使用済みの可能性があります。リセットメールを再送してください。',
        reapply: 'リセットメールを再送する',
        backLogin: 'ログインに戻る',
        setTitle: '新しいパスワードを設定',
        setSub: 'アカウントに新しいパスワードを設定します。設定後すぐに有効になります。',
        newPw: '新しいパスワード',
        pwPlaceholder: '6 文字以上',
        hidePw: 'パスワードを隠す',
        showPw: 'パスワードを表示',
        confirmPw: '新しいパスワード（確認）',
        confirmPlaceholder: 'もう一度入力',
        updating: '更新中…',
        updateBtn: 'パスワードを更新'
      }
    : {
        brandTitle: '设置新的 LVJIN 密码',
        pwShort: '密码至少 6 位',
        mismatch: '两次输入的密码不一致',
        commClosed: '社区暂未开放',
        backendOff: '账号服务还没接通。教程内容仍可正常访问。',
        backHome: '返回首页',
        updated: '密码已更新',
        updatedSub: '你的密码已成功修改,并且已登录。',
        enterSite: '进入站点',
        verifying: '正在验证重置链接…',
        invalid: '链接无效或已过期',
        invalidSub: '这个重置链接可能已过期或已被使用。请重新申请一封重置邮件。',
        reapply: '重新申请重置',
        backLogin: '返回登录',
        setTitle: '设置新密码',
        setSub: '为你的账号设置一个新密码,设置后将立即生效。',
        newPw: '新密码',
        pwPlaceholder: '至少 6 位',
        hidePw: '隐藏密码',
        showPw: '显示密码',
        confirmPw: '确认新密码',
        confirmPlaceholder: '再次输入新密码',
        updating: '更新中…',
        updateBtn: '更新密码'
      }

  const homeHref = isJa ? '/ja' : '/'
  const loginHref = isJa ? '/ja/login' : '/login'
  const forgotHref = isJa ? '/ja/forgot-password' : '/forgot-password'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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
    if (!validPassword) return toast.error(t.pwShort)
    if (!matches) return toast.error(t.mismatch)
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
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle={t.brandTitle}>
        <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" />
            <h2 className="text-lg font-semibold">{t.commClosed}</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.backendOff}</p>
          <Button asChild size="sm" variant="outline">
            <Link href={homeHref}>{t.backHome}</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  // ── Success ──
  if (done) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle={t.brandTitle}>
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t.updated}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.updatedSub}</p>
          </div>
          <Button
            onClick={() => router.replace(homeHref)}
            className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25"
          >
            {t.enterSite}
          </Button>
        </div>
      </AuthShell>
    )
  }

  // ── Still verifying the recovery link ──
  if (!ready || grace) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle={t.brandTitle}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t.verifying}</p>
        </div>
      </AuthShell>
    )
  }

  // ── Link invalid / expired (no session was established) ──
  if (!isLoggedIn) {
    return (
      <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle={t.brandTitle}>
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 ring-1 ring-destructive/30">
            <ShieldAlert className="size-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t.invalid}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.invalidSub}</p>
          </div>
          <Button asChild className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25">
            <Link href={forgotHref}>{t.reapply}</Link>
          </Button>
          <Link
            href={loginHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t.backLogin}
          </Link>
        </div>
      </AuthShell>
    )
  }

  // ── New password form ──
  return (
    <AuthShell eyebrow="ACCOUNT RECOVERY" brandTitle={t.brandTitle}>
      <div className="space-y-7">
        <div className="space-y-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{t.setTitle}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.setSub}</p>
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
              {t.newPw}
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
                placeholder={t.pwPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={passwordError || undefined}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePw : t.showPw}
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
              {t.confirmPw}
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
                placeholder={t.confirmPlaceholder}
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
            {confirmError && <p className="text-xs text-destructive">{t.mismatch}</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting || !canSubmit}
            className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t.updating}
              </>
            ) : (
              t.updateBtn
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}
