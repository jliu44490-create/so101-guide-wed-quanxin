import { cn } from '@/lib/utils'

/**
 * Decorative SO-101 robotic-arm "engineering blueprint" for the auth brand panel.
 *
 * Line-art 5-DOF arm in a reaching/pick pose with glowing joints, a dashed
 * end-effector trajectory, a base coordinate frame, a dimension line and
 * technical callouts. Purely decorative (aria-hidden); all motion respects
 * prefers-reduced-motion via the global reduce-motion rules in globals.css.
 */

interface Joint {
  x: number
  y: number
  label: string
  angle?: string
}

// Kinematic chain (viewBox 0 0 620 250). Shoulder → elbow → wrist → wrist-roll.
const JOINTS: Joint[] = [
  { x: 96, y: 152, label: 'J1', angle: '128°' },
  { x: 214, y: 96, label: 'J2', angle: '96°' },
  { x: 344, y: 132, label: 'J3', angle: '74°' },
  { x: 432, y: 112, label: 'J4', angle: '15°' }
]

// Link segments between joints (and the riser + gripper wrist).
const LINKS = [
  'M96,206 L96,152', // base riser
  'M96,152 L214,96', // upper arm
  'M214,96 L344,132', // forearm
  'M344,132 L432,112', // wrist link
  'M432,112 L474,112' // gripper base
]

export function RobotArmBlueprint({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 250"
      fill="none"
      aria-hidden
      className={cn('h-auto w-full overflow-visible', className)}
    >
      <defs>
        <filter id="arm-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <radialGradient id="arm-seat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.18" />
          <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow seating the arm */}
      <ellipse cx="300" cy="130" rx="280" ry="120" fill="url(#arm-seat)" />

      {/* ── Base coordinate frame (Z up, X right) ── */}
      <g className="stroke-muted-foreground/50" strokeWidth="1.2">
        <line x1="52" y1="214" x2="92" y2="214" />
        <path d="M92,214 l-5,-2.5 v5 z" className="fill-muted-foreground/50" stroke="none" />
        <line x1="52" y1="214" x2="52" y2="176" />
        <path d="M52,176 l-2.5,5 h5 z" className="fill-muted-foreground/50" stroke="none" />
      </g>
      <text x="96" y="218" className="fill-muted-foreground/60 font-mono text-[8px]">
        X
      </text>
      <text x="44" y="174" className="fill-muted-foreground/60 font-mono text-[8px]">
        Z
      </text>

      {/* ── Base plinth + ground hatching ── */}
      <g>
        <path
          d="M64,206 L128,206 L138,224 L54,224 Z"
          className="fill-muted-foreground/10 stroke-muted-foreground/45"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="84" cy="214" r="1.8" className="fill-muted-foreground/50" />
        <circle cx="108" cy="214" r="1.8" className="fill-muted-foreground/50" />
        <g className="stroke-muted-foreground/30" strokeWidth="1">
          <line x1="58" y1="230" x2="68" y2="224" />
          <line x1="74" y1="230" x2="84" y2="224" />
          <line x1="90" y1="230" x2="100" y2="224" />
          <line x1="106" y1="230" x2="116" y2="224" />
          <line x1="122" y1="230" x2="132" y2="224" />
        </g>
      </g>

      {/* ── End-effector trajectory (dashed, flowing) ── */}
      <path
        d="M250,46 Q372,26 474,112"
        className="arm-trace stroke-accent/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="250" cy="46" r="2.5" className="fill-accent/70" />

      {/* ── Arm links: dim casing + bright core ── */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {LINKS.map((d) => (
          <path key={d} d={d} className="stroke-muted-foreground/20" strokeWidth="7" />
        ))}
        {LINKS.map((d) => (
          <path key={`core-${d}`} d={d} className="stroke-foreground/70" strokeWidth="2" />
        ))}
      </g>

      {/* ── Gripper jaws around the target ── */}
      <g className="stroke-foreground/70" strokeWidth="2" strokeLinecap="round">
        <path d="M474,112 L498,103" />
        <path d="M474,112 L498,121" />
        <path d="M498,99 L498,107" />
        <path d="M498,117 L498,125" />
      </g>

      {/* ── Target cube + crosshair ── */}
      <g>
        <rect
          x="512"
          y="100"
          width="26"
          height="26"
          rx="2"
          className="fill-primary/10 stroke-primary/60"
          strokeWidth="1.5"
        />
        <path
          d="M525,92 v6 M525,128 v6 M504,113 h6 M540,113 h6"
          className="stroke-primary/60"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* ── Joints: glow + ring + hub ── */}
      {JOINTS.map((j) => (
        <g key={j.label}>
          <circle
            cx={j.x}
            cy={j.y}
            r="7"
            className="animate-slow-pulse fill-primary/70"
            filter="url(#arm-glow)"
          />
          <circle cx={j.x} cy={j.y} r="5.5" className="fill-background stroke-primary" strokeWidth="2" />
          <circle cx={j.x} cy={j.y} r="1.8" className="fill-primary" />
        </g>
      ))}

      {/* ── Active end-effector indicator (pinging ring) ──
           transform-box:fill-box makes the ping scale around the circle's own
           centre instead of the SVG origin. */}
      <circle cx="474" cy="112" r="6" className="fill-background stroke-accent" strokeWidth="2" />
      <circle
        cx="474"
        cy="112"
        r="6"
        fill="none"
        strokeWidth="1.5"
        className="animate-ping stroke-accent/60 [transform-box:fill-box] [transform-origin:center]"
      />

      {/* ── Joint callouts ── */}
      {JOINTS.map((j) => (
        <g key={`lbl-${j.label}`} className="font-mono">
          <text x={j.x + 9} y={j.y - 8} className="fill-foreground/80 text-[8.5px] font-medium">
            {j.label}
          </text>
          {j.angle && (
            <text x={j.x + 9} y={j.y + 1} className="fill-muted-foreground/65 text-[7.5px]">
              θ {j.angle}
            </text>
          )}
        </g>
      ))}
      <text x="486" y="98" className="fill-accent/80 font-mono text-[8.5px] font-medium">
        EEF
      </text>
      <text x="506" y="146" className="fill-muted-foreground/60 font-mono text-[7.5px]">
        TARGET
      </text>

      {/* ── Dimension line: reach envelope ── */}
      <g className="stroke-muted-foreground/35" strokeWidth="1">
        <line x1="96" y1="240" x2="525" y2="240" strokeDasharray="2 3" />
        <line x1="96" y1="236" x2="96" y2="244" />
        <line x1="525" y1="236" x2="525" y2="244" />
      </g>
      <text
        x="310"
        y="237"
        textAnchor="middle"
        className="fill-muted-foreground/60 font-mono text-[7.5px]"
      >
        REACH ≈ 0.42 m
      </text>

      {/* ── Title tag ── */}
      <g className="font-mono">
        <text x="250" y="70" className="fill-foreground/75 text-[9px] font-semibold tracking-wider">
          SO-101
        </text>
        <text x="250" y="81" className="fill-muted-foreground/55 text-[7.5px] tracking-wide">
          5-DOF · GRIPPER
        </text>
      </g>
    </svg>
  )
}
