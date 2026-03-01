'use client'

import { useMemo, useState } from 'react'
import {
  Terminal,
  TerminalCommand,
  TerminalLog,
  type LogEntry,
} from '@/components/terminal'
import {
  TerminalFilterBar,
  emptyFilterState,
  filterEntries,
  type FilterBarState,
} from '@/components/terminal-filter-bar'

const ALL_ENTRIES: LogEntry[] = [
  { id:  '1', level: 'info',    timestamp: '10:23:44', source: 'server',  message: 'Application starting up...' },
  { id:  '2', level: 'info',    timestamp: '10:23:45', source: 'server',  message: 'Listening on :3000' },
  { id:  '3', level: 'debug',   timestamp: '10:23:45', source: 'cache',   message: 'HIT packages/react@19.1.0' },
  { id:  '4', level: 'warn',    timestamp: '10:23:46', source: 'cache',   message: 'MISS @openknots/terminal-ui — fetching from registry' },
  { id:  '5', level: 'info',    timestamp: '10:23:47', source: 'build',   message: 'Compiling 42 modules...' },
  { id:  '6', level: 'debug',   timestamp: '10:23:47', source: 'build',   message: 'Resolved tsconfig paths in 4ms' },
  { id:  '7', level: 'success', timestamp: '10:23:48', source: 'build',   message: 'Compiled in 1.2s — 0 errors' },
  { id:  '8', level: 'info',    timestamp: '10:23:49', source: 'test',    message: 'Running 24 unit tests...' },
  { id:  '9', level: 'error',   timestamp: '10:23:50', source: 'test',    message: 'FAIL src/utils.test.ts — 1 snapshot mismatch' },
  { id: '10', level: 'info',    timestamp: '10:23:50', source: 'test',    message: 'Retrying with --updateSnapshot...' },
  { id: '11', level: 'success', timestamp: '10:23:51', source: 'test',    message: '24 / 24 tests passed — coverage 94%' },
  { id: '12', level: 'info',    timestamp: '10:23:52', source: 'deploy',  message: 'Uploading artifacts to CDN...' },
  { id: '13', level: 'warn',    timestamp: '10:23:52', source: 'deploy',  message: 'Edge cache warm-up taking longer than 5s' },
  { id: '14', level: 'success', timestamp: '10:23:53', source: 'deploy',  message: 'Published to production — https://example.app' },
]

const SOURCES = [...new Set(ALL_ENTRIES.map((e) => e.source!))]

export function FilterBarDemo() {
  const [filter, setFilter] = useState<FilterBarState>(emptyFilterState)

  const visible = useMemo(() => filterEntries(ALL_ENTRIES, filter), [filter])

  return (
    <div className="flex flex-col gap-2">
      <TerminalFilterBar
        state={filter}
        onChange={setFilter}
        sources={SOURCES}
      />
      <Terminal title="pipeline.log">
        <TerminalCommand>pnpm run ci</TerminalCommand>
        <TerminalLog entries={visible} maxLines={20} />
      </Terminal>
      <p className="font-mono text-xs text-(--term-fg-dim)">
        {visible.length} / {ALL_ENTRIES.length} entries shown
      </p>
    </div>
  )
}
