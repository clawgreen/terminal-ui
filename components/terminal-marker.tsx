'use client'

export interface TerminalMarkerProps {
  /** Label text displayed as the phase marker. */
  label: string
  /** Optional timestamp to display after the label. */
  timestamp?: string
  /** Visual style variant (default: 'neutral'). */
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  /** Additional classes for layout tweaks. */
  className?: string
}

/**
 * Per-variant Tailwind classes for border, background tint, label, and timestamp.
 * Background tints use `color-mix` for consistent translucency across themes.
 */
const variantClasses: Record<
  NonNullable<TerminalMarkerProps['variant']>,
  { root: string; label: string; timestamp: string }
> = {
  neutral: {
    root: 'border-[var(--glass-border)] bg-[rgba(255,255,255,0.03)]',
    label: 'text-[var(--term-fg)]',
    timestamp: 'text-[var(--term-fg-dim)]',
  },
  info: {
    root: 'border-[var(--term-blue)]/40 bg-[color-mix(in_oklab,var(--term-blue)_8%,transparent)]',
    label: 'text-[var(--term-blue)]',
    timestamp: 'text-[var(--term-blue)]/60',
  },
  success: {
    root: 'border-[var(--term-green)]/40 bg-[color-mix(in_oklab,var(--term-green)_8%,transparent)]',
    label: 'text-[var(--term-green)]',
    timestamp: 'text-[var(--term-green)]/60',
  },
  warning: {
    root: 'border-[var(--term-yellow)]/40 bg-[color-mix(in_oklab,var(--term-yellow)_8%,transparent)]',
    label: 'text-[var(--term-yellow)]',
    timestamp: 'text-[var(--term-yellow)]/60',
  },
  error: {
    root: 'border-[var(--term-red)]/40 bg-[color-mix(in_oklab,var(--term-red)_8%,transparent)]',
    label: 'text-[var(--term-red)]',
    timestamp: 'text-[var(--term-red)]/60',
  },
}

/**
 * Displays a terminal-style phase separator for visual boundaries in feeds.
 * Used to mark different phases like "Build", "Test", "Deploy" in sequential outputs.
 *
 * Renders a left-bordered row with a semantic background tint, a bold phase label,
 * and an optional timestamp. Fully theme-aware via CSS custom properties and
 * naturally responsive at any width.
 *
 * @param label     - Phase label text (e.g., "Build", "Test", "Deploy")
 * @param timestamp - Optional timestamp to display after the label
 * @param variant   - Visual style for semantic coloring (default: 'neutral')
 * @param className - Additional CSS classes for layout overrides
 *
 * @example
 * ```tsx
 * <TerminalMarker label="BUILD"  timestamp="10:23:45" variant="info" />
 * <TerminalMarker label="TEST"   timestamp="10:24:01" variant="success" />
 * <TerminalMarker label="DEPLOY" timestamp="10:24:30" variant="warning" />
 * <TerminalMarker label="DONE"   timestamp="10:24:45" variant="success" />
 * ```
 */
export function TerminalMarker({
  label,
  timestamp,
  variant = 'neutral',
  className = '',
}: TerminalMarkerProps) {
  const cls = variantClasses[variant]

  return (
    <div
      className={`flex min-w-0 items-center gap-3 border-l-2 pl-3 py-1.5 my-2 rounded-r ${cls.root} ${className}`.trim()}
    >
      <span
        className={`shrink-0 font-mono text-xs font-semibold tracking-widest uppercase ${cls.label}`}
      >
        {label}
      </span>
      {timestamp && (
        <span className={`font-mono text-xs truncate ${cls.timestamp}`}>{timestamp}</span>
      )}
    </div>
  )
}
