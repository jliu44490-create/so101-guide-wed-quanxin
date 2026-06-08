'use client'

/**
 * Iridescent Logo Card
 * --------------------------------------------------
 * 8 层合成 + 3D 倾斜 + 鼠标跟踪 + 空闲漂移：
 *   0  外圈光晕 (halo)
 *   1  卡片底色 (surface)
 *   2  Logo 图片 (mix-blend: screen 让白底自动透出)
 *   3  彩虹叠加 (linear gradient + mix-blend: color-dodge)
 *   4  聚光灯   (radial pinned to cursor + mix-blend: overlay)
 *   5  闪光带   (linear streak)
 *   6  噪点     (svg fractalNoise + mix-blend: overlay)
 *   7  内描边   (rim highlight)
 *
 * 性能：所有跟随鼠标的值都通过 ref + element.style 写入，
 * 不触发 React re-render（原版每帧 setState 在低端机会卡顿）。
 */

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type IridescentSurface = 'obsidian' | 'graphite' | 'ink' | 'pearl' | 'forest'

interface SurfaceConfig {
  bg: string
  logoBlend: 'screen' | 'multiply' | 'normal'
  haloColor: string
}

const SURFACES: Record<IridescentSurface, SurfaceConfig> = {
  obsidian: {
    bg: 'radial-gradient(120% 100% at 50% 0%, #1b2330 0%, #0c1018 60%, #060a10 100%)',
    logoBlend: 'screen',
    haloColor: 'rgba(120,200,140,.85)'
  },
  graphite: {
    bg: 'linear-gradient(160deg, #2a2f37 0%, #15181d 60%, #0a0c10 100%)',
    logoBlend: 'screen',
    haloColor: 'rgba(140,160,200,.7)'
  },
  ink: {
    bg: 'linear-gradient(170deg, #0a1228 0%, #050817 60%, #02030a 100%)',
    logoBlend: 'screen',
    haloColor: 'rgba(120,160,255,.7)'
  },
  forest: {
    bg: 'radial-gradient(120% 100% at 50% 0%, #142a1d 0%, #0a1812 60%, #050d09 100%)',
    logoBlend: 'screen',
    haloColor: 'rgba(123,232,107,.85)'
  },
  pearl: {
    bg: 'linear-gradient(160deg, #f7f7f4 0%, #ececec 60%, #d8d8d6 100%)',
    logoBlend: 'normal',
    haloColor: 'rgba(120,200,140,.45)'
  }
}

const RAINBOW =
  'linear-gradient(var(--ang), ' +
  'hsl(0,100%,62%) 0%, ' +
  'hsl(35,100%,60%) 12%, ' +
  'hsl(58,100%,60%) 22%, ' +
  'hsl(140,90%,58%) 35%, ' +
  'hsl(180,90%,58%) 48%, ' +
  'hsl(220,95%,62%) 60%, ' +
  'hsl(270,95%,65%) 72%, ' +
  'hsl(310,95%,62%) 84%, ' +
  'hsl(0,100%,62%) 100%)'

const NOISE_SVG = (scale: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${scale}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
  )
    .replace(/%23/g, '%2523')
    .replace(/#n/g, '%23n')}`

export interface IridescentCardProps {
  /** Logo 图片路径（PNG，透明或白底） */
  logoSrc?: string
  /** 卡片宽度 px */
  width?: number
  /** 卡片高度 px */
  height?: number
  /** 圆角 px */
  radius?: number
  /** 表面预设 */
  surface?: IridescentSurface
  /** 倾斜强度 0-45 */
  tilt?: number
  /** 透视 px */
  perspective?: number
  /** 平滑度 1-40，越大越平滑越懒散 */
  smoothing?: number
  /** 彩虹强度 0-200，默认 0 即不显示 */
  rainbowIntensity?: number
  /** 彩虹缩放 % */
  rainbowScale?: number
  /** 鼠标偏移彩虹位置幅度 */
  rainbowShift?: number
  /** 聚光灯强度 0-150 */
  glowIntensity?: number
  /** 聚光灯尺寸 % */
  glowSize?: number
  /** 闪光带强度 0-100 */
  sheenIntensity?: number
  /** 光晕强度 0-150 */
  haloIntensity?: number
  /** 光晕大小 0-120 */
  haloSize?: number
  /** 噪点透明度 0-60 */
  noiseOpacity?: number
  /** 噪点尺寸 0.2-3 */
  noiseScale?: number
  /** 空闲漂移开关 */
  idleDrift?: boolean
  /** 移动端是否禁用倾斜（默认 true） */
  disableTiltOnTouch?: boolean
  className?: string
  /** 自定义文字层（覆盖 logo 上方），可放标语 */
  caption?: React.ReactNode
}

export function IridescentCard({
  logoSrc = '/lvjin-logo.png',
  width = 380,
  height = 480,
  radius = 28,
  surface = 'forest',
  tilt = 14,
  perspective = 1000,
  smoothing = 14,
  rainbowIntensity = 28,
  rainbowScale = 130,
  rainbowShift = 60,
  glowIntensity = 70,
  glowSize = 55,
  sheenIntensity = 35,
  haloIntensity = 75,
  haloSize = 55,
  noiseOpacity = 12,
  noiseScale = 0.85,
  idleDrift = true,
  disableTiltOnTouch = true,
  className,
  caption
}: IridescentCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const rainbowRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)

  const targetRef = useRef({ x: 0.5, y: 0.5, active: 0 })
  const currentRef = useRef({ x: 0.5, y: 0.5, active: 0 })
  const hoverRef = useRef(false)
  const touchRef = useRef(false)

  // 注入到 DOM 的核心循环
  useEffect(() => {
    let raf = 0
    const wrap = wrapRef.current
    const halo = haloRef.current
    const rainbow = rainbowRef.current
    const spot = spotRef.current
    const sheen = sheenRef.current
    const ground = groundRef.current
    if (!wrap || !rainbow || !spot || !sheen) return

    const idleStart = performance.now()

    const loop = (now: number) => {
      const cur = currentRef.current
      const target = targetRef.current

      // idle drift：未 hover 时绕圈
      if (idleDrift && !hoverRef.current) {
        const t = ((now - idleStart) / 6000) * Math.PI * 2
        target.x = 0.5 + Math.cos(t) * 0.18
        target.y = 0.5 + Math.sin(t * 0.85) * 0.16
        target.active = 0.35
      }

      // lerp
      const k = 1 / Math.max(1, smoothing)
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      cur.active += (target.active - cur.active) * k

      const cx = cur.x
      const cy = cur.y
      const active = cur.active

      // 倾斜
      const useTilt = !(disableTiltOnTouch && touchRef.current)
      const rotY = useTilt ? (cx - 0.5) * 2 * tilt : 0
      const rotX = useTilt ? (0.5 - cy) * 2 * tilt : 0
      wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`

      // 彩虹
      const bgX = 50 - (cx - 0.5) * rainbowShift * 2
      const bgY = 50 - (cy - 0.5) * rainbowShift * 2
      const ang = 120 + (cx - 0.5) * 60
      rainbow.style.setProperty('--ang', `${ang}deg`)
      rainbow.style.backgroundPosition = `${bgX}% ${bgY}%`
      rainbow.style.opacity = String((rainbowIntensity / 100) * (0.55 + active * 0.45))

      // 聚光灯
      spot.style.background = `radial-gradient(${glowSize}% ${glowSize * 0.85}% at ${cx * 100}% ${cy * 100}%, rgba(255,255,255,${
        0.45 * (glowIntensity / 100)
      }) 0%, rgba(255,255,255,${0.18 * (glowIntensity / 100)}) 25%, rgba(255,255,255,0) 55%)`
      spot.style.opacity = String(0.4 + active * 0.6)

      // 闪光
      sheen.style.background = `linear-gradient(${110 + (cx - 0.5) * 80}deg, transparent ${Math.max(
        0,
        35 - cx * 30
      )}%, rgba(255,255,255,${0.35 * (sheenIntensity / 100)}) ${50 + (cy - 0.5) * 10}%, transparent ${Math.min(
        100,
        70 + cx * 15
      )}%)`
      sheen.style.opacity = String(0.4 + active * 0.6)

      // 光晕
      if (halo) {
        halo.style.opacity = String((haloIntensity / 100) * (0.45 + active * 0.55))
      }

      // 地面阴影
      if (ground) {
        ground.style.transform = `translateZ(-40px) translateX(${(cx - 0.5) * -30}px)`
      }

      // 表面色（仅初始化时设一次，其实不需要每帧设）
      // 此处不重设以省事

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [
    smoothing,
    tilt,
    rainbowIntensity,
    rainbowShift,
    glowIntensity,
    glowSize,
    sheenIntensity,
    haloIntensity,
    idleDrift,
    disableTiltOnTouch
  ])

  // 事件
  const onMove = (e: React.PointerEvent) => {
    const card = cardRef.current
    if (!card) return
    const r = card.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
    targetRef.current = { x, y, active: 1 }
    hoverRef.current = true
    touchRef.current = e.pointerType === 'touch'
  }

  const onLeave = () => {
    targetRef.current.active = 0
    hoverRef.current = false
  }

  const surf = SURFACES[surface]

  return (
    <div
      className={cn('inline-block', className)}
      style={{ perspective: `${perspective}px` }}
    >
      <div
        ref={wrapRef}
        className="relative"
        style={{
          width,
          height,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transition: 'transform 220ms cubic-bezier(.2,.7,.2,1)'
        }}
        onPointerMove={onMove}
        onPointerEnter={() => {
          hoverRef.current = true
        }}
        onPointerLeave={onLeave}
      >
        {/* 外圈光晕 */}
        <div
          ref={haloRef}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: radius,
            filter: `blur(${20 + haloSize * 0.4}px)`,
            transform: `translateZ(-1px) scale(${1 + haloSize / 500})`,
            background: `radial-gradient(60% 60% at 50% 50%, ${surf.haloColor} 0%, ${surf.haloColor.replace(/[\d.]+\)$/, '0.45)')} 35%, rgba(0,0,0,0) 70%)`,
            zIndex: 0
          }}
        />

        {/* 卡片主体 */}
        <div
          ref={cardRef}
          className="relative h-full w-full"
          style={{
            borderRadius: radius,
            overflow: 'hidden',
            background: surf.bg,
            transformStyle: 'preserve-3d',
            isolation: 'isolate'
          }}
        >
          {/* Logo 层 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `url("${logoSrc}") center 75%/82% no-repeat`,
              mixBlendMode: surf.logoBlend,
              zIndex: 2,
            }}
          />

          {/* 彩虹层 */}
          <div
            ref={rainbowRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              ['--ang' as string]: '120deg',
              background: RAINBOW,
              backgroundSize: `${rainbowScale}% ${rainbowScale}%`,
              mixBlendMode: 'color-dodge',
              filter: 'saturate(1.25)',
              opacity: 0,
              zIndex: 3
            }}
          />

          {/* 聚光灯 */}
          <div
            ref={spotRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              mixBlendMode: 'overlay',
              zIndex: 4
            }}
          />

          {/* 闪光 */}
          <div
            ref={sheenRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              mixBlendMode: 'screen',
              zIndex: 5
            }}
          />

          {/* 噪点 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url("${NOISE_SVG(noiseScale)}")`,
              opacity: noiseOpacity / 100,
              mixBlendMode: 'overlay',
              zIndex: 6
            }}
          />

          {/* 内描边 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: radius,
              boxShadow:
                'inset 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -40px 60px rgba(0,0,0,.35)',
              zIndex: 7
            }}
          />

          {/* 自定义标语 */}
          {caption && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] flex items-end justify-center p-5"
              style={{ color: surface === 'pearl' ? '#1a1a1a' : '#e7eef7' }}
            >
              {caption}
            </div>
          )}
        </div>

        {/* 地面阴影 */}
        <div
          ref={groundRef}
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            width: '80%',
            height: 24,
            left: '10%',
            bottom: -38,
            background: `radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,${
              surface === 'pearl' ? 0.25 : 0.7
            }) 0%, rgba(0,0,0,0) 70%)`,
            filter: 'blur(8px)',
            zIndex: -1
          }}
        />
      </div>
    </div>
  )
}
