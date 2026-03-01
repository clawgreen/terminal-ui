'use client'

import { ReactNode } from 'react'

export interface TerminalLogLineProps {
  /** Primary log message content. */
  message: ReactNode
  /** Severity level — controls the label color (default: 'info'). */
  level?: 'debug' | 'info' | 'warn' | 'error' | 'success'
  /** Optional timestamp string (e.g. "10:23:45" or ISO). */
  timestamp?: string
  /** Optional source / subsystem label (e.g. "server", "db"). */
  source?: string
  /** Additional classes for layout overrides. */
  className?: string
}

/**
 * Per-level color tokens — border, background tint, and text colors.
 *
 * `badge`   — the [LEVEL] indicator pill (border + bg tint, consistent with TerminalBadge)
 * `message` — foreground for the message body (dimmed for debug, red for error)
 */
const levelClasses: Record<
  NonNullable<TerminalLogLineProps['level']>,
  { badge: string; message: string }
> = {
  debug: {
    badge: 'border-(--glass-border) text-(--term-fg-dim) bg-[rgba(255,255,255,0.03)]',
    message: 'text-(--term-fg-dim)',
  },
  info: {
    badge:
      'border-[var(--term-blue)]/40 text-(--term-blue) bg-[color-mix(in_oklab,var(--term-blue)_10%,transparent)]',
    message: 'text-(--term-fg)',
  },
  warn: {
    badge:
      'border-[var(--term-yellow)]/40 text-(--term-yellow) bg-[color-mix(in_oklab,var(--term-yellow)_10%,transparent)]',
    message: 'text-(--term-fg)',
  },
  error: {
    badge:
      'border-[var(--term-red)]/40 text-(--term-red) bg-[color-mix(in_oklab,var(--term-red)_10%,transparent)]',
    message: 'text-(--term-red)',
  },
  success: {
    badge:
      'border-[var(--term-green)]/40 text-(--term-green) bg-[color-mix(in_oklab,var(--term-green)_10%,transparent)]',
    message: 'text-(--term-fg)',
  },
}

/**
 * 3-character uppercase level labels.
 * All entries are exactly 3 chars so the badge pill stays a consistent width
 * across levels in a monospace font.
 */
const levelLabel: Record<NonNullable<TerminalLogLineProps['level']>, string> = {
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
  success: 'OK',
}

/**
 * A single structured log row primitive for terminal-style feeds.
 *
 * Renders a monospace row with an optional timestamp, a compact level badge,
 * an optional source label, and the log message. All color tokens are derived
 * from CSS custom properties, making the component fully theme-aware.
 *
 * Layout (left → right):
 * ```
 * [timestamp]  [LVL]  source  message
 * ```
 *
 * @param message   - Log message body (string or any React node)
 * @param level     - Severity (debug | info | warn | error | success); default 'info'
 * @param timestamp - Optional timestamp string shown in dim foreground
 * @param source    - Optional subsystem / service label shown after the badge
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TerminalLogLine level="info"    timestamp="10:23:45" source="server" message="Listening on :3000" />
 * <TerminalLogLine level="warn"    timestamp="10:23:47" source="auth"   message="Token expiring in 5 min" />
 * <TerminalLogLine level="error"   timestamp="10:23:48" source="db"     message="Connection refused" />
 * <TerminalLogLine level="success" timestamp="10:23:49" source="build"  message="Compiled 42 modules" />
 * <TerminalLogLine level="debug"   timestamp="10:23:50" source="worker" message="Spawned 4 threads" />
 * ```
 */
export function TerminalLogLine({
  message,
  level = 'info',
  timestamp,
  source,
  className = '',
}: TerminalLogLineProps) {
  const cls = levelClasses[level]

  return (
    <div
      className={`flex min-w-0 items-baseline gap-2 py-0.5 font-mono text-xs leading-5 ${className}`.trim()}
    >
      {/* Timestamp */}
      {timestamp && <span className="shrink-0 tabular-nums text-(--term-fg-dim)">{timestamp}</span>}

      {/* Level badge — fixed width keeps columns aligned in monospace feeds */}
      <span
        className={`shrink-0 inline-flex w-[calc(3ch+0.5rem)] justify-center rounded border py-px font-mono text-[10px] font-semibold leading-none tracking-wider ${cls.badge}`}
      >
        {levelLabel[level]}
      </span>

      {/* Source */}
      {source && <span className="shrink-0 text-(--term-fg-dim)">{source}</span>}

      {/* Message */}
      <span className={`min-w-0 wrap-break-word ${cls.message}`}>{message}</span>
    </div>
  )
}
