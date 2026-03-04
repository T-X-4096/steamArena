// config.js — Supabase anon client
// Credentials come from front/env.js (local dev) or _build.sh (Cloudflare Pages).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = window.__SUPABASE_URL__
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
        '❌ Supabase credentials missing.\n' +
        'Open front/env.js and fill in your SUPABASE_URL and SUPABASE_ANON_KEY.\n' +
        'Then make sure index.html has <script src="./env.js"></script> before the module script.'
    )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
