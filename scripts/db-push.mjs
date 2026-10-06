#!/usr/bin/env node
import { lintMigration, readMigrations } from './lint-migrations.mjs'
import { callCloud, notConnected, readCloudConfig } from './lovabee-cloud.mjs'

const files = readMigrations()
const lintErrors = files.flatMap((f) => lintMigration(f.filename, f.sql).errors.map((e) => `${f.filename}: ${e}`))
if (lintErrors.length) {
  for (const e of lintErrors) console.error(`✖ ${e}`)
  console.error('Fix these before pushing. Nothing was applied.')
  process.exit(1)
}

const config = readCloudConfig()
if (!config) notConnected('npm run db:push')

const { ok, results } = await callCloud(config, 'migrations', { files })
const icons = { applied: '✔', skipped: '·', blocked: '⏸', error: '✖', not_attempted: '…' }
for (const r of results) {
  console.log(`${icons[r.status] ?? '?'} ${r.filename} — ${r.status}`)
  for (const m of r.messages) console.log(`    ${m}`)
}

if (!ok) {
  const blocked = results.some((r) => r.status === 'blocked')
  console.error(
    blocked
      ? 'A destructive migration is waiting for the user to approve it in Lovabee. Tell the user, and do not work around it.'
      : 'Migration failed. Nothing after the failing file was applied.',
  )
  process.exit(1)
}
