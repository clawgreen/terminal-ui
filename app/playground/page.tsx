import { TerminalApp } from '@/components/terminal-app'
import {
  Terminal,
  TerminalCommand,
  TerminalDiff,
  TerminalOutput,
  TerminalSpinner,
  TerminalBadge,
  TerminalMarker,
  TerminalLogLine,
  ThemeSwitcher,
} from '@/components/terminal'
import { TerminalProgress } from '@/components/terminal-progress'
import { LogDemo, StructuredLogDemo } from './log-demo'
import { FeedDemo } from './feed-demo'
import { FilterBarDemo } from './filter-demo'
import { TerminalJsonLine } from '@/components/terminal'
import { PromptDemo } from './prompt-demo'
import { GroupDemo } from './group-demo'
import { SearchDemo } from './search-demo'
import { TreeDemo } from './tree-demo'
import { TreeKeyboardDemo } from './tree-keyboard-demo'
import { StackTraceDemo } from './stack-trace-demo'
import { AnsiDemo } from './ansi-demo'

export const metadata = {
  title: 'Playground',
}

export default function PlaygroundPage() {
  return (
    <main className="flex flex-col gap-8 p-6 min-h-screen">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold font-mono text-[var(--term-fg)]">Playground</h1>
        <ThemeSwitcher />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">Terminal App</h2>
        <div className="h-[480px]">
          <TerminalApp className="h-full" />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalPrompt</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Interactive command input with history navigation (up / down).
        </p>
        <PromptDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalProgress</h2>
        <Terminal title="progress-demo.sh">
          <TerminalCommand>pnpm install</TerminalCommand>
          <TerminalProgress label="Resolving packages..." percent={25} variant="yellow" />
          <TerminalProgress label="Downloading..." percent={62} variant="blue" />
          <TerminalProgress label="Linking dependencies..." percent={88} variant="purple" />
          <TerminalProgress label="Done" percent={100} variant="green" />
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalSpinner</h2>
        <Terminal title="spinner-demo.sh">
          <TerminalCommand>pnpm run build</TerminalCommand>
          <TerminalSpinner text="Compiling components..." />
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">
          TerminalLog — string mode
        </h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Simulated streaming logs with capped history and auto-scroll.
        </p>
        <LogDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">
          TerminalLog — structured mode
        </h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Structured entries with level badges, timestamps, and source labels via{' '}
          <code>entries</code> prop.
        </p>
        <StructuredLogDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">Copy Button</h2>
        <Terminal title="copy-demo.sh">
          <TerminalCommand>pnpm run build</TerminalCommand>
          <TerminalOutput type="success">Compiled successfully in 1.2s</TerminalOutput>
          <TerminalOutput type="info">
            Click the copy icon in the header to copy this output.
          </TerminalOutput>
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalDiff</h2>
        <Terminal title="diff-demo.sh">
          <TerminalCommand>git diff -- src/config.ts</TerminalCommand>
          <TerminalOutput type="info">Unified</TerminalOutput>
          <TerminalDiff
            before={'const retries = 2\nconst timeoutMs = 1500\nconst env = "staging"'}
            after={'const retries = 3\nconst timeoutMs = 2000\nconst env = "production"'}
            mode="unified"
          />
          <TerminalOutput type="info">Split</TerminalOutput>
          <TerminalDiff
            before={'PORT=3000\nLOG_LEVEL=info\nFEATURE_FLAG=false'}
            after={'PORT=3000\nLOG_LEVEL=debug\nFEATURE_FLAG=true'}
            mode="split"
          />
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">
          Syntax Highlighting
        </h2>
        <Terminal title="package-info.json">
          <TerminalCommand>cat package.json | jq '.name, .version, .scripts'</TerminalCommand>
          <TerminalOutput language="json">
            {`{
  "name": "@openknots/terminal-ui",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`}
          </TerminalOutput>
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalTree</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Expandable tree with custom icon, label, and row render props.
        </p>
        <TreeDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">
          Tree Keyboard Navigation
        </h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Arrow keys to navigate, Enter/Space to toggle, ArrowRight to expand/enter, ArrowLeft to
          collapse/parent.
        </p>
        <TreeKeyboardDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalBadge</h2>
        <Terminal title="badge-demo.sh">
          <TerminalCommand>pnpm run release</TerminalCommand>
          <TerminalOutput type="info">
            <span className="flex flex-wrap items-center gap-2">
              <TerminalBadge variant="info">staging</TerminalBadge>
              <TerminalBadge variant="success">v1.2.0</TerminalBadge>
              <TerminalBadge variant="warning">WARN 2</TerminalBadge>
              <TerminalBadge variant="error">EXIT 1</TerminalBadge>
            </span>
          </TerminalOutput>
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalMarker</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Phase separators for visual boundaries in terminal feeds.
        </p>
        <Terminal title="deploy-pipeline.sh">
          <TerminalCommand>npm run deploy:full</TerminalCommand>
          <TerminalMarker label="BUILD" timestamp="10:23:45" variant="info" />
          <TerminalOutput type="success">✓ Compiled 42 modules</TerminalOutput>
          <TerminalOutput type="normal"> dist/main.js 124 KB</TerminalOutput>
          <TerminalMarker label="TEST" timestamp="10:24:01" variant="success" />
          <TerminalOutput type="success">✓ 24 tests passed</TerminalOutput>
          <TerminalOutput type="normal"> coverage: 94%</TerminalOutput>
          <TerminalMarker label="DEPLOY" timestamp="10:24:30" variant="warning" />
          <TerminalOutput type="info">→ Deploying to production...</TerminalOutput>
          <TerminalOutput type="success">✓ Deployed successfully</TerminalOutput>
          <TerminalMarker label="DONE" timestamp="10:24:45" variant="success" />
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalLogLine</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Structured log row primitive with level badge, timestamp, source, and message.
        </p>
        <Terminal title="app.log">
          <TerminalCommand>pnpm run start</TerminalCommand>
          <TerminalLogLine
            level="info"
            timestamp="10:23:44"
            source="server"
            message="Starting application..."
          />
          <TerminalLogLine
            level="info"
            timestamp="10:23:45"
            source="server"
            message="Listening on :3000"
          />
          <TerminalLogLine
            level="debug"
            timestamp="10:23:46"
            source="worker"
            message="Spawned 4 worker threads"
          />
          <TerminalLogLine
            level="warn"
            timestamp="10:23:47"
            source="auth"
            message="Token expiring in 5 min for user #42"
          />
          <TerminalLogLine
            level="error"
            timestamp="10:23:48"
            source="db"
            message="Connection refused: ECONNREFUSED 127.0.0.1:5432"
          />
          <TerminalLogLine
            level="info"
            timestamp="10:23:48"
            source="db"
            message="Retrying connection (attempt 1/3)..."
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:49"
            source="db"
            message="Connected to postgres in 84ms"
          />
          <TerminalLogLine
            level="success"
            timestamp="10:23:50"
            source="build"
            message="Compiled 42 modules in 1.2s"
          />
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalFeed</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          High-performance log feed. Compare standard (DOM-bounded) vs virtualized (constant node
          count) modes. Hit ⚡ burst to stress-test.
        </p>
        <FeedDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalGroup</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Collapsible command/output sections with header, summary, count pill, and variant accent.
        </p>
        <GroupDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalSearch</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          In-feed search with next / prev navigation (Enter / Shift+Enter) and match highlighting.
        </p>
        <SearchDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">Typing Animation</h2>
        <Terminal title="deploy-log.sh">
          <TerminalCommand>npm run deploy</TerminalCommand>
          <TerminalOutput type="info" animate delay={28}>
            Building production bundle...
          </TerminalOutput>
          <TerminalOutput type="success" animate delay={20}>
            Deployment complete. URL: https://example.app
          </TerminalOutput>
        </Terminal>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalAnsi</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          ANSI SGR escape-code renderer — standard/bright/256/true-colour, bold, dim, italic,
          underline, strikethrough, invert. No dangerouslySetInnerHTML.
        </p>
        <AnsiDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">
          TerminalStackTrace
        </h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Foldable stack trace viewer with per-frame collapse, node_modules filtering, and
          keyboard-accessible toggles.
        </p>
        <StackTraceDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalFilterBar</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Controlled filter bar — level toggles, text search, and source toggles. Pair with{' '}
          <code>filterEntries()</code> to apply.
        </p>
        <FilterBarDemo />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold font-mono text-[var(--term-fg)]">TerminalJsonLine</h2>
        <p className="text-sm text-[var(--term-fg-dim)] font-mono">
          Collapsible JSON payload renderer — click to expand, handles invalid JSON safely.
        </p>
        <Terminal title="events.log">
          <TerminalCommand>tail -f logs/events.log</TerminalCommand>
          <TerminalJsonLine
            label="deploy"
            payload={{
              type: 'deploy',
              status: 'success',
              durationMs: 1240,
              region: 'us-east-1',
              sha: 'a3f9c12',
            }}
          />
          <TerminalJsonLine
            label="request"
            payload={{
              method: 'POST',
              path: '/api/publish',
              statusCode: 200,
              latencyMs: 84,
              userId: 'u_8f3a',
            }}
          />
          <TerminalJsonLine
            label="error"
            payload={{
              code: 'ECONNREFUSED',
              host: '127.0.0.1',
              port: 5432,
              retries: 3,
              fatal: false,
            }}
            defaultExpanded
          />
          <TerminalJsonLine label="response" payload="not { valid ] json at all" />
          <TerminalJsonLine
            label="config"
            payload={{
              version: '2.1.0',
              features: { darkMode: true, telemetry: false, maxConnections: 10 },
              plugins: ['auth', 'cache', 'ratelimit'],
              endpoints: { api: 'https://api.example.com', cdn: 'https://cdn.example.com' },
            }}
          />
        </Terminal>
      </section>
    </main>
  )
}
