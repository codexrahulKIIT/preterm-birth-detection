import { NextRequest, NextResponse } from 'next/server'

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000'

function candidateBackends(): string[] {
  const primary = BACKEND_BASE.replace(/\/+$/, '')
  const out: string[] = [primary]
  if (primary.includes('127.0.0.1')) out.push(primary.replace('127.0.0.1', 'localhost'))
  if (primary.includes('localhost')) out.push(primary.replace('localhost', '127.0.0.1'))
  return Array.from(new Set(out))
}

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const form = new URLSearchParams()
  Object.entries(payload || {}).forEach(([k, v]) => form.set(k, String(v)))

  let lastError: unknown = null
  for (const base of candidateBackends()) {
    try {
      const res = await fetch(`${base}/report/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        cache: 'no-store',
      })
      const bytes = await res.arrayBuffer()
      return new NextResponse(bytes, {
        status: res.status,
        headers: {
          'Content-Type': res.headers.get('Content-Type') || 'application/pdf',
        },
      })
    } catch (err) {
      lastError = err
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error_type: 'internal_error',
      message:
        `Failed to connect to backend report endpoint. Checked: ${candidateBackends().join(', ')}` +
        (lastError instanceof Error ? ` (${lastError.message})` : ''),
    },
    { status: 502 }
  )
}

