#!/usr/bin/env node
// Everything under src/ ships to the browser, so a server key found there is
// a leak even if it is "only used in dev".
import fs from 'node:fs'
import path from 'node:path'

const PATTERNS = [
  { name: 'Stripe secret key', re: /\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}/ },
  { name: 'Supabase secret key', re: /\bsb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'Resend API key', re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/ },
  { name: 'Server-only env var', re: /import\.meta\.env\.(SUPABASE_SECRET_KEY|STRIPE_SECRET_KEY|RESEND_API_KEY)\b/ },
]

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const findings = walk('src')
  .filter((f) => /\.(ts|tsx|js|jsx|json|html|css)$/.test(f))
  .flatMap((file) => {
    const content = fs.readFileSync(file, 'utf8')
    return PATTERNS.filter((p) => p.re.test(content)).map((p) => `${file}: looks like a ${p.name}`)
  })

if (findings.length) {
  for (const f of findings) console.error(`✖ ${f}`)
  console.error('Secrets belong in functions/ (read them from c.env), never in src/.')
  process.exit(1)
}
