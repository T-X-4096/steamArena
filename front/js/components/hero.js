import { openStreamDrawer } from '../modules/ui.js'

export function initHeroCarousel(streams) {
    if (!streams || streams.length === 0) return
    let currentStreamIndex = 0

    const heroBackground   = document.getElementById('heroBackground')
    const heroStatus       = document.getElementById('heroStatus')
    const heroGame         = document.getElementById('heroGame')
    const heroTitle        = document.getElementById('heroTitle')
    const team1El          = document.getElementById('team1')
    const team2El          = document.getElementById('team2')
    const heroViewers      = document.getElementById('heroViewers')
    const heroTime         = document.getElementById('heroTime')
    const featuredContainer = document.getElementById('featuredStreams')
    const heroIndicators   = document.getElementById('heroIndicators')
    const watchBtn         = document.getElementById('heroWatchBtn')
    const detailsBtn       = document.getElementById('heroDetailsBtn')

    function updateHero(index) {
        const stream = streams[index]
        if (!stream) return

        if (heroBackground) heroBackground.style.backgroundImage = `url(${stream.thumbnail})`
        if (heroStatus) {
            heroStatus.textContent = stream.status
            heroStatus.className = stream.status === 'LIVE' ? 'badge live-badge' : 'badge'
        }
        if (heroGame)    heroGame.textContent    = stream.game
        if (heroTitle)   heroTitle.textContent   = stream.title
        if (team1El)     team1El.textContent     = stream.team1?.name || ''
        if (team2El)     team2El.textContent     = stream.team2?.name || ''
        if (heroViewers) heroViewers.textContent = stream.viewers
        if (heroTime)    heroTime.textContent    = stream.timeLeft

        // Wire hero buttons to current stream
        if (watchBtn)   watchBtn.onclick   = () => openStreamDrawer(stream)
        if (detailsBtn) detailsBtn.onclick = () => openStreamDrawer(stream)

        if (heroIndicators) {
            heroIndicators.querySelectorAll('.hero-indicator')
                .forEach((ind, i) => ind.classList.toggle('active', i === index))
        }
    }

    function renderFeaturedStreams() {
        if (!featuredContainer) return
        featuredContainer.innerHTML = streams.map((stream, index) => `
        <div class="featured-stream-card ${index === currentStreamIndex ? 'active' : ''}" data-index="${index}" style="cursor:pointer">
            <div class="featured-stream-thumb">
                <img src="${stream.thumbnail}" alt="${stream.title}"
                    onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
                ${stream.status === 'LIVE' ? '<span class="badge live-badge" style="position:absolute;top:0.25rem;left:0.25rem;font-size:0.625rem">LIVE</span>' : ''}
            </div>
            <div class="featured-stream-info">
                <div class="featured-stream-title">${stream.title}</div>
                <div class="featured-stream-meta">${stream.team1?.name || ''} vs ${stream.team2?.name || ''}</div>
                <div class="featured-stream-meta">👁️ ${stream.viewers} • ${stream.timeLeft}</div>
            </div>
        </div>`).join('')

        featuredContainer.querySelectorAll('.featured-stream-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                currentStreamIndex = index
                updateHero(index)
                renderFeaturedStreams()
            })
        })
    }

    function renderHeroIndicators() {
        if (!heroIndicators) return
        heroIndicators.innerHTML = streams.map((_, index) => `
        <button class="hero-indicator ${index === currentStreamIndex ? 'active' : ''}" data-index="${index}"></button>
        `).join('')

        heroIndicators.querySelectorAll('.hero-indicator').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                currentStreamIndex = index
                updateHero(index)
                renderFeaturedStreams()
                renderHeroIndicators()
            })
        })
    }

    setInterval(() => {
        currentStreamIndex = (currentStreamIndex + 1) % streams.length
        updateHero(currentStreamIndex)
        renderFeaturedStreams()
        renderHeroIndicators()
    }, 5000)

    updateHero(0)
    renderFeaturedStreams()
    renderHeroIndicators()
}
