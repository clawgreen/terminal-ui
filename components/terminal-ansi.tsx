'use client'

import { useMemo, type CSSProperties } from 'react'

// ─── ANSI Color Tables ────────────────────────────────────────────────────────

/**
 * Standard 4-bit ANSI color palette (indices 0–15).
 *
 * Indices 0–7  → normal colors (SGR fg 30–37, bg 40–47)
 * Indices 8–15 → bright colors (SGR fg 90–97, bg 100–107)
 *
 * Colors that correspond to existing theme tokens use CSS custom-property
 * references so the component stays fully theme-aware. Bright shades that
 * have no direct token use literal hex values matching the project palette.
 */
const ANSI_16: readonly string[] = [
  /* 0  black         */ 'var(--term-bg)',
  /* 1  red           */ 'var(--term-red)',
  /* 2  green         */ 'var(--term-green)',
  /* 3  yellow        */ 'var(--term-yellow)',
  /* 4  blue          */ 'var(--term-blue)',
  /* 5  magenta       */ 'var(--term-purple)',
  /* 6  cyan          */ 'var(--term-cyan)',
  /* 7  white         */ 'var(--term-fg)',
  /* 8  bright black  */ 'var(--term-fg-dim)',
  /* 9  bright red    */ '#f87171',
  /* 10 bright green  */ '#34d399',
  /* 11 bright yellow */ '#fde047',
  /* 12 bright blue   */ '#60a5fa',
  /* 13 bright magenta*/ '#c084fc',
  /* 14 bright cyan   */ '#22d3ee',
  /* 15 bright white  */ '#ffffff',
] as const

// ─── Internal Types ──────────────────────────────────────────────────────────

interface AnsiStyle {
  /** CSS color string for the foreground, or undefined for the terminal default. */
  fg?: string
  /** CSS color string for the background, or undefined for transparent. */
  bg?: string
  bold: boolean
  dim: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  /** Swap fg/bg (SGR 7). */
  invert: boolean
}

const RESET_STYLE: AnsiStyle = {
  bold: false,
  dim: false,
  italic: false,
  underline: false,
  strikethrough: false,
  invert: false,
}

/** A contiguous run of text that shares a single style. */
export interface AnsiSpan {
  /** Plain text content — never contains escape sequences. */
  text: string
  /** Resolved style for this span. */
  style: AnsiStyle
}

// ─── 256-color Resolver ──────────────────────────────────────────────────────

/**
 * Converts an xterm 256-colour palette index to a CSS colour string.
 *
 * - 0–15   → mapped to the same 16 entries as standard + bright ANSI colours.
 * - 16–231 → 6×6×6 RGB colour cube.
 * - 232–255 → 24-step greyscale ramp.
 */
function ansi256Color(code: number): string {
  if (code < 16) return ANSI_16[code]

  if (code < 232) {
    const idx = code - 16
    const b = idx % 6
    const g = Math.floor(idx / 6) % 6
    const r = Math.floor(idx / 36)
    const v = (n: number) => (n === 0 ? 0 : n * 40 + 55)
    return `rgb(${v(r)}, ${v(g)}, ${v(b)})`
  }

  const gray = (code - 232) * 10 + 8
  return `rgb(${gray}, ${gray}, ${gray})`
}

// ─── SGR Parameter Processor ─────────────────────────────────────────────────

/**
 * Applies a semicolon-delimited SGR parameter string to a current style and
 * returns the updated style. Does **not** mutate `current`.
 *
 * Handles:
 * - `0` / empty — reset
 * - `1` bold, `2` dim, `3` italic, `4` underline, `7` invert, `9` strikethrough
 * - `22` unset bold/dim, `23` unset italic, `24` unset underline,
 *   `27` unset invert, `29` unset strikethrough
 * - `30–37` standard fg, `39` default fg
 * - `38;5;n` 256-colour fg, `38;2;r;g;b` true-colour fg
 * - `40–47` standard bg, `49` default bg
 * - `48;5;n` 256-colour bg, `48;2;r;g;b` true-colour bg
 * - `90–97` bright fg, `100–107` bright bg
 */
function applyParams(current: AnsiStyle, paramStr: string): AnsiStyle {
  // Empty param string or bare "0" is a full reset.
  if (!paramStr || paramStr === '0') return { ...RESET_STYLE }

  const next: AnsiStyle = { ...current }
  const params = paramStr.split(';').map(Number)
  let i = 0

  while (i < params.length) {
    const p = params[i]

    if (p === 0)  { Object.assign(next, RESET_STYLE) }
    else if (p === 1)  { next.bold = true }
    else if (p === 2)  { next.dim = true }
    else if (p === 3)  { next.italic = true }
    else if (p === 4)  { next.underline = true }
    else if (p === 7)  { next.invert = true }
    else if (p === 9)  { next.strikethrough = true }
    else if (p === 22) { next.bold = false; next.dim = false }
    else if (p === 23) { next.italic = false }
    else if (p === 24) { next.underline = false }
    else if (p === 27) { next.invert = false }
    else if (p === 29) { next.strikethrough = false }

    // Standard foreground 30–37
    else if (p >= 30 && p <= 37) { next.fg = ANSI_16[p - 30] }

    // Extended foreground: 256-colour or true-colour
    else if (p === 38) {
      if (params[i + 1] === 5 && params[i + 2] !== undefined) {
        next.fg = ansi256Color(params[i + 2])
        i += 2
      } else if (params[i + 1] === 2 && params[i + 4] !== undefined) {
        next.fg = `rgb(${params[i + 2]}, ${params[i + 3]}, ${params[i + 4]})`
        i += 4
      }
    }

    else if (p === 39) { next.fg = undefined }

    // Standard background 40–47
    else if (p >= 40 && p <= 47) { next.bg = ANSI_16[p - 40] }

    // Extended background: 256-colour or true-colour
    else if (p === 48) {
      if (params[i + 1] === 5 && params[i + 2] !== undefined) {
        next.bg = ansi256Color(params[i + 2])
        i += 2
      } else if (params[i + 1] === 2 && params[i + 4] !== undefined) {
        next.bg = `rgb(${params[i + 2]}, ${params[i + 3]}, ${params[i + 4]})`
        i += 4
      }
    }

    else if (p === 49) { next.bg = undefined }

    // Bright foreground 90–97
    else if (p >= 90 && p <= 97) { next.fg = ANSI_16[p - 90 + 8] }

    // Bright background 100–107
    else if (p >= 100 && p <= 107) { next.bg = ANSI_16[p - 100 + 8] }

    i++
  }

  return next
}

// ─── Style → CSSProperties ───────────────────────────────────────────────────

function styleToCss(s: AnsiStyle): CSSProperties {
  const css: CSSProperties = {}

  let fg = s.fg
  let bg = s.bg

  if (s.invert) {
    // Swap fg ↔ bg, defaulting to terminal background/foreground tokens.
    const tmpFg = bg ?? 'var(--term-bg)'
    const tmpBg = fg ?? 'var(--term-fg)'
    fg = tmpFg
    bg = tmpBg
  }

  if (fg) css.color = fg
  if (bg) css.backgroundColor = bg

  if (s.bold) css.fontWeight = 700
  if (s.dim) css.opacity = 0.5
  if (s.italic) css.fontStyle = 'italic'

  const dec: string[] = []
  if (s.underline) dec.push('underline')
  if (s.strikethrough) dec.push('line-through')
  if (dec.length) css.textDecoration = dec.join(' ')

  return css
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/** Regex that matches any ANSI SGR escape sequence: ESC [ <params> m */
const SGR_RE = /\x1b\[([0-9;]*)m/g

/**
 * Strips non-SGR ANSI escape sequences (cursor movement, erase, etc.) from a
 * text segment so they don't appear as raw garbage characters in the output.
 */
const NON_SGR_RE = /\x1b\[[^m]*[A-Za-ln-z]/g

/**
 * Parses a raw string that may contain ANSI SGR escape sequences and returns
 * an array of `AnsiSpan` objects, each containing a plain-text fragment and
 * the resolved `AnsiStyle` to apply.
 *
 * This is a **pure function** — safe to call outside of React, unit-testable,
 * and free of any side effects.
 *
 * Behaviour contract:
 * - Plain text (no escape sequences) → single span with reset style.
 * - Empty string → empty array.
 * - Trailing reset (`\x1b[0m`) with no following text → no trailing span.
 * - Consecutive spans with identical effective styles are **not** merged (kept
 *   simple; callers can merge if needed).
 * - Unrecognised SGR codes are silently ignored; the style is otherwise
 *   unchanged.
 * - Non-SGR escape sequences (e.g. cursor movement) are stripped from all
 *   text segments to prevent raw garbage characters appearing in output.
 * - 256-colour and true-colour (24-bit) sequences are resolved to `rgb(…)`
 *   CSS values.
 *
 * @example
 * ```ts
 * parseAnsi('\x1b[32mhello\x1b[0m world')
 * // → [
 * //   { text: 'hello', style: { fg: 'var(--term-green)', bold: false, ... } },
 * //   { text: ' world', style: { bold: false, ... } },
 * // ]
 * ```
 *
 * @example
 * ```ts
 * // Bold red then reset
 * parseAnsi('\x1b[1;31mERROR\x1b[0m: file not found')
 * // → [
 * //   { text: 'ERROR', style: { fg: 'var(--term-red)', bold: true, ...} },
 * //   { text: ': file not found', style: { bold: false, ... } },
 * // ]
 * ```
 *
 * @example
 * ```ts
 * // 256-colour
 * parseAnsi('\x1b[38;5;214morange\x1b[0m')
 * // → [{ text: 'orange', style: { fg: 'rgb(255, 175, 0)', ... } }]
 * ```
 *
 * @example
 * ```ts
 * // True-colour RGB
 * parseAnsi('\x1b[38;2;255;128;0mbright orange\x1b[0m')
 * // → [{ text: 'bright orange', style: { fg: 'rgb(255, 128, 0)', ... } }]
 * ```
 *
 * @example
 * ```ts
 * // Plain text — no escape sequences
 * parseAnsi('hello world')
 * // → [{ text: 'hello world', style: { bold: false, dim: false, ... } }]
 * ```
 */
export function parseAnsi(raw: string): AnsiSpan[] {
  const spans: AnsiSpan[] = []
  let cursor = 0
  let style: AnsiStyle = { ...RESET_STYLE }

  SGR_RE.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = SGR_RE.exec(raw)) !== null) {
    // Emit text segment before this escape sequence.
    if (match.index > cursor) {
      const text = raw.slice(cursor, match.index).replace(NON_SGR_RE, '')
      if (text) spans.push({ text, style: { ...style } })
    }

    // Advance style from the SGR params embedded in this escape.
    style = applyParams(style, match[1])
    cursor = match.index + match[0].length
  }

  // Emit any remaining text after the last escape sequence.
  if (cursor < raw.length) {
    const text = raw.slice(cursor).replace(NON_SGR_RE, '')
    if (text) spans.push({ text, style: { ...style } })
  }

  return spans
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface TerminalAnsiProps {
  /**
   * Raw string that may contain ANSI SGR escape sequences.
   * Plain strings (no escapes) render correctly without any overhead.
   */
  children: string
  /**
   * Render with a block (`div`) wrapper rather than inline (`span`).
   * Useful when rendering multi-line ANSI output (e.g. build logs, test
   * runners). The wrapper also gets `whitespace-pre-wrap` so newlines inside
   * the string are preserved.
   * @default false
   */
  block?: boolean
  /** Optional extra class names applied to the wrapper element. */
  className?: string
}

/**
 * Renders a string that may contain ANSI SGR escape sequences as styled React
 * spans — without any `dangerouslySetInnerHTML`, so output is always safe from
 * HTML-injection attacks.
 *
 * Supports:
 * - Standard & bright foreground/background colors (mapped to theme CSS vars
 *   where possible).
 * - 256-colour (`38;5;n` / `48;5;n`) and true-colour RGB (`38;2;r;g;b` /
 *   `48;2;r;g;b`) sequences.
 * - Bold, dim, italic, underline, strikethrough, invert (SGR 1–9 and resets).
 * - Clean stripping of non-SGR escape sequences (cursor moves etc.).
 *
 * @example
 * ```tsx
 * // Inline inside a terminal output line
 * <TerminalOutput>
 *   <TerminalAnsi>{'\x1b[32m✓\x1b[0m build passed'}</TerminalAnsi>
 * </TerminalOutput>
 * ```
 *
 * @example
 * ```tsx
 * // Multi-line block (e.g. piped build output)
 * <TerminalAnsi block>{rawBuildLog}</TerminalAnsi>
 * ```
 */
export function TerminalAnsi({ children, block = false, className = '' }: TerminalAnsiProps) {
  const spans = useMemo(() => parseAnsi(children), [children])

  const wrapperClass = ['font-mono text-sm', block ? 'whitespace-pre-wrap' : '', className]
    .filter(Boolean)
    .join(' ')

  const content = spans.map((span, i) => {
    const css = styleToCss(span.style)
    const hasStyle = Object.keys(css).length > 0
    return hasStyle ? (
      <span key={i} style={css}>
        {span.text}
      </span>
    ) : (
      <span key={i}>{span.text}</span>
    )
  })

  if (block) {
    return <div className={wrapperClass}>{content}</div>
  }

  return <span className={wrapperClass}>{content}</span>
}
