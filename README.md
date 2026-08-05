# The Cut — 21 Week Training Log

A private food, training and weight log for an August–December cut. Runs entirely in your browser. No accounts, no server, no data leaving your phone.

---

## Where it lives

Repo `sanirb-debug/fitnesstracker`, served by GitHub Pages from `main` / root:

```
https://sanirb-debug.github.io/fitnesstracker/
```

Pages is configured under **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

> `.nojekyll` matters. Without it GitHub runs Jekyll over the site, which can strip files. It's empty — just don't delete it.

**Put it on your home screen**

Open that URL in **Safari** on your phone → Share button → **Add to Home Screen**. It launches full screen with no browser chrome, and works offline after the first load.

Do this. It's the whole point — an installed PWA gets real, persistent storage, which is what the in-app artifact viewer was failing at.

---

## Where your data lives

In your browser's `localStorage`, on that device, under that exact URL. That means:

- It survives closing the app, restarting your phone, and going offline.
- It is **not** synced between your phone and your laptop. They're separate logs.
- Clearing Safari's website data wipes it. So does "Clear History and Website Data."

**Use the backup.** ⚙ Settings → Backup → **Copy / restore** copies your whole log as text. Paste it into Notes once a week. If you ever need it back — new phone, wiped browser, moving from phone to laptop — paste it into the restore box.

Stats tab also has **Export CSV** if you want the numbers in a spreadsheet.

---

## AI features (optional)

Three things use Claude: reading Garmin screenshots, estimating macros from a description, and the weekly coach review. On your own site there's no proxy, so they need an API key.

**Everything else works without one** — the meal library, all logging, the Cindy timer, charts, weekly budget, free days, swaps.

To turn them on: get a key at [console.anthropic.com](https://console.anthropic.com), then ⚙ Settings → **AI features** → paste it → Save.

The key is stored in your browser only and is sent nowhere except Anthropic. It never touches GitHub. Two cautions worth taking seriously:

- Create a **dedicated key with a spend limit** rather than reusing one you care about.
- Anyone who can unlock your phone and open dev tools could read it. Fine for a personal phone, not fine on a shared computer.

If you'd rather not deal with keys at all, skip it. Manual entry and the 36-meal library cover the day-to-day.

---

## Changing the app

The app source is `src/App.jsx`. `app.js` at the root is built output — don't edit it
by hand, it gets overwritten.

```bash
npm install        # once
npm run release    # bump the SW cache version, then build
npm test           # headless boot test
git add -A && git commit -m "…" && git push
```

`npm run release` bumps `const CACHE` in `sw.js` (`the-cut-v1` → `v2` → …). Without
that bump phones keep serving the old cached build. If a device seems stuck on an old
version anyway, delete it from the home screen and re-add it.

---

## Files

| File | What it is |
|---|---|
| `src/App.jsx` | The entire app — the source of truth |
| `src/entry.jsx` | Mounts `<App/>` into `#root` |
| `app.js` | Built output — React, charts, everything. No CDN, works offline |
| `index.html` | Page shell, install metadata, safe-area handling |
| `sw.js` | Service worker for offline caching. Never caches API calls |
| `manifest.webmanifest` | Makes it installable |
| `.nojekyll` | Stops GitHub from processing the site |
| `icon-*.png` | Home screen icons |
| `scripts/` | SW cache bump, headless boot test |
| `CLAUDE.md` | Notes for future coding sessions — constraints that matter |

---

## Troubleshooting

**Blank page.** Open the URL on a laptop and check the browser console. Usually a missing `app.js` upload or Pages pointing at the wrong branch.

**404.** Pages can take a few minutes on first deploy. Check **Settings → Pages** shows a green "Your site is live at…".

**Red "Nothing is saving" banner.** Storage is blocked — usually Safari Private Browsing. Open it in a normal tab.

**Changes not showing.** Cache. Bump `CACHE` in `sw.js`, or remove and re-add the home screen icon.
