'use client'

import { useEffect, useMemo, useRef } from 'react'
import { TerminalLogLine, type TerminalLogLineProps } from './terminal-log-line'

// ── Structured entry type ─────────────────────────────────────────────────────

/**
 * A structured log entry for use with the `entries` prop on `TerminalLog`.
 * All fields except `message` are optional to keep the type lightweight.
 */
export interface LogEntry {
  /** Unique key for React reconciliation. Falls back to index when omitted. */
  id?: string
  /** Log message body. */
  message: string
  /** Severity level — controls badge color (default: 'info'). */
  level?: TerminalLogLineProps['level']
  /** Optional timestamp string (e.g. "10:23:45"). */
  timestamp?: string
  /** Optional source / subsystem label (e.g. "server", "db"). */
  source?: string
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface TerminalLogProps {
  /**
   * Plain string lines (backward-compatible path).
   * Ignored when `entries` is also provided.
   */
  lines?: string[]
  /**
   * Structured log entries rendered via `TerminalLogLine` with level badges,
   * timestamps, and source labels. Takes precedence over `lines`.
   */
  entries?: LogEntry[]
  /** Maximum number of lines rendered (default: 200). */
  maxLines?: number
  /** Auto-scroll to the newest line when new logs arrive (default: false). */
  autoScroll?: boolean
  /** Optional className for custom layout adjustments. */
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays a terminal-style scrolling log buffer.
 *
 * Supports two rendering modes:
 *
 * **String mode** (backward-compatible):
 * ```tsx
 * <TerminalLog lines={streamingLogs} maxLines={100} autoScroll />
 * ```
 *
 * **Structured mode** (uses `TerminalLogLine` internally):
 * ```tsx
 * const entries: LogEntry[] = [
 *   { id: '1', level: 'info',  timestamp: '10:23:45', source: 'server', message: 'Listening on :3000' },
 *   { id: '2', level: 'error', timestamp: '10:23:48', source: 'db',     message: 'Connection refused' },
 * ]
 * <TerminalLog entries={entries} maxLines={100} autoScroll />
 * ```
 *
 * When both props are supplied, `entries` takes precedence.
 *
 * @param lines     - Plain string lines (existing API, fully backward-compatible)
 * @param entries   - Structured log entries with optional level/timestamp/source
 * @param maxLines  - Maximum number of visible lines kept in view (default: 200)
 * @param autoScroll - Stick to the latest line on updates (default: false)
 * @param className - Additional wrapper classes
 */
export function TerminalLog({
  lines = [],
  entries,
  maxLines = 200,
  autoScroll = false,
  className = '',
}: TerminalLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const safeMaxLines = Math.max(1, Math.floor(maxLines))

  // Determine render mode once per render.
  const structured = entries !== undefined

  const visibleEntries = useMemo(
    () =>
      structured
        ? (entries as LogEntry[]).slice(Math.max(0, (entries as LogEntry[]).length - safeMaxLines))
        : null,
    [structured, entries, safeMaxLines]
  )

  const visibleLines = useMemo(
    () => (structured ? null : lines.slice(Math.max(0, lines.length - safeMaxLines))),
    [structured, lines, safeMaxLines]
  )

  // Scroll sentinel: depend on whichever array is active.
  const scrollDep = structured ? visibleEntries : visibleLines

  useEffect(() => {
    if (!autoScroll || !containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [autoScroll, scrollDep])

  return (
    <div
      ref={containerRef}
      className={`max-h-64 overflow-auto rounded border border-(--glass-border) bg-(--term-bg)/40 p-3 font-mono text-xs ${className}`.trim()}
      role="log"
      aria-live={autoScroll ? 'polite' : 'off'}
      aria-relevant="additions text"
    >
      {structured
        ? visibleEntries!.map((entry, index) => (
            <TerminalLogLine
              key={entry.id ?? index}
              message={entry.message}
              level={entry.level}
              timestamp={entry.timestamp}
              source={entry.source}
            />
          ))
        : visibleLines!.map((line, index) => (
            <div
              key={`${index}-${line}`}
              className="whitespace-pre-wrap break-all text-(--term-fg-dim) leading-5 py-0.5"
            >
              {line}
            </div>
          ))}
    </div>
  )
}
