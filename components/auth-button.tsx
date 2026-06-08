'use client'

import { useState } from 'react'
import { Github, LogOut, Mail, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/use-auth'

type AuthLocale = 'zh' | 'ja'

const labels = {
  zh: {
    userFallback: '我',
    accountMenu: '账号菜单',
    signedOut: '已退出登录',
    signOut: '退出登录',
    invalidEmail: '请输入有效邮箱',
    sendFailed: '发送失败，请稍后再试',
    login: '登录',
    title: '登录 / 注册',
    description:
      '登录后即可在每章和报错下方提问、回答、点赞。无需密码，只通过邮箱登录链接验证。',
    githubLogin: '用 GitHub 登录',
    emailDivider: '或用邮箱',
    sentPrefix: '登录链接已发送到',
    sentHint: '打开邮件点击链接即可登录。若没看到，请检查垃圾邮件箱。',
    sending: '发送中',
    sendLink: '发链接',
    policy:
      '登录即表示同意社区行为准则：友善、不灌水、不发广告。邮箱仅用于登录验证与必要通知。'
  },
  ja: {
    userFallback: '私',
    accountMenu: 'アカウントメニュー',
    signedOut: 'ログアウトしました',
    signOut: 'ログアウト',
    invalidEmail: '有効なメールアドレスを入力してください',
    sendFailed: '送信に失敗しました。少し時間を置いて再試行してください',
    login: 'ログイン',
    title: 'ログイン / 登録',
    description:
      'ログインすると各章やエラー診断の下で質問、回答、いいねができます。パスワード不要のメールリンク方式です。',
    githubLogin: 'GitHub でログイン',
    emailDivider: 'またはメールで',
    sentPrefix: 'ログインリンクを送信しました:',
    sentHint: 'メール内のリンクを開くとログインできます。届かない場合は迷惑メールも確認してください。',
    sending: '送信中',
    sendLink: '送信',
    policy:
      'ログインするとコミュニティガイドラインに同意したものとみなします。メールはログイン認証と必要な通知にのみ使用します。'
  }
} as const

/**
 * Header auth control.
 *  - backend not configured → renders nothing (community layer dormant)
 *  - logged out → "登录" button opening a dialog (GitHub + email magic link)
 *  - logged in  → avatar dropdown with username + sign out
 */
export function AuthButton({ locale = 'zh' }: { locale?: AuthLocale }) {
  const t = labels[locale]
  const { enabled, ready, isLoggedIn, profile, user, signInWithGitHub, signInWithEmail, signOut } =
    useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Community backend not set up yet — keep the header clean.
  if (!enabled) return null
  // Avoid a flash of the login button before we know the session.
  if (!ready) return <div className="h-9 w-16" aria-hidden />

  if (isLoggedIn) {
    const name = profile?.username ?? user?.email ?? t.userFallback
    const initial = name.slice(0, 1).toUpperCase()
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 rounded-full p-0.5 transition-transform hover:scale-105"
            aria-label={t.accountMenu}
          >
            <Avatar className="h-8 w-8">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await signOut()
              toast.success(t.signedOut)
            }}
            className="text-muted-foreground"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            {t.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const handleEmail = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error(t.invalidEmail)
      return
    }
    setSending(true)
    const { error } = await signInWithEmail(trimmed)
    setSending(false)
    if (error) {
      toast.error(t.sendFailed)
    } else {
      setSent(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <UserIcon className="h-3.5 w-3.5" />
          {t.login}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* GitHub login only appears once the project owner has configured a
             GitHub OAuth app in Supabase AND set NEXT_PUBLIC_ENABLE_GITHUB_AUTH=true.
             Defaults off so a fresh email-only deployment never shows a button
             that would 500 against an unconfigured provider. */}
          {process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH === 'true' && (
            <>
              <Button onClick={signInWithGitHub} className="w-full gap-2" size="lg">
                <Github className="h-4 w-4" />
                {t.githubLogin}
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                {t.emailDivider}
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {sent ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center text-sm">
              {t.sentPrefix} <strong>{email}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.sentHint}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEmail()
                }}
                className="h-10"
              />
              <Button
                onClick={handleEmail}
                disabled={sending}
                variant="secondary"
                className="h-10 shrink-0 gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                {sending ? t.sending : t.sendLink}
              </Button>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            {t.policy}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
