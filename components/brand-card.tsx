'use client'

/**
 * BrandCard
 * --------------------------------------------------
 * 极简高级版 logo 卡片。
 *
 * 设计取舍：
 *   - 没有彩虹叠加、没有噪点磨砂（hero 区已经有 aurora / 粒子 / 光球，再叠就糊了）
 *   - 玻璃感 + 站点 primary/accent 色系，不再 hue rainbow
 *   - 4 层结构（容器 + 微光晕 + logo + 反光），层次干净
 *   - 一道光束每 7 秒缓慢扫过，像产品发布会的灯效
 *   - 鼠标 hover 时极轻微 3D tilt（最多 6 度），不再夸张
 *   - 顶部状态点 + 角落产品编号，营造"品牌产品页"质感
 *
 * 性能：transform 用 ref 直写 DOM，0 次 React re-render。
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useHasFinePointer, usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'

const ARM_IMAGES = [
  '/lvjin-so101-view-front.jpeg',
  '/lvjin-so101-view-rear.jpeg',
  '/lvjin-so101-view-side.jpeg',
  '/lvjin-so101-view-top.jpeg'
]

interface BrandCardProps {
  className?: string
  /** 容器宽 */
  width?: number
  /** 容器高 */
  height?: number
  /** logo 路径 */
  logoSrc?: string
  /** 顶部状态文字 */
  statusLabel?: string
  /** 产品编号 */
  productCode?: string
  /** 主标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 底部 chip 标签 */
  tags?: string[]
  /** 倾斜最大角度 */
  maxTilt?: number
}

export function BrandCard({
  className,
  width = 380,
  height = 480,
  statusLabel = 'LIVE',
  productCode = 'LVJIN/SO-101',
  title = '绿晋科技',
  subtitle = 'Embodied AI · 具身智能学习平台',
  tags = ['Hardware', 'Software', 'Education'],
  maxTilt = 6
}: BrandCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const isFine = useHasFinePointer()
  const reduce = usePrefersReducedMotion()
  const shouldCycleImages = isFine && !reduce
  const [activeImage, setActiveImage] = useState(0)
  const activeImageSrc = ARM_IMAGES[shouldCycleImages ? activeImage : 0]

  useEffect(() => {
    if (!shouldCycleImages) {
      setActiveImage(0)
      return
    }

    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % ARM_IMAGES.length)
    }, 2800)

    return () => clearInterval(timer)
  }, [shouldCycleImages])

  useEffect(() => {
    if (!isFine || reduce) return
    const el = wrapRef.current
    if (!el) return

    const target = { rx: 0, ry: 0, mx: 0.5, my: 0.5 }
    const current = { rx: 0, ry: 0, mx: 0.5, my: 0.5 }
    let raf = 0

    const loop = () => {
      const k = 0.08
      current.rx += (target.rx - current.rx) * k
      current.ry += (target.ry - current.ry) * k
      current.mx += (target.mx - current.mx) * k
      current.my += (target.my - current.my) * k
      el.style.transform = `perspective(1100px) rotateX(${current.rx}deg) rotateY(${current.ry}deg)`
      el.style.setProperty('--mx', `${current.mx * 100}%`)
      el.style.setProperty('--my', `${current.my * 100}%`)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      target.mx = Math.max(0, Math.min(1, x))
      target.my = Math.max(0, Math.min(1, y))
      target.ry = (x - 0.5) * 2 * maxTilt
      target.rx = (0.5 - y) * 2 * maxTilt
    }
    const onLeave = () => {
      target.rx = 0
      target.ry = 0
      target.mx = 0.5
      target.my = 0.5
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [maxTilt, isFine, reduce])

  return (
    <div
      className={cn('inline-block', className)}
      style={{ perspective: '1200px' }}
    >
      <div
        ref={wrapRef}
        className="group relative will-change-transform"
        style={{
          width: `min(${width}px, calc(100vw - 2rem))`,
          height: `min(${height}px, 70vh)`,
          maxWidth: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 400ms cubic-bezier(.22,1,.36,1)',
          ['--mx' as string]: '50%',
          ['--my' as string]: '50%'
        }}
      >
        {/* 外圈柔光（远） */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 rounded-[2.5rem] opacity-60 blur-3xl sm:-inset-6"
          style={{
            background:
              'radial-gradient(45% 45% at 50% 30%, oklch(from var(--primary) l c h / 0.5) 0%, transparent 70%), radial-gradient(45% 45% at 50% 80%, oklch(from var(--accent) l c h / 0.4) 0%, transparent 70%)'
          }}
        />

        {/* 主卡片容器 */}
        <div
          className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[oklch(0.16_0.018_270)] via-[oklch(0.13_0.014_270)] to-[oklch(0.10_0.012_270)] shadow-2xl shadow-black/40"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 内边发光描边 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2rem]"
            style={{
              boxShadow:
                'inset 0 1px 0 oklch(from white l c h / 0.12), inset 0 0 0 1px oklch(from var(--primary) l c h / 0.08), inset 0 -60px 80px oklch(from black l c h / 0.4)'
            }}
          />

          {/* 主色微光 (主) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(70% 60% at 50% 0%, oklch(from var(--primary) l c h / 0.18) 0%, transparent 60%), radial-gradient(60% 50% at 50% 100%, oklch(from var(--accent) l c h / 0.12) 0%, transparent 70%)'
            }}
          />

          {/* 网格背景（极淡） */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)'
            }}
          />

          {/* 顶部信息条 */}
          <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/55">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              </span>
              <span>{statusLabel}</span>
            </div>
            <span className="font-mono text-white/35">{productCode}</span>
          </div>

          {/* 角落十字标记（精细装饰） */}
          {[
            'top-5 left-5',
            'top-5 right-5',
            'bottom-[120px] left-5',
            'bottom-[120px] right-5'
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              className={cn(
                'pointer-events-none absolute h-2.5 w-2.5 text-white/15',
                pos
              )}
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 80deg, currentColor 80deg, currentColor 100deg, transparent 100deg, transparent 170deg, currentColor 170deg, currentColor 190deg, transparent 190deg, transparent 260deg, currentColor 260deg, currentColor 280deg, transparent 280deg, transparent 350deg, currentColor 350deg, currentColor 360deg)',
                mask: 'radial-gradient(circle, transparent 35%, black 36%, black 60%, transparent 61%)',
                WebkitMask:
                  'radial-gradient(circle, transparent 35%, black 36%, black 60%, transparent 61%)'
              }}
            />
          ))}

          {/* Logo */}
          <div
            className="absolute inset-x-0 top-[5px] z-10 px-7"
            style={{ transform: 'translateZ(40px)' }}
          >
            <div
              className="relative mx-auto h-[min(500px,60vh)] w-full max-w-[500px] overflow-hidden rounded-2xl"
              style={{
                maskImage:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)'
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl blur-2xl opacity-50"
                style={{
                  background:
                    'radial-gradient(circle, oklch(from var(--primary) l c h / 0.35) 0%, transparent 70%)'
                }}
              />

              <Image
                key={activeImageSrc}
                src={activeImageSrc}
                alt={`${title} robotic arm view`}
                fill
                priority
                className="object-contain object-top opacity-95 transition-opacity duration-700"
                sizes="(max-width: 640px) 70vw, 270px"
              />
            </div>
          </div>

          {/* 光束扫过（缓慢，每 7 秒） */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen brand-sweep"
            style={{
              background:
                'linear-gradient(115deg, transparent 35%, oklch(from white l c h / 0.06) 47%, oklch(from white l c h / 0.18) 50%, oklch(from white l c h / 0.06) 53%, transparent 65%)',
              backgroundSize: '250% 100%'
            }}
          />

          {/* 跟随鼠标的聚光（极轻） */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(360px circle at var(--mx) var(--my), oklch(from white l c h / 0.08) 0%, transparent 60%)',
              mixBlendMode: 'overlay'
            }}
          />

          {/* 底部信息 */}
          <div
            className="absolute inset-x-0 bottom-0 z-10 px-7 pb-7"
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* 分割线 */}
            <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
              LVJIN ROBOTICS
            </p>
            <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">
              {title}
            </p>
            <p className="mt-1 text-[12px] text-white/55">{subtitle}</p>

            {/* 标签 */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部反光（产品照风格） */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-full mt-3 h-12 w-[70%] -translate-x-1/2 rounded-[100%] blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse, oklch(from var(--primary) l c h / 0.45) 0%, transparent 70%)',
            transform: 'translateX(-50%) translateZ(-30px) scaleY(0.5)'
          }}
        />
      </div>

      <style>{`
        @keyframes brand-sweep {
          0% { background-position: -50% 0% }
          60% { background-position: 150% 0% }
          100% { background-position: 150% 0% }
        }
        .brand-sweep {
          animation: brand-sweep 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-sweep { animation: none }
        }
      `}</style>
    </div>
  )
}
