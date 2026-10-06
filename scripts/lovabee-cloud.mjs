import fs from 'node:fs'
import path from 'node:path'

// Written by the Lovabee sandbox worker; absent once the project is exported.
export function readCloudConfig(root = process.cwd()) {
  const file = path.join(root, '.lovabee', 'cloud.json')
  if (!fs.existsSync(file)) return null
  const config = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!config.apiUrl || !config.projectId || !config.token) return null
  return config
}

export async function callCloud(config, endpoint, body = {}) {
  const res = await fetch(`${config.apiUrl}/webhooks/sandbox/cloud/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: config.projectId, token: config.token, ...body }),
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { message: text }
  }
  if (!res.ok) throw new Error(data.message || `Lovabee Cloud request failed (${res.status})`)
  return data
}

export function notConnected(command) {
  console.error(
    `This project is not connected to Lovabee Cloud, so "${command}" has nothing to talk to.\n` +
      'Outside Lovabee, use the Supabase CLI instead: `npx supabase db push` / `npx supabase gen types typescript`.',
  )
  process.exit(1)
}
