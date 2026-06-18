'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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

interface AuthLabels {
  userFallback: string
  accountMenu: string
  settings: string
  signedOut: string
  signOut: string
  login: string
}

const labels: Record<AuthLocale, AuthLabels> = {
  zh: {
    userFallback: '我',
    accountMenu: '账号菜单',
    settings: '账号设置',
    signedOut: '已退出登录',
    signOut: '退出登录',
    login: '登录'
  },
  ja: {
    userFallback: '私',
    accountMenu: 'アカウントメニュー',
    settings: 'アカウント設定',
    signedOut: 'ログアウトしました',
    signOut: 'ログアウト',
    login: 'ログイン'
  }
}

/**
 * Header auth control.
 *  - backend not configured → renders nothing (community layer dormant)
 *  - logged out → "登录" button that links to /login?next=<current>
 *  - logged in  → avatar dropdown with username, settings link + sign out
 */
export function AuthButton({ locale = 'zh' }: { locale?: AuthLocale }) {
  const t = labels[locale]
  const { enabled, ready, isLoggedIn, profile, user, signOut } = useAuth()
  const pathname = usePathname()

  if (!enabled) return null
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
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-3.5 w-3.5" />
              {t.settings}
            </Link>
          </DropdownMenuItem>
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

  const loginHref = pathname && pathname !== '/login'
    ? `/login?next=${encodeURIComponent(pathname)}`
    : '/login'

  return (
    <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
      <Link href={loginHref}>
        <UserIcon className="h-3.5 w-3.5" />
        {t.login}
      </Link>
    </Button>
  )
}
