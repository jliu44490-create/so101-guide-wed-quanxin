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

/**
 * Header auth control.
 *  - backend not configured → renders nothing (community layer dormant)
 *  - logged out → "登录" button opening a dialog (GitHub + email magic link)
 *  - logged in  → avatar dropdown with username + sign out
 */
export function AuthButton() {
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
    const name = profile?.username ?? user?.email ?? '我'
    const initial = name.slice(0, 1).toUpperCase()
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 rounded-full p-0.5 transition-transform hover:scale-105"
            aria-label="账号菜单"
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
              toast.success('已退出登录')
            }}
            className="text-muted-foreground"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const handleEmail = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('请输入有效邮箱')
      return
    }
    setSending(true)
    const { error } = await signInWithEmail(trimmed)
    setSending(false)
    if (error) {
      toast.error('发送失败，请稍后再试')
    } else {
      setSent(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <UserIcon className="h-3.5 w-3.5" />
          登录
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>登录 / 注册</DialogTitle>
          <DialogDescription>
            登录后即可在每章和报错下方提问、回答、点赞。无需密码。
          </DialogDescription>
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
                用 GitHub 登录
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                或用邮箱
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {sent ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center text-sm">
              ✅ 登录链接已发到 <strong>{email}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                打开邮件点击链接即可登录（注意查收垃圾箱）
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
                {sending ? '发送中' : '发链接'}
              </Button>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            登录即表示同意社区行为准则：友善、不灌水、不发广告。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
