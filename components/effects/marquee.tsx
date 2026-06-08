import { cn } from '@/lib/utils'

interface MarqueeProps {
  /** 单个项目，会复制一份保证无缝循环 */
  items: React.ReactNode[]
  /** 速度，秒 */
  duration?: number
  /** 反向 */
  reverse?: boolean
  /** 是否在两端做渐隐 */
  fade?: boolean
  className?: string
  itemClassName?: string
}

export function Marquee({
  items,
  duration = 35,
  reverse = false,
  fade = true,
  className,
  itemClassName
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'marquee-viewport relative w-full max-w-full overflow-hidden [overflow:clip]',
        fade && '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className
      )}
    >
      <div className="flex flex-wrap justify-center gap-3 px-4 sm:hidden">
        {items.map((item, i) => (
          <div key={i} className={cn('max-w-full min-w-0', itemClassName)}>
            {item}
          </div>
        ))}
      </div>
      <div
        className="marquee-track hidden min-w-max gap-8 will-change-transform sm:flex"
        style={
          {
            '--marquee-duration': `${duration}s`,
            animationDirection: reverse ? 'reverse' : 'normal'
          } as React.CSSProperties
        }
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className={cn('shrink-0', itemClassName)}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
