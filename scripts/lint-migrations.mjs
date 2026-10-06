#!/usr/bin/env node
// Keep in sync with packages/shared/src/migration-lint.ts in the Lovabee
// platform: this copy runs in the sandbox (npm run lint:sql), the platform
// re-runs its copy before applying anything, so the two must agree.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const MIGRATION_FILENAME_RE = /^\d{4,14}_[a-z0-9_]+\.sql$/

const TABLE_NAME = String.raw`((?:"[^"]+"|[\w]+)(?:\.(?:"[^"]+"|[\w]+))?)`

function normalizeTableName(name) {
  return name
    .replace(/"/g, '')
    .toLowerCase()
    .replace(/^public\./, '')
}

function collectMarkers(sql, marker) {
  const re = new RegExp(String.raw`--\s*lovabee:${marker}\s+${TABLE_NAME}`, 'gi')
  return new Set([...sql.matchAll(re)].map((m) => normalizeTableName(m[1])))
}

function stripNonCode(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .replace(/\$([a-z_]*)\$[\s\S]*?\$\1\$/gi, "''")
    .replace(/'(?:[^']|'')*'/g, "''")
}

export function lintMigration(filename, sql) {
  const errors = []
  const destructive = []

  if (!MIGRATION_FILENAME_RE.test(filename)) {
    errors.push(`${filename}: name must look like 0003_add_orders.sql (numeric prefix, lowercase, underscores).`)
  }

  const serviceOnly = collectMarkers(sql, 'service-only')
  const publicRead = collectMarkers(sql, 'public-read')

  const statements = stripNonCode(sql)
    .split(';')
    .map((s) => s.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter(Boolean)

  const created = new Set()
  const rlsEnabled = new Set()
  const withPolicies = new Set()

  for (const stmt of statements) {
    const createTable = stmt.match(
      new RegExp(String.raw`^create\s+table\s+(?:if\s+not\s+exists\s+)?${TABLE_NAME}`, 'i'),
    )
    if (createTable) created.add(normalizeTableName(createTable[1]))

    const enableRls = stmt.match(
      new RegExp(
        String.raw`^alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?${TABLE_NAME}\s+enable\s+row\s+level\s+security`,
        'i',
      ),
    )
    if (enableRls) rlsEnabled.add(normalizeTableName(enableRls[1]))

    const policy = stmt.match(
      new RegExp(String.raw`^create\s+policy\s+(?:"[^"]+"|''|\w+)\s+on\s+${TABLE_NAME}(.*)$`, 'i'),
    )
    if (policy) {
      const table = normalizeTableName(policy[1])
      const rest = policy[2]
      withPolicies.add(table)
      const opensEverything = /(using|with\s+check)\s*\(\s*true\s*\)/.test(rest)
      const command = rest.match(/\bfor\s+(select|insert|update|delete|all)\b/)?.[1] ?? 'all'
      if (opensEverything && command !== 'select') {
        errors.push(
          `Policy on "${table}" lets anyone ${
            command === 'all' ? 'read and write' : command
          } rows (true). Scope it to auth.uid().`,
        )
      }
      if (opensEverything && command === 'select' && !publicRead.has(table)) {
        errors.push(
          `Policy on "${table}" makes every row public. If that is intended, add "-- lovabee:public-read ${table}".`,
        )
      }
    }

    if (
      /^create\s+(or\s+replace\s+)?function\b/.test(stmt) &&
      /\bsecurity\s+definer\b/.test(stmt) &&
      !/\bset\s+search_path\b/.test(stmt)
    ) {
      errors.push('SECURITY DEFINER functions must pin the schema with "set search_path = public".')
    }

    if (
      /^(alter\s+table|drop\s+table|truncate|insert\s+into|update|delete\s+from)\s+(?:table\s+)?(?:if\s+exists\s+)?(?:only\s+)?(auth|storage)\./.test(
        stmt,
      )
    ) {
      errors.push(
        'Do not modify the auth or storage schemas directly. Use triggers on auth.users or the Supabase APIs.',
      )
    }

    if (/^drop\s+(table|schema|type)\b/.test(stmt)) destructive.push(`Drops data: ${stmt.slice(0, 120)}`)
    else if (/\bdrop\s+column\b/.test(stmt)) destructive.push(`Drops a column: ${stmt.slice(0, 120)}`)
    else if (/^truncate\b/.test(stmt)) destructive.push(`Deletes all rows: ${stmt.slice(0, 120)}`)
    else if (/^delete\s+from\b/.test(stmt)) destructive.push(`Deletes rows: ${stmt.slice(0, 120)}`)
    else if (/\balter\s+column\s+\S+\s+(set\s+data\s+)?type\b/.test(stmt))
      destructive.push(`Changes a column type: ${stmt.slice(0, 120)}`)
    else if (/^alter\s+table\s+\S+\s+rename\b/.test(stmt))
      destructive.push(`Renames a table or column: ${stmt.slice(0, 120)}`)
  }

  for (const table of created) {
    if (!rlsEnabled.has(table)) {
      errors.push(`Table "${table}" is created without "alter table ${table} enable row level security".`)
    }
    if (!withPolicies.has(table) && !serviceOnly.has(table)) {
      errors.push(
        `Table "${table}" has no policies, so the app cannot read it. Add policies, or mark it "-- lovabee:service-only ${table}" if only /api functions use it.`,
      )
    }
  }

  return { filename, errors, destructive }
}

export function readMigrations(root = process.cwd()) {
  const dir = path.join(root, 'supabase', 'migrations')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((filename) => ({ filename, sql: fs.readFileSync(path.join(dir, filename), 'utf8') }))
}

function main() {
  const files = readMigrations()
  let failed = false
  for (const file of files) {
    const { errors, destructive } = lintMigration(file.filename, file.sql)
    for (const e of errors) console.error(`✖ ${file.filename}: ${e}`)
    for (const d of destructive) console.warn(`⚠ ${file.filename}: needs user approval before it is applied. ${d}`)
    if (errors.length) failed = true
  }
  if (failed) process.exit(1)
  console.log(`✔ ${files.length} migration file(s) passed lint:sql`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main()
