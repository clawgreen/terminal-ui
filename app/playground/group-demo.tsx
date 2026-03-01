'use client'

import { useState } from 'react'
import { Terminal, TerminalCommand, TerminalGroup, TerminalLogLine } from '@/components/terminal'

// ── Demo ──────────────────────────────────────────────────────────────────────

/**
 * Playground demo for TerminalGroup.
 *
 * Shows several groups in a single terminal window:
 * - A success group (collapsed by default) — install step
 * - A warn group (open) — test step with a warning
 * - An error group (open) — build step with failures
 * - An info group (open) — controlled open/close via external button
 */
export function GroupDemo() {
  // Controlled group example
  const [deployOpen, setDeployOpen] = useState(true)

  return (
    <Terminal title="ci-pipeline.log">
      <TerminalCommand>pnpm run ci</TerminalCommand>

      {/* ── Install step: collapsed by default ── */}
      <div className="px-3 pt-2">
        <TerminalGroup
          title="install"
          summary="42 packages resolved from cache"
          countLabel="0.8s"
          variant="success"
          defaultOpen={false}
        >
          <TerminalLogLine
            level="debug"
            timestamp="10:23:44"
            source="npm"
            message="Resolving dependency tree…"
          />
          <TerminalLogLine
            level="debug"
            timestamp="10:23:44"
            source="npm"
            message="HIT react@19.2.0"
          />
          <TerminalLogLine
            level="debug"
            timestamp="10:23:44"
            source="npm"
            message="HIT typescript@5.8.2"
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:44"
            source="npm"
            message="42 packages installed from cache"
          />
        </TerminalGroup>
      </div>

      {/* ── Lint step: info, collapsed by default ── */}
      <div className="px-3 pt-1">
        <TerminalGroup
          title="lint"
          summary="ruff check — no issues"
          countLabel="0.2s"
          variant="info"
          defaultOpen={false}
        >
          <TerminalLogLine
            level="info"
            timestamp="10:23:45"
            source="ruff"
            message="Checking 38 files…"
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:45"
            source="ruff"
            message="All checks passed"
          />
        </TerminalGroup>
      </div>

      {/* ── Test step: warn, open ── */}
      <div className="px-3 pt-1">
        <TerminalGroup
          title="test"
          summary="23/24 passed · 1 snapshot mismatch"
          countLabel="4.1s"
          variant="warn"
          defaultOpen
        >
          <TerminalLogLine
            level="info"
            timestamp="10:23:46"
            source="jest"
            message="Running 24 test suites…"
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:49"
            source="jest"
            message="23 tests passed"
          />
          <TerminalLogLine
            level="warn"
            timestamp="10:23:49"
            source="jest"
            message="FAIL src/utils.test.ts — 1 snapshot out of date"
          />
          <TerminalLogLine
            level="info"
            timestamp="10:23:49"
            source="jest"
            message="Run with --updateSnapshot to fix"
          />
        </TerminalGroup>
      </div>

      {/* ── Build step: error, open ── */}
      <div className="px-3 pt-1">
        <TerminalGroup
          title="build"
          summary="TypeScript compilation failed"
          countLabel="3 errors"
          variant="error"
          defaultOpen
        >
          <TerminalLogLine
            level="info"
            timestamp="10:23:50"
            source="tsc"
            message="Compiling 42 modules…"
          />
          <TerminalLogLine
            level="error"
            timestamp="10:23:51"
            source="tsc"
            message="src/api/handler.ts:14 — Property 'data' does not exist on type 'Response'"
          />
          <TerminalLogLine
            level="error"
            timestamp="10:23:51"
            source="tsc"
            message="src/api/handler.ts:22 — Argument of type 'string' is not assignable to 'number'"
          />
          <TerminalLogLine
            level="error"
            timestamp="10:23:51"
            source="tsc"
            message="src/utils/retry.ts:8 — Cannot find module '../types' or its type declarations"
          />
        </TerminalGroup>
      </div>

      {/* ── Deploy step: controlled ── */}
      <div className="px-3 pt-1 pb-3">
        <TerminalGroup
          title="deploy"
          summary="Production rollout"
          countLabel="2.3s"
          variant="info"
          open={deployOpen}
          onOpenChange={setDeployOpen}
        >
          <TerminalLogLine
            level="info"
            timestamp="10:23:52"
            source="k8s"
            message="Rolling update → deployment/api-server"
          />
          <TerminalLogLine
            level="info"
            timestamp="10:23:53"
            source="k8s"
            message="4/4 pods healthy"
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:54"
            source="k8s"
            message="Deployment complete. Live at https://api.example.com"
          />
        </TerminalGroup>

        {/* External controlled toggle */}
        <div className="mt-2 pl-1">
          <button
            type="button"
            onClick={() => setDeployOpen((v) => !v)}
            className="font-mono text-xs text-(--term-fg-dim) underline underline-offset-2
              hover:text-(--term-fg) transition-colors"
          >
            {deployOpen ? '▲ collapse deploy (controlled)' : '▼ expand deploy (controlled)'}
          </button>
        </div>
      </div>
    </Terminal>
  )
}
