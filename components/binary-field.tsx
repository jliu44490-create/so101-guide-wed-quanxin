'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * BinaryField — a dense field of 0/1 glyphs rendered like a rippling 3D surface
 * (à la zeabur's hero). A flowing, domain-warped height field shades the glyphs
 * (bright lavender crests → dark troughs) and lifts them into relief, so the whole
 * panel reads as a slowly undulating sea of binary that flows over time. It fades
 * toward the left so the headline copy stays readable.
 *
 * Decorative (aria-hidden). Honors prefers-reduced-motion (single static frame),
 * throttles to ~30fps, pauses when hidden, adapts to DPR and container size.
 */

const MONO = '"SF Mono", SFMono-Regular, ui-monospace, Menlo, Consolas, monospace'
const CELL = 12
const FONT = 12
const DISP = 14 // vertical relief displacement (px) — gives the sea its depth
const RENDER_MS = 30 // ~30fps throttle
const LUTN = 32

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

function buildLUT(stops: [number, number, number][]) {
  const lut: string[] = []
  for (let i = 0; i < LUTN; i++) {
    const f = (i / (LUTN - 1)) * (stops.length - 1)
    const k = Math.min(stops.length - 2, Math.floor(f))
    const t = f - k
    const a = stops[k]
    const b = stops[k + 1]
    lut.push(
      `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
        a[2] + (b[2] - a[2]) * t
      )})`
    )
  }
  return lut
}

export function BinaryField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Dim purple trough → bright lavender crest (the binary sea).
    const lut = buildLUT([
      [78, 74, 108],
      [120, 104, 204],
      [170, 150, 250],
      [214, 204, 255]
    ])

    let w = 0
    let h = 0
    let gridX = new Float32Array(0)
    let gridY = new Float32Array(0)
    let ph = new Float32Array(0) // per-cell flip phase/speed seed

    function resize() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cols = Math.ceil(w / CELL) + 1
      const rows = Math.ceil(h / CELL) + 1
      const n = cols * rows
      gridX = new Float32Array(n)
      gridY = new Float32Array(n)
      ph = new Float32Array(n)
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i
          gridX[idx] = i * CELL + CELL / 2
          gridY[idx] = j * CELL + CELL / 2
          ph[idx] = (((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1) + 1) % 1
        }
      }
    }

    // Flowing height field, ~0..1. The domain is warped by low-frequency noise,
    // then a fractal sum of sines at rising frequencies and differing drift
    // speeds is layered on top → irregular, organic swells with no obvious bands.
    function wave(x: number, y: number, t: number) {
      const nx = x * 0.011
      const ny = y * 0.015
      const wx = nx + 0.7 * Math.sin(ny * 0.7 + t * 0.21) + 0.4 * Math.sin(ny * 1.9 - t * 0.13)
      const wy = ny + 0.7 * Math.sin(nx * 0.8 - t * 0.17) + 0.4 * Math.sin(nx * 2.1 + t * 0.11)
      let v = Math.sin(wx + wy * 0.6 + t * 0.5)
      v += 0.5 * Math.sin(wx * -1.7 + wy * 1.3 - t * 0.37)
      v += 0.25 * Math.sin(wx * 2.6 + wy * -2.2 + t * 0.74)
      v += 0.13 * Math.sin((wx + wy) * 3.7 - t * 0.95)
      return 0.5 + 0.5 * (v / 1.88)
    }

    function render(t: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${FONT}px ${MONO}`

      for (let idx = 0; idx < gridX.length; idx++) {
        const gx = gridX[idx]
        const gy = gridY[idx]
        // full-bleed: gently fade only at the four edges so the sea covers the
        // whole screen without any hard panel boundary
        const fade =
          smooth(0, 0.05, gx / w) *
          smooth(1, 0.96, gx / w) *
          smooth(0, 0.04, gy / h) *
          smooth(1, 0.95, gy / h)
        if (fade < 0.04) continue

        const hgt = wave(gx, gy, t)
        const alpha = fade * (0.42 + 0.58 * hgt)
        if (alpha < 0.05) continue

        ctx.fillStyle = lut[(hgt * (LUTN - 1)) | 0]
        ctx.globalAlpha = alpha > 1 ? 1 : alpha
        const bit = ((idx * 1103515245) ^ Math.floor(t * (0.3 + ph[idx] * 1.6) + ph[idx] * 9)) & 1
        ctx.fillText(bit ? '1' : '0', gx, gy - hgt * DISP)
      }
      ctx.globalAlpha = 1
    }

    let raf = 0
    let t = 0
    let prev = performance.now()
    let lastRender = -999

    function frame(now: number) {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      t += dt
      if (now - lastRender >= RENDER_MS) {
        render(t)
        lastRender = now
      }
      raf = requestAnimationFrame(frame)
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)

    if (reduce) {
      render(3)
    } else {
      raf = requestAnimationFrame(frame)
    }

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!reduce && !raf) {
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={cn('h-full w-full', className)} />
}
