/* Headless boot test.
   Loads the real index.html and the real built app.js in jsdom at the project's
   Pages origin, with window.storage removed so the app is forced down the
   localStorage path — the web build's only persistence.

   The resource loader only serves files under the project base path, so an
   absolute "/app.js" in index.html fails here the same way it 404s on Pages.
   BASE is the real deploy URL; because every asset reference is relative, the
   app works under any subpath — change BASE if the repo is ever renamed.

   Run: npm test   (after npm run build) */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";
import jsdomPkg from "jsdom";

const { JSDOM, ResourceLoader, VirtualConsole } = jsdomPkg;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://sanirb-debug.github.io/fitnesstracker/";

let failures = 0;
const ok = (label, cond, detail = "") => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
};

/* Serves only what really sits under the project path. Anything else — an
   absolute path, a CDN — is a miss, which is the point. */
class PagesLoader extends ResourceLoader {
  constructor() { super(); this.served = []; this.offBase = []; }
  fetch(url) {
    if (!url.startsWith(BASE)) {
      this.offBase.push(url);
      return Promise.reject(new Error(`off-base: ${url}`));
    }
    const rel = decodeURIComponent(url.slice(BASE.length).split("?")[0]);
    const file = normalize(join(ROOT, rel));
    if (!file.startsWith(ROOT)) return Promise.reject(new Error("escapes root"));
    try {
      const buf = readFileSync(file);
      this.served.push(rel);
      return Promise.resolve(buf);
    } catch (e) {
      console.log(`  (404: ${rel})`);
      return Promise.reject(e);
    }
  }
}

function installPolyfills(w) {
  // recharts' ResponsiveContainer needs a size; jsdom has no layout.
  w.ResizeObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) {
      this.cb([{ target: el, contentRect: { width: 390, height: 240, top: 0, left: 0 } }], this);
    }
    unobserve() {} disconnect() {}
  };
  if (!w.matchMedia) {
    w.matchMedia = () => ({ matches: false, media: "", addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
  }
  // The web build must never see an artifact store.
  delete w.storage;
}

async function boot(seed = null, label = "") {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const loader = new PagesLoader();
  const vc = new VirtualConsole();
  const errors = [];
  /* The webfont @import is progressive enhancement — the CSS falls back to
     system-ui, sw.js caches it separately, and the test harness blocks it for
     being off-base. Expected here; anything else is a real error. */
  const expected = (msg) => /fonts\.googleapis\.com/.test(msg);
  const record = (msg) => { if (!expected(msg)) errors.push(msg); };
  vc.on("jsdomError", (e) => record(String(e.message || e)));
  vc.on("error", (...a) => record(a.map(String).join(" ")));

  const dom = new JSDOM(html, {
    url: BASE, runScripts: "dangerously", resources: loader,
    pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) { installPolyfills(w); },
  });
  const w = dom.window;

  if (seed) {
    for (const [k, v] of Object.entries(seed)) w.localStorage.setItem(k, v);
  }

  // Wait for the bundle to mount and replace the #boot placeholder.
  const root = w.document.getElementById("root");
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 100));
    if (!w.document.getElementById("boot") && root.textContent.trim().length > 40) break;
  }
  return { dom, w, root, loader, errors, label };
}

const textOf = (root) => root.textContent.replace(/\s+/g, " ").trim();

console.log(`\nBoot test @ ${BASE}\n`);

/* ---------- pass 1: cold boot, empty storage ---------- */
console.log("Cold boot (empty localStorage)");
const a = await boot();

ok("app.js served over the relative ./ path", a.loader.served.includes("app.js"),
  `served: [${a.loader.served.join(", ")}]`);
ok("#boot placeholder replaced (app mounted)", !a.w.document.getElementById("boot"));

const text1 = textOf(a.root);
ok('rendered text contains "On the board today"', text1.includes("On the board today"));
ok("no NaN in rendered output", !/NaN/.test(text1),
  /NaN/.test(text1) ? text1.match(/.{0,40}NaN.{0,40}/)?.[0] : "");
ok("no undefined in rendered output", !/undefined/.test(text1),
  /undefined/.test(text1) ? text1.match(/.{0,40}undefined.{0,40}/)?.[0] : "");
ok("storage adapter chose localStorage (no window.storage)", a.w.storage === undefined);
ok("no page errors during boot", a.errors.length === 0, a.errors.slice(0, 2).join(" | "));

/* Every asset must resolve under the project path. An absolute "/app.js" would show
   up here as an off-base request and 404 on a real project Pages site. */
const strayAssets = a.loader.offBase.filter((u) => !/fonts\.(googleapis|gstatic)\.com/.test(u));
ok("no absolute-path asset requests escaped the project path", strayAssets.length === 0,
  strayAssets.length ? strayAssets.join(", ") : "only webfonts are off-base, as designed");

/* ---------- quick-log click ---------- */
console.log("\nQuick-log: Greek Yogurt Power Bowl");
const MEAL = "Greek Yogurt Power Bowl";
const btn = [...a.w.document.querySelectorAll("button")]
  .find((b) => b.textContent.includes(MEAL));
ok("quick-log button found", !!btn);

if (btn) {
  btn.dispatchEvent(new a.w.MouseEvent("click", { bubbles: true }));
  // saveState runs behind a 250ms debounce.
  await new Promise((r) => setTimeout(r, 1500));
}

const keys = [...Array(a.w.localStorage.length)].map((_, i) => a.w.localStorage.key(i));
const hcKeys = keys.filter((k) => k.startsWith("hollandcut"));
ok("a key starting with hollandcut was written", hcKeys.length > 0, `keys: [${keys.join(", ")}]`);

const saved = {};
for (const k of hcKeys) saved[k] = a.w.localStorage.getItem(k);
const holder = hcKeys.find((k) => String(saved[k]).includes(MEAL));
ok("meal name present in saved JSON", !!holder,
  holder ? `${holder} = ${String(saved[holder]).slice(0, 120)}…` : "not in any hollandcut key");

const text2 = textOf(a.root);
ok("logged meal visible in the UI after click", text2.includes(MEAL));

/* ---------- pass 2: remount with the same storage ---------- */
console.log("\nRemount with that same localStorage");
const b = await boot(saved, "remount");

ok("#boot placeholder replaced on remount", !b.w.document.getElementById("boot"));
const text3 = textOf(b.root);
ok("logged meal still shown after remount", text3.includes(MEAL));
ok("no NaN after remount", !/NaN/.test(text3),
  /NaN/.test(text3) ? text3.match(/.{0,40}NaN.{0,40}/)?.[0] : "");
ok("no undefined after remount", !/undefined/.test(text3),
  /undefined/.test(text3) ? text3.match(/.{0,40}undefined.{0,40}/)?.[0] : "");
ok("no page errors on remount", b.errors.length === 0, b.errors.slice(0, 2).join(" | "));

a.dom.window.close();
b.dom.window.close();

console.log(failures === 0 ? "\nAll boot assertions passed.\n" : `\n${failures} assertion(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
