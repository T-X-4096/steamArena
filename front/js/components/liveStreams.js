import { openStreamDrawer } from '../modules/ui.js'

export function renderLiveStreams(liveStreams) {
    const container = document.getElementById('streamsGrid')
    if (!container) return

    container.innerHTML = liveStreams.map((s, i) => `
        <div class="stream-card" data-index="${i}" style="cursor:pointer">
            <div class="stream-thumb">
                <img src="${s.thumbnail}" alt="${s.title}"
                    onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
                <div class="stream-overlay">
                    <button class="stream-play-btn">▶</button>
                </div>
                <div class="stream-badges">
                    <span class="badge live-badge">● LIVE</span>
                    <span class="badge">👁️ ${s.viewers}</span>
                </div>
            </div>
            <div class="stream-content">
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.5rem">
                    <span class="badge game-badge">${s.game}</span>
                    <span class="badge">${s.category}</span>
                </div>
                <h3 style="font-weight:600;margin-bottom:0.25rem;line-height:1.3">${s.title}</h3>
                <div style="color:hsl(var(--muted-foreground));font-size:0.8rem;margin-bottom:0.75rem">
                    👥 ${s.streamer} • ${s.language} • ${s.duration}
                </div>
                <button class="btn btn-primary btn-sm watch-btn" style="width:100%">▶ Watch Live</button>
            </div>
        </div>
    `).join('')

    container.querySelectorAll('.stream-card').forEach((card, i) => {
        const stream = liveStreams[i]
        card.querySelector('.watch-btn').addEventListener('click', e => {
            e.stopPropagation()
            openStreamDrawer(stream)
        })
        card.querySelector('.stream-thumb').addEventListener('click', () => openStreamDrawer(stream))
    })
}