import { supabase } from './supabase.js'
import topTeams from '../front/js/data/teams.js'
import { featuredStreams, liveStreams } from '../front/js/data/streams.js'
import { newsArticles, highlights } from '../front/js/data/news.js'
import upcomingTournaments from '../front/js/data/tournaments.js'

async function seed() {
    // Clear existing data
    for (const table of ['teams', 'featured_streams', 'live_streams', 'news_articles', 'highlights', 'tournaments']) {
        await supabase.from(table).delete().gte('id', 0)
    }
    console.log('Cleared existing data')

    // Seed teams
    const { error: e1 } = await supabase.from('teams').insert(topTeams.map(({ id, ...t }) => ({
        name: t.name, logo: t.logo, game: t.game, rank: t.rank, region: t.region,
        win_rate: t.winRate, total_wins: t.totalWins, recent_form: t.recentForm,
        prize: t.prize, followers: t.followers, trending: t.trending,
    })))
    console.log(e1 ? `Teams FAIL: ${e1.message}` : 'Teams seeded')

    // Seed featured streams
    const { error: e2 } = await supabase.from('featured_streams').insert(featuredStreams.map(({ id, ...s }) => ({
        title: s.title, game: s.game,
        team1_name: s.team1.name, team1_logo: s.team1.logo,
        team2_name: s.team2.name, team2_logo: s.team2.logo,
        viewers: s.viewers, status: s.status, thumbnail: s.thumbnail, time_left: s.timeLeft,
    })))
    console.log(e2 ? `Featured FAIL: ${e2.message}` : 'Featured streams seeded')

    // Seed live streams
    const { error: e3 } = await supabase.from('live_streams').insert(liveStreams.map(({ id, ...s }) => ({
        title: s.title, game: s.game, streamer: s.streamer, viewers: s.viewers,
        thumbnail: s.thumbnail, category: s.category, language: s.language, duration: s.duration,
    })))
    console.log(e3 ? `Live FAIL: ${e3.message}` : 'Live streams seeded')

    // Seed news articles
    const { error: e4 } = await supabase.from('news_articles').insert(newsArticles.map(({ id, ...a }) => ({
        title: a.title, excerpt: a.excerpt, author: a.author, published_at: a.publishedAt,
        read_time: a.readTime, thumbnail: a.thumbnail, category: a.category,
        trending: a.trending, views: a.views, comments: a.comments,
    })))
    console.log(e4 ? `News FAIL: ${e4.message}` : 'News articles seeded')

    // Seed highlights
    const { error: e5 } = await supabase.from('highlights').insert(highlights.map(({ id, ...h }) => ({
        title: h.title, game: h.game, player: h.player, team: h.team,
        duration: h.duration, views: h.views, thumbnail: h.thumbnail, trending: h.trending,
    })))
    console.log(e5 ? `Highlights FAIL: ${e5.message}` : 'Highlights seeded')

    // Seed tournaments
    const { error: e6 } = await supabase.from('tournaments').insert(upcomingTournaments.map(({ id, ...t }) => ({
        name: t.name, game: t.game, start_date: t.startDate.toISOString(),
        location: t.location, prize_pool: t.prizePool, teams: t.teams,
        format: t.format, organizer: t.organizer, thumbnail: t.thumbnail,
        status: t.status, featured: t.featured,
    })))
    console.log(e6 ? `Tournaments FAIL: ${e6.message}` : 'Tournaments seeded')

    console.log('\nSeed complete!')
}

seed().catch(console.error)
