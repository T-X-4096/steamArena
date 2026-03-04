// config.js — Supabase anon client
// Credentials come from front/env.js (local dev) or _build.sh (Cloudflare Pages).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL     = 'https://tslyqafnmvikwzgcvcgy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbHlxYWZubXZpa3d6Z2N2Y2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjAzNDgsImV4cCI6MjA4ODE5NjM0OH0.ZfA_hLk6q3S_2MjVpKu27rhTolR9mqUrmEpdTDBpqoA'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(
        '❌ Supabase credentials missing.\n' +
        'Open front/env.js and fill in your SUPABASE_URL and SUPABASE_ANON_KEY.\n' +
        'Then make sure index.html has <script src="./env.js"></script> before the module script.'
    )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
