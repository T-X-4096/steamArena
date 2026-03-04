import { renderCountdown } from '../utils/countdown.js'
import { toggleReminder, hasReminder, openTournamentDrawer } from '../modules/ui.js'

export function renderTournaments(upcomingTournaments) {
    if (!upcomingTournaments || upcomingTournaments.length === 0) return

    const featuredContainer = document.getElementById('featuredTournament')
    const gridContainer = document.getElementById('tournamentsGrid')

    const featured = upcomingTournaments.find(t => t.featured)

    if (featured && featuredContainer) {
        const countdownId = `countdown-${featured.id}`
        const hasRemind = hasReminder(featured.id)

        featuredContainer.innerHTML = `
        <div class="featured-tournament-card">
            <div class="featured-tournament-content">
                <div class="featured-tournament-image" style="cursor:pointer" id="featuredThumb">
                    <img src="${featured.thumbnail}" alt="${featured.name}"
                        onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
                    <div style="position:absolute;top:1rem;left:1rem">
                        <span class="badge" style="background:hsl(var(--accent))">Featured</span>
                    </div>
                    <div style="position:absolute;bottom:1rem;left:1rem;right:1rem">
                        <h3 style="font-family:'Orbitron',monospace;font-size:1.5rem;font-weight:700;color:white;margin-bottom:0.5rem">${featured.name}</h3>
                        <span class="badge game-badge" style="color:white;border-color:rgba(255,255,255,0.5)">${featured.game}</span>
                    </div>
                </div>
                <div class="featured-tournament-info">
                    <div>
                        <div class="tournament-details">
                            <h4 style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Tournament Details</h4>
                            <div class="tournament-detail">📍 ${featured.location}</div>
                            <div class="tournament-detail">💰 Prize Pool: ${featured.prizePool}</div>
                            <div class="tournament-detail">👥 ${featured.teams} Teams</div>
                            <div class="tournament-detail">🏆 ${featured.format}</div>
                            <div class="tournament-detail">🏢 ${featured.organizer}</div>
                        </div>
                        <div>
                            <h4 style="font-size:1.125rem;font-weight:600;margin-bottom:1rem">Starts In</h4>
                            <div class="countdown" id="${countdownId}"></div>
                        </div>
                    </div>
                    <div style="display:flex;gap:0.75rem">
                        <button class="btn btn-primary featured-remind-btn ${hasRemind ? 'reminder-set' : ''}"
                            style="flex:1" data-id="${featured.id}" data-name="${featured.name}">
                            ${hasRemind ? '🔕 Remove Reminder' : '🔔 Set Reminder'}
                        </button>
                        <button class="btn btn-outline featured-details-btn" style="flex:1">
                            📅 View Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>`

        setTimeout(() => {
            const countdownEl = document.getElementById(countdownId)
            if (countdownEl) renderCountdown(countdownEl, featured.startDate)
        }, 100)

        // Wire buttons
        featuredContainer.querySelector('.featured-remind-btn').addEventListener('click', e => {
            toggleReminder(featured.id, featured.name, e.currentTarget)
        })
        featuredContainer.querySelector('.featured-details-btn').addEventListener('click', () => {
            openTournamentDrawer(featured)
        })
        featuredContainer.querySelector('#featuredThumb').addEventListener('click', () => {
            openTournamentDrawer(featured)
        })
    }

    const others = upcomingTournaments.filter(t => !featured || t.id !== featured.id)

    if (gridContainer) {
        gridContainer.innerHTML = others.map((tournament, i) => {
            const daysLeft = Math.max(0, Math.floor(
                (new Date(tournament.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ))
            const hasRemind = hasReminder(tournament.id)

            return `
            <div class="tournament-card" data-index="${i}" style="cursor:pointer">
                <div class="tournament-thumb">
                    <img src="${tournament.thumbnail}" alt="${tournament.name}"
                        onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
                    <div style="position:absolute;top:0.75rem;left:0.75rem">
                        <span class="badge" style="background:rgba(0,0,0,0.7);color:white">${tournament.status}</span>
                    </div>
                    <div style="position:absolute;bottom:0.75rem;left:0.75rem;right:0.75rem">
                        <h3 style="font-weight:700;color:white;margin-bottom:0.25rem;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${tournament.name}</h3>
                        <span class="badge game-badge" style="color:white;border-color:rgba(255,255,255,0.5);font-size:0.75rem">${tournament.game}</span>
                    </div>
                </div>
                <div class="tournament-card-content">
                    <div class="tournament-card-meta">
                        <div class="tournament-card-meta-item">📍 ${tournament.location}</div>
                        <div class="tournament-card-meta-item">💰 ${tournament.prizePool}</div>
                        <div class="tournament-card-meta-item">👥 ${tournament.teams} Teams</div>
                    </div>
                    <div style="margin-bottom:1rem">
                        <div style="font-size:0.75rem;color:hsl(var(--muted-foreground));margin-bottom:0.5rem">Starts in:</div>
                        <div style="display:inline-block;background:hsl(var(--primary)/0.1);border-radius:var(--radius);padding:0.25rem 0.5rem;font-size:0.75rem">
                            <span style="font-weight:700;color:hsl(var(--primary))">${daysLeft}</span>
                            <span style="color:hsl(var(--muted-foreground));margin-left:0.25rem">days</span>
                        </div>
                    </div>
                    <div class="tournament-actions">
                        <button class="btn btn-outline btn-sm remind-btn ${hasRemind ? 'reminder-set' : ''}" style="flex:1;font-size:0.75rem"
                            data-id="${tournament.id}" data-name="${tournament.name}">
                            ${hasRemind ? '🔕 Reminded' : '🔔 Remind'}
                        </button>
                        <button class="btn btn-outline btn-sm details-btn" style="flex:1;font-size:0.75rem">
                            Details
                        </button>
                    </div>
                </div>
            </div>`
        }).join('')

        gridContainer.querySelectorAll('.tournament-card').forEach((card, i) => {
            const t = others[i]

            card.querySelector('.remind-btn').addEventListener('click', e => {
                e.stopPropagation()
                toggleReminder(t.id, t.name, e.currentTarget)
            })

            card.querySelector('.details-btn').addEventListener('click', e => {
                e.stopPropagation()
                openTournamentDrawer(t)
            })

            card.querySelector('.tournament-thumb').addEventListener('click', () => {
                openTournamentDrawer(t)
            })
        })
    }
}
