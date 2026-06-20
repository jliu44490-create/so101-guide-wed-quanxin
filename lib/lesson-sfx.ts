'use client'

/**
 * Sound effects for the interactive lessons.
 *
 * Everything here is synthesized on the fly with the Web Audio API — no audio
 * files, no dependencies, no network. Honors a persisted mute flag so the user
 * can silence the whole experience with one click (remembered across sessions).
 */

let ctx: AudioContext | null = null

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  return ctx
}

const MUTE_KEY = 'lesson-sfx-muted'
export const SFX_MUTE_EVENT = 'lesson-sfx-mute'

export function isSfxMuted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setSfxMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  // Let any mounted toggle re-sync without prop drilling.
  window.dispatchEvent(new CustomEvent(SFX_MUTE_EVENT, { detail: muted }))
  if (!muted) playSfx('tap') // tiny confirmation blip when unmuting
}

interface Tone {
  freq: number
  dur: number
  delay?: number
  type?: OscillatorType
  gain?: number
}

function playTones(tones: Tone[]): void {
  const ac = audioCtx()
  if (!ac || isSfxMuted()) return
  // Browsers start the context suspended until a user gesture; lessons are
  // entirely click-driven so by the time a sound plays we've had a gesture.
  if (ac.state === 'suspended') void ac.resume()
  const now = ac.currentTime
  for (const t of tones) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.value = t.freq
    const start = now + (t.delay ?? 0)
    const peak = t.gain ?? 0.15
    g.gain.setValueAtTime(0.0001, start)
    g.gain.linearRampToValueAtTime(peak, start + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, start + t.dur)
    osc.connect(g)
    g.connect(ac.destination)
    osc.start(start)
    osc.stop(start + t.dur + 0.03)
  }
}

export type SfxName = 'correct' | 'combo' | 'wrong' | 'complete' | 'tap'

/**
 * Play a named effect. `streak` lets "correct" climb in pitch as the user
 * chains right answers — a small but satisfying escalation.
 */
export function playSfx(name: SfxName, streak = 0): void {
  switch (name) {
    case 'correct': {
      // Rising major triad; nudges up a semitone per streak (capped).
      const base = 523.25 * Math.pow(2, Math.min(streak, 7) / 12)
      playTones([
        { freq: base, dur: 0.12, type: 'triangle', gain: 0.16 },
        { freq: base * 1.26, dur: 0.12, delay: 0.07, type: 'triangle', gain: 0.16 },
        { freq: base * 1.5, dur: 0.2, delay: 0.14, type: 'triangle', gain: 0.16 }
      ])
      break
    }
    case 'combo': {
      // Brighter, square-wave sparkle for streak milestones.
      const base = 659.25
      playTones([
        { freq: base, dur: 0.09, type: 'square', gain: 0.1 },
        { freq: base * 1.5, dur: 0.1, delay: 0.05, type: 'square', gain: 0.1 },
        { freq: base * 2, dur: 0.16, delay: 0.1, type: 'square', gain: 0.1 }
      ])
      break
    }
    case 'wrong': {
      // Soft, low, NON-harsh — encouraging, never a buzzer.
      playTones([
        { freq: 330, dur: 0.16, type: 'sine', gain: 0.12 },
        { freq: 247, dur: 0.22, delay: 0.09, type: 'sine', gain: 0.12 }
      ])
      break
    }
    case 'complete': {
      // Triumphant four-note fanfare.
      const seq = [523.25, 659.25, 783.99, 1046.5]
      playTones(
        seq.map((f, i) => ({ freq: f, dur: 0.32, delay: i * 0.12, type: 'triangle', gain: 0.17 }))
      )
      break
    }
    case 'tap': {
      playTones([{ freq: 440, dur: 0.05, type: 'sine', gain: 0.06 }])
      break
    }
  }
}
