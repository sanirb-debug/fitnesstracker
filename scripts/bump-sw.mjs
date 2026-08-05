/* Bumps the service worker cache version.
   Installed phones serve the cached shell until CACHE changes, so shipping a
   new app.js without this means nobody sees it. Run before every deploy —
   `npm run release` does both. */
import { readFileSync, writeFileSync } from "node:fs";

const SW = new URL("../sw.js", import.meta.url);
const src = readFileSync(SW, "utf8");

const m = src.match(/const CACHE = "the-cut-v(\d+)";/);
if (!m) {
  console.error('bump-sw: could not find `const CACHE = "the-cut-vN";` in sw.js');
  process.exit(1);
}

const next = Number(m[1]) + 1;
writeFileSync(SW, src.replace(m[0], `const CACHE = "the-cut-v${next}";`));
console.log(`sw.js cache: the-cut-v${m[1]} -> the-cut-v${next}`);
