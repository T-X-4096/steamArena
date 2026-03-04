// modules/api.js
// All public-facing data fetches. Uses anon key + RLS to enforce read-only access.
// Replaces the Express GET /api/* routes from server.js.

import { supabase } from '../config.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function snakeToCamel(obj) {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
        result[camelKey] = value
    }
    return result
}

function throwIfError(error, context) {
    if (error) throw new Error(`[api.js] ${context}: ${error.message}`)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch top teams ordered by rank.
 * @returns {Promise<Array>}
 */
export async function fetchTopTeams() {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('rank')

    throwIfError(error, 'fetchTopTeams')
    return data.map(snakeToCamel)
}

/**
 * Fetch featured streams (hero carousel).
 * @returns {Promise<Array>}
 */
export async function fetchFeaturedStreams() {
    const { data, error } = await supabase
        .from('featured_streams')
        .select('*')
        .order('id')

    throwIfError(error, 'fetchFeaturedStreams')

    return data.map(row => {
        const mapped = snakeToCamel(row)
        return {
            ...mapped,
            team1: { name: row.team1_name, logo: row.team1_logo },
            team2: { name: row.team2_name, logo: row.team2_logo },
        }
    })
}

/**
 * Fetch live streams.
 * @returns {Promise<Array>}
 */
export async function fetchLiveStreams() {
    const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .order('id')

    throwIfError(error, 'fetchLiveStreams')
    return data.map(snakeToCamel)
}

/**
 * Fetch news articles and video highlights.
 * @returns {Promise<{ articles: Array, highlights: Array }>}
 */
export async function fetchNews() {
    const [articlesRes, highlightsRes] = await Promise.all([
        supabase.from('news_articles').select('*').order('id'),
        supabase.from('highlights').select('*').order('id'),
    ])

    throwIfError(articlesRes.error, 'fetchNews/articles')
    throwIfError(highlightsRes.error, 'fetchNews/highlights')

    return {
        articles: articlesRes.data.map(snakeToCamel),
        highlights: highlightsRes.data.map(snakeToCamel),
    }
}

/**
 * Fetch tournaments ordered by start_date.
 * @returns {Promise<Array>}
 */
export async function fetchTournaments() {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date')

    throwIfError(error, 'fetchTournaments')

    return data.map(row => {
        const mapped = snakeToCamel(row)
        mapped.startDate = new Date(row.start_date)
        return mapped
    })
}
