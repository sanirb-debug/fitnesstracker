# Brief: ship The Cut as a GitHub Pages PWA

## What you're inheriting

`The Cut` is a personal training and nutrition log for a 21-week cut (Aug–Dec 2026). It's a single-file React app, already written and tested — **your job is to get it deployed and set up for iteration, not to rewrite it.** Read the source before changing anything.

It has to work in two places from one source file:
- **Inside a Claude artifact**, where persistence goes through `window.storage`
- **On a self-hosted static site**, where persistence goes through `localStorage`

A `Store` adapter near the top of the file picks whichever exists. Don't break that.

## Files in this folder

```
the-cut.jsx      the entire app — the source of truth (~2,800 lines)
site/            a working prebuilt site, use it as the reference output
  index.html     page shell, install metadata, safe-area handling
  app.js         prebuilt bundle (React + recharts + app, no CDN)
  sw.js          service worker
  manifest.webmanifest
  .nojekyll
  icon-192.png  icon-512.png  icon-maskable-512.png  apple-touch-icon.png  favicon.png
  README.md      deploy + troubleshooting notes
```

## Goal

1. Restructure into a maintainable repo: source in `src/`, built output at repo root (Pages will serve from `main` / root).
   - `src/App.jsx` ← `the-cut.jsx`
   - `src/entry.jsx` ← mounts `<App/>` into `#root` via `react-dom/client`
   - Keep `index.html`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, and all icons at root.
2. Add `package.json` with a real build script and pin `react`, `react-dom`, `recharts`, `esbuild` as devDependencies.
3. Verify the build reproduces a working `app.js`.
4. Create the GitHub repo, push, and enable Pages. Use the `gh` CLI if it's installed and authenticated. If it isn't, stop and print exact click-by-click instructions instead of guessing — do not leave me thinking it deployed when it didn't.
5. Confirm the live URL actually serves the app.
6. Write a `CLAUDE.md` so future sessions don't relearn all this.

## Build pipeline

This exact command is known to work and produces a ~705KB bundle:

```bash
npx esbuild src/entry.jsx --bundle --minify --format=iife \
  --loader:.jsx=jsx --jsx=automatic --target=es2019 \
  --define:process.env.NODE_ENV='"production"' \
  --outfile=app.js
```

`--target=es2019` is deliberate — this runs on a phone. Don't raise it.

## Hard constraints

Violating any of these silently breaks the app or destroys my logged data.

**Paths must be relative.** This deploys to `https<!-- -->://USER.github.io/the-cut/`, not a root domain. Every reference in `index.html`, `manifest.webmanifest` and `sw.js` must be `./app.js`, not `/app.js`. Absolute paths 404 on a project Pages site. Same for `start_url` and `scope` in the manifest.

**`localStorage` is correct here — do not remove it.** Claude artifacts ban `localStorage`, and you may have that rule cached. It does not apply to a self-hosted site. On the web build `localStorage` is the *only* thing making persistence work.

**Never rename the storage keys.** `hollandcut:v1`, `hollandcut:photos:v1`, `hollandcut:aikey`, `hollandcut:probe`. I have real logged data under these. Renaming them silently orphans it.

**Keep `.nojekyll`.** Without it GitHub runs Jekyll and can drop files. It's empty; make sure it survives every commit.

**Don't use `structuredClone` unguarded.** There's a `clone()` helper that falls back to a JSON round-trip. Unguarded `structuredClone` crashed on older Safari — every log tap threw. Use `clone()`.

**Don't cache API calls in the service worker.** `sw.js` explicitly skips `anthropic.com`. Keep that.

**Bump the SW cache version on every deploy.** `const CACHE = "the-cut-v1"` → `v2`, etc. Otherwise installed phones keep serving the stale build. Wire this into the build script if you can.

**No secrets in the repo.** The app takes an optional Anthropic API key at runtime, entered in Settings and held in `localStorage`. It must never be hardcoded, committed, or written to a config file. Add a `.gitignore` covering `node_modules/`, `.env*`, `.DS_Store`.

**Preserve the iPhone safe-area CSS.** The `.hcnav` / `.hcpad` / `env(safe-area-inset-*)` rules stop the bottom nav from sitting under the home bar in standalone mode.

## Verification gates

Don't tell me it's done until all of these pass, and show me the actual output:

1. `npx esbuild ...` exits clean, `app.js` exists and is >500KB.
2. Serve locally (`python3 -m http.server 8080`) and `curl -sI` → `200` for `/index.html`, `/app.js`, `/manifest.webmanifest`, `/sw.js`, `/icon-192.png`.
3. Headless boot test — install `jsdom`, load the real `index.html` + built `app.js` at a fake origin like `https://x.github.io/the-cut/`, with `window.storage` deleted so it's forced down the `localStorage` path, then assert:
   - the `#boot` placeholder gets replaced (the app actually mounted)
   - rendered text contains `On the board today`
   - no `NaN` or `undefined` in the rendered output
   - clicking the `Greek Yogurt Power Bowl` quick-log button writes a key starting with `hollandcut` to `localStorage`, and the meal name appears in the saved JSON
   - re-mounting with that same `localStorage` still shows the logged meal
4. After deploy: `curl -sI` the live URL → `200`, and `curl -s` the live `app.js` → non-empty. Pages can take a couple of minutes on first publish; poll, don't assume.
5. Report the live URL back to me.

Fix failures rather than lowering the assertions. If something genuinely can't work, say so plainly.

## CLAUDE.md

Capture: the build command, the two-target `Store` adapter and why it exists, the relative-paths rule, the storage key names, the SW cache-bump step, the `clone()` note, and the verification gates above. Short and factual.

## Notes

- `recharts` is the only heavy dependency. If bundle size becomes a problem later, that's the thing to replace with hand-rolled SVG — but don't do it now, and don't do it without asking.
- The app is deliberately offline-first and serverless. Don't add a backend, an account system, or analytics.
- Copy in the reference `README.md` from `site/` and update it if the structure changes.
