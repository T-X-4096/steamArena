# Deployment Guide

## Prerequisites
- Supabase project created at https://supabase.com
- Cloudflare account with Pages + Workers enabled
- Node.js 18+ (for Wrangler CLI)
- GitHub repo with this code

---

## Step 1 — Supabase Setup

### 1a. Run DB migrations
In your Supabase project → **SQL Editor**, run these files **in order**:

1. `db/schema.sql` — creates the 6 content tables
2. `db/migrations/001_profiles.sql` — creates profiles table + auth trigger
3. `db/migrations/002_rls_policies.sql` — enables RLS + public SELECT policies

### 1b. Enable Auth
- Supabase Dashboard → **Authentication → Providers**
- Enable **Email** provider
- (Optional) Disable email confirmation for faster testing

### 1c. Create your admin user
- Supabase Dashboard → **Authentication → Users → Add User**
- After creating the user, run this SQL to give them admin role:

```sql
update profiles set role = 'admin' where id = '<USER_UUID>';
```

### 1d. Get your keys
From Supabase Dashboard → **Settings → API**:
- `Project URL` → your `SUPABASE_URL`
- `anon public` key → your `SUPABASE_ANON_KEY`
- `service_role` key → your `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret**)

---

## Step 2 — Local Development

### 2a. Set credentials
Edit `front/env.js` with your Supabase URL and anon key.
Add `<script src="./env.js"></script>` before module scripts in `index.html` and `admin.html` **locally only**.

### 2b. Run a local static server
```bash
cd front
npx serve .
# Visit http://localhost:3000
```

### 2c. Run the Worker locally
```bash
npm install -g wrangler
wrangler dev worker/index.js --port 8787
```

Set in `front/env.js`:
```js
window.__WORKER_URL__ = 'http://localhost:8787'
```

---

## Step 3 — Deploy Worker

```bash
# Install wrangler
npm install -g wrangler
wrangler login

# Deploy the worker
wrangler deploy

# Set secrets (you'll be prompted to enter each value)
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Note the Worker URL (e.g. `https://cfweb-admin-worker.YOUR_SUBDOMAIN.workers.dev`).

Update `wrangler.toml` with your actual domain and zone name once your Pages site is deployed.

---

## Step 4 — Deploy Frontend to Cloudflare Pages

1. Push code to GitHub
2. Cloudflare Dashboard → **Pages → Create a Project → Connect to Git**
3. Select your repo
4. Build settings:
   - **Build command**: *(leave empty — no build step)*
   - **Build output directory**: `front`
5. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | your Supabase project URL |
   | `SUPABASE_ANON_KEY` | your anon public key |
6. Deploy

---

## Step 5 — Wire Worker to Pages domain

Update `wrangler.toml`:
```toml
[[routes]]
pattern = "your-domain.pages.dev/api/admin/*"
zone_name = "your-domain.pages.dev"
```

Then redeploy:
```bash
wrangler deploy
```

---

## Step 6 — Remove local dev helpers

Before final production push:
- Remove `<script src="./env.js">` from `index.html` and `admin.html`
- Do **not** commit `front/env.js` with real keys (add to `.gitignore`)

---

## Environment Variables Summary

| Where | Variable | Description |
|---|---|---|
| Cloudflare Pages | `SUPABASE_URL` | Supabase project URL |
| Cloudflare Pages | `SUPABASE_ANON_KEY` | Public anon key (safe to expose) |
| Worker Secrets | `SUPABASE_URL` | Supabase project URL |
| Worker Secrets | `SUPABASE_ANON_KEY` | Anon key (for JWT validation) |
| Worker Secrets | `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — never in frontend |

---

## Inject env vars into frontend HTML

Cloudflare Pages doesn't inject env vars into static HTML automatically.
Use a Pages **build plugin** or a simple build script to replace placeholders:

```bash
# _build.sh (run as build command in Pages)
sed -i "s|REPLACE_WITH_YOUR_SUPABASE_URL|$SUPABASE_URL|g" front/js/config.js
sed -i "s|REPLACE_WITH_YOUR_ANON_KEY|$SUPABASE_ANON_KEY|g" front/js/config.js
```

Set build command in Pages to: `bash _build.sh`
