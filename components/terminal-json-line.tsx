'use client'

import { useId, useMemo, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TerminalJsonLineProps {
  /**
   * The data to render. Accepts:
   * - A plain JS object / array / primitive — serialised automatically.
   * - A raw JSON string — parsed and validated; shown as invalid if malformed.
   */
  payload: unknown
  /**
   * Optional label rendered before the collapsed summary (e.g. a field name or event type).
   */
  label?: string
  /** Start in expanded state (default: false). */
  defaultExpanded?: boolean
  /** Additional CSS classes for layout overrides. */
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ParseResult {
  value: unknown
  pretty: string
  invalid: boolean
  /** Short one-line summary for the collapsed row. */
  summary: string
}

function parse(payload: unknown): ParseResult {
  // If the caller passed a raw string, try to parse it as JSON.
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload)
      const pretty = JSON.stringify(parsed, null, 2)
      return { value: parsed, pretty, invalid: false, summary: summarise(parsed) }
    } catch {
      // Not valid JSON — treat as opaque string.
      const truncated = payload.length > 60 ? payload.slice(0, 60) + '…' : payload
      return {
        value: payload,
        pretty: payload,
        invalid: true,
        summary: `"${truncated}"`,
      }
    }
  }

  // Already a JS value — serialise directly.
  try {
    const pretty = JSON.stringify(payload, null, 2)
    return { value: payload, pretty, invalid: false, summary: summarise(payload) }
  } catch {
    return { value: payload, pretty: String(payload), invalid: true, summary: String(payload) }
  }
}

function summarise(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[ ${value.length} item${value.length === 1 ? '' : 's'} ]`
  if (typeof value === 'object') {
    const keys = Object.keys(value as object).length
    return `{ ${keys} key${keys === 1 ? '' : 's'} }`
  }
  // Primitives — show inline, truncated.
  const str = JSON.stringify(value) ?? String(value)
  return str.length > 60 ? str.slice(0, 60) + '…' : str
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A collapsible JSON payload renderer for terminal log feeds.
 *
 * Renders a compact one-line summary by default. Clicking the row (or pressing
 * Enter / Space) toggles a fully expanded, Prism-highlighted pretty-print view.
 *
 * Handles invalid JSON gracefully — shows the raw value with a warning indicator
 * instead of throwing. Large payloads are constrained to a scrollable code block.
 *
 * @param payload          - JS value or raw JSON string to display
 * @param label            - Optional label prefix shown before the summary
 * @param defaultExpanded  - Start in expanded state (default: false)
 * @param className        - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Object payload
 * <TerminalJsonLine label="event" payload={{ type: 'deploy', status: 'ok', ts: 1709900000 }} />
 *
 * // Raw JSON string
 * <TerminalJsonLine label="response" payload='{"status":200,"body":"ok"}' />
 *
 * // Invalid JSON — rendered safely
 * <TerminalJsonLine payload="not { valid ] json" />
 *
 * // Start expanded
 * <TerminalJsonLine payload={largeObject} defaultExpanded />
 * ```
 */
export function TerminalJsonLine({
  payload,
  label,
  defaultExpanded = false,
  className = '',
}: TerminalJsonLineProps) {
  const id = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)

  const parsed = useMemo(() => parse(payload), [payload])

  const highlightedHtml = useMemo(() => {
    if (parsed.invalid) return null
    const grammar = Prism.languages['json']
    if (!grammar) return null
    try {
      return Prism.highlight(parsed.pretty, grammar, 'json')
    } catch {
      return null
    }
  }, [parsed])

  function toggle() {
    setExpanded((v) => !v)
  }

  return (
    <div className={`font-mono text-xs leading-5 ${className}`.trim()}>
      {/* ── Collapsed row (always visible) ── */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={toggle}
        className="flex w-full min-w-0 items-baseline gap-1.5 text-left hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-(--term-blue)/60 rounded"
      >
        {/* Chevron */}
        <span
          className="shrink-0 text-(--term-fg-dim) transition-transform duration-150"
          style={{ display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▶
        </span>

        {/* Label */}
        {label && (
          <span className="shrink-0 text-(--term-fg-dim)">{label}:</span>
        )}

        {/* Invalid indicator */}
        {parsed.invalid && (
          <span className="shrink-0 rounded border border-(--term-yellow)/40 px-1 py-px text-[10px] font-semibold leading-none text-(--term-yellow) bg-[color-mix(in_oklab,var(--term-yellow)_10%,transparent)]">
            INVALID
          </span>
        )}

        {/* Summary */}
        <span className={`min-w-0 truncate ${parsed.invalid ? 'text-(--term-yellow)' : 'text-(--term-fg)'}`}>
          {parsed.summary}
        </span>
      </button>

      {/* ── Expanded view ── */}
      {expanded && (
        <div
          id={id}
          className="mt-1 max-h-72 overflow-auto rounded border border-(--glass-border) bg-(--term-bg-light) p-3"
        >
          {highlightedHtml ? (
            <code
              className="terminal-code block whitespace-pre text-xs leading-5"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap break-all text-xs leading-5 text-(--term-yellow)">
              {parsed.pretty}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
