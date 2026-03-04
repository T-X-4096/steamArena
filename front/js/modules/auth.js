// modules/auth.js
// Supabase Auth helpers: login, logout, session, role.

import { supabase } from '../config.js'

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user, session, error }>}
 */
export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { user: data?.user ?? null, session: data?.session ?? null, error }
}

/**
 * Sign out the current session.
 */
export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[auth.js] logout:', error.message)
}

/**
 * Get the currently authenticated user, or null.
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get the authenticated user's access token (JWT).
 * Used to authenticate requests to the Cloudflare Worker.
 * @returns {Promise<string | null>}
 */
export async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
}

/**
 * Get the role from the profiles table for the current user.
 * Returns 'public' if unauthenticated.
 * @returns {Promise<'admin' | 'editor' | 'public'>}
 */
export async function getUserRole() {
    const user = await getCurrentUser()
    if (!user) return 'public'

    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error || !data) return 'public'
    return data.role
}

/**
 * Listen for auth state changes.
 * @param {(event: string, session: object) => void} callback
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
}
