import { NextRequest, NextResponse } from 'next/server'

const backendBaseUrl =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:8000'

function buildBackendUrl(pathSegments: string[], requestUrl: string): URL {
  const incoming = new URL(requestUrl)
  const joinedPath = pathSegments.join('/')
  const normalizedBase = backendBaseUrl.endsWith('/')
    ? backendBaseUrl.slice(0, -1)
    : backendBaseUrl

  return new URL(`${normalizedBase}/${joinedPath}${incoming.search}`)
}

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params
  const targetUrl = buildBackendUrl(path, req.url)

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') || 'application/json',
    },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
    cache: 'no-store',
  })

  const body = await upstream.text()
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
    },
  })
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return proxyRequest(req, context)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  return proxyRequest(req, context)
}
