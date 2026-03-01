'use client'

import { Terminal, TerminalCommand, TerminalOutput } from '@/components/terminal'
import { TerminalStackTrace } from '@/components/terminal-stack-trace'

// ── Sample stack traces ──────────────────────────────────────────────────────

const NODE_STACK = `TypeError: Cannot read properties of undefined (reading 'map')
    at ProductList (/app/src/components/ProductList.tsx:42:15)
    at renderWithHooks (/app/node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (/app/node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (/app/node_modules/react-dom/cjs/react-dom.development.js:19049:16)
    at App (/app/src/App.tsx:18:5)
    at callRenderFunction (/app/node_modules/react-dom/cjs/react-dom.development.js:3991:14)
    at performWork (/app/node_modules/react-dom/cjs/react-dom.development.js:6422:7)`.trim()

const ASYNC_STACK = `Error: ENOENT: no such file or directory, open '/etc/secrets/api.key'
    at Object.openSync (node:fs:596:3)
    at Object.readFileSync (node:fs:464:35)
    at loadSecrets (/app/src/config/secrets.ts:12:18)
    at bootstrap (/app/src/index.ts:7:3)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async start (/app/src/server.ts:23:3)`.trim()

const MINIMAL_STACK = `RangeError: Maximum call stack size exceeded
    at fibonacci (/app/src/utils/math.ts:8:12)
    at fibonacci (/app/src/utils/math.ts:9:10)
    at fibonacci (/app/src/utils/math.ts:9:10)
    at fibonacci (/app/src/utils/math.ts:9:10)`.trim()

// ─────────────────────────────────────────────────────────────────────────────

export function StackTraceDemo() {
  return (
    <Terminal title="error.log">
      <TerminalCommand>pnpm run dev</TerminalCommand>
      <TerminalOutput type="error">Unhandled runtime error — see trace below</TerminalOutput>
      <div className="flex flex-col gap-3 mt-1">
        <TerminalStackTrace stack={NODE_STACK} />
        <TerminalStackTrace stack={ASYNC_STACK} hideNodeModules={false} />
        <TerminalStackTrace stack={MINIMAL_STACK} defaultCollapsed />
      </div>
    </Terminal>
  )
}
