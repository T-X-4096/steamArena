#!/bin/bash
# _build.sh — Cloudflare Pages build script
# Injects Supabase credentials into config.js at build time.
# Set as "Build command" in Cloudflare Pages dashboard.
# Requires SUPABASE_URL and SUPABASE_ANON_KEY as Pages environment variables.

set -e

echo "→ Injecting environment variables into config.js..."

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set as environment variables."
    exit 1
fi

sed -i "s|REPLACE_WITH_YOUR_SUPABASE_URL|$SUPABASE_URL|g" front/js/config.js
sed -i "s|REPLACE_WITH_YOUR_ANON_KEY|$SUPABASE_ANON_KEY|g" front/js/config.js

echo "✓ Build complete. Output directory: front/"
