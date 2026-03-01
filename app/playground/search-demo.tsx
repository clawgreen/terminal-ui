'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import {
  Terminal,
  TerminalCommand,
  TerminalLogLine,
  TerminalSearch,
  useTerminalSearch,
  type LogEntry,
} from '@/components/terminal'
import { TerminalLog } from '@/components/terminal-log'

// ── Static log fixture ────────────────────────────────────────────────────────

const SEARCH_ENTRIES: LogEntry[] = [
  {
    id: '0',
    level: 'info',
    timestamp: '12:00:01',
    source: 'server',
    message: 'HTTP server listening on :3000',
  },
  {
    id: '1',
    level: 'info',
    timestamp: '12:00:02',
    source: 'db',
    message: 'PostgreSQL connection pool ready (max: 10)',
  },
  {
    id: '2',
    level: 'debug',
    timestamp: '12:00:03',
    source: 'cache',
    message: 'Redis connected at 127.0.0.1:6379',
  },
  {
    id: '3',
    level: 'info',
    timestamp: '12:00:04',
    source: 'server',
    message: 'GET /api/health → 200 OK (3ms)',
  },
  {
    id: '4',
    level: 'warn',
    timestamp: '12:00:05',
    source: 'db',
    message: 'Slow query detected: SELECT * FROM sessions (450ms)',
  },
  {
    id: '5',
    level: 'info',
    timestamp: '12:00:06',
    source: 'server',
    message: 'POST /api/login → 200 OK (22ms)',
  },
  {
    id: '6',
    level: 'debug',
    timestamp: '12:00:07',
    source: 'cache',
    message: 'MISS sessions:user:42',
  },
  {
    id: '7',
    level: 'info',
    timestamp: '12:00:08',
    source: 'db',
    message: 'Inserted session for user:42',
  },
  {
    id: '8',
    level: 'error',
    timestamp: '12:00:09',
    source: 'server',
    message: 'POST /api/upload → 413 Payload Too Large',
  },
  {
    id: '9',
    level: 'warn',
    timestamp: '12:00:10',
    source: 'server',
    message: 'Rate limit exceeded for IP 203.0.113.7',
  },
  {
    id: '10',
    level: 'info',
    timestamp: '12:00:11',
    source: 'server',
    message: 'GET /api/users → 200 OK (11ms)',
  },
  {
    id: '11',
    level: 'debug',
    timestamp: '12:00:12',
    source: 'cache',
    message: 'HIT sessions:user:42',
  },
  {
    id: '12',
    level: 'success',
    timestamp: '12:00:13',
    source: 'deploy',
    message: 'Rolling update complete — 4/4 instances healthy',
  },
  {
    id: '13',
    level: 'error',
    timestamp: '12:00:14',
    source: 'db',
    message: 'Connection timeout after 5000ms — retrying…',
  },
  {
    id: '14',
    level: 'success',
    timestamp: '12:00:15',
    source: 'db',
    message: 'Reconnected to PostgreSQL successfully',
  },
  {
    id: '15',
    level: 'info',
    timestamp: '12:00:16',
    source: 'server',
    message: 'DELETE /api/sessions/user:42 → 204 No Content',
  },
]

// ── Highlight helper ──────────────────────────────────────────────────────────

/**
 * Wraps every case-insensitive occurrence of `query` within `text` in a
 * highlight `<mark>` span. Returns the original string when `query` is empty.
 */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const lc = text.toLowerCase()
  const lcQ = query.toLowerCase()
  const nodes: ReactNode[] = []
  let cursor = 0

  while (cursor < text.length) {
    const found = lc.indexOf(lcQ, cursor)
    if (found === -1) {
      nodes.push(text.slice(cursor))
      break
    }
    if (found > cursor) nodes.push(text.slice(cursor, found))
    nodes.push(
      <mark
        key={found}
        className="rounded-[2px] bg-[color-mix(in_oklab,var(--term-yellow)_35%,transparent)] text-(--term-yellow) not-italic px-px"
      >
        {text.slice(found, found + query.length)}
      </mark>
    )
    cursor = found + query.length
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>
}

// ── Demo component ────────────────────────────────────────────────────────────

/**
 * Playground demo for TerminalSearch + useTerminalSearch.
 *
 * Displays a static log feed with an in-line search bar.
 * Matching rows are outlined; the focused match is scrolled into view.
 */
export function SearchDemo() {
  // Build the flat string array the hook needs.
  const searchItems = SEARCH_ENTRIES.map((e) =>
    [e.message, e.source ?? '', e.level ?? ''].join(' ')
  )

  const search = useTerminalSearch(searchItems)

  // Scroll current match into view.
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    if (search.currentIndex < 0) return
    const matchItemIndex = search.matchIndices[search.currentIndex]
    rowRefs.current[matchItemIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [search.currentIndex, search.matchIndices])

  return (
    <Terminal title="server.log">
      <TerminalCommand>tail -f logs/server.log | grep …</TerminalCommand>

      {/* ── Search bar ── */}
      <div className="px-3 pt-2 pb-1">
        <TerminalSearch
          query={search.query}
          onQueryChange={search.setQuery}
          matchCount={search.matchCount}
          currentMatch={search.currentMatchNumber}
          onNext={search.next}
          onPrev={search.prev}
        />
      </div>

      {/* ── Log feed ── */}
      <div
        className="max-h-64 overflow-auto px-3 pb-3 font-mono text-xs"
        role="log"
        aria-live="off"
        aria-relevant="additions text"
      >
        {SEARCH_ENTRIES.map((entry, index) => {
          const isCurrent = search.isCurrentMatch(index)
          const isAnyMatch = search.isMatch(index)

          return (
            <div
              key={entry.id}
              ref={(el) => {
                rowRefs.current[index] = el
              }}
              className={`rounded transition-colors
                ${
                  isCurrent
                    ? 'ring-1 ring-(--term-yellow)/50 bg-[color-mix(in_oklab,var(--term-yellow)_6%,transparent)]'
                    : isAnyMatch
                      ? 'ring-1 ring-(--term-yellow)/20 bg-[color-mix(in_oklab,var(--term-yellow)_3%,transparent)]'
                      : ''
                }`}
            >
              <TerminalLogLine
                level={entry.level}
                timestamp={entry.timestamp}
                source={entry.source}
                message={highlight(entry.message, search.query)}
              />
            </div>
          )
        })}
      </div>
    </Terminal>
  )
}
