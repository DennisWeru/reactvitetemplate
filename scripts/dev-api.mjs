#!/usr/bin/env node
// Runs functions/ locally on :8788. Vite (the preview on :3000) proxies /api
// here, so the browser only ever talks to one origin.
import fs from 'node:fs'
import { spawn } from 'node:child_process'

const COMPATIBILITY_DATE = '2025-09-01'
const COMPATIBILITY_FLAGS = 'nodejs_compat'

// wrangler pages dev needs a static directory; Vite serves the real frontend.
const staticRoot = '.wrangler/dev-root'
fs.mkdirSync(staticRoot, { recursive: true })

const child = spawn(
  'npx',
  [
    'wrangler',
    'pages',
    'dev',
    staticRoot,
    '--port',
    '8788',
    '--ip',
    '127.0.0.1',
    '--compatibility-date',
    COMPATIBILITY_DATE,
    '--compatibility-flags',
    COMPATIBILITY_FLAGS,
    '--show-interactive-dev-session=false',
  ],
  { stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } },
)
child.on('exit', (code) => process.exit(code ?? 0))
