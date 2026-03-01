'use client'

import { useEffect, useState } from 'react'
import { Terminal, TerminalCommand, TerminalLog, type LogEntry } from '@/components/terminal'

// ── String-mode demo (unchanged) ─────────────────────────────────────────────

const STREAM_LINES = [
  '[info] Connecting to build worker...',
  '[info] Installing dependencies...',
  '[warn] Cache miss for @openknots/terminal-ui',
  '[info] Running unit tests...',
  '[info] Packaging artifacts...',
  '[success] Deployment finished.',
]

export function LogDemo() {
  const [logs, setLogs] = useState<string[]>(() => [
    '[boot] Starting live stream...',
    '[boot] Waiting for events...',
  ])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLogs((current) => {
        const nextLine = STREAM_LINES[current.length % STREAM_LINES.length]
        return [...current, nextLine]
      })
    }, 900)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  return (
    <Terminal title="stream.log">
      <TerminalCommand>tail -f logs/deploy.log</TerminalCommand>
      <TerminalLog lines={logs} maxLines={10} autoScroll />
    </Terminal>
  )
}

// ── Structured-mode demo ─────────────────────────────────────────────────────

const STREAM_ENTRIES: LogEntry[] = [
  { level: 'info', timestamp: '10:23:45', source: 'server', message: 'Worker connected' },
  { level: 'debug', timestamp: '10:23:46', source: 'cache', message: 'HIT packages/react@19.1.0' },
  { level: 'warn', timestamp: '10:23:47', source: 'cache', message: 'MISS @openknots/terminal-ui' },
  { level: 'info', timestamp: '10:23:48', source: 'build', message: 'Compiling 42 modules...' },
  { level: 'success', timestamp: '10:23:49', source: 'build', message: 'Compiled in 1.2s' },
  { level: 'info', timestamp: '10:23:50', source: 'test', message: 'Running 24 unit tests...' },
  {
    level: 'error',
    timestamp: '10:23:51',
    source: 'test',
    message: 'FAIL src/utils.test.ts — 1 snapshot mismatch',
  },
  {
    level: 'info',
    timestamp: '10:23:52',
    source: 'test',
    message: 'Retrying with --updateSnapshot...',
  },
  { level: 'success', timestamp: '10:23:53', source: 'test', message: '24 / 24 tests passed' },
  { level: 'success', timestamp: '10:23:54', source: 'deploy', message: 'Published to production' },
]

export function StructuredLogDemo() {
  const [entries, setEntries] = useState<LogEntry[]>([
    {
      id: 'boot-0',
      level: 'info',
      timestamp: '10:23:44',
      source: 'server',
      message: 'Starting pipeline...',
    },
  ])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEntries((current) => {
        const next = STREAM_ENTRIES[current.length % STREAM_ENTRIES.length]
        return [...current, { ...next, id: String(current.length) }]
      })
    }, 900)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  return (
    <Terminal title="pipeline.log">
      <TerminalCommand>pnpm run ci</TerminalCommand>
      <TerminalLog entries={entries} maxLines={8} autoScroll />
    </Terminal>
  )
}
