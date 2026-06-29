import Link from 'next/link'
import { Mail, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal, ShimmerText } from '@/components/effects'
import { HeroAura } from '@/components/hero-aura'
import { siteConfig } from '@/lib/site-config'

/**
 * Presentational shell for the legal/content pages (服务条款 / 隐私政策).
 * Server-compatible: takes plain data and renders the standard page chrome
 * (header, glass hero, readable prose column, contact card, footer).
 */

export type LegalBlock = string | { sub: string } | { list: string[] }
export type LegalSection = { heading: string; blocks: LegalBlock[] }

function renderBlock(block: LegalBlock, key: number) {
  if (typeof block === 'string') {
    return (
      <p key={key} className="text-pretty">
        {block}
      </p>
    )
  }
  if ('sub' in block) {
    return (
      <h3 key={key} className="pt-2 text-base font-medium text-foreground">
        {block.sub}
      </h3>
    )
  }
  return (
    <ul key={key} className="list-disc space-y-1.5 pl-5 marker:text-primary/60">
      {block.list.map((item, i) => (
        <li key={i} className="text-pretty">
          {item}
        </li>
      ))}
    </ul>
  )
}

interface LegalChrome {
  updatedLabel: string
  contactTitle: string
  contactBtn: string
  seeAlso: string
}

const DEFAULT_CHROME: LegalChrome = {
  updatedLabel: '最后更新',
  contactTitle: '联系我们',
  contactBtn: '邮件联系',
  seeAlso: '另见：'
}

export function LegalPage({
  badge,
  title,
  updated,
  intro,
  sections,
  contactNote,
  related,
  t = DEFAULT_CHROME
}: {
  badge: string
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
  contactNote: string
  related: { href: string; label: string }
  /** Locale chrome labels. Defaults to Chinese. */
  t?: LegalChrome
}) {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <HeroAura />
          <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                <ShieldCheck className="mr-1 h-3 w-3" />
                {badge}
              </Badge>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-4 text-balance text-3xl font-bold sm:text-4xl lg:text-5xl">
                <ShimmerText>{title}</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-sm text-muted-foreground">{t.updatedLabel}：{updated}</p>
            </Reveal>
            {intro ? (
              <Reveal delay={280}>
                <p className="mt-5 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
                  {intro}
                </p>
              </Reveal>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((section, i) => (
              <Reveal key={section.heading} delay={Math.min(i, 4) * 60}>
                <div className="scroll-mt-24">
                  <h2 className="text-xl font-semibold sm:text-2xl">{section.heading}</h2>
                  <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                    {section.blocks.map((block, j) => renderBlock(block, j))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-md sm:p-8">
            <h2 className="text-lg font-semibold">{t.contactTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{contactNote}</p>
            <Button asChild className="mt-4">
              <a href={siteConfig.links.inquiry}>
                <Mail className="mr-1.5 h-4 w-4" />
                {t.contactBtn}
              </a>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            {t.seeAlso}
            <Link
              href={related.href}
              className="ml-1 underline underline-offset-2 hover:text-foreground"
            >
              {related.label}
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
