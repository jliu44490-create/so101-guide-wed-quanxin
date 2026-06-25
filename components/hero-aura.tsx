/**
 * 内页 hero 的统一氛围层 — replaces the old AuroraBackground/FloatingOrbs on the
 * inner-page heroes. Transparent so the site-wide Dark Veil flows through (so
 * the hero no longer reads as a separate "old" band), but adds a soft violet
 * spotlight to mark the title zone plus a glowing divider instead of a hard
 * border. Distinct, yet harmonised with the veil. Pure CSS, no deps.
 */

export function HeroAura() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* violet spotlight marking the title zone */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 130% at 16% -15%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 55%)'
        }}
      />
      {/* a complementary accent glow on the opposite side */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 120% at 92% -5%, color-mix(in oklab, var(--color-accent) 13%, transparent), transparent 55%)'
        }}
      />
      {/* glowing divider instead of a hard border-b */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  )
}
