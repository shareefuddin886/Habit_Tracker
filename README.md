# Daily Goals Tracker

A goals/habit tracker built with plain HTML, CSS and JavaScript modules (no build step).
Each user's goals are saved in their own browser (`localStorage`).

The repo holds **two separate Vercel projects** that share one Redis database for usage stats:

| Folder | What it is | Vercel Root Directory |
|---|---|---|
| `web/` | The public app + `/api/track` (records anonymous usage events) | `web` |
| `admin/` | Password-protected dashboard + `/api/stats` | `admin` |

## Project structure

```
web/
  index.html            Page shell
  css/styles.css        All styles
  api/track.js          POST /api/track — anonymous usage events
  api/_lib.js           Redis + date helpers
  js/
    main.js             Entry point: rendering, tabs, click handling
    state.js            Saved data (localStorage) + UI state, theme
    goals.js            Goals, completion %, streaks
    gamification.js     XP, levels, badges, daily quests
    effects.js          Fireworks, confetti, praise toast
    modal.js            Confirm dialog
    track.js            Sends anonymous usage events (off on localhost)
    utils.js            Small helpers (dates, escaping, ids)
    views/              Today, Month, Journal, Stats tabs, mascot, header
admin/
  index.html            Admin dashboard
  css/styles.css        Copy of the app styles
  api/stats.js          GET /api/stats — needs header x-admin-key = ADMIN_PASSWORD
  api/_lib.js           Redis + date helpers (same as web/api/_lib.js — keep in sync)
```

## Run locally

ES modules don't load from `file://`, so serve the folder:

```
npx serve web
```

Tracking is switched off on localhost. The admin page needs its API, so test it on the deployed site
(or with `npx vercel dev` inside `admin/`).

## Deploy to Vercel (two projects)

**1. Website**
1. vercel.com → **Add New → Project** → import this repo.
2. **Root Directory:** `web` · Framework Preset: **Other** → Deploy.
3. Project → **Storage** → create **Upstash Redis** (free) and connect it to this project.
4. Optional: **Settings → Environment Variables** → `STATS_TZ=Asia/Kolkata`. Redeploy.

**2. Admin**
1. **Add New → Project** → import the **same repo** again.
2. **Root Directory:** `admin` · Framework Preset: **Other**.
3. Project → **Storage** → connect the **same** Upstash Redis database from step 1.
4. **Settings → Environment Variables** → `ADMIN_PASSWORD` (long and random), and the same `STATS_TZ` if you set one. Deploy.
5. Open the admin URL and sign in.

## Privacy

Only a random per-browser id and an event name (`open`, `goal_add`, `goal_done`, `perfect_day`) are sent.
Goal text and other personal data never leave the user's browser. "Users" in the dashboard means unique browsers.
