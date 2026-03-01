'use client'

import { useId, useState, type ReactNode } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type GroupVariant = 'default' | 'info' | 'warn' | 'error' | 'success'

export interface TerminalGroupProps {
  /**
   * Header title displayed next to the expand/collapse caret.
   * Keep it short — it sits in a monospace row alongside summary and count.
   */
  title: string
  /**
   * Optional one-line description shown after the title in dim foreground.
   * Ideal for a status message, step description, or abbreviated output.
   */
  summary?: string
  /**
   * Hint label rendered as a pill on the right of the header row.
   * Typical use: `"42 lines"`, `"3 errors"`, `"1.2s"`.
   */
  countLabel?: string
  /**
   * Left-border accent colour (default: `'default'` — no accent).
   * Maps to the same CSS custom properties as `TerminalLogLine` level badges.
   */
  variant?: GroupVariant
  /**
   * Uncontrolled initial open state (default: `true`).
   * Ignored when `open` is provided.
   */
  defaultOpen?: boolean
  /**
   * Controlled open state.  Must be paired with `onOpenChange`.
   */
  open?: boolean
  /**
   * Called when the user toggles the group header.
   */
  onOpenChange?: (open: boolean) => void
  /** Content rendered inside the collapsible region. */
  children: ReactNode
  /** Additional wrapper classes for layout overrides. */
  className?: string
}

// ── Variant tokens ────────────────────────────────────────────────────────────

const variantTokens: Record<
  GroupVariant,
  { border: string; headerHover: string; countBadge: string }
> = {
  default: {
    border: 'border-(--glass-border)',
    headerHover: 'hover:bg-[rgba(255,255,255,0.03)]',
    countBadge: 'border-(--glass-border) text-(--term-fg-dim) bg-[rgba(255,255,255,0.04)]',
  },
  info: {
    border: 'border-[var(--term-blue)]/30',
    headerHover: 'hover:bg-[color-mix(in_oklab,var(--term-blue)_5%,transparent)]',
    countBadge:
      'border-[var(--term-blue)]/30 text-(--term-blue) bg-[color-mix(in_oklab,var(--term-blue)_10%,transparent)]',
  },
  warn: {
    border: 'border-[var(--term-yellow)]/30',
    headerHover: 'hover:bg-[color-mix(in_oklab,var(--term-yellow)_5%,transparent)]',
    countBadge:
      'border-[var(--term-yellow)]/30 text-(--term-yellow) bg-[color-mix(in_oklab,var(--term-yellow)_10%,transparent)]',
  },
  error: {
    border: 'border-[var(--term-red)]/30',
    headerHover: 'hover:bg-[color-mix(in_oklab,var(--term-red)_5%,transparent)]',
    countBadge:
      'border-[var(--term-red)]/30 text-(--term-red) bg-[color-mix(in_oklab,var(--term-red)_10%,transparent)]',
  },
  success: {
    border: 'border-[var(--term-green)]/30',
    headerHover: 'hover:bg-[color-mix(in_oklab,var(--term-green)_5%,transparent)]',
    countBadge:
      'border-[var(--term-green)]/30 text-(--term-green) bg-[color-mix(in_oklab,var(--term-green)_10%,transparent)]',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A collapsible command/output group for terminal-style log feeds.
 *
 * Renders a single-row header (caret · title · summary · count pill) above a
 * content region that can be toggled open or closed.  Supports both
 * **uncontrolled** (`defaultOpen`) and **controlled** (`open` + `onOpenChange`)
 * modes.
 *
 * ```
 * ▾ Install dependencies          Resolving packages…   42 lines
 * │ [INF] 10:23:45  npm  Fetching react@19.2.0
 * │ [INF] 10:23:46  npm  Fetching typescript@5.8.2
 * │  …
 * ```
 *
 * ARIA: the toggle `<button>` carries `aria-expanded` and `aria-controls`;
 * the content region has `role="region"` and a matching `aria-labelledby`.
 *
 * @example
 * ```tsx
 * <TerminalGroup
 *   title="Install"
 *   summary="42 packages"
 *   countLabel="1.4s"
 *   variant="success"
 *   defaultOpen={false}
 * >
 *   <TerminalLogLine level="info" message="Fetching react@19.2.0" />
 *   <TerminalLogLine level="success" message="Installed 42 packages" />
 * </TerminalGroup>
 * ```
 */
export function TerminalGroup({
  title,
  summary,
  countLabel,
  variant = 'default',
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  children,
  className = '',
}: TerminalGroupProps) {
  const regionId = useId()
  const headerId = useId()

  // Support both controlled and uncontrolled modes.
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = isControlled ? controlledOpen : internalOpen

  function toggle() {
    const next = !isOpen
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const tokens = variantTokens[variant]

  return (
    <div className={`font-mono text-xs ${className}`.trim()}>
      {/* ── Header row ── */}
      <button
        type="button"
        id={headerId}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={regionId}
        className={`group flex w-full min-w-0 items-center gap-2 rounded px-2 py-1
          text-left transition-colors
          focus-visible:ring-2 focus-visible:ring-(--term-blue)/60 focus-visible:ring-offset-1
          ${tokens.headerHover}`}
      >
        {/* Caret — rotates 90° when open */}
        <span
          aria-hidden="true"
          className={`shrink-0 text-(--term-fg-dim) transition-transform duration-150
            ${isOpen ? 'rotate-90' : 'rotate-0'}`}
          style={{ display: 'inline-block' }}
        >
          ▶
        </span>

        {/* Title */}
        <span className="shrink-0 font-semibold text-(--term-fg)">{title}</span>

        {/* Summary — grows to fill available space */}
        {summary && <span className="min-w-0 flex-1 truncate text-(--term-fg-dim)">{summary}</span>}

        {/* Spacer when no summary */}
        {!summary && <span className="flex-1" aria-hidden="true" />}

        {/* Count / duration pill */}
        {countLabel && (
          <span
            className={`shrink-0 rounded border px-1.5 py-px text-[10px] leading-none
              ${tokens.countBadge}`}
          >
            {countLabel}
          </span>
        )}
      </button>

      {/* ── Collapsible content region ── */}
      <div
        id={regionId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className={`ml-4 border-l pl-3 ${tokens.border}`}
      >
        {children}
      </div>
    </div>
  )
}
