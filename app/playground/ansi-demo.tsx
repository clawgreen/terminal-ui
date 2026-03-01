'use client'

import { Terminal, TerminalCommand, TerminalOutput } from '@/components/terminal'
import { TerminalAnsi } from '@/components/terminal-ansi'

// ── Helpers ──────────────────────────────────────────────────────────────────

const ESC = '\x1b['
const R = `${ESC}0m`
const bold = (s: string) => `${ESC}1m${s}${R}`
const dim = (s: string) => `${ESC}2m${s}${R}`
const fg = (code: number, s: string) => `${ESC}${30 + code}m${s}${R}`
const fgBright = (code: number, s: string) => `${ESC}${90 + code}m${s}${R}`
const fg256 = (n: number, s: string) => `${ESC}38;5;${n}m${s}${R}`
const fgRgb = (r: number, g: number, b: number, s: string) => `${ESC}38;2;${r};${g};${b}m${s}${R}`
const bg = (code: number, s: string) => `${ESC}${40 + code}m${s}${R}`

// ── Sample strings ────────────────────────────────────────────────────────────

/**
 * Realistic pnpm/Vite build output with ANSI colours.
 */
const BUILD_LOG = [
  `${bold(fg(4, 'vite'))} v5.4.11  ${fg(2, 'building for production...')}`,
  '',
  `  ${fg(6, '✓')} 142 modules transformed.`,
  `  ${fg(6, '✓')} built in ${fg(3, '1.42s')}`,
  '',
  `  ${dim('dist/index.html              ')} ${fg(2, '1.23 kB')} │ gzip: ${fg(2, '0.62 kB')}`,
  `  ${dim('dist/assets/index-DiwrgTda.js')} ${fg(3, '142.18 kB')} │ gzip: ${fg(2, '45.31 kB')}`,
  `  ${dim('dist/assets/index-Bx9a8Z1E.css')} ${fg(2, '8.94 kB')} │ gzip: ${fg(2, '2.15 kB')}`,
].join('\n')

/**
 * Jest-style test runner output.
 */
const TEST_LOG = [
  ` ${fg(2, 'PASS')} src/utils/parseAnsi.test.ts ${dim('(1.2s)')}`,
  ` ${fg(2, 'PASS')} src/components/TerminalAnsi.test.tsx`,
  ` ${fg(1, 'FAIL')} src/utils/formatter.test.ts`,
  '',
  `  ${bold(fg(1, '● formatter › formatBytes › handles 0'))}`,
  `    Expected: ${fg(2, '"0 B"')}`,
  `    Received: ${fg(1, '"NaN B"')}`,
  '',
  `  ${fg(3, 'Test Suites')}: ${fg(1, bold('1 failed'))}, ${fg(2, '2 passed')}, 3 total`,
  `  ${fg(3, 'Tests')}:       ${fg(1, bold('1 failed'))}, ${fg(2, '14 passed')}, 15 total`,
].join('\n')

/**
 * Showcases all 16 standard ANSI colours.
 */
const COLOR_SWATCHES = [
  ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'].map((name, i) =>
    `${ESC}${30 + i}m${name}${R}`
  ).join('  '),
  ['bright-black', 'bright-red', 'bright-green', 'bright-yellow', 'bright-blue', 'bright-magenta', 'bright-cyan', 'bright-white'].map((name, i) =>
    `${ESC}${90 + i}m${name}${R}`
  ).join('  '),
].join('\n')

/**
 * Showcases text decorations and dim.
 */
const STYLES_LINE =
  `${bold('bold')}  ` +
  `${dim('dim')}  ` +
  `${ESC}3mitalic${R}  ` +
  `${ESC}4munderline${R}  ` +
  `${ESC}9mstrikethrough${R}  ` +
  `${ESC}7;32m  inverted  ${R}`

/**
 * 256-colour palette sampler — first 36 entries of the 6×6×6 cube.
 */
const PALETTE_256 = Array.from({ length: 36 }, (_, i) =>
  fg256(16 + i, '▄'),
).join('')

/**
 * True-colour (24-bit) horizontal gradient from cyan → magenta.
 */
const TRUE_COLOR_GRAD = Array.from({ length: 48 }, (_, i) => {
  const t = i / 47
  const r = Math.round(0 + t * 236)
  const g = Math.round(183 - t * 183)
  const b = Math.round(212 + t * (236 - 212))
  return fgRgb(r, g, b, '█')
}).join('')

/**
 * Background colour demo.
 */
const BG_DEMO =
  `${bg(1, ' error ')}  ` +
  `${bg(2, ' success ')}  ` +
  `${bg(3, ' warn ')}  ` +
  `${bg(4, ' info ')}  ` +
  `${fgBright(7, bg(0, ' on-black '))}`

// ─────────────────────────────────────────────────────────────────────────────

export function AnsiDemo() {
  return (
    <div className="flex flex-col gap-4">

      {/* Build output */}
      <Terminal title="vite build">
        <TerminalCommand>pnpm run build</TerminalCommand>
        <TerminalOutput>
          <TerminalAnsi block>{BUILD_LOG}</TerminalAnsi>
        </TerminalOutput>
      </Terminal>

      {/* Test runner */}
      <Terminal title="jest">
        <TerminalCommand>pnpm test</TerminalCommand>
        <TerminalOutput>
          <TerminalAnsi block>{TEST_LOG}</TerminalAnsi>
        </TerminalOutput>
      </Terminal>

      {/* Standard colours + styles */}
      <Terminal title="colour-matrix.sh">
        <TerminalCommand>./print-colors.sh</TerminalCommand>
        <TerminalOutput>
          <TerminalAnsi block>{COLOR_SWATCHES}</TerminalAnsi>
        </TerminalOutput>
        <TerminalOutput>
          <TerminalAnsi>{STYLES_LINE}</TerminalAnsi>
        </TerminalOutput>
        <TerminalOutput>
          <TerminalAnsi>{BG_DEMO}</TerminalAnsi>
        </TerminalOutput>
      </Terminal>

      {/* 256-colour + true-colour */}
      <Terminal title="256-and-truecolor.sh">
        <TerminalCommand>./print-palette.sh</TerminalCommand>
        <TerminalOutput>
          <span className="font-mono text-xs text-(--term-fg-dim) mr-2">256-colour cube:</span>
          <TerminalAnsi>{PALETTE_256}</TerminalAnsi>
        </TerminalOutput>
        <TerminalOutput>
          <span className="font-mono text-xs text-(--term-fg-dim) mr-2">true-colour grad:</span>
          <TerminalAnsi>{TRUE_COLOR_GRAD}</TerminalAnsi>
        </TerminalOutput>
      </Terminal>

    </div>
  )
}
