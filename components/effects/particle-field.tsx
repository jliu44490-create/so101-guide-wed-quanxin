'use client'

import { useEffect, useRef } from 'react'
import { useHasFinePointer, usePrefersReducedMotion } from '@/lib/hooks'
import { cn } from '@/lib/utils'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
  life: number
}

interface ParticleFieldProps {
  className?: string
  /** 粒子数量 */
  count?: number
  /** 是否启用鼠标交互 */
  interactive?: boolean
  /** 颜色 hue 基准 (0-360) */
  baseHue?: number
}

export function ParticleField({
  className,
  count = 60,
  interactive = true,
  baseHue = 260
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isFine = useHasFinePointer()
  const reduceMotion = usePrefersReducedMotion()
  const effectiveCount = isFine ? count : Math.min(count, 18)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (reduceMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -1000, y: -1000, active: false }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    const seed = () => {
      const rect = canvas.getBoundingClientRect()
      const particles: Particle[] = []
      for (let i = 0; i < effectiveCount; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.5,
          hue: baseHue + (Math.random() - 0.5) * 80,
          life: Math.random()
        })
      }
      return particles
    }

    resize()
    let particles = seed()

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      resize()
      particles = seed()
    }
    const onMove = (e: MouseEvent) => {
      if (!interactive || !isFine) return
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseout', onLeave)

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // 连接线
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < 12000) {
            const op = 1 - d2 / 12000
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 80%, 65%, ${op * 0.12})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // 粒子
      for (const p of particles) {
        // 鼠标排斥力
        if (interactive && mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < 14400 && d2 > 0.01) {
            const f = 0.5 / d2
            p.vx += dx * f * 30
            p.vy += dy * f * 30
          }
        }

        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = rect.width + 10
        if (p.x > rect.width + 10) p.x = -10
        if (p.y < -10) p.y = rect.height + 10
        if (p.y > rect.height + 10) p.y = -10

        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, 0.7)`
        ctx.shadowBlur = 8
        ctx.shadowColor = `hsla(${p.hue}, 85%, 70%, 0.5)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [effectiveCount, interactive, baseHue, reduceMotion, isFine])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
