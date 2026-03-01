'use client'

import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'

// ── useTerminalSearch hook ────────────────────────────────────────────────────

export interface UseTerminalSearchOptions {
  /** Case-sensitive matching (default: false). */
  caseSensitive?: boolean
}

export interface UseTerminalSearchResult {
  query: string
  setQuery: (q: string) => void
  /** Indices of `items` entries whose text contains the query. */
  matchIndices: number[]
  /** Total number of matching entries. */
  matchCount: number
  /** 0-based position within `matchIndices` (−1 when no query / no matches). */
  currentIndex: number
  /** 1-based match number for display ("2 of 5"), or 0 when no match. */
  currentMatchNumber: number
  /** Advance to the next match (wraps around). */
  next: () => void
  /** Go to the previous match (wraps around). */
  prev: () => void
  /** Returns true when `itemIndex` is any matched entry. */
  isMatch: (itemIndex: number) => boolean
  /** Returns true when `itemIndex` is the *current* highlighted entry. */
  isCurrentMatch: (itemIndex: number) => boolean
}

/**
 * Stateful hook that drives in-feed search over a flat string array.
 *
 * Each item in `items` is compared against the controlled `query`.
 * For structured log entries, map them to strings before passing in:
 *
 * ```ts
 * const searchItems = entries.map(e => [e.message, e.source ?? ''].join(' '))
 * const search = useTerminalSearch(searchItems)
 * ```
 *
 * @param items   - Flat array of strings to search within.
 * @param options - Optional configuration.
 */
export function useTerminalSearch(
  items: string[],
  options: UseTerminalSearchOptions = {}
): UseTerminalSearchResult {
  const { caseSensitive = false } = options
  const [query, setQueryRaw] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  const matchIndices = useMemo<number[]>(() => {
    const q = caseSensitive ? query : query.toLowerCase()
    if (!q) return []
    return items.reduce<number[]>((acc, item, i) => {
      const haystack = caseSensitive ? item : item.toLowerCase()
      if (haystack.includes(q)) acc.push(i)
      return acc
    }, [])
  }, [items, query, caseSensitive])

  // Clamp currentIndex whenever matchIndices changes.
  const safeCurrentIndex =
    matchIndices.length === 0 ? -1 : Math.min(currentIndex, matchIndices.length - 1)

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
    setCurrentIndex(0)
  }, [])

  const next = useCallback(() => {
    if (matchIndices.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % matchIndices.length)
  }, [matchIndices.length])

  const prev = useCallback(() => {
    if (matchIndices.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + matchIndices.length) % matchIndices.length)
  }, [matchIndices.length])

  const matchSet = useMemo(() => new Set(matchIndices), [matchIndices])

  const isMatch = useCallback((itemIndex: number) => matchSet.has(itemIndex), [matchSet])

  const isCurrentMatch = useCallback(
    (itemIndex: number) => safeCurrentIndex >= 0 && matchIndices[safeCurrentIndex] === itemIndex,
    [safeCurrentIndex, matchIndices]
  )

  return {
    query,
    setQuery,
    matchIndices,
    matchCount: matchIndices.length,
    currentIndex: safeCurrentIndex,
    currentMatchNumber: safeCurrentIndex >= 0 ? safeCurrentIndex + 1 : 0,
    next,
    prev,
    isMatch,
    isCurrentMatch,
  }
}

// ── TerminalSearch component ──────────────────────────────────────────────────

export interface TerminalSearchProps {
  /** Controlled query value. */
  query: string
  /** Called when the user edits the query. */
  onQueryChange: (q: string) => void
  /**
   * Total number of matches across the feed.
   * When `undefined` the match counter is hidden.
   */
  matchCount?: number
  /**
   * 1-based index of the currently focused match (e.g. `2` → "2 / 5").
   * When `undefined` or `0` only `matchCount` is shown.
   */
  currentMatch?: number
  /** Navigate to the next match. Bound to `Enter` / ↓ button. */
  onNext?: () => void
  /** Navigate to the previous match. Bound to `Shift+Enter` / ↑ button. */
  onPrev?: () => void
  /** Input placeholder text (default: "Search logs…"). */
  placeholder?: string
  /** Additional wrapper classes for layout overrides. */
  className?: string
}

/**
 * In-feed search bar for terminal log viewers.
 *
 * Keyboard bindings (when the input is focused):
 * - **Enter** → next match
 * - **Shift+Enter** → previous match
 * - **Escape** → clear query
 *
 * Pair with `useTerminalSearch` to drive the match state:
 *
 * ```tsx
 * const search = useTerminalSearch(items)
 *
 * <TerminalSearch
 *   query={search.query}
 *   onQueryChange={search.setQuery}
 *   matchCount={search.matchCount}
 *   currentMatch={search.currentMatchNumber}
 *   onNext={search.next}
 *   onPrev={search.prev}
 * />
 * ```
 */
export function TerminalSearch({
  query,
  onQueryChange,
  matchCount,
  currentMatch,
  onNext,
  onPrev,
  placeholder = 'Search logs…',
  className = '',
}: TerminalSearchProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  // Derived state
  const hasQuery = query.length > 0
  const noMatches = hasQuery && matchCount !== undefined && matchCount === 0
  const showCounter = hasQuery && matchCount !== undefined && matchCount > 0

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        onPrev?.()
      } else {
        onNext?.()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onQueryChange('')
      inputRef.current?.blur()
    }
  }

  function handleClear() {
    onQueryChange('')
    inputRef.current?.focus()
  }

  return (
    <div
      className={`flex items-center gap-1 rounded border font-mono text-xs transition-colors
        ${
          noMatches
            ? 'border-(--term-red)/50 bg-[color-mix(in_oklab,var(--term-red)_6%,transparent)]'
            : 'border-(--glass-border) bg-(--term-bg)/40'
        }
        ${className}`.trim()}
      role="search"
    >
      {/* Search icon */}
      <label htmlFor={inputId} className="pl-2.5 shrink-0">
        <Search
          size={12}
          className={`transition-colors ${noMatches ? 'text-(--term-red)' : 'text-(--term-fg-dim)'}`}
          aria-hidden="true"
        />
        <span className="sr-only">Search logs</span>
      </label>

      {/* Input */}
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label="Search logs"
        aria-live="polite"
        aria-atomic="true"
        className={`min-w-0 flex-1 bg-transparent py-1.5 outline-none placeholder:text-(--term-fg-dim)/50
          ${noMatches ? 'text-(--term-red)' : 'text-(--term-fg)'}`}
      />

      {/* Match counter */}
      {showCounter && (
        <span
          className="shrink-0 whitespace-nowrap tabular-nums text-(--term-fg-dim) pr-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentMatch ? `${currentMatch} / ${matchCount}` : matchCount}
        </span>
      )}

      {/* No-match label */}
      {noMatches && (
        <span
          className="shrink-0 whitespace-nowrap text-(--term-red) pr-1"
          role="status"
          aria-live="polite"
        >
          no match
        </span>
      )}

      {/* Prev / Next navigation buttons */}
      {(onPrev || onNext) && (
        <div className="flex shrink-0 items-center border-l border-(--glass-border)">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasQuery || (matchCount !== undefined && matchCount === 0)}
            aria-label="Previous match (Shift+Enter)"
            title="Previous match (Shift+Enter)"
            className="flex items-center justify-center px-1.5 py-1.5
              text-(--term-fg-dim) transition-colors
              hover:text-(--term-fg)
              disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronUp size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasQuery || (matchCount !== undefined && matchCount === 0)}
            aria-label="Next match (Enter)"
            title="Next match (Enter)"
            className="flex items-center justify-center px-1.5 py-1.5
              text-(--term-fg-dim) transition-colors
              hover:text-(--term-fg)
              disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Clear button */}
      {hasQuery && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear (Escape)"
          className="flex shrink-0 items-center justify-center px-2 py-1.5
            text-(--term-fg-dim) transition-colors hover:text-(--term-fg)"
        >
          <X size={11} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
