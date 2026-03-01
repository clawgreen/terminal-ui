'use client'

import { useId } from 'react'
import type { TerminalLogLineProps } from './terminal-log-line'
import type { LogEntry } from './terminal-log'

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogLevel = NonNullable<TerminalLogLineProps['level']>

/**
 * The controlled state for `TerminalFilterBar`.
 *
 * - `levels`  — set of active levels. Empty array = all levels visible.
 * - `text`    — case-insensitive substring filter applied to `message` and `source`.
 * - `sources` — set of active sources. Empty array = all sources visible.
 */
export interface FilterBarState {
  levels: LogLevel[]
  text: string
  sources: string[]
}

/** Returns a `FilterBarState` with all filters cleared (show everything). */
export function emptyFilterState(): FilterBarState {
  return { levels: [], text: '', sources: [] }
}

export interface TerminalFilterBarProps {
  /** Current filter state (controlled). */
  state: FilterBarState
  /** Called whenever the user changes any filter value. */
  onChange: (next: FilterBarState) => void
  /**
   * Available source options to show as toggle buttons.
   * When empty or omitted the source row is hidden.
   */
  sources?: string[]
  /** Additional CSS classes for layout overrides. */
  className?: string
}

// ── Level metadata ────────────────────────────────────────────────────────────

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success']

/** Active (toggled-on) Tailwind classes per level — mirrors TerminalLogLine badge palette. */
const levelActiveClasses: Record<LogLevel, string> = {
  debug: 'border-(--glass-border)      text-(--term-fg-dim)    bg-[rgba(255,255,255,0.06)]',
  info: 'border-[var(--term-blue)]/40  text-(--term-blue)      bg-[color-mix(in_oklab,var(--term-blue)_14%,transparent)]',
  warn: 'border-[var(--term-yellow)]/40 text-(--term-yellow)   bg-[color-mix(in_oklab,var(--term-yellow)_14%,transparent)]',
  error:
    'border-[var(--term-red)]/40   text-(--term-red)       bg-[color-mix(in_oklab,var(--term-red)_14%,transparent)]',
  success:
    'border-[var(--term-green)]/40 text-(--term-green)     bg-[color-mix(in_oklab,var(--term-green)_14%,transparent)]',
}

const levelLabel: Record<LogLevel, string> = {
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
  success: 'OK',
}

// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * Pure filtering helper — apply a `FilterBarState` to a `LogEntry[]`.
 *
 * Rules:
 * - If `state.levels` is empty, all levels pass.
 * - If `state.sources` is empty, all sources pass.
 * - `state.text` is trimmed and matched case-insensitively against `message` and `source`.
 *
 * @example
 * ```tsx
 * const visible = filterEntries(entries, filterState)
 * <TerminalLog entries={visible} />
 * ```
 */
export function filterEntries(entries: LogEntry[], state: FilterBarState): LogEntry[] {
  const needle = state.text.trim().toLowerCase()

  return entries.filter((entry) => {
    // Level filter
    if (state.levels.length > 0) {
      const entryLevel: LogLevel = entry.level ?? 'info'
      if (!state.levels.includes(entryLevel)) return false
    }

    // Source filter
    if (state.sources.length > 0) {
      if (!entry.source || !state.sources.includes(entry.source)) return false
    }

    // Text filter
    if (needle) {
      const msg = (typeof entry.message === 'string' ? entry.message : '').toLowerCase()
      const src = (entry.source ?? '').toLowerCase()
      if (!msg.includes(needle) && !src.includes(needle)) return false
    }

    return true
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * A compact controlled filter bar for terminal feed views.
 *
 * Provides three composable filters:
 * 1. **Level toggles** — click to include/exclude `debug | info | warn | error | success`.
 *    No levels selected = all levels shown.
 * 2. **Text search** — case-insensitive substring match across `message` and `source`.
 * 3. **Source toggles** — only rendered when the `sources` prop is non-empty.
 *    No sources selected = all sources shown.
 *
 * Pair with the exported `filterEntries` helper to apply the state:
 * ```tsx
 * const [filter, setFilter] = useState(emptyFilterState)
 * const visible = filterEntries(entries, filter)
 *
 * <TerminalFilterBar state={filter} onChange={setFilter} sources={allSources} />
 * <TerminalLog entries={visible} autoScroll />
 * ```
 *
 * All controls are keyboard-accessible (native `<button>` and `<input>`).
 *
 * @param state     - Controlled filter state
 * @param onChange  - Callback fired on every change
 * @param sources   - Available source labels rendered as toggle buttons
 * @param className - Additional CSS classes
 */
export function TerminalFilterBar({
  state,
  onChange,
  sources = [],
  className = '',
}: TerminalFilterBarProps) {
  const inputId = useId()

  function toggleLevel(level: LogLevel) {
    const next = state.levels.includes(level)
      ? state.levels.filter((l) => l !== level)
      : [...state.levels, level]
    onChange({ ...state, levels: next })
  }

  function toggleSource(source: string) {
    const next = state.sources.includes(source)
      ? state.sources.filter((s) => s !== source)
      : [...state.sources, source]
    onChange({ ...state, sources: next })
  }

  function clearText() {
    onChange({ ...state, text: '' })
  }

  const hasActiveFilters =
    state.levels.length > 0 || state.sources.length > 0 || state.text.trim().length > 0

  return (
    <div
      className={`flex flex-col gap-2 rounded border border-(--glass-border) bg-(--term-bg-light) p-2 font-mono text-xs ${className}`.trim()}
    >
      {/* Row 1: level toggles + text input */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Level toggles */}
        <span className="shrink-0 text-(--term-fg-dim) select-none">level:</span>
        {LEVELS.map((level) => {
          const active = state.levels.includes(level)
          return (
            <button
              key={level}
              type="button"
              aria-pressed={active}
              aria-label={`Toggle ${level} level`}
              onClick={() => toggleLevel(level)}
              className={[
                'inline-flex items-center rounded border px-1.5 py-px font-mono text-[10px] font-semibold leading-none tracking-wider transition-opacity',
                active
                  ? levelActiveClasses[level]
                  : 'border-(--glass-border) text-(--term-fg-dim) bg-transparent opacity-40 hover:opacity-70',
              ].join(' ')}
            >
              {levelLabel[level]}
            </button>
          )
        })}

        {/* Separator */}
        <span className="mx-0.5 h-3 w-px bg-(--glass-border) shrink-0" aria-hidden="true" />

        {/* Text search */}
        <label htmlFor={inputId} className="sr-only">
          Filter by text
        </label>
        <div className="relative flex items-center">
          {/* Search icon — inline SVG avoids lucide React-version type conflicts */}
          <svg
            viewBox="0 0 16 16"
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pointer-events-none absolute left-2 text-(--term-fg-dim)"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input
            id={inputId}
            type="text"
            value={state.text}
            onChange={(e) => onChange({ ...state, text: e.target.value })}
            placeholder="filter…"
            spellCheck={false}
            className="h-5 w-36 rounded border border-(--glass-border) bg-transparent pl-6 pr-5 text-xs text-(--term-fg) placeholder:text-(--term-fg-dim) focus:outline-none focus:border-(--term-blue)/60 transition-colors"
          />
          {state.text && (
            <button
              type="button"
              aria-label="Clear text filter"
              onClick={clearText}
              className="absolute right-1.5 text-(--term-fg-dim) hover:text-(--term-fg) transition-colors"
            >
              {/* Clear icon — inline SVG */}
              <svg
                viewBox="0 0 16 16"
                width="10"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          )}
        </div>

        {/* Clear-all pill — only shown when any filter is active */}
        {hasActiveFilters && (
          <button
            type="button"
            aria-label="Clear all filters"
            onClick={() => onChange(emptyFilterState())}
            className="ml-auto shrink-0 rounded border border-(--glass-border) px-1.5 py-px text-[10px] text-(--term-fg-dim) hover:text-(--term-fg) hover:border-(--term-fg-dim)/60 transition-colors"
          >
            clear
          </button>
        )}
      </div>

      {/* Row 2: source toggles (only when sources provided) */}
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="shrink-0 text-(--term-fg-dim) select-none">source:</span>
          {sources.map((src) => {
            const active = state.sources.includes(src)
            return (
              <button
                key={src}
                type="button"
                aria-pressed={active}
                aria-label={`Toggle source ${src}`}
                onClick={() => toggleSource(src)}
                className={[
                  'inline-flex items-center rounded border px-1.5 py-px text-[10px] leading-none transition-opacity',
                  active
                    ? 'border-(--glass-border) text-(--term-fg) bg-[rgba(255,255,255,0.06)] opacity-100'
                    : 'border-(--glass-border) text-(--term-fg-dim) bg-transparent opacity-40 hover:opacity-70',
                ].join(' ')}
              >
                {src}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
