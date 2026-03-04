// main.js — public site entry point
// Fetches all data from Supabase via modules/api.js (no Express server required).

import { initMobileMenu } from './components/menu.js'
import { initHeroCarousel } from './components/hero.js'
import { renderTeams } from './components/teams.js'
import { renderNews } from './components/news.js'
import { renderTournaments } from './components/tournaments.js'
import { renderLiveStreams } from './components/liveStreams.js'

import {
    fetchFeaturedStreams,
    fetchLiveStreams,
    fetchTopTeams,
    fetchTournaments,
    fetchNews,
} from './modules/api.js'

// Show a skeleton/loading state while data loads
function setLoading(id, show) {
    const el = document.getElementById(id)
    if (!el) return
    el.classList.toggle('loading-shimmer', show)
}

document.addEventListener('DOMContentLoaded', async () => {
    initMobileMenu()

    // Run all fetches in parallel for performance
    const [featuredStreams, liveStreams, topTeams, tournaments, news] = await Promise.allSettled([
        fetchFeaturedStreams(),
        fetchLiveStreams(),
        fetchTopTeams(),
        fetchTournaments(),
        fetchNews(),
    ])

    // Hero carousel
    if (featuredStreams.status === 'fulfilled') {
        initHeroCarousel(featuredStreams.value)
    } else {
        console.error('Featured streams failed:', featuredStreams.reason)
    }

    // Live streams
    if (liveStreams.status === 'fulfilled') {
        renderLiveStreams(liveStreams.value)
    } else {
        console.error('Live streams failed:', liveStreams.reason)
    }

    // Teams
    if (topTeams.status === 'fulfilled') {
        renderTeams(topTeams.value)
    } else {
        console.error('Top teams failed:', topTeams.reason)
    }

    // Tournaments
    if (tournaments.status === 'fulfilled') {
        renderTournaments(tournaments.value)
    } else {
        console.error('Tournaments failed:', tournaments.reason)
    }

    // News & highlights
    if (news.status === 'fulfilled') {
        renderNews(news.value.articles, news.value.highlights)
    } else {
        console.error('News failed:', news.reason)
    }
})
