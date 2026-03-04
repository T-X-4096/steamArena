import { openArticleDrawer, openHighlightDrawer } from '../modules/ui.js'

export function renderNews(newsArticles, highlights) {
    const articlesContainer = document.getElementById('newsArticles')
    if (articlesContainer) {
        articlesContainer.innerHTML = newsArticles.map((a, i) => `
        <div class="news-article ${i === 0 ? 'featured' : ''}" data-index="${i}" style="cursor:pointer">
            <img src="${a.thumbnail}" alt="${a.title}"
                onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
            <div class="news-article-content">
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.5rem">
                    <span class="badge game-badge">${a.category}</span>
                    ${a.trending ? '<span class="badge" style="background:hsl(var(--accent)/0.2);color:hsl(var(--accent))">🔥 Trending</span>' : ''}
                </div>
                <h3>${a.title}</h3>
                <p>${a.excerpt}</p>
                <div style="display:flex;gap:1rem;margin-top:0.5rem;color:hsl(var(--muted-foreground));font-size:0.75rem">
                    <span>✍️ ${a.author}</span>
                    <span>🕒 ${a.publishedAt || a.published_at}</span>
                    <span>👁 ${a.views}</span>
                </div>
            </div>
        </div>`).join('')

        articlesContainer.querySelectorAll('.news-article').forEach((el, i) => {
            el.addEventListener('click', () => openArticleDrawer(newsArticles[i]))
        })
    }

    const highlightsContainer = document.getElementById('highlightsList')
    if (highlightsContainer) {
        highlightsContainer.innerHTML = highlights.map((h, i) => `
        <div class="highlight-card" data-index="${i}" style="cursor:pointer">
            <div style="position:relative;overflow:hidden;border-radius:0.5rem">
                <img src="${h.thumbnail}" alt="${h.title}"
                    onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop'">
                <div class="highlight-play-overlay">▶</div>
            </div>
            <div>
                <h4>${h.title}</h4>
                <span style="color:hsl(var(--muted-foreground));font-size:0.8rem">${h.player} • ${h.team}</span>
                <div style="display:flex;gap:0.75rem;margin-top:0.25rem;font-size:0.75rem;color:hsl(var(--muted-foreground))">
                    <span>⏱ ${h.duration}</span>
                    <span>👁 ${h.views}</span>
                </div>
            </div>
        </div>`).join('')

        highlightsContainer.querySelectorAll('.highlight-card').forEach((el, i) => {
            el.addEventListener('click', () => openHighlightDrawer(highlights[i]))
        })
    }
}
