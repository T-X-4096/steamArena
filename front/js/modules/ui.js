// modules/ui.js
// Central UI system: drawer, modal, toast, follow state, reminders.

// ─── Toast ────────────────────────────────────────────────────────────────────

export function toast(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer')
    if (!container) {
        container = document.createElement('div')
        container.id = 'toastContainer'
        document.body.appendChild(container)
    }
    const el = document.createElement('div')
    el.className = `toast toast-${type}`
    el.innerHTML = msg
    container.appendChild(el)
    requestAnimationFrame(() => el.classList.add('toast-show'))
    setTimeout(() => {
        el.classList.remove('toast-show')
        setTimeout(() => el.remove(), 300)
    }, duration)
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
// A right-side sliding drawer. Call openDrawer(title, htmlContent).

export function openDrawer(title, content) {
    closeDrawer()

    const overlay = document.createElement('div')
    overlay.id = 'drawerOverlay'
    overlay.className = 'drawer-overlay'
    overlay.innerHTML = `
        <div class="drawer" id="drawer">
            <div class="drawer-header">
                <h3 class="drawer-title">${title}</h3>
                <button class="drawer-close" id="drawerClose">✕</button>
            </div>
            <div class="drawer-body">${content}</div>
        </div>
    `
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => overlay.classList.add('drawer-open'))

    overlay.addEventListener('click', e => { if (e.target === overlay) closeDrawer() })
    document.getElementById('drawerClose').addEventListener('click', closeDrawer)
    document.addEventListener('keydown', handleEsc)
}

export function closeDrawer() {
    const overlay = document.getElementById('drawerOverlay')
    if (!overlay) return
    overlay.classList.remove('drawer-open')
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEsc)
    setTimeout(() => overlay.remove(), 300)
}

function handleEsc(e) { if (e.key === 'Escape') closeDrawer() }

// ─── Follow ───────────────────────────────────────────────────────────────────

const FOLLOWS_KEY = 'esports_follows'

function getFollows() {
    try { return JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '[]') } catch { return [] }
}

function saveFollows(list) {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify(list))
}

export function toggleFollow(teamName, btn) {
    let follows = getFollows()
    if (follows.includes(teamName)) {
        follows = follows.filter(f => f !== teamName)
        btn.textContent = '⭐ Follow'
        btn.classList.remove('following')
        toast(`Unfollowed <strong>${teamName}</strong>`, 'info')
    } else {
        follows.push(teamName)
        btn.textContent = '✅ Following'
        btn.classList.add('following')
        toast(`Now following <strong>${teamName}</strong>!`, 'success')
    }
    saveFollows(follows)
}

export function isFollowing(teamName) {
    return getFollows().includes(teamName)
}

// ─── Reminder ─────────────────────────────────────────────────────────────────

const REMINDERS_KEY = 'esports_reminders'

function getReminders() {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]') } catch { return [] }
}

export function toggleReminder(tournamentId, tournamentName, btn) {
    let reminders = getReminders()
    if (reminders.includes(tournamentId)) {
        reminders = reminders.filter(r => r !== tournamentId)
        btn.textContent = '🔔 Remind me'
        btn.classList.remove('reminder-set')
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
        toast(`Reminder removed for <strong>${tournamentName}</strong>`, 'info')
    } else {
        reminders.push(tournamentId)
        btn.classList.add('reminder-set')
        btn.textContent = '🔕 Remove Reminder'
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
        toast(`🔔 Reminder set for <strong>${tournamentName}</strong>!`, 'success')
    }
}

export function hasReminder(id) {
    return getReminders().includes(id)
}

// ─── Stream drawer builder ────────────────────────────────────────────────────

export function openStreamDrawer(stream) {
    const isLive = stream.status === 'LIVE' || !stream.status
    const statusBadge = isLive
        ? `<span class="badge live-badge" style="font-size:0.8rem">● LIVE</span>`
        : `<span class="badge" style="font-size:0.8rem">UPCOMING</span>`

    const content = `
        <div class="drawer-thumb">
            <img src="${stream.thumbnail}" alt="${stream.title}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
            <div class="drawer-thumb-overlay">
                ${isLive ? `<button class="drawer-play-btn" onclick="window.open('https://www.twitch.tv/directory/game/${encodeURIComponent(stream.game)}','_blank')">▶ Watch on Twitch</button>` : ''}
            </div>
        </div>
        <div class="drawer-meta-grid">
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Status</span>
                <span>${statusBadge}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Game</span>
                <span class="badge game-badge">${stream.game}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Viewers</span>
                <span style="color:hsl(var(--primary));font-weight:700">👁 ${stream.viewers || 'N/A'}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">${stream.streamer ? 'Broadcaster' : 'Duration'}</span>
                <span>${stream.streamer || stream.timeLeft || 'N/A'}</span>
            </div>
            ${stream.category ? `
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Category</span>
                <span>${stream.category}</span>
            </div>` : ''}
            ${stream.language ? `
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Language</span>
                <span>${stream.language}</span>
            </div>` : ''}
        </div>
        ${stream.team1 ? `
        <div class="drawer-matchup">
            <div class="drawer-team">
                <img src="${stream.team1.logo}" alt="${stream.team1.name}" onerror="this.style.display='none'">
                <span>${stream.team1.name}</span>
            </div>
            <span class="drawer-vs">VS</span>
            <div class="drawer-team">
                <img src="${stream.team2.logo}" alt="${stream.team2.name}" onerror="this.style.display='none'">
                <span>${stream.team2.name}</span>
            </div>
        </div>` : ''}
        <div class="drawer-actions">
            <button class="btn btn-primary" style="flex:1" onclick="window.open('https://www.twitch.tv/directory/game/${encodeURIComponent(stream.game)}','_blank')">
                ▶ Watch on Twitch
            </button>
            <button class="btn btn-outline" style="flex:1" onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(stream.title + ' esports')}','_blank')">
                🎬 YouTube
            </button>
        </div>
    `
    openDrawer(stream.title, content)
}

// ─── Team drawer builder ──────────────────────────────────────────────────────

export function openTeamDrawer(team) {
    const following = isFollowing(team.name)
    const formHtml = (team.recentForm || [])
        .map(w => `<div class="form-badge ${w ? 'win' : 'loss'}">${w ? 'W' : 'L'}</div>`)
        .join('')

    const content = `
        <div class="drawer-team-header">
            <img src="${team.logo}" alt="${team.name}" class="drawer-team-logo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=0a0a0a&color=00b4d8&size=100'">
            <div>
                <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.25rem">${team.name}</h2>
                <div style="color:hsl(var(--muted-foreground))">📍 ${team.region}</div>
                <span class="badge game-badge" style="margin-top:0.5rem;display:inline-block">${team.game}</span>
            </div>
        </div>
        <div class="drawer-meta-grid">
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Rank</span>
                <span style="font-weight:700;font-size:1.1rem;color:hsl(var(--primary))">#${team.rank}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Win Rate</span>
                <span style="font-weight:700;color:#22c55e">${team.winRate}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Total Wins</span>
                <span style="font-weight:700">${team.totalWins}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Prize Money</span>
                <span style="font-weight:700;color:hsl(var(--primary))">${team.prize}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Followers</span>
                <span>👥 ${team.followers}</span>
            </div>
            ${team.trending ? `
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Trending</span>
                <span>📈 Yes</span>
            </div>` : ''}
        </div>
        <div style="margin-bottom:1.5rem">
            <div class="drawer-meta-label" style="margin-bottom:0.5rem">Recent Form</div>
            <div style="display:flex;gap:0.4rem">${formHtml}</div>
        </div>
        <div class="drawer-actions">
            <button class="btn btn-primary follow-btn" style="flex:1" id="drawerFollowBtn"
                data-team="${team.name}">
                ${following ? '✅ Following' : '⭐ Follow'}
            </button>
            <button class="btn btn-outline" style="flex:1"
                onclick="window.open('https://liquipedia.net/search?query=${encodeURIComponent(team.name)}','_blank')">
                📋 Liquipedia
            </button>
        </div>
    `
    openDrawer(team.name, content)

    // Wire follow button inside drawer
    setTimeout(() => {
        const btn = document.getElementById('drawerFollowBtn')
        if (btn) {
            if (isFollowing(team.name)) btn.classList.add('following')
            btn.addEventListener('click', () => toggleFollow(team.name, btn))
        }
    }, 50)
}

// ─── Tournament drawer builder ────────────────────────────────────────────────

export function openTournamentDrawer(tournament) {
    const hasRemind = hasReminder(tournament.id)
    const daysLeft = tournament.startDate
        ? Math.max(0, Math.floor((new Date(tournament.startDate) - Date.now()) / 86400000))
        : null

    const content = `
        <div class="drawer-thumb">
            <img src="${tournament.thumbnail}" alt="${tournament.name}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
        </div>
        <div class="drawer-meta-grid">
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Game</span>
                <span class="badge game-badge">${tournament.game}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Status</span>
                <span class="badge" style="background:hsl(var(--primary)/0.15);color:hsl(var(--primary))">${tournament.status}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Prize Pool</span>
                <span style="font-weight:700;color:hsl(var(--primary))">${tournament.prizePool}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Teams</span>
                <span>${tournament.teams} teams</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Format</span>
                <span>${tournament.format}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Location</span>
                <span>📍 ${tournament.location}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Organizer</span>
                <span>${tournament.organizer}</span>
            </div>
            ${daysLeft !== null ? `
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Starts In</span>
                <span style="font-weight:700;color:hsl(var(--accent))">${daysLeft} days</span>
            </div>` : ''}
        </div>
        <div class="drawer-actions">
            <button class="btn ${hasRemind ? 'btn-outline reminder-set' : 'btn-primary'}" style="flex:1"
                id="drawerReminderBtn" data-id="${tournament.id}" data-name="${tournament.name}">
                ${hasRemind ? '🔕 Remove Reminder' : '🔔 Remind me'}
            </button>
            <button class="btn btn-outline" style="flex:1"
                onclick="window.open('https://liquipedia.net/search?query=${encodeURIComponent(tournament.name)}','_blank')">
                📅 Full Schedule
            </button>
        </div>
    `
    openDrawer(tournament.name, content)

    setTimeout(() => {
        const btn = document.getElementById('drawerReminderBtn')
        if (btn) {
            btn.addEventListener('click', () => toggleReminder(tournament.id, tournament.name, btn))
        }
    }, 50)
}

// ─── News drawer builder ──────────────────────────────────────────────────────

export function openArticleDrawer(article) {
    const content = `
        <div class="drawer-thumb">
            <img src="${article.thumbnail}" alt="${article.title}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
            <span class="badge game-badge">${article.category}</span>
            ${article.trending ? `<span class="badge" style="background:hsl(var(--accent)/0.2);color:hsl(var(--accent))">🔥 Trending</span>` : ''}
        </div>
        <div style="display:flex;gap:1.5rem;margin-bottom:1.5rem;color:hsl(var(--muted-foreground));font-size:0.8rem">
            <span>✍️ ${article.author}</span>
            <span>🕒 ${article.publishedAt || article.published_at}</span>
            <span>📖 ${article.readTime || article.read_time}</span>
            <span>👁 ${article.views}</span>
        </div>
        <p style="color:hsl(var(--muted-foreground));line-height:1.8;margin-bottom:1.5rem">${article.excerpt}</p>
        <div class="drawer-actions">
            <button class="btn btn-primary" style="flex:1"
                onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(article.title)}','_blank')">
                🔗 Read Full Article
            </button>
        </div>
    `
    openDrawer(article.title, content)
}

// ─── Highlight drawer builder ─────────────────────────────────────────────────

export function openHighlightDrawer(highlight) {
    const content = `
        <div class="drawer-thumb" style="cursor:pointer" onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(highlight.title + ' ' + highlight.game)}','_blank')">
            <img src="${highlight.thumbnail}" alt="${highlight.title}" onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
            <div class="drawer-thumb-overlay">
                <button class="drawer-play-btn">▶ Watch Highlight</button>
            </div>
        </div>
        <div class="drawer-meta-grid">
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Game</span>
                <span class="badge game-badge">${highlight.game}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Player</span>
                <span style="font-weight:600">${highlight.player}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Team</span>
                <span>${highlight.team}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Duration</span>
                <span>⏱ ${highlight.duration}</span>
            </div>
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Views</span>
                <span>👁 ${highlight.views}</span>
            </div>
            ${highlight.trending ? `
            <div class="drawer-meta-item">
                <span class="drawer-meta-label">Trending</span>
                <span>🔥 Yes</span>
            </div>` : ''}
        </div>
        <div class="drawer-actions">
            <button class="btn btn-primary" style="flex:1"
                onclick="window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(highlight.title + ' ' + highlight.game)}','_blank')">
                ▶ Watch on YouTube
            </button>
        </div>
    `
    openDrawer(highlight.title, content)
}
