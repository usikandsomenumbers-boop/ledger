# Ledger — Neon-backed version

Same app, same look — but entries now live in a real Postgres database
(Neon) instead of Telegram CloudStorage/localStorage, so they survive
cache clears, reinstalls, and new devices.

## Why this can't be GitHub Pages alone
GitHub Pages only serves static files — it can't run server code or hold a
database connection string safely. This project adds a tiny API (in `api/`)
that Vercel runs as serverless functions. You still push everything to
GitHub; Vercel just watches that repo and redeploys automatically, the same
way your Safety KPI dashboard works. The frontend (`public/index.html`) and
the API are deployed together, from the one repo.

## One-time setup

### 1. Create the Neon project
1. In Neon, create a **new project** (you said separate from Safety KPI).
2. Open the SQL editor for that project and run everything in `schema.sql`.
3. Copy the **connection string** (the `postgresql://...` one, "pooled
   connection" is fine) — you'll need it in step 3.

### 2. Push this folder to GitHub
Put `api/`, `public/`, `package.json`, and `schema.sql` in a repo (a new one,
or a new folder in an existing one — your call).

### 3. Import into Vercel
1. vercel.com → **Add New Project** → import the GitHub repo.
2. Vercel auto-detects the `api/` folder as serverless functions and
   `public/` as static output — no build config needed.
3. Under **Environment Variables**, add:
   - `DATABASE_URL` — the Neon connection string from step 1
   - `TELEGRAM_BOT_TOKEN` — your bot's token (from @BotFather)
   - `ALLOWED_USERNAMES` — `yaxyobekpersonal,usikandsomenmbrs` (comma-separated,
     no `@`, no spaces — keep this in sync with the `ALLOWED_USERNAMES` array
     near the top of `public/index.html`)
4. Deploy. You'll get a URL like `https://your-project.vercel.app`.

### 4. Point the bot at the new URL
In @BotFather, update your Mini App / Menu Button URL for `@ledger_89bot` to
the Vercel URL from step 3 (instead of the old GitHub Pages URL).

## Day to day
Just `git push` — Vercel redeploys both the page and the API automatically.
Your data stays in Neon and is untouched by deploys, same as before.

## How auth works now
Every request from the app carries Telegram's signed `initData`. The API
verifies that signature against `TELEGRAM_BOT_TOKEN` (proving it really came
from Telegram for your bot) and checks the username against
`ALLOWED_USERNAMES` server-side — so, unlike before, this can't be bypassed
by just knowing the page URL.

## Testing outside Telegram
Opening `public/index.html` directly in a browser still works for a quick
look, but falls back to that browser's `localStorage` (no signed Telegram
session to authenticate API calls with) — same as before. Real use should
always be through the Mini App inside Telegram.
