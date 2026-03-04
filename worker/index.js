// worker/index.js — Cloudflare Worker
// Handles all admin CRUD operations.
// Validates Supabase JWT on every request before executing any DB operation.
// Uses SUPABASE_SERVICE_ROLE_KEY (stored as a Worker secret) for DB writes.
//
// Routes:
//   GET    /api/admin/:table         → list all rows
//   POST   /api/admin/:table         → create row
//   PUT    /api/admin/:table/:id     → update row
//   DELETE /api/admin/:table/:id     → delete row

const ALLOWED_TABLES = [
    'teams',
    'featured_streams',
    'live_streams',
    'news_articles',
    'highlights',
    'tournaments',
]

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',      // Tighten to your domain in production
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS })
        }

        try {
            return await handleRequest(request, env)
        } catch (err) {
            console.error('[Worker] Unhandled error:', err)
            return jsonError('Internal server error', 500)
        }
    }
}

// ─── Request Router ───────────────────────────────────────────────────────────

async function handleRequest(request, env) {
    const url = new URL(request.url)
    const parts = url.pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean)
    // parts[0] = table, parts[1] = id (optional)

    const table = parts[0]
    const id = parts[1] ?? null

    // Validate table name
    if (!table || !ALLOWED_TABLES.includes(table)) {
        return jsonError('Invalid or missing table name', 400)
    }

    // Authenticate request — every admin route requires a valid Supabase JWT
    const authResult = await authenticate(request, env)
    if (!authResult.ok) {
        return jsonError(authResult.error, 401)
    }

    // Route to handler
    switch (request.method) {
        case 'GET':    return handleList(table, env)
        case 'POST':   return handleCreate(table, request, env)
        case 'PUT':    return handleUpdate(table, id, request, env)
        case 'DELETE': return handleDelete(table, id, env)
        default:       return jsonError('Method not allowed', 405)
    }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function authenticate(request, env) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return { ok: false, error: 'Missing Authorization header' }
    }

    const token = authHeader.slice(7)

    // Verify the JWT by calling Supabase's /auth/v1/user endpoint
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': env.SUPABASE_ANON_KEY,
        },
    })

    if (!res.ok) {
        return { ok: false, error: 'Invalid or expired token' }
    }

    const user = await res.json()
    return { ok: true, user }
}

// ─── CRUD Handlers ────────────────────────────────────────────────────────────

async function handleList(table, env) {
    const data = await supabaseRequest(env, 'GET', `/${table}?order=id`)
    return jsonOk(data)
}

async function handleCreate(table, request, env) {
    const body = await request.json()
    const data = await supabaseRequest(env, 'POST', `/${table}`, body, {
        'Prefer': 'return=representation',
    })
    return jsonOk(Array.isArray(data) ? data[0] : data, 201)
}

async function handleUpdate(table, id, request, env) {
    if (!id) return jsonError('Missing id', 400)
    const body = await request.json()
    const data = await supabaseRequest(env, 'PATCH', `/${table}?id=eq.${id}`, body, {
        'Prefer': 'return=representation',
    })
    return jsonOk(Array.isArray(data) ? data[0] : data)
}

async function handleDelete(table, id, env) {
    if (!id) return jsonError('Missing id', 400)
    await supabaseRequest(env, 'DELETE', `/${table}?id=eq.${id}`)
    return jsonOk({ ok: true })
}

// ─── Supabase REST Client ─────────────────────────────────────────────────────

async function supabaseRequest(env, method, path, body = null, extraHeaders = {}) {
    const url = `${env.SUPABASE_URL}/rest/v1${path}`

    const headers = {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
    }

    const options = { method, headers }
    if (body) options.body = JSON.stringify(body)

    const res = await fetch(url, options)

    // 204 No Content (DELETE success) — return empty
    if (res.status === 204) return null

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || data?.error || `Supabase error ${res.status}`)
    return data
}

// ─── Response Helpers ─────────────────────────────────────────────────────────

function jsonOk(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
}

function jsonError(message, status = 400) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
}
