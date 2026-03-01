'use client'

import { useState, useCallback, useId, type KeyboardEvent } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TerminalStackTraceProps {
  /**
   * Raw stack trace string (e.g. `error.stack`).
   *
   * Expected format:
   * ```
   * ErrorType: message
   *     at functionName (file:line:col)
   *     at ...
   * ```
   */
  stack: string
  /**
   * Hide `node_modules` frames by default.
   * A toggle button lets users reveal them.
   * @default true
   */
  hideNodeModules?: boolean
  /**
   * Start with all frames collapsed (only the error header visible).
   * @default false
   */
  defaultCollapsed?: boolean
  /** Optional className for outer wrapper. */
  className?: string
}

interface StackFrame {
  /** Original raw line as it appears in the stack string. */
  raw: string
  /** Whether this frame originates from node_modules. */
  isNodeModules: boolean
  /**
   * Parsed function / method name, e.g. `"App.render"`.
   * `null` when the function location could not be determined.
   */
  fn: string | null
  /**
   * File path + line + column string, e.g. `"/src/App.tsx:42:15"`.
   * `null` when the location could not be determined.
   */
  location: string | null
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Splits a raw stack string into a header block and a list of parsed frames.
 *
 * Handles both V8/Node.js (`at …`) and Firefox (`functionName@file:line:col`)
 * frame formats. Lines that cannot be parsed as frames are folded into the
 * header block.
 */
function parseStack(stack: string): { header: string; frames: StackFrame[] } {
  const lines = stack.replace(/\r\n/g, '\n').split('\n')
  const headerLines: string[] = []
  const frameLines: string[] = []
  let inFrames = false

  for (const line of lines) {
    const t = line.trim()
    // V8/Node.js frames start with "at "
    // Firefox frames match "name@file:line:col"
    const isFrameLine = t.startsWith('at ') || /^.+@.+:\d+:\d+$/.test(t)
    if (!inFrames && isFrameLine) inFrames = true
    if (inFrames && isFrameLine) {
      frameLines.push(line)
    } else if (!inFrames) {
      headerLines.push(line)
    }
    // Lines between frames (blank separators etc.) are silently dropped.
  }

  const frames: StackFrame[] = frameLines.map((line): StackFrame => {
    const t = line.trim()
    const isNodeModules = t.includes('node_modules')

    // V8: "at FnName (file:line:col)"
    const v8WithFn = t.match(/^at\s+(.+?)\s+\((.+)\)$/)
    if (v8WithFn) {
      return { raw: line, isNodeModules, fn: v8WithFn[1], location: v8WithFn[2] }
    }

    // V8: "at file:line:col" (anonymous / top-level)
    const v8Bare = t.match(/^at\s+(.+)$/)
    if (v8Bare) {
      return { raw: line, isNodeModules, fn: null, location: v8Bare[1] }
    }

    // Firefox: "name@file:line:col"
    const firefox = t.match(/^(.+)@(.+)$/)
    if (firefox) {
      return { raw: line, isNodeModules, fn: firefox[1] || null, location: firefox[2] }
    }

    return { raw: line, isNodeModules, fn: null, location: null }
  })

  return { header: headerLines.join('\n'), frames }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FrameRowProps {
  frame: StackFrame
  index: number
}

/**
 * A single foldable stack frame row.
 *
 * Collapsed → shows only the function name (or a placeholder).
 * Expanded  → additionally shows the full file path.
 *
 * Keyboard: Space / Enter toggles the frame.
 */
function FrameRow({ frame, index }: FrameRowProps) {
  const [open, setOpen] = useState(true)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

  const fnLabel = frame.fn ?? '<anonymous>'
  const hasLocation = frame.location !== null

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-1.5 min-h-6">
        {/* Frame index gutter */}
        <span
          className="shrink-0 w-6 text-right text-(--term-fg-dim) select-none opacity-40"
          aria-hidden="true"
        >
          {index}
        </span>

        {/* Toggle chevron */}
        <button
          type="button"
          onClick={toggle}
          onKeyDown={handleKeyDown}
          aria-label={`${open ? 'Collapse' : 'Expand'} frame ${index}: ${fnLabel}`}
          aria-expanded={open}
          className="shrink-0 w-4 text-center text-(--term-fg-dim) hover:text-(--term-fg) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--term-blue) rounded-sm"
        >
          {hasLocation ? (open ? '▾' : '▸') : '·'}
        </button>

        {/* Function name */}
        <span
          className={`leading-6 break-all ${
            frame.isNodeModules ? 'text-(--term-fg-dim)' : 'text-(--term-fg)'
          }`}
        >
          at{' '}
          <span
            className={
              frame.isNodeModules ? 'text-(--term-fg-dim)' : 'text-(--term-yellow) font-medium'
            }
          >
            {fnLabel}
          </span>
        </span>
      </div>

      {/* Location — hidden when frame is collapsed */}
      {open && hasLocation && (
        <div className="pl-11 pb-0.5">
          <span className="text-(--term-fg-dim) break-all">{frame.location}</span>
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * Renders a styled, interactive stack trace for terminal-style error output.
 *
 * Features:
 * - Parses raw `Error.stack` strings (V8/Node.js and Firefox formats).
 * - Global collapse/expand toggle (Space or Enter on the header button).
 * - Per-frame collapse/expand to hide the noisy file-path line.
 * - Optional `node_modules` frame filtering (hidden by default).
 * - Fully keyboard-navigable and screen-reader labelled.
 * - Uses the same CSS custom-property color tokens as every other terminal-ui component.
 *
 * @example
 * ```tsx
 * <TerminalStackTrace stack={error.stack} />
 * ```
 *
 * @example
 * ```tsx
 * <TerminalStackTrace
 *   stack={rawStackString}
 *   hideNodeModules={false}
 *   defaultCollapsed
 * />
 * ```
 */
export function TerminalStackTrace({
  stack,
  hideNodeModules = true,
  defaultCollapsed = false,
  className = '',
}: TerminalStackTraceProps) {
  const id = useId()
  const frameListId = `${id}-frames`

  const [framesOpen, setFramesOpen] = useState(!defaultCollapsed)
  const [showNodeModules, setShowNodeModules] = useState(!hideNodeModules)

  const toggleFrames = useCallback(() => setFramesOpen((v) => !v), [])
  const toggleNodeModules = useCallback(() => setShowNodeModules((v) => !v), [])

  const handleHeaderKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggleFrames()
      }
    },
    [toggleFrames]
  )

  const { header, frames } = parseStack(stack)

  const userFrames = frames.filter((f) => !f.isNodeModules)
  const nodeModulesFrames = frames.filter((f) => f.isNodeModules)
  const hiddenCount = nodeModulesFrames.length

  // Frames visible in the list
  const visibleFrames = showNodeModules ? frames : frames.filter((f) => !f.isNodeModules)

  return (
    <div
      role="region"
      aria-label="Stack trace"
      className={`font-mono text-xs rounded border border-(--term-red)/30 bg-[color-mix(in_oklab,var(--term-red)_5%,transparent)] overflow-hidden ${className}`.trim()}
    >
      {/* ── Error header ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 px-3 pt-3 pb-2">
        {/* Error icon */}
        <span className="shrink-0 mt-0.5 text-(--term-red) select-none" aria-hidden="true">
          ✗
        </span>

        {/* Error message block */}
        <pre className="flex-1 whitespace-pre-wrap break-all text-(--term-red) leading-5 m-0">
          {header || '(no error message)'}
        </pre>

        {/* Global frames toggle */}
        {frames.length > 0 && (
          <button
            type="button"
            onClick={toggleFrames}
            onKeyDown={handleHeaderKeyDown}
            aria-expanded={framesOpen}
            aria-controls={frameListId}
            aria-label={
              framesOpen
                ? `Collapse stack frames (${frames.length} total)`
                : `Expand stack frames (${frames.length} total)`
            }
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded border border-(--term-red)/30 text-(--term-fg-dim) hover:text-(--term-fg) hover:border-(--term-red)/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--term-blue)"
          >
            <span aria-hidden="true">{framesOpen ? '▾' : '▸'}</span>
            <span className="text-[10px]">
              {framesOpen ? 'collapse' : `${frames.length} frames`}
            </span>
          </button>
        )}
      </div>

      {/* ── Frame list ─────────────────────────────────────────────────────── */}
      {framesOpen && frames.length > 0 && (
        <div
          id={frameListId}
          role="list"
          aria-label={`${frames.length} stack frames`}
          className="px-3 pb-3 flex flex-col gap-0.5 border-t border-(--term-red)/20 pt-2"
        >
          {visibleFrames.map((frame, i) => {
            // Preserve original index across the full frame list for gutter numbering
            const originalIndex = frames.indexOf(frame)
            return (
              <div key={originalIndex} role="listitem">
                <FrameRow frame={frame} index={originalIndex} />
              </div>
            )
          })}

          {/* ── node_modules toggle ──────────────────────────────────────── */}
          {hiddenCount > 0 && (
            <div className="mt-1 pt-1 border-t border-(--glass-border)">
              <button
                type="button"
                onClick={toggleNodeModules}
                aria-pressed={showNodeModules}
                aria-label={
                  showNodeModules
                    ? `Hide ${hiddenCount} node_modules frame${hiddenCount !== 1 ? 's' : ''}`
                    : `Show ${hiddenCount} hidden node_modules frame${hiddenCount !== 1 ? 's' : ''}`
                }
                className="flex items-center gap-1.5 text-(--term-fg-dim) hover:text-(--term-fg) transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--term-blue) rounded-sm"
              >
                <span aria-hidden="true" className="text-[10px]">
                  {showNodeModules ? '▾' : '▸'}
                </span>
                <span>
                  {showNodeModules
                    ? `hide ${hiddenCount} node_modules frame${hiddenCount !== 1 ? 's' : ''}`
                    : `${hiddenCount} hidden node_modules frame${hiddenCount !== 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          )}

          {/* ── Summary footer ───────────────────────────────────────────── */}
          <div
            className="mt-1 pt-1 border-t border-(--glass-border) text-(--term-fg-dim) opacity-60"
            aria-label={`${userFrames.length} user frames, ${hiddenCount} node_modules frames`}
          >
            {userFrames.length} user frame{userFrames.length !== 1 ? 's' : ''}
            {hiddenCount > 0 && ` · ${hiddenCount} node_modules`}
          </div>
        </div>
      )}
    </div>
  )
}
