// admin.js — Auth-gated admin panel
// All writes route through the Cloudflare Worker at /api/admin/*
// The Worker validates the Supabase JWT and uses service_role for DB writes.

import { login, logout, getCurrentUser, getAccessToken, onAuthStateChange } from './modules/auth.js'

// Worker base URL — same origin on Cloudflare Pages (Worker is bound to /api/admin/*)
// For local dev, set this to your Worker preview URL.
const WORKER_BASE = window.__WORKER_URL__ || ''

// ─── Table definitions (unchanged from original) ──────────────────────────────

const TABLES = {
    teams: {
        label: 'Teams',
        columns: ['id', 'name', 'game', 'rank', 'region', 'win_rate', 'trending'],
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'logo', type: 'url', label: 'Logo URL', required: true },
            { name: 'game', type: 'text', required: true },
            { name: 'rank', type: 'number', required: true },
            { name: 'region', type: 'text', required: true },
            { name: 'win_rate', type: 'text', required: true, label: 'Win Rate', help: 'e.g. 87%' },
            { name: 'total_wins', type: 'text', required: true, label: 'Total Wins' },
            { name: 'recent_form', type: 'text', required: true, label: 'Recent Form', help: 'Comma-separated: true,true,false,true,true' },
            { name: 'prize', type: 'text', required: true, help: 'e.g. $2.4M' },
            { name: 'followers', type: 'text', required: true, help: 'e.g. 1.2M' },
            { name: 'trending', type: 'checkbox' },
        ]
    },
    featured_streams: {
        label: 'Featured Streams',
        columns: ['id', 'title', 'game', 'team1_name', 'team2_name', 'status', 'viewers'],
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'game', type: 'text', required: true },
            { name: 'team1_name', type: 'text', required: true, label: 'Team 1 Name' },
            { name: 'team1_logo', type: 'text', required: true, label: 'Team 1 Logo', help: 'emoji or text' },
            { name: 'team2_name', type: 'text', required: true, label: 'Team 2 Name' },
            { name: 'team2_logo', type: 'text', required: true, label: 'Team 2 Logo', help: 'Team 2 Logo' },
            { name: 'viewers', type: 'text', required: true, help: 'e.g. 125.7K' },
            { name: 'status', type: 'select', required: true, options: ['LIVE', 'UPCOMING', 'ENDED'] },
            { name: 'thumbnail', type: 'url', required: true },
            { name: 'time_left', type: 'text', required: true, label: 'Time Left', help: 'e.g. Best of 5' },
        ]
    },
    live_streams: {
        label: 'Live Streams',
        columns: ['id', 'title', 'game', 'streamer', 'viewers', 'category'],
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'game', type: 'text', required: true },
            { name: 'streamer', type: 'text', required: true },
            { name: 'viewers', type: 'text', required: true, help: 'e.g. 45.2K' },
            { name: 'thumbnail', type: 'url', required: true },
            { name: 'category', type: 'text', required: true },
            { name: 'language', type: 'text', required: true },
            { name: 'duration', type: 'text', required: true, help: 'e.g. 3h 24m' },
        ]
    },
    news_articles: {
        label: 'News',
        columns: ['id', 'title', 'author', 'category', 'trending', 'views'],
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'excerpt', type: 'textarea', required: true },
            { name: 'author', type: 'text', required: true },
            { name: 'published_at', type: 'text', required: true, label: 'Published At', help: 'e.g. 2 hours ago' },
            { name: 'read_time', type: 'text', required: true, label: 'Read Time', help: 'e.g. 3 min read' },
            { name: 'thumbnail', type: 'url', required: true },
            { name: 'category', type: 'text', required: true },
            { name: 'trending', type: 'checkbox' },
            { name: 'views', type: 'text', required: true, help: 'e.g. 12.5K' },
            { name: 'comments', type: 'number' },
        ]
    },
    highlights: {
        label: 'Highlights',
        columns: ['id', 'title', 'game', 'player', 'team', 'views'],
        fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'game', type: 'text', required: true },
            { name: 'player', type: 'text', required: true },
            { name: 'team', type: 'text', required: true },
            { name: 'duration', type: 'text', required: true, help: 'e.g. 2:34' },
            { name: 'views', type: 'text', required: true, help: 'e.g. 1.2M' },
            { name: 'thumbnail', type: 'url', required: true },
            { name: 'trending', type: 'checkbox' },
        ]
    },
    tournaments: {
        label: 'Tournaments',
        columns: ['id', 'name', 'game', 'location', 'prize_pool', 'status', 'featured'],
        fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'game', type: 'text', required: true },
            { name: 'start_date', type: 'datetime-local', required: true, label: 'Start Date' },
            { name: 'location', type: 'text', required: true },
            { name: 'prize_pool', type: 'text', required: true, label: 'Prize Pool', help: 'e.g. $2,225,000' },
            { name: 'teams', type: 'number', required: true, label: 'Number of Teams' },
            { name: 'format', type: 'text', required: true, help: 'e.g. Double Elimination' },
            { name: 'organizer', type: 'text', required: true },
            { name: 'thumbnail', type: 'url', required: true },
            { name: 'status', type: 'select', required: true, options: ['Registration Open', 'Coming Soon', 'Qualifiers', 'TBD', 'Live', 'Completed'] },
            { name: 'featured', type: 'checkbox' },
        ]
    },
}

let currentTable = 'teams'
let tableData = []

// ─── Auth-gated API calls (via Cloudflare Worker) ────────────────────────────

async function workerFetch(path, options = {}) {
    const token = await getAccessToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${WORKER_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {}),
        },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
    return data
}

// ─── Auth UI ─────────────────────────────────────────────────────────────────

function showLoginWall() {
    document.getElementById('loginWall').style.display = 'flex'
    document.getElementById('adminApp').style.display = 'none'
}

function showAdminApp(user) {
    document.getElementById('loginWall').style.display = 'none'
    document.getElementById('adminApp').style.display = 'block'
    document.getElementById('adminUserEmail').textContent = user.email
}

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
    // Check if already logged in
    const user = await getCurrentUser()
    if (user) {
        showAdminApp(user)
        initAdminPanel()
    } else {
        showLoginWall()
    }

    // Listen for auth changes (e.g., session expiry)
    onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            showAdminApp(session.user)
            initAdminPanel()
        } else if (event === 'SIGNED_OUT') {
            showLoginWall()
        }
    })

    // Login form
    document.getElementById('loginBtn').addEventListener('click', handleLogin)
    document.getElementById('loginPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleLogin()
    })

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await logout()
        showLoginWall()
    })
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim()
    const password = document.getElementById('loginPassword').value

    const errorEl = document.getElementById('loginError')
    const btn = document.getElementById('loginBtn')

    if (!email || !password) {
        errorEl.textContent = 'Please enter email and password.'
        errorEl.style.display = 'block'
        return
    }

    btn.textContent = 'Signing in…'
    btn.disabled = true
    errorEl.style.display = 'none'

    const { user, error } = await login(email, password)

    btn.textContent = 'Sign In'
    btn.disabled = false

    if (error) {
        errorEl.textContent = error.message
        errorEl.style.display = 'block'
        return
    }

    showAdminApp(user)
    initAdminPanel()
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function initAdminPanel() {
    renderTabs()
    document.getElementById('addBtn').addEventListener('click', () => openModal())
    loadTable(currentTable)
}

function renderTabs() {
    const tabs = document.getElementById('tabs')
    tabs.innerHTML = Object.entries(TABLES).map(([key, cfg]) =>
        `<button class="tab ${key === currentTable ? 'active' : ''}" data-table="${key}">${cfg.label}</button>`
    ).join('')
    tabs.addEventListener('click', e => {
        const btn = e.target.closest('.tab')
        if (!btn) return
        currentTable = btn.dataset.table
        renderTabs()
        loadTable(currentTable)
    })
}

async function loadTable(table) {
    const cfg = TABLES[table]
    document.getElementById('tableTitle').textContent = cfg.label
    document.getElementById('tableContainer').innerHTML = '<div class="loading">Loading…</div>'

    try {
        tableData = await workerFetch(`/api/admin/${table}`)
    } catch (err) {
        document.getElementById('tableContainer').innerHTML = `<div class="empty error">Error: ${err.message}</div>`
        return
    }

    if (tableData.length === 0) {
        document.getElementById('tableContainer').innerHTML = '<div class="empty">No data yet. Click "+ Add New" to create one.</div>'
        return
    }

    const html = `<table class="data-table">
        <thead><tr>
            ${cfg.columns.map(c => `<th>${c}</th>`).join('')}
            <th>Actions</th>
        </tr></thead>
        <tbody>
            ${tableData.map(row => `<tr>
                ${cfg.columns.map(c => `<td>${formatCell(row[c])}</td>`).join('')}
                <td class="actions-cell">
                    <button class="btn btn-outline btn-sm" onclick="window._edit(${row.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="window._del(${row.id})">Del</button>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`
    document.getElementById('tableContainer').innerHTML = html
}

function formatCell(val) {
    if (val === true) return '<span style="color:#22c55e">Yes</span>'
    if (val === false) return '<span style="color:#a3a3a3">No</span>'
    if (Array.isArray(val)) return val.map(v => v ? 'W' : 'L').join('')
    if (val === null || val === undefined) return '-'
    return String(val)
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function openModal(item = null) {
    const cfg = TABLES[currentTable]
    const isEdit = !!item
    const title = isEdit ? `Edit ${cfg.label}` : `Add ${cfg.label}`

    const fieldsHtml = cfg.fields.map(f => {
        const val = item ? item[f.name] : ''
        const label = f.label || f.name.replace(/_/g, ' ')

        if (f.type === 'checkbox') {
            return `<div class="form-group">
                <div class="form-check">
                    <input type="checkbox" name="${f.name}" id="f_${f.name}" ${val ? 'checked' : ''}>
                    <label for="f_${f.name}">${label}</label>
                </div>
            </div>`
        }
        if (f.type === 'textarea') {
            return `<div class="form-group">
                <label for="f_${f.name}">${label}</label>
                <textarea name="${f.name}" id="f_${f.name}" ${f.required ? 'required' : ''}>${val || ''}</textarea>
                ${f.help ? `<div class="help">${f.help}</div>` : ''}
            </div>`
        }
        if (f.type === 'select') {
            return `<div class="form-group">
                <label for="f_${f.name}">${label}</label>
                <select name="${f.name}" id="f_${f.name}">
                    ${f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
                </select>
            </div>`
        }

        let displayVal = val
        if (f.type === 'datetime-local' && val) {
            displayVal = new Date(val).toISOString().slice(0, 16)
        }
        if (f.name === 'recent_form' && Array.isArray(val)) {
            displayVal = val.join(',')
        }

        return `<div class="form-group">
            <label for="f_${f.name}">${label}</label>
            <input type="${f.type === 'url' ? 'text' : f.type}" name="${f.name}" id="f_${f.name}"
                   value="${displayVal || ''}" ${f.required ? 'required' : ''}>
            ${f.help ? `<div class="help">${f.help}</div>` : ''}
        </div>`
    }).join('')

    document.getElementById('modalContainer').innerHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window._closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="itemForm">${fieldsHtml}</form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="window._closeModal()">Cancel</button>
                    <button class="btn btn-primary" id="saveBtn" onclick="window._save(${isEdit ? item.id : 'null'})">${isEdit ? 'Update' : 'Create'}</button>
                </div>
            </div>
        </div>`

    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) window._closeModal()
    })
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function save(id) {
    const cfg = TABLES[currentTable]
    const body = {}

    for (const f of cfg.fields) {
        const el = document.getElementById(`f_${f.name}`)
        if (!el) continue

        if (f.type === 'checkbox') {
            body[f.name] = el.checked
        } else if (f.name === 'recent_form') {
            body[f.name] = el.value.split(',').map(v => v.trim().toLowerCase() === 'true')
        } else if (f.type === 'number') {
            body[f.name] = Number(el.value)
        } else if (f.type === 'datetime-local') {
            body[f.name] = new Date(el.value).toISOString()
        } else {
            body[f.name] = el.value
        }
    }

    const isEdit = id !== null
    const path = isEdit ? `/api/admin/${currentTable}/${id}` : `/api/admin/${currentTable}`
    const method = isEdit ? 'PUT' : 'POST'

    const saveBtn = document.getElementById('saveBtn')
    if (saveBtn) { saveBtn.textContent = 'Saving…'; saveBtn.disabled = true }

    try {
        await workerFetch(path, { method, body: JSON.stringify(body) })
        toast(isEdit ? 'Updated!' : 'Created!', 'success')
        window._closeModal()
        loadTable(currentTable)
    } catch (err) {
        toast(err.message, 'error')
        if (saveBtn) { saveBtn.textContent = isEdit ? 'Update' : 'Create'; saveBtn.disabled = false }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

async function del(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    try {
        await workerFetch(`/api/admin/${currentTable}/${id}`, { method: 'DELETE' })
        toast('Deleted!', 'success')
        loadTable(currentTable)
    } catch (err) {
        toast(err.message, 'error')
    }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer')
    const el = document.createElement('div')
    el.className = `toast toast-${type}`
    el.textContent = msg
    container.appendChild(el)
    setTimeout(() => el.classList.add('toast-visible'), 10)
    setTimeout(() => {
        el.classList.remove('toast-visible')
        setTimeout(() => el.remove(), 300)
    }, 3000)
}

// ─── Globals for inline onclick ───────────────────────────────────────────────

window._edit = (id) => {
    const item = tableData.find(r => r.id === id)
    if (item) openModal(item)
}
window._del = del
window._save = save
window._closeModal = () => {
    document.getElementById('modalContainer').innerHTML = ''
}

init()
