#!/usr/bin/env node
// Upgrades a project generated from the static (main) template to Lovabee
// Cloud by copying in this branch's backend files and patching the few shared
// files deterministically. Usage: node apply-cloud-overlay.mjs <fullstackTemplateDir> <projectDir>
// Anything it can't patch safely is written to the project's decisions.md for
// the agent to finish, instead of guessing.
import fs from 'node:fs'
import path from 'node:path'

const [templateDir, projectDir] = process.argv.slice(2).map((p) => path.resolve(p))
if (!templateDir || !projectDir) {
  console.error('Usage: node apply-cloud-overlay.mjs <fullstackTemplateDir> <projectDir>')
  process.exit(1)
}

const COPY_IF_MISSING = [
  'functions',
  'supabase',
  'scripts',
  'src/features/auth',
  'src/features/billing',
  'src/shared/lib/supabase.ts',
  'src/shared/lib/api.ts',
  'src/shared/types/database.ts',
  'src/app/auth-routes.ts',
  'src/app/pages/login',
  'src/app/pages/signup',
  'src/app/pages/forgot-password',
  'src/app/pages/reset-password',
  'src/app/pages/account',
]

const CLOUD_SCRIPTS = [
  'dev:api',
  'build',
  'build:app',
  'build:functions',
  'verify',
  'typecheck',
  'lint',
  'lint:fix',
  'lint:sql',
  'db:push',
  'db:types',
]

const todos = []
const t = (rel) => path.join(templateDir, rel)
const p = (rel) => path.join(projectDir, rel)
const read = (file) => fs.readFileSync(file, 'utf8')

function copyIfMissing(rel) {
  const src = t(rel)
  if (!fs.existsSync(src)) return
  if (fs.statSync(src).isDirectory()) {
    for (const entry of fs.readdirSync(src)) copyIfMissing(path.join(rel, entry))
    return
  }
  if (fs.existsSync(p(rel))) return
  fs.mkdirSync(path.dirname(p(rel)), { recursive: true })
  fs.copyFileSync(src, p(rel))
}

function mergePackageJson() {
  const tpl = JSON.parse(read(t('package.json')))
  const proj = JSON.parse(read(p('package.json')))
  for (const field of ['dependencies', 'devDependencies']) {
    proj[field] = proj[field] || {}
    for (const [name, version] of Object.entries(tpl[field] || {})) {
      if (!proj[field][name]) proj[field][name] = version
    }
  }
  proj.scripts = proj.scripts || {}
  for (const name of CLOUD_SCRIPTS) {
    if (tpl.scripts[name]) proj.scripts[name] = tpl.scripts[name]
  }
  fs.writeFileSync(p('package.json'), JSON.stringify(proj, null, 2) + '\n')
}

function patchFile(rel, isDone, patch, todo) {
  const file = p(rel)
  if (!fs.existsSync(file)) return todos.push(todo)
  const content = read(file)
  if (isDone(content)) return
  const next = patch(content)
  if (next === content) return todos.push(todo)
  fs.writeFileSync(file, next)
}

function patchViteConfig() {
  patchFile(
    'vite.config.ts',
    (c) => c.includes("'/api'"),
    (c) => c.replace(/server:\s*\{/, "server: {\n    proxy: {\n      '/api': 'http://127.0.0.1:8788',\n    },"),
    "Add `proxy: { '/api': 'http://127.0.0.1:8788' }` to `server` in vite.config.ts so /api reaches functions/ in dev.",
  )
}

// Appended at the end so the user's own routes keep priority over the
// template's when both define the same path (React Router picks the first of
// equally specific routes).
function patchRouter() {
  patchFile(
    'src/app/router.tsx',
    (c) => c.includes('authRoutes'),
    (c) => {
      const open = c.search(/export const routerObjects: RouteObject\[\] = \[/)
      if (open === -1) return c
      const start = c.indexOf('[', c.indexOf('=', open))
      let depth = 0
      let close = -1
      for (let i = start; i < c.length; i++) {
        if (c[i] === '[') depth++
        if (c[i] === ']' && --depth === 0) {
          close = i
          break
        }
      }
      if (close === -1) return c
      const body = c.slice(start + 1, close).trimEnd()
      const separator = body.length && !body.endsWith(',') ? ',' : ''
      return c
        .slice(0, start + 1)
        .concat(`${body}${separator}\n  ...authRoutes,\n`, c.slice(close))
        .replace(/(import [^\n]+\n)(?![\s\S]*^import )/m, "$1import { authRoutes } from './auth-routes'\n")
    },
    'Add the auth pages to the router: `import { authRoutes } from "./auth-routes"` in src/app/router.tsx and spread `...authRoutes` into the routes.',
  )
}

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/account']

// Run before copying: anything found here was built by the user before Cloud
// and must be kept and wired up, not replaced by the template's version.
function findExistingAuthUi() {
  const found = []
  const router = fs.existsSync(p('src/app/router.tsx')) ? read(p('src/app/router.tsx')) : ''
  for (const route of AUTH_PATHS) {
    if (router.includes(`'${route}'`) || router.includes(`"${route}"`)) found.push(`route ${route}`)
  }
  if (fs.existsSync(p('src/features/auth')))
    found.push('src/features/auth (existing, so template auth files were only added where missing)')
  return found
}

function patchApp() {
  patchFile(
    'src/app/app.tsx',
    (c) => c.includes('AuthProvider'),
    (c) => {
      if (!/<RouterProvider[^>]*\/>/.test(c)) return c
      return c
        .replace(/(import [^\n]+\n)(?![\s\S]*^import )/m, "$1import { AuthProvider } from '../features/auth'\n")
        .replace(/<RouterProvider[^>]*\/>/, (m) => `<AuthProvider>\n          ${m}\n        </AuthProvider>`)
    },
    'Wrap the app in `<AuthProvider>` from src/features/auth (around the router in src/app/app.tsx).',
  )
}

function patchViteEnvTypes() {
  patchFile(
    'src/vite-env.d.ts',
    (c) => c.includes('VITE_SUPABASE_URL'),
    (c) =>
      `${c.trimEnd()}\n\ninterface ImportMetaEnv {\n  readonly VITE_SUPABASE_URL: string\n  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string\n}\n\ninterface ImportMeta {\n  readonly env: ImportMetaEnv\n}\n`,
    'Declare VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY on ImportMetaEnv in src/vite-env.d.ts.',
  )
}

function appendOnce(rel, marker, block) {
  const file = p(rel)
  const content = fs.existsSync(file) ? read(file) : ''
  if (content.includes(marker)) return
  fs.writeFileSync(file, `${content.trimEnd()}\n\n${block.trim()}\n`)
}

const BACKEND_START = '<!-- lovabee-backend:start -->'
const BACKEND_END = '<!-- lovabee-backend:end -->'

// main's AGENTS.md says the project has no backend; leaving that next to the
// backend rules would contradict them, so the whole marked section is swapped.
function replaceAgentBackendSection() {
  const agents = read(t('AGENTS.md'))
  const start = agents.indexOf(BACKEND_START)
  const end = agents.indexOf(BACKEND_END)
  if (start === -1 || end === -1) return
  const section = agents.slice(start, end + BACKEND_END.length)

  const file = p('AGENTS.md')
  const current = fs.existsSync(file) ? read(file) : ''
  if (current.includes('<!-- lovabee-cloud:start -->')) return
  const from = current.indexOf(BACKEND_START)
  const to = current.indexOf(BACKEND_END)
  const next =
    from !== -1 && to !== -1
      ? current.slice(0, from) + section + current.slice(to + BACKEND_END.length)
      : `${current.trimEnd()}\n\n${section}\n`
  fs.writeFileSync(file, next)
}

const existingAuthUi = findExistingAuthUi()
for (const rel of COPY_IF_MISSING) copyIfMissing(rel)
mergePackageJson()
patchViteConfig()
patchRouter()
patchApp()
patchViteEnvTypes()
replaceAgentBackendSection()
appendOnce(
  '.gitignore',
  '.dev.vars',
  '# Lovabee Cloud: local secrets and tooling state\n.dev.vars\n.lovabee/\n.wrangler/',
)

if (existingAuthUi.length) {
  todos.push(
    `This project already had its own auth UI (${existingAuthUi.join('; ')}). Keep the user's design: connect it to ` +
      'useAuth()/supabase.auth from src/features/auth, then delete the duplicate template page and its entry in ' +
      'src/app/auth-routes.ts. Remove any fake auth (localStorage users, hard-coded accounts).',
  )
}

if (todos.length) {
  appendOnce(
    'decisions.md',
    '## Lovabee Cloud overlay: manual steps',
    [
      '## Lovabee Cloud overlay: manual steps',
      'Finish these before anything else:',
      ...todos.map((x) => `- [ ] ${x}`),
    ].join('\n'),
  )
}

console.log(
  `Lovabee Cloud overlay applied to ${projectDir}${
    todos.length ? ` (${todos.length} manual step(s) in decisions.md)` : ''
  }`,
)
