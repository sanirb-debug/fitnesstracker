import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, ReferenceLine, Area, AreaChart, CartesianGrid
} from "recharts";

/* ============================================================
   THE BLUEPRINT — 21 weeks, Aug 3 2026 → Dec 27 2026
   Weeks 1-16 are the uploaded plan. 17-21 are the Final Cut
   extension that carries 172 → 165 without wrecking the base.
   ============================================================ */

const PLAN = [
  { w:1,  start:"2026-08-03", block:"Foundation",   title:"Baseline Establishment", mon:2.5, fri:3,   sat:4,    weight:194, pr:false, note:"Lock in 2,300 kcal & 160g protein. Cindy at 80% — smooth transitions, ~10–14 rounds." },
  { w:2,  start:"2026-08-10", block:"Foundation",   title:"Technique & Rhythm",     mon:3,   fri:3,   sat:4.5,  weight:192, pr:false, note:"Full arm lockout at the bottom of pull-ups. Chest to deck on push-ups." },
  { w:3,  start:"2026-08-17", block:"Foundation",   title:"Aerobic Building",       mon:3,   fri:3.5, sat:5,    weight:190, pr:false, note:"Pre-workout carbs 45 min before court sports — banana or rice cake." },
  { w:4,  start:"2026-08-24", block:"Foundation",   title:"Baseline Benchmark",     mon:3,   fri:3.5, sat:5.5,  weight:188, pr:true,  note:"MAX EFFORT Cindy. This score is the number everything else gets measured against." },
  { w:5,  start:"2026-08-31", block:"Volume",       title:"Pacing Reset",           mon:3.5, fri:4,   sat:6,    weight:186.5, pr:false, note:"Back to controlled 80% — one round every 75–90 seconds." },
  { w:6,  start:"2026-09-07", block:"Volume",       title:"Upper Hypertrophy",      mon:3.5, fri:4,   sat:6.5,  weight:185, pr:false, note:"3-second lowering phase on push-ups. Chest density." },
  { w:7,  start:"2026-09-14", block:"Volume",       title:"Endurance Progression",  mon:4,   fri:4,   sat:7,    weight:183.5, pr:false, note:"15 min foam rolling Thursday — IT bands and calves. Non-negotiable." },
  { w:8,  start:"2026-09-21", block:"Volume",       title:"Mid-Point Benchmark",    mon:4,   fri:4,   sat:7.5,  weight:182, pr:true,  note:"Maximal Cindy. Target +1 to +3 rounds over Week 4." },
  { w:9,  start:"2026-09-28", block:"Crucible",     title:"Double-Digit Base",      mon:4,   fri:4.5, sat:8,    weight:180.5, pr:false, note:"8 hours of sleep. CNS recovery is the limiter now, not willpower." },
  { w:10, start:"2026-10-05", block:"Crucible",     title:"V-Taper Accentuation",   mon:4,   fri:4.5, sat:8.5,  weight:179, pr:false, note:"Explosive chest-to-bar pull-ups. Controlled hanging leg raises." },
  { w:11, start:"2026-10-12", block:"Crucible",     title:"Peak Aerobic Push",      mon:4,   fri:5,   sat:9,    weight:177.5, pr:false, note:"Protein stays 160g+ minimum. Peak mileage is when muscle walks out the door." },
  { w:12, start:"2026-10-19", block:"Crucible",     title:"Peak Mileage Milestone", mon:4,   fri:5,   sat:10,   weight:176, pr:true,  note:"THE 10-MILER. Then test Cindy — you're ~19 lbs lighter, pull-ups will feel free." },
  { w:13, start:"2026-10-26", block:"Milestone",    title:"Deload & Rebuild",       mon:3,   fri:3,   sat:5,    weight:175, pr:false, note:"Cindy at 70%, effortless flow. Tendons rebuild in the easy weeks, not the hard ones." },
  { w:14, start:"2026-11-02", block:"Milestone",    title:"Consolidation",          mon:4,   fri:4,   sat:8,    weight:173.5, pr:false, note:"Physique check — core definition and shoulder caps. Take a photo." },
  { w:15, start:"2026-11-09", block:"Milestone",    title:"Final Build",            mon:4,   fri:5,   sat:9,    weight:172, pr:false, note:"Prep for the capstone. Sleep, hydrate, don't add anything new." },
  { w:16, start:"2026-11-16", block:"Milestone",    title:"Transformation Capstone", mon:4,  fri:5,   sat:10,   weight:171, pr:true,  note:"Scale target 170–175. All-time best Cindy. This is the original finish line." },
  { w:17, start:"2026-11-23", block:"Final Cut",    title:"Holiday Hold",           mon:4,   fri:5,   sat:9,    weight:170, pr:false, note:"Thanksgiving week. Eat the meal. Hold the average. One day never moved anybody." },
  { w:18, start:"2026-11-30", block:"Final Cut",    title:"Base Extension",         mon:4,   fri:5,   sat:11,   weight:169, pr:false, note:"First 11-miler. Marathon base officially begins here." },
  { w:19, start:"2026-12-07", block:"Final Cut",    title:"Long Run PR",            mon:4,   fri:5,   sat:12,   weight:167.5, pr:false, note:"12 miles. Half-marathon distance is now inside your normal week." },
  { w:20, start:"2026-12-14", block:"Final Cut",    title:"Deload",                 mon:3,   fri:4,   sat:8,    weight:166, pr:false, note:"Pull volume back. Finals + travel week. Protect the deficit, not the mileage." },
  { w:21, start:"2026-12-21", block:"Final Cut",    title:"Year-End Capstone",      mon:4,   fri:5,   sat:12,   weight:165, pr:true,  note:"Final Cindy, final long run, final weigh-in. Then you're a marathon athlete building toward Spring." },
];

const DAY_TEMPLATE = {
  1: { name:"Upper Push + Easy Run",  tag:"strength", detail:"4 sets — Dips 8-12 · Decline push-ups 10-15 · Hanging leg raises. Then Zone 2 easy run." },
  2: { name:"Court Sports",           tag:"court",    detail:"Basketball or futsal, high-intensity match play. Carb up 45 min before." },
  3: { name:"CINDY — 20 min AMRAP",   tag:"benchmark",detail:"5 pull-ups · 10 push-ups · 15 air squats. Placed Wednesday for 48h leg recovery before Saturday." },
  4: { name:"Active Recovery",        tag:"recovery", detail:"Zero impact. Mobility, foam roll quads and calves, 10,000 campus steps. No running, no jumping." },
  5: { name:"Upper Pull + Easy Run",  tag:"strength", detail:"4 sets — Pull-ups max · Chin-ups max · L-sit holds. Then Zone 2 easy run." },
  6: { name:"Long Run",               tag:"run",      detail:"The week's anchor. Strictly conversational pace — if you can't talk, you're going too fast." },
  0: { name:"Rest / Light Court",     tag:"rest",     detail:"Light hoops or full rest + 10k steps. Meal prep window for the week ahead." },
};

/* Macro library — every meal from the blueprint, pre-costed */
const MEALS = [
  // breakfast
  { n:"Overnight Protein Oats", c:420, p:35, cb:48, f:11, m:"breakfast" },
  { n:"Turkey Sausage Wrap", c:400, p:34, cb:34, f:13, m:"breakfast" },
  { n:"Cottage Cheese + Pineapple", c:260, p:28, cb:24, f:5, m:"breakfast" },
  { n:"Protein Pancakes (Kodiak)", c:450, p:33, cb:50, f:12, m:"breakfast" },
  { n:"Smoked Salmon Toast", c:380, p:27, cb:36, f:13, m:"breakfast" },
  { n:"Shakshuka with Naan", c:480, p:26, cb:45, f:22, m:"breakfast" },
  { n:"Tofu Scramble", c:330, p:26, cb:16, f:19, m:"breakfast" },
  { n:"Greek Yogurt Power Bowl", c:400, p:35, cb:42, f:8, m:"breakfast" },
  // lunch
  { n:"Chicken & Black Bean Wrap", c:600, p:45, cb:60, f:18, m:"lunch" },
  { n:"Cold Soba Noodle Salad", c:550, p:42, cb:62, f:13, m:"lunch" },
  { n:"Turkey & Provolone Pinwheels", c:480, p:38, cb:38, f:18, m:"lunch" },
  { n:"Greek Yogurt Tuna Salad", c:430, p:42, cb:34, f:11, m:"lunch" },
  { n:"Mediterranean Quinoa Bowl", c:590, p:45, cb:58, f:17, m:"lunch" },
  { n:"Buffalo Chicken Pasta Salad", c:560, p:48, cb:52, f:15, m:"lunch" },
  { n:"Black Bean & Corn Salad + Shrimp", c:470, p:38, cb:52, f:10, m:"lunch" },
  { n:"Adult Lunchable", c:450, p:34, cb:28, f:22, m:"lunch" },
  // dinner
  { n:"Chicken Tikka Masala (macro)", c:700, p:50, cb:62, f:24, m:"dinner" },
  { n:"Lean Beef Smashburger", c:700, p:50, cb:52, f:28, m:"dinner" },
  { n:"Sheet Pan Teriyaki Salmon", c:650, p:45, cb:55, f:24, m:"dinner" },
  { n:"Healthy Chicken Parm", c:620, p:55, cb:45, f:20, m:"dinner" },
  { n:"Ground Turkey Tacos", c:580, p:48, cb:48, f:20, m:"dinner" },
  { n:"Steak Fajita Bowl", c:700, p:46, cb:68, f:22, m:"dinner" },
  { n:"Korean Beef Bowl", c:680, p:46, cb:62, f:24, m:"dinner" },
  { n:"Shrimp Po'Boy Bowl", c:520, p:40, cb:48, f:16, m:"dinner" },
  { n:"Lentil & Spinach Curry", c:600, p:26, cb:78, f:18, m:"dinner" },
  { n:"Chicken Meatballs + Zoodles", c:480, p:50, cb:22, f:20, m:"dinner" },
  { n:"BBQ Chicken Cauliflower Pizza", c:560, p:42, cb:46, f:22, m:"dinner" },
  // snacks
  { n:"Banana + Rice Cake + PB", c:200, p:5, cb:38, f:5, m:"snack" },
  { n:"Whey Isolate Shake", c:130, p:27, cb:3, f:1, m:"snack" },
  { n:"Cottage Cheese Bowl (night)", c:200, p:30, cb:10, f:4, m:"snack" },
  { n:"Apple with PB2", c:160, p:6, cb:30, f:2, m:"snack" },
  { n:"Steamed Edamame", c:190, p:17, cb:15, f:8, m:"snack" },
  { n:"Loaded Rice Cakes", c:180, p:4, cb:22, f:9, m:"snack" },
  { n:"Recovery Smoothie", c:250, p:28, cb:26, f:4, m:"snack" },
  { n:"Roasted Chickpeas", c:180, p:9, cb:26, f:5, m:"snack" },
  { n:"Beef Jerky (1 oz)", c:90, p:15, cb:5, f:1, m:"snack" },
];

/* Night out — for when you're not the one cooking. Honest numbers, not
   comfortable ones: these lean high on oil and sauce the way real food does. */
const PARTY = [
  { n:"Beer (12 oz)", c:150, p:2, cb:13, f:0 },
  { n:"Light beer (12 oz)", c:100, p:1, cb:6, f:0 },
  { n:"Hard seltzer", c:100, p:0, cb:2, f:0 },
  { n:"Shot of liquor", c:100, p:0, cb:0, f:0 },
  { n:"Mixed drink w/ soda or juice", c:220, p:0, cb:26, f:0 },
  { n:"Red or white wine (5 oz)", c:125, p:0, cb:4, f:0 },
  { n:"Pizza slice", c:285, p:12, cb:36, f:10 },
  { n:"Wings (6, sauced)", c:430, p:36, cb:6, f:29 },
  { n:"Chips & queso", c:400, p:9, cb:38, f:24 },
  { n:"Loaded nachos (shared plate)", c:550, p:18, cb:48, f:32 },
  { n:"Burger off the grill", c:450, p:26, cb:33, f:24 },
  { n:"Fries (medium)", c:365, p:4, cb:48, f:17 },
  { n:"Mozzarella sticks (4)", c:340, p:14, cb:28, f:19 },
  { n:"Fried chicken (2 pieces)", c:520, p:38, cb:20, f:32 },
  { n:"Halal cart platter", c:900, p:50, cb:80, f:38 },
  { n:"Chipotle burrito", c:1050, p:52, cb:110, f:40 },
  { n:"Slice of cake", c:350, p:4, cb:50, f:15 },
  { n:"Two cookies", c:250, p:3, cb:34, f:12 },
  { n:"Ice cream (2 scoops)", c:320, p:6, cb:38, f:16 },
  { n:"Late-night 2am plate", c:800, p:30, cb:80, f:38 },
];

/* Any session. MET values so calories get estimated off your real bodyweight. */
const ACTIVITIES = [
  { n:"Basketball", met:8.0, group:"court" },
  { n:"Futsal", met:9.0, group:"court" },
  { n:"Soccer", met:7.5, group:"court" },
  { n:"Flag football", met:8.0, group:"court" },
  { n:"Volleyball", met:4.5, group:"court" },
  { n:"Tennis", met:7.3, group:"court" },
  { n:"Pickleball", met:5.5, group:"court" },
  { n:"Weights", met:6.0, group:"gym" },
  { n:"Calisthenics", met:8.0, group:"gym" },
  { n:"Jump rope", met:11.0, group:"gym" },
  { n:"Rowing", met:7.0, group:"gym" },
  { n:"Stairmaster", met:9.0, group:"gym" },
  { n:"Cycling", met:8.0, group:"gym" },
  { n:"Elliptical", met:5.0, group:"gym" },
  { n:"Swimming", met:7.0, group:"outdoor" },
  { n:"Climbing", met:8.0, group:"outdoor" },
  { n:"Hiking", met:6.0, group:"outdoor" },
  { n:"Brisk walk", met:4.3, group:"outdoor" },
  { n:"Yoga / mobility", met:3.0, group:"recovery" },
  { n:"Stretch & foam roll", met:2.3, group:"recovery" },
];
const ACT_GROUPS = { court:"Court & field", gym:"Gym", outdoor:"Outdoor", recovery:"Recovery" };

const metCalories = (met, minutes, lbs, intensity=1) =>
  Math.round(met * intensity * (lbs * 0.4536) * (minutes / 60));

/* Calories for a run or walk, on the same MET basis the session logger uses so
   the two agree. With a time we can get speed and pick the MET off it — MET
   rises roughly linearly with pace over the range a person actually moves at.
   With distance but no time, fall back to cost-per-mile, which barely varies
   with speed for running (~0.75 kcal per lb per mile, gross). */
const paceMET = (mph, walking) => walking
  ? clamp(1.3 * mph, 2.3, 8)
  : clamp(1.65 * mph, 6, 20);

function activityCalories({ miles, minutes, lbs, walking }) {
  const mi = +miles || 0, min = +minutes || 0;
  if (mi > 0 && min > 0) return metCalories(paceMET(mi / (min / 60), walking), min, lbs);
  if (mi > 0) return Math.round(mi * lbs * (walking ? 0.42 : 0.75));
  if (min > 0) return metCalories(walking ? 3.8 : 9.8, min, lbs);
  return 0;
}

const MEAL_SLOTS = ["breakfast", "lunch", "snack", "dinner"];
const SLOT_LABEL = { breakfast:"Breakfast", lunch:"Lunch", snack:"Snacks & Fuel", dinner:"Dinner" };

/* ============================================================
   UTILITIES
   ============================================================ */

const iso = (d) => {
  const z = new Date(d);
  return `${z.getFullYear()}-${String(z.getMonth()+1).padStart(2,"0")}-${String(z.getDate()).padStart(2,"0")}`;
};
const parseISO = (s) => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate()+n); return iso(d); };
const daysBetween = (a,b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDay = (s) => parseISO(s).toLocaleDateString("en-US",{weekday:"long", month:"long", day:"numeric"});
const fmtShort = (s) => parseISO(s).toLocaleDateString("en-US",{month:"short", day:"numeric"});
const dow = (s) => parseISO(s).getDay();

const weekFor = (dateStr) => {
  for (let i = PLAN.length - 1; i >= 0; i--) {
    if (daysBetween(PLAN[i].start, dateStr) >= 0) return PLAN[i];
  }
  return PLAN[0];
};
const weekStartOf = (dateStr) => {
  const d = dow(dateStr);
  return addDays(dateStr, d === 0 ? -6 : 1 - d); // Monday-anchored
};

const round = (n, p=0) => { const m = Math.pow(10,p); return Math.round(n*m)/m; };

/* State is plain JSON, so the JSON round-trip is a correct deep clone.
   structuredClone is faster but missing on older Safari, and this runs on
   every single log action — not worth the crash. */
const clone = (o) => {
  try { if (typeof structuredClone === "function") return structuredClone(o); } catch (e) {}
  return JSON.parse(JSON.stringify(o));
};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const uid = () => Math.random().toString(36).slice(2,10);

/* Mifflin-St Jeor + activity factor. Overridden by Garmin whenever it exists. */
function estimateBurn(profile, weight) {
  const kg = weight * 0.4536;
  const cm = ((profile.heightFt * 12) + profile.heightIn) * 2.54;
  const bmr = 10*kg + 6.25*cm - 5*profile.age + 5;
  return Math.round(bmr * profile.activity);
}

/* What a day actually cost. One definition, used by both the day view and the
   cumulative deficit ledger — they drifted the moment new burnKinds landed and
   the ledger kept reading an "extra" day as a whole-day total. */
const num = (v) => (typeof v === "number" && v > 0) ? v : null;
/* Resting burn when the day doesn't state one: formulaBurn carries a 1.55
   activity factor, so *0.62 backs it out to roughly BMR. */
const restingOf = (day, formulaBurn) => num(day.restBurn) ?? Math.round(formulaBurn * 0.62);

function dayBurn(day, formulaBurn) {
  const trainingCal = (day.workouts || []).reduce((a,w) => a + (w.calories || 0), 0);
  if (day.burnKind === "training") {
    return Math.round(formulaBurn * 0.774 + (num(day.burn) ?? trainingCal));
  }
  if (day.burnKind === "active") {
    // active + resting. Either alone is enough to count as set.
    if (num(day.burn) == null && num(day.restBurn) == null) return formulaBurn;
    return restingOf(day, formulaBurn) + (num(day.burn) ?? 0);
  }
  if (num(day.burn) != null) {
    return day.burnKind === "extra" ? Math.round(formulaBurn + day.burn) : day.burn;
  }
  return formulaBurn;
}

/* Pace helpers */
const paceOf = (miles, minutes) => (!miles || !minutes) ? null : minutes/miles;
const fmtPace = (p) => p == null ? "—" : `${Math.floor(p)}:${String(Math.round((p%1)*60)).padStart(2,"0")}`;

/* ============================================================
   STORAGE — one rolling key so we never hammer the rate limit
   ============================================================ */

const KEY = "hollandcut:v1";
const PHOTO_KEY = "hollandcut:photos:v1";

const BLANK_DAY = () => ({ food: [], workouts: [], weight: null, steps: null, burn: null,
  burnKind: "total", water: 0, note: "", garmin: null, free: false, freeNote: "", swap: null });

const DEFAULT_STATE = {
  profile: {
    startWeight: 196, goalNov: 170, goalYear: 163,
    age: 21, heightFt: 5, heightIn: 10, activity: 1.55,
    deficit: 750, proteinTarget: 165, stepTarget: 10000, waterTarget: 128,
    startDate: "2026-08-03",
  },
  days: {},
  customFoods: [],
  benchmarks: [],   // { id, date, rounds, reps, notes }
  badges: [],
};

const PROBE_KEY = "hollandcut:probe";

/* ---------- storage adapter ----------
   Same app runs in two places. Inside a Claude artifact there's window.storage;
   on a real website there's localStorage. Pick whichever exists and expose one
   interface, so nothing downstream has to care which. */

const ARTIFACT_STORE = typeof window !== "undefined" && window.storage
  && typeof window.storage.set === "function";

const LOCAL_STORE = (() => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    window.localStorage.setItem(PROBE_KEY, "1");
    window.localStorage.removeItem(PROBE_KEY);
    return true;
  } catch (e) { return false; }  // Safari private mode throws on write
})();

const Store = {
  kind: ARTIFACT_STORE ? "artifact" : LOCAL_STORE ? "local" : "none",
  async get(key) {
    if (ARTIFACT_STORE) { const r = await window.storage.get(key, false); return r ? r.value : null; }
    if (LOCAL_STORE) return window.localStorage.getItem(key);
    throw new Error("no storage");
  },
  async set(key, value) {
    if (ARTIFACT_STORE) { await window.storage.set(key, value, false); return; }
    if (LOCAL_STORE) { window.localStorage.setItem(key, value); return; }
    throw new Error("no storage");
  },
};

const hasStorage = () => Store.kind !== "none";

/* Write a value and read it straight back. If this fails, persistence is
   unavailable and the user needs to know immediately — not after losing a
   week of logs. */
async function probeStorage() {
  if (!hasStorage()) return false;
  try {
    const stamp = String(Date.now());
    await Store.set(PROBE_KEY, stamp);
    return (await Store.get(PROBE_KEY)) === stamp;
  } catch (e) { return false; }
}

async function loadState() {
  if (!hasStorage()) return DEFAULT_STATE;
  try {
    const raw = await Store.get(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed, profile: { ...DEFAULT_STATE.profile, ...(parsed.profile||{}) } };
    }
  } catch (e) { /* nothing saved yet — first run */ }
  return DEFAULT_STATE;
}

async function saveState(s) {
  if (!hasStorage()) return false;
  const payload = JSON.stringify(s);
  for (let attempt = 0; attempt < 3; attempt++) {
    try { await Store.set(KEY, payload); return true; }
    catch (e) {
      if (attempt === 2) { console.error("save failed after 3 tries", e); return false; }
      await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  return false;
}

/* ============================================================
   DESIGN SYSTEM — "field house": chalk paper, slate ink,
   bib orange for effort, lane blue for aerobic, moss for hit.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.hc {
  --field:#E8EAE3; --card:#FCFCFA; --ink:#16202B; --ink2:#5C6A76; --ink3:#94A0AA;
  --bib:#FF4D19; --lane:#1E6FD9; --moss:#4C8C4A; --warn:#C6413A; --rule:rgba(22,32,43,.13);
  --shadow:0 1px 0 rgba(22,32,43,.05), 0 4px 14px -8px rgba(22,32,43,.28);
  font-family:'Archivo',system-ui,sans-serif; color:var(--ink); background:var(--field);
  min-height:100vh; -webkit-font-smoothing:antialiased;
}
.hc *, .hc *::before, .hc *::after { box-sizing:border-box; }
.hc { padding-top:env(safe-area-inset-top); }
.hcnav { padding-bottom:env(safe-area-inset-bottom); }
.hcpad { padding-bottom:calc(78px + env(safe-area-inset-bottom)); }
.hc button { font-family:inherit; cursor:pointer; border:none; background:none; color:inherit; }
.hc input, .hc textarea, .hc select { font-family:inherit; color:inherit; }
.hc input:focus-visible, .hc button:focus-visible, .hc textarea:focus-visible, .hc select:focus-visible {
  outline:2px solid var(--bib); outline-offset:2px;
}
.dsp { font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:.01em; line-height:.92; }
.mono { font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums; }
.eyebrow { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink3); font-weight:500; }
.card { background:var(--card); border:1px solid var(--rule); border-radius:6px; box-shadow:var(--shadow); }
.hc input[type=text], .hc input[type=number], .hc textarea, .hc select {
  background:var(--card); border:1px solid var(--rule); border-radius:4px; padding:9px 10px;
  font-size:14px; width:100%; transition:border-color .15s;
}
.hc input:focus, .hc textarea:focus { border-color:var(--ink2); }
.hc input::placeholder, .hc textarea::placeholder { color:var(--ink3); }
.tapfade { transition:opacity .12s, transform .12s; }
.tapfade:active { opacity:.6; transform:scale(.97); }
.hc ::-webkit-scrollbar { height:6px; width:6px; }
.hc ::-webkit-scrollbar-thumb { background:var(--rule); border-radius:3px; }
.noscroll::-webkit-scrollbar { display:none; }
@keyframes hcrise { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:none;} }
.rise { animation:hcrise .32s cubic-bezier(.2,.7,.3,1) both; }
@keyframes hcpulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }
.pulse { animation:hcpulse 1.1s ease-in-out infinite; }
@media (prefers-reduced-motion:reduce) { .rise,.pulse { animation:none !important; } .tapfade { transition:none; } }
`;

/* ---------- primitives ---------- */

const Card = ({ children, style, className="", ...p }) => (
  <div className={`card ${className}`} style={{ padding:16, ...style }} {...p}>{children}</div>
);

const Eyebrow = ({ children, color }) => (
  <div className="eyebrow" style={color?{color}:undefined}>{children}</div>
);

const Stat = ({ label, value, unit, color, sub, size=34 }) => (
  <div>
    <Eyebrow>{label}</Eyebrow>
    <div style={{ display:"flex", alignItems:"baseline", gap:4, marginTop:3 }}>
      <span className="dsp" style={{ fontSize:size, color:color||"var(--ink)" }}>{value}</span>
      {unit && <span className="mono" style={{ fontSize:11, color:"var(--ink3)" }}>{unit}</span>}
    </div>
    {sub && <div className="mono" style={{ fontSize:11, color:"var(--ink3)", marginTop:2 }}>{sub}</div>}
  </div>
);

const Btn = ({ children, onClick, kind="ghost", size="md", disabled, style, full }) => {
  const base = { borderRadius:4, fontWeight:600, transition:"all .15s", display:"inline-flex",
    alignItems:"center", justifyContent:"center", gap:6, width: full?"100%":undefined,
    opacity: disabled?.45:1, pointerEvents: disabled?"none":"auto" };
  const sizes = { sm:{ padding:"6px 10px", fontSize:12 }, md:{ padding:"10px 14px", fontSize:13.5 }, lg:{ padding:"13px 18px", fontSize:15 } };
  const kinds = {
    solid: { background:"var(--ink)", color:"#FCFCFA" },
    bib:   { background:"var(--bib)", color:"#fff" },
    lane:  { background:"var(--lane)", color:"#fff" },
    ghost: { background:"transparent", color:"var(--ink)", border:"1px solid var(--rule)" },
    quiet: { background:"rgba(22,32,43,.05)", color:"var(--ink2)" },
  };
  return <button className="tapfade" onClick={onClick} disabled={disabled}
    style={{ ...base, ...sizes[size], ...kinds[kind], ...style }}>{children}</button>;
};

const Meter = ({ pct, color, height=6, bg="rgba(22,32,43,.09)" }) => (
  <div style={{ height, background:bg, borderRadius:height/2, overflow:"hidden" }}>
    <div style={{ width:`${clamp(pct,0,100)}%`, height:"100%", background:color,
      borderRadius:height/2, transition:"width .5s cubic-bezier(.2,.7,.3,1)" }} />
  </div>
);

/* ---------- THE SIGNATURE: lane rings ----------
   Three concentric arcs read like the lanes of an outdoor track.
   Outer lane = calories, middle = protein, inner = movement.
   The dashed lane-line between arcs is the giveaway.        */

const LaneRings = ({ cal, calTarget, pro, proTarget, steps, stepTarget, size=192 }) => {
  const cx = size/2, cy = size/2;
  const lanes = [
    { r: size*0.42, val: cal,   target: calTarget,  color:"var(--bib)",  w: 11 },
    { r: size*0.31, val: pro,   target: proTarget,  color:"var(--moss)", w: 11 },
    { r: size*0.20, val: steps, target: stepTarget, color:"var(--lane)", w: 11 },
  ];
  const arc = (r, frac) => {
    const f = Math.min(clamp(frac, 0, 1), 0.9999);
    const a = -Math.PI/2 + f * 2 * Math.PI;
    const large = f > 0.5 ? 1 : 0;
    return `M ${cx} ${cy-r} A ${r} ${r} 0 ${large} 1 ${cx + r*Math.cos(a)} ${cy + r*Math.sin(a)}`;
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={`${Math.round(cal)} of ${calTarget} calories, ${Math.round(pro)} of ${proTarget}g protein, ${steps||0} of ${stepTarget} steps`}>
      {lanes.map((l,i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={l.r} fill="none" stroke="rgba(22,32,43,.08)" strokeWidth={l.w} />
          <path d={arc(l.r, (l.val||0)/l.target)} fill="none" stroke={l.color}
            strokeWidth={l.w} strokeLinecap="butt"
            style={{ transition:"d .6s cubic-bezier(.2,.7,.3,1)" }} />
        </g>
      ))}
      {/* lane lines — the dashed separators of a real track */}
      {[size*0.365, size*0.255].map((r,i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(22,32,43,.22)"
          strokeWidth={1} strokeDasharray="2 5" />
      ))}
    </svg>
  );
};

/* ============================================================
   AI LAYER — screenshot reading, food estimation, weekly coach
   ============================================================ */

/* Inside a Claude artifact the API call is proxied for us. On a self-hosted
   site there's no proxy, so it uses a key the user pastes into Settings —
   held in this browser only, never sent anywhere but Anthropic. */
const AI_KEY = "hollandcut:aikey";
let apiKey = null;

async function loadApiKey() {
  try { apiKey = (await Store.get(AI_KEY)) || null; } catch (e) { apiKey = null; }
  return apiKey;
}
async function saveApiKey(k) {
  apiKey = (k && k.trim()) || null;
  try { await Store.set(AI_KEY, apiKey || ""); } catch (e) {}
}
const aiConfigured = () => Store.kind === "artifact" || !!apiKey;

async function askClaude(messages, maxTokens = 1100) {
  if (!aiConfigured()) throw new Error("NOKEY");
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers,
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, messages }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("BADKEY");
  if (res.status === 429) throw new Error("RATE");
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
}

/* One place to turn an API failure into something worth reading. */
function aiError(e, fallback) {
  const m = String(e && e.message);
  if (m === "NOKEY") return "AI features need an Anthropic API key — add one in ⚙ Settings. Everything else works without it.";
  if (m === "BADKEY") return "That API key was rejected. Check it in ⚙ Settings.";
  if (m === "RATE") return "Rate limited by the API. Wait a few seconds and try again.";
  return fallback;
}

function extractJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no json");
  return JSON.parse(clean.slice(s, e + 1));
}

async function readGarminShot(base64, mediaType) {
  const prompt = `This is a screenshot from a Garmin watch or the Garmin Connect app. Pull out the numbers.

Return ONLY this JSON, no other text:
{
  "totalCalories": number or null,
  "activeCalories": number or null,
  "steps": number or null,
  "distanceMiles": number or null,
  "durationMinutes": number or null,
  "avgHeartRate": number or null,
  "activityName": string or null,
  "avgPace": string or null,
  "isSingleActivity": boolean,
  "confidence": "high" | "medium" | "low",
  "readAs": "one short sentence describing what this screen shows"
}

Rules:
- "isSingleActivity" is true for one workout (a run, a basketball session). False for a whole-day summary screen.
- Garmin day summaries usually show TOTAL calories (resting + active). Single activities usually show ACTIVE only. Fill whichever you can actually see; use null for the other.
- If distance is in km, convert to miles.
- Never guess a number that isn't visible. null is the correct answer for anything you can't read.`;

  const txt = await askClaude([{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
      { type: "text", text: prompt },
    ],
  }], 700);
  return extractJSON(txt);
}

async function estimateFood(description) {
  const txt = await askClaude([{
    role: "user",
    content: `Estimate macros for this food. Be realistic about restaurant and homemade portions — people under-report, so lean slightly high on oils and sauces rather than low.

Food: "${description}"

Return ONLY this JSON:
{"name":"short clean name under 40 chars","calories":number,"protein":number,"carbs":number,"fat":number,"slot":"breakfast"|"lunch"|"dinner"|"snack","note":"one short sentence on the biggest assumption you made"}`,
  }], 400);
  return extractJSON(txt);
}

async function coachReview(payload) {
  return await askClaude([{
    role: "user",
    content: `You are a strength-and-endurance coach reviewing one week of a client's training log. He is a 21-year-old college student cutting from 196 lbs toward 165 while building marathon base, doing calisthenics, basketball and futsal. He follows a 21-week plan.

Here is the week's data as JSON:
${JSON.stringify(payload)}

Write a short review, max 200 words, plain text, no markdown headers or bullets — just 3 tight paragraphs:
1. What actually went well, citing his real numbers.
2. The single biggest thing to fix, with a specific action for next week.
3. One line of perspective on where he is against the plan.

Be direct and specific. Use his numbers. Don't be a cheerleader and don't pile on. If protein or mileage was short, say so plainly. If the data is thin because he barely logged, say that instead of inventing praise.

Important: days marked freeDay:true are planned free days — parties, meals out, food he didn't control. Judge the week on its total against weeklyCalorieBudget, never on individual free days, and never tell him to compensate with extra cardio or extra restriction. If a swappedSession appears, he traded the scheduled workout for something else on purpose; that counts as training, not a missed session.`,
  }], 700);
}

/* Downscale a photo before storing it — keeps progress pics under ~60KB */
function compressImage(file, maxDim = 520, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("bad image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

/* ============================================================
   DERIVED MATH — one place, so every screen agrees
   ============================================================ */

function useDerived(state, date) {
  return useMemo(() => {
    const P = state.profile;
    const day = state.days[date] || BLANK_DAY();
    const wk = weekFor(date);
    const wkStart = weekStartOf(date);

    const cal = day.food.reduce((s,f) => s + (f.calories||0), 0);
    const pro = day.food.reduce((s,f) => s + (f.protein||0), 0);
    const carb = day.food.reduce((s,f) => s + (f.carbs||0), 0);
    const fat = day.food.reduce((s,f) => s + (f.fat||0), 0);

    // Weight series (real entries only), plus a 7-day rolling average
    const weights = Object.entries(state.days)
      .filter(([,d]) => typeof d.weight === "number")
      .map(([k,d]) => ({ date:k, w:d.weight }))
      .sort((a,b) => a.date.localeCompare(b.date));

    const trend = weights.map((pt, i) => {
      const window = weights.filter(x => daysBetween(x.date, pt.date) >= 0 && daysBetween(x.date, pt.date) <= 6);
      return { ...pt, trend: round(window.reduce((s,x)=>s+x.w,0)/window.length, 1) };
    });

    const latest = weights.length ? weights[weights.length-1].w : P.startWeight;
    const latestTrend = trend.length ? trend[trend.length-1].trend : P.startWeight;

    // Burn: real Garmin data wins, formula is the fallback
    const formulaBurn = estimateBurn(P, latest);
    /* What the day's logged training cost, summed off the workouts themselves. */
    const trainingCal = (day.workouts || []).reduce((a,w) => a + (w.calories || 0), 0);

    /* burn itself comes from the shared helper; only the label is worked out here.
       training — follows the logged workouts (day.burn overrides the sum)
       total    — the whole day, replaces the estimate outright
       active   — a whole day's *active* calories, over ~BMR
       extra    — work beyond a normal day, on top of the estimate */
    const burn = dayBurn(day, formulaBurn);
    let burnSource = "estimate";
    if (day.burnKind === "training") {
      burnSource = (typeof day.burn === "number" && day.burn > 0) ? "training+set" : "training";
    } else if (typeof day.burn === "number" && day.burn > 0) {
      // Days logged before burnFrom existed came from Garmin, so that's the default.
      const from = day.burnFrom === "manual" ? "manual" : "garmin";
      burnSource = day.burnKind === "active" ? `${from}+bmr`
                 : day.burnKind === "extra" ? `${from}+extra` : from;
    }
    const calTarget = Math.max(1700, Math.round((burn - P.deficit) / 25) * 25);

    // This week's running
    const weekDays = Array.from({length:7}, (_,i) => addDays(wkStart, i));
    const weekMiles = weekDays.reduce((s,d) => {
      const dd = state.days[d];
      return s + (dd ? dd.workouts.filter(w=>w.type==="run").reduce((a,w)=>a+(w.miles||0),0) : 0);
    }, 0);
    const weekTarget = wk.mon + wk.fri + wk.sat;

    // Rolling 7-day averages
    const last7 = Array.from({length:7}, (_,i) => addDays(date, -i)).map(d => state.days[d]).filter(Boolean);
    const logged7 = last7.filter(d => d.food.length > 0);
    const avgCal = logged7.length ? Math.round(logged7.reduce((s,d)=>s+d.food.reduce((a,f)=>a+(f.calories||0),0),0)/logged7.length) : 0;
    const avgPro = logged7.length ? Math.round(logged7.reduce((s,d)=>s+d.food.reduce((a,f)=>a+(f.protein||0),0),0)/logged7.length) : 0;

    // Streak rewards honest logging. A free day you actually logged passes
    // through untouched — the all-or-nothing spiral is what kills cuts, not pizza.
    let streak = 0;
    for (let i = 0; i < 200; i++) {
      const d = state.days[addDays(date, -i)];
      if (!d || d.food.length === 0) break;
      if (d.free) { streak++; continue; }
      const p = d.food.reduce((s,f)=>s+(f.protein||0),0);
      if (p < P.proteinTarget * 0.85) break;
      streak++;
    }

    // Cumulative deficit ledger → pounds earned
    const allLogged = Object.entries(state.days).filter(([,d]) => d.food.length > 0);
    const totalDeficit = allLogged.reduce((s,[k,d]) => {
      const c = d.food.reduce((a,f)=>a+(f.calories||0),0);
      return s + (dayBurn(d, estimateBurn(P, latest)) - c);
    }, 0);

    // Projection off trend weight
    const elapsed = Math.max(1, daysBetween(P.startDate, date));
    const lost = P.startWeight - latestTrend;
    const perWeek = (lost / elapsed) * 7;
    const toGoal = latestTrend - P.goalYear;
    const weeksLeft = perWeek > 0.05 ? toGoal / perWeek : null;
    const projDate = weeksLeft && weeksLeft > 0 ? addDays(date, Math.round(weeksLeft*7)) : null;

    // Weekly calorie budget — the unit your body actually works in.
    // A big Saturday doesn't ruin anything; it just spends more of the week.
    const dayIdx = clamp(daysBetween(wkStart, date), 0, 6);
    const daysAfter = 6 - dayIdx;
    const weekBudget = calTarget * 7;
    const spentBefore = weekDays.slice(0, dayIdx).reduce((s,d) => {
      const dd = state.days[d];
      return s + (dd ? dd.food.reduce((a,f)=>a+(f.calories||0),0) : calTarget);
    }, 0);
    const weekSpent = spentBefore + cal;
    const perDayLeft = Math.max(1800, Math.round(((weekBudget - spentBefore) / (daysAfter + 1)) / 25) * 25);
    const freeDaysThisWeek = weekDays.filter(d => state.days[d]?.free).length;
    const swap = day.swap;

    const totalMiles = Object.values(state.days).reduce((s,d) =>
      s + d.workouts.filter(w=>w.type==="run").reduce((a,w)=>a+(w.miles||0),0), 0);

    return { P, day, wk, wkStart, weekDays, cal, pro, carb, fat, burn, burnSource, formulaBurn, trainingCal,
      calTarget, weights, trend, latest, latestTrend, weekMiles, weekTarget,
      avgCal, avgPro, streak, totalDeficit, lost, perWeek, projDate, totalMiles,
      weekBudget, weekSpent, perDayLeft, daysAfter, dayIdx, freeDaysThisWeek, swap };
  }, [state, date]);
}

/* ============================================================
   APP SHELL
   ============================================================ */

const TABS = [
  { id:"today", label:"Today", icon:"◎" },
  { id:"food",  label:"Food",  icon:"◍" },
  { id:"train", label:"Train", icon:"⌁" },
  { id:"stats", label:"Stats", icon:"◱" },
  { id:"plan",  label:"Plan",  icon:"≣" },
];

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("today");
  const [date, setDate] = useState(iso(new Date()));
  const [toast, setToast] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guide, setGuide] = useState(null);   // null | { only: string|null }
  const [saveStatus, setSaveStatus] = useState("idle");  // idle | saving | saved | failed
  const [storageOK, setStorageOK] = useState(true);
  const hydrated = useRef(false);
  const live = useRef(null);
  const D = useDerived(state, date);

  useEffect(() => {
    (async () => {
      const ok = await probeStorage();
      setStorageOK(ok);
      await loadApiKey();
      const s = await loadState();
      setState(s); live.current = s; setReady(true);
    })();
  }, []);

  const flush = useCallback(async (snapshot) => {
    setSaveStatus("saving");
    const ok = await saveState(snapshot);
    setSaveStatus(ok ? "saved" : "failed");
    if (!ok) setStorageOK(false);
  }, []);

  /* Every change schedules a write 250ms later. Short enough that tapping a
     button and immediately backing out still lands. */
  useEffect(() => {
    if (!ready) return;
    live.current = state;
    if (!hydrated.current) { hydrated.current = true; return; }
    const t = setTimeout(() => flush(state), 250);
    return () => clearTimeout(t);
  }, [state, ready, flush]);

  /* Belt and braces: write on the way out, before the view is torn down. */
  useEffect(() => {
    const bail = () => { if (live.current && hydrated.current) saveState(live.current); };
    const onVis = () => { if (document.visibilityState === "hidden") bail(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", bail);
    window.addEventListener("blur", bail);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", bail);
      window.removeEventListener("blur", bail);
    };
  }, []);

  const flash = useCallback((msg, kind="ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const update = useCallback((fn) => {
    setState(prev => fn(clone(prev)));
  }, []);

  const patchDay = useCallback((d, patch) => {
    update(s => {
      s.days[d] = { ...BLANK_DAY(), ...(s.days[d]||{}), ...patch };
      return s;
    });
  }, [update]);

  const addFood = useCallback((item, d = date) => {
    update(s => {
      const day = { ...BLANK_DAY(), ...(s.days[d]||{}) };
      day.food = [...day.food, { id: uid(), ...item }];
      s.days[d] = day;
      return s;
    });
  }, [update, date]);

  const removeFood = useCallback((id, d = date) => {
    update(s => {
      const day = s.days[d]; if (!day) return s;
      day.food = day.food.filter(f => f.id !== id);
      return s;
    });
  }, [update, date]);

  const updateFood = useCallback((id, patch, d = date) => {
    update(s => {
      const day = s.days[d]; if (!day) return s;
      day.food = day.food.map(f => f.id === id ? { ...f, ...patch } : f);
      return s;
    });
  }, [update, date]);

  const addWorkout = useCallback((w, d = date) => {
    update(s => {
      const day = { ...BLANK_DAY(), ...(s.days[d]||{}) };
      day.workouts = [...day.workouts, { id: uid(), ...w }];
      s.days[d] = day;
      return s;
    });
  }, [update, date]);

  const removeWorkout = useCallback((id, d = date) => {
    update(s => { const day = s.days[d]; if (day) day.workouts = day.workouts.filter(w=>w.id!==id); return s; });
  }, [update, date]);

  const updateWorkout = useCallback((id, patch, d = date) => {
    update(s => {
      const day = s.days[d]; if (!day) return s;
      day.workouts = day.workouts.map(w => w.id === id ? { ...w, ...patch } : w);
      return s;
    });
  }, [update, date]);

  const openGuide = useCallback((only = null) => setGuide({ only }), []);

  const ctx = { state, update, patchDay, addFood, removeFood, updateFood, addWorkout, removeWorkout, updateWorkout, openGuide,
    date, setDate, D, flash, setTab, setState, saveStatus, storageOK, flush };

  if (!ready) return (
    <div className="hc" style={{ display:"grid", placeItems:"center", minHeight:"100vh" }}>
      <style>{CSS}</style>
      <div className="pulse" style={{ textAlign:"center" }}>
        <div className="dsp" style={{ fontSize:44, letterSpacing:"-.01em" }}>THE CUT</div>
        <div className="eyebrow" style={{ marginTop:6 }}>Loading your log</div>
      </div>
    </div>
  );

  return (
    <div className="hc">
      <style>{CSS}</style>
      <div className="hcpad" style={{ maxWidth:520, margin:"0 auto" }}>
        <Header D={D} date={date} setDate={setDate} onSettings={()=>setSettingsOpen(true)}
          saveStatus={saveStatus} storageOK={storageOK} />
        <div style={{ padding:"0 14px" }}>
          {!storageOK && <StorageWarning ctx={ctx} />}
          {tab==="today" && <Today ctx={ctx} />}
          {tab==="food"  && <Food ctx={ctx} />}
          {tab==="train" && <Train ctx={ctx} />}
          {tab==="stats" && <Stats ctx={ctx} />}
          {tab==="plan"  && <PlanView ctx={ctx} />}
        </div>
      </div>

      {settingsOpen && <Settings ctx={ctx} onClose={()=>setSettingsOpen(false)} />}

      {guide && (
        <Sheet onClose={()=>setGuide(null)} title={guide.only ? "What this means" : "How this works"}>
          <Guide ctx={ctx} only={guide.only} onDone={()=>setGuide(null)} onAll={()=>setGuide({ only:null })} />
        </Sheet>
      )}

      {toast && (
        <div className="rise" style={{ position:"fixed", bottom:"calc(82px + env(safe-area-inset-bottom))", left:"50%", transform:"translateX(-50%)",
          background: toast.kind==="err" ? "var(--warn)" : "var(--ink)", color:"#FCFCFA",
          padding:"10px 16px", borderRadius:4, fontSize:13, fontWeight:600, zIndex:60,
          maxWidth:"90vw", textAlign:"center", boxShadow:"0 6px 20px -6px rgba(0,0,0,.4)" }}>
          {toast.msg}
        </div>
      )}

      <nav className="hcnav" style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(252,252,250,.94)",
        backdropFilter:"blur(12px)", borderTop:"1px solid var(--rule)", zIndex:50 }}>
        <div style={{ maxWidth:520, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(5,1fr)" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="tapfade"
              style={{ padding:"9px 0 11px", display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                color: tab===t.id ? "var(--bib)" : "var(--ink3)", position:"relative" }}>
              {tab===t.id && <div style={{ position:"absolute", top:0, left:"28%", right:"28%", height:2, background:"var(--bib)" }} />}
              <span style={{ fontSize:17, lineHeight:1 }}>{t.icon}</span>
              <span className="eyebrow" style={{ color:"inherit", fontSize:9.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ============================================================
   STORAGE FAILSAFE — if the viewer won't persist, say so loudly
   and hand over a backup the user can paste back in.
   ============================================================ */

function StorageWarning({ ctx }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ marginBottom:12, padding:"12px 14px", borderRadius:6,
        border:"1px solid var(--warn)", background:"rgba(198,65,58,.07)" }}>
        <Eyebrow color="var(--warn)">Nothing is saving</Eyebrow>
        <p style={{ margin:"6px 0 0", fontSize:12.5, lineHeight:1.5, color:"var(--ink2)" }}>
          This viewer is blocking storage, so anything you log here disappears when you close it.
          Open the artifact in a browser tab instead — or copy a backup below and paste it
          back in whenever you return.
        </p>
        <Btn kind="bib" size="sm" style={{ marginTop:10 }} onClick={()=>setOpen(true)}>Backup & restore</Btn>
      </div>
      {open && <Sheet onClose={()=>setOpen(false)} title="Backup & restore"><Backup ctx={ctx} /></Sheet>}
    </>
  );
}

function Backup({ ctx }) {
  const { state, setState, flush, flash } = ctx;
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => JSON.stringify(state), [state]);
  const ref = useRef(null);

  const copy = async () => {
    try { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(()=>setCopied(false), 2200); }
    catch (e) { ref.current?.select(); flash("Select all and copy manually"); }
  };

  const restore = () => {
    try {
      const parsed = JSON.parse(paste.trim());
      if (!parsed || typeof parsed !== "object" || !parsed.days) throw new Error("shape");
      const merged = { ...DEFAULT_STATE, ...parsed,
        profile: { ...DEFAULT_STATE.profile, ...(parsed.profile||{}) } };
      setState(merged);
      flush(merged);
      flash(`Restored ${Object.keys(merged.days).length} days`);
      setPaste("");
    } catch (e) { flash("That doesn't look like a backup — paste the whole thing", "err"); }
  };

  return (
    <div>
      <Eyebrow>Copy your data out</Eyebrow>
      <p style={{ margin:"6px 0 9px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
        {Object.keys(state.days).length} days logged. Paste this somewhere safe — Notes, a text
        to yourself, anywhere.
      </p>
      <textarea ref={ref} readOnly value={json} rows={4}
        onFocus={e=>e.target.select()}
        style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, lineHeight:1.4 }} />
      <Btn kind="solid" size="md" full style={{ marginTop:8 }} onClick={copy}>
        {copied ? "Copied ✓" : "Copy backup"}
      </Btn>

      <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid var(--rule)" }}>
        <Eyebrow>Paste a backup back in</Eyebrow>
        <p style={{ margin:"6px 0 9px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
          This replaces everything currently in the app.
        </p>
        <textarea value={paste} onChange={e=>setPaste(e.target.value)} rows={4}
          placeholder='{"profile":{...},"days":{...}}'
          style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10 }} />
        <Btn kind="ghost" size="md" full style={{ marginTop:8 }} disabled={!paste.trim()} onClick={restore}>
          Restore from backup
        </Btn>
      </div>
    </div>
  );
}

/* ============================================================
   HEADER — the race bib
   ============================================================ */

function Header({ D, date, setDate, onSettings, saveStatus, storageOK }) {
  const dayNum = daysBetween(D.P.startDate, date) + 1;
  const isToday = date === iso(new Date());
  return (
    <div style={{ padding:"18px 14px 12px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
        {/* the bib */}
        <div style={{ border:"1.5px solid var(--ink)", borderRadius:3, padding:"5px 10px 6px", background:"var(--card)",
          minWidth:78, textAlign:"center", position:"relative" }}>
          <div className="eyebrow" style={{ fontSize:8.5, color:"var(--ink2)" }}>DAY</div>
          <div className="dsp" style={{ fontSize:32, marginTop:-1 }}>{String(Math.max(dayNum,0)).padStart(3,"0")}</div>
          <div style={{ height:1, background:"var(--rule)", margin:"4px -4px 3px" }} />
          <div className="mono" style={{ fontSize:9, color:"var(--bib)", fontWeight:600, letterSpacing:".08em" }}>
            WK {String(D.wk.w).padStart(2,"0")}
          </div>
        </div>

        <div style={{ flex:1, paddingTop:2 }}>
          <Eyebrow color="var(--bib)">{D.wk.block} · {D.wk.title}</Eyebrow>
          <div className="dsp" style={{ fontSize:27, marginTop:4 }}>
            {isToday ? "TODAY" : fmtDay(date).split(",")[0].toUpperCase()}
          </div>
          <div className="mono" style={{ fontSize:11, color:"var(--ink2)", marginTop:2 }}>
            {fmtShort(date)} · {D.latestTrend} lb trend · {round(D.P.startWeight - D.latestTrend,1)} lb down
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5 }}>
          <button onClick={onSettings} className="tapfade" aria-label="Settings"
            style={{ color:"var(--ink3)", fontSize:19, padding:"2px" }}>⚙</button>
          <div className="mono" title="Save status" style={{ fontSize:8.5, letterSpacing:".05em",
            display:"flex", alignItems:"center", gap:3.5, whiteSpace:"nowrap",
            color: !storageOK || saveStatus==="failed" ? "var(--warn)"
              : saveStatus==="saving" ? "var(--ink3)" : "var(--moss)" }}>
            <span style={{ width:5, height:5, borderRadius:3, background:"currentColor",
              opacity: saveStatus==="saving" ? .4 : 1 }} />
            {!storageOK || saveStatus==="failed" ? "NOT SAVED"
              : saveStatus==="saving" ? "SAVING" : saveStatus==="saved" ? "SAVED" : "READY"}
          </div>
        </div>
      </div>

      {/* day scrubber */}
      <div className="noscroll" style={{ display:"flex", gap:6, marginTop:14, overflowX:"auto", scrollbarWidth:"none" }}>
        {Array.from({length:8},(_,i)=>addDays(iso(new Date()), i-7)).map(d => {
          const on = d === date;
          const dd = parseISO(d);
          return (
            <button key={d} onClick={()=>setDate(d)} className="tapfade"
              style={{ flex:"0 0 auto", width:42, padding:"6px 0 7px", borderRadius:4, textAlign:"center",
                background: on ? "var(--ink)" : "transparent", color: on ? "#FCFCFA" : "var(--ink3)",
                border: on ? "1px solid var(--ink)" : "1px solid var(--rule)" }}>
              <div className="eyebrow" style={{ color:"inherit", opacity:.75, fontSize:8.5 }}>
                {dd.toLocaleDateString("en-US",{weekday:"short"}).toUpperCase()}
              </div>
              <div className="dsp" style={{ fontSize:17, marginTop:1 }}>{dd.getDate()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   TODAY
   ============================================================ */

function Today({ ctx }) {
  const { D, date, patchDay, addFood, flash, setTab, state } = ctx;
  const [swapOpen, setSwapOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [burnOpen, setBurnOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const sched = DAY_TEMPLATE[dow(date)];
  const left = D.calTarget - D.cal;
  const free = D.day.free;

  return (
    <div className="rise" style={{ display:"grid", gap:12 }}>

      {/* rings */}
      <Card style={{ padding:"18px 16px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <LaneRings cal={D.cal} calTarget={D.calTarget} pro={D.pro} proTarget={D.P.proteinTarget}
            steps={D.day.steps||0} stepTarget={D.P.stepTarget} size={168} />
          <div style={{ flex:1, display:"grid", gap:13 }}>
            <div>
              <Eyebrow color={free ? "var(--lane)" : "var(--bib)"}>
                {free ? "◉ Free day — no target" : "◉ Calories left"}
              </Eyebrow>
              <div className="dsp" style={{ fontSize:40, marginTop:1,
                color: free ? "var(--lane)" : left < 0 ? "var(--warn)" : "var(--ink)" }}>
                {free ? Math.round(D.cal).toLocaleString()
                  : left < 0 ? `+${Math.abs(Math.round(left))}` : Math.round(left)}
              </div>
              <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)" }}>
                {free ? "logged, and that's all you owe" : `${Math.round(D.cal)} of ${D.calTarget}`}
              </div>
            </div>
            <div>
              <Eyebrow color="var(--moss)">◉ Protein</Eyebrow>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span className="dsp" style={{ fontSize:26 }}>{Math.round(D.pro)}</span>
                <span className="mono" style={{ fontSize:10.5, color:"var(--ink3)" }}>/ {D.P.proteinTarget}g</span>
              </div>
            </div>
            <button onClick={()=>setStepsOpen(true)} className="tapfade" aria-label="Set step count"
              style={{ textAlign:"left", background:"transparent", padding:0 }}>
              <Eyebrow color="var(--lane)">◉ Steps</Eyebrow>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span className="dsp" style={{ fontSize:26 }}>{(D.day.steps||0).toLocaleString()}</span>
                <span className="mono" style={{ fontSize:10.5, color:"var(--ink3)" }}>/ {(D.P.stepTarget/1000)}k</span>
              </div>
              <div className="mono" style={{ fontSize:9, color:"var(--ink3)", marginTop:2 }}>
                {D.day.steps == null ? "tap to set" : "tap to edit"}
              </div>
            </button>
          </div>
        </div>

        <div style={{ display:"flex", gap:14, marginTop:15, paddingTop:13, borderTop:"1px solid var(--rule)" }}>
          <MiniStat label="Carbs" val={`${Math.round(D.carb)}g`} />
          <MiniStat label="Fat" val={`${Math.round(D.fat)}g`} />
          <MiniStat label="Burn" val={D.burn.toLocaleString()}
            hint={burnLabel(D.burnSource)} onClick={()=>setBurnOpen(true)} />
          <MiniStat label="Streak" val={`${D.streak}d`} hint="protein hit" />
        </div>

        <button onClick={()=>setReportOpen(true)} className="tapfade"
          style={{ width:"100%", marginTop:13, padding:"11px 0", borderRadius:5,
            border:"1px solid var(--ink)", background:"transparent",
            fontSize:12.5, fontWeight:700, letterSpacing:".01em" }}>
          Report from today →
        </button>
      </Card>

      {/* today's session */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ height:3, background: sched.tag==="recovery" ? "var(--ink3)"
          : sched.tag==="run" ? "var(--lane)" : sched.tag==="benchmark" ? "var(--bib)"
          : sched.tag==="rest" ? "var(--rule)" : "var(--moss)" }} />
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div style={{ flex:1 }}>
              <Eyebrow color={D.swap ? "var(--moss)" : undefined}>
                {D.swap ? "Swapped in today" : "On the board today"}
              </Eyebrow>
              <div className="dsp" style={{ fontSize:25, marginTop:3 }}>
                {(D.swap ? D.swap.name : sched.name).toUpperCase()}
              </div>
              {D.swap && (
                <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:3 }}>
                  instead of {sched.name.toLowerCase()}
                </div>
              )}
            </div>
            {dow(date)===6 && <RunChip miles={D.wk.sat} />}
            {dow(date)===1 && <RunChip miles={D.wk.mon} />}
            {dow(date)===5 && <RunChip miles={D.wk.fri} />}
          </div>
          <p style={{ margin:"9px 0 0", fontSize:13.5, lineHeight:1.5, color:"var(--ink2)" }}>
            {D.swap ? D.swap.detail : sched.detail}
          </p>
          {D.wk.pr && (
            <div style={{ marginTop:11, padding:"8px 10px", background:"rgba(255,77,25,.09)",
              borderLeft:"2px solid var(--bib)", borderRadius:"0 4px 4px 0" }}>
              <div className="eyebrow" style={{ color:"var(--bib)" }}>PR test week</div>
              <div style={{ fontSize:12.5, color:"var(--ink2)", marginTop:2 }}>{D.wk.note}</div>
            </div>
          )}
          <div style={{ display:"flex", gap:8, marginTop:13, flexWrap:"wrap" }}>
            <Btn kind="solid" size="sm" onClick={()=>setTab("train")}>Log this session</Btn>
            <Btn kind="ghost" size="sm" onClick={()=>setSwapOpen(true)}>
              {D.swap ? "Change swap" : "Do something else"}
            </Btn>
            {D.swap && <Btn kind="quiet" size="sm" onClick={()=>{ patchDay(date,{swap:null}); flash("Back to the plan"); }}>Undo</Btn>}
          </div>
        </div>
      </Card>

      <GarminCard ctx={ctx} />

      {/* fast log row */}
      <Card>
        <Eyebrow>The five-second log</Eyebrow>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7, marginTop:10 }}>
          {["Greek Yogurt Power Bowl","Chicken & Black Bean Wrap","Banana + Rice Cake + PB","Whey Isolate Shake"]
            .map(n => { const m = MEALS.find(x=>x.n===n); if(!m) return null; return (
              <button key={n} className="tapfade" onClick={()=>{ addFood({ name:m.n, calories:m.c, protein:m.p, carbs:m.cb, fat:m.f, slot:m.m }); flash(`${m.n} logged`); }}
                style={{ textAlign:"left", padding:"9px 10px", border:"1px solid var(--rule)", borderRadius:4, background:"transparent" }}>
                <div style={{ fontSize:12, fontWeight:600, lineHeight:1.25 }}>{m.n}</div>
                <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:3 }}>{m.c} · {m.p}p</div>
              </button>
            );})}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <WeightCard ctx={ctx} />
        <WaterCard ctx={ctx} />
      </div>

      {/* protein rescue */}
      {!free && D.pro < D.P.proteinTarget && D.cal > D.calTarget * 0.55 && (
        <Card style={{ background:"rgba(76,140,74,.07)", borderColor:"rgba(76,140,74,.3)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Eyebrow color="var(--moss)">Protein rescue — {Math.round(D.P.proteinTarget - D.pro)}g short</Eyebrow>
            <Why label="the protein floor" onClick={()=>ctx.openGuide("protein")} />
          </div>
          <div style={{ display:"flex", gap:7, marginTop:9, flexWrap:"wrap" }}>
            {MEALS.filter(m => m.p >= 15 && m.c <= 260).slice(0,4).map(m => (
              <button key={m.n} className="tapfade"
                onClick={()=>{ addFood({ name:m.n, calories:m.c, protein:m.p, carbs:m.cb, fat:m.f, slot:"snack" }); flash(`+${m.p}g protein`); }}
                style={{ padding:"6px 9px", border:"1px solid rgba(76,140,74,.35)", borderRadius:4, fontSize:11.5, fontWeight:600 }}>
                {m.n} <span className="mono" style={{ color:"var(--moss)" }}>+{m.p}g</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <WeekBudget ctx={ctx} />
      <FreeDay ctx={ctx} />
      <Ledger D={D} ctx={ctx} />

      {swapOpen && (
        <Sheet onClose={()=>setSwapOpen(false)} title="Swap today's session">
          <SwapPicker ctx={ctx} onDone={()=>setSwapOpen(false)} />
        </Sheet>
      )}

      {stepsOpen && (
        <Sheet onClose={()=>setStepsOpen(false)} title="Step count">
          <StepsForm ctx={ctx} onDone={()=>setStepsOpen(false)} />
        </Sheet>
      )}

      {burnOpen && (
        <Sheet onClose={()=>setBurnOpen(false)} title="Calories burned">
          <BurnForm ctx={ctx} onDone={()=>setBurnOpen(false)} />
        </Sheet>
      )}

      {reportOpen && (
        <Sheet onClose={()=>setReportOpen(false)} title="Today's report">
          <DailyReport ctx={ctx} onDone={()=>setReportOpen(false)} />
        </Sheet>
      )}
    </div>
  );
}

/* ---------- steps: whatever your phone or watch is showing right now ---------- */

function StepsForm({ ctx, onDone }) {
  const { D, date, patchDay, flash } = ctx;
  const [val, setVal] = useState(D.day.steps != null ? String(D.day.steps) : "");
  const target = D.P.stepTarget;

  /* Held in a ref so several taps of a bump chip in one tick each add — reading
     the number off state would make them all compute from the same stale value. */
  const ref = useRef(val);
  const put = (v) => { ref.current = v; setVal(v); };
  const bump = (n) => put(String(Math.max(0, Math.round(+ref.current || 0) + n)));

  const n = Math.round(+val || 0);
  const save = () => {
    if (val.trim() === "") { patchDay(date, { steps:null }); flash("Steps cleared"); onDone(); return; }
    if (n < 0 || n > 200000) { flash("That doesn't look like a step count", "err"); return; }
    patchDay(date, { steps:n });
    flash(`${n.toLocaleString()} steps logged`);
    onDone();
  };

  return (
    <div>
      <p style={{ margin:"0 0 11px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
        Put in the total your phone or watch is showing. Importing a Garmin day summary
        overwrites this with whatever Garmin has.
      </p>
      <input type="number" inputMode="numeric" step="100" value={val} autoFocus
        onChange={e=>put(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
        placeholder="8500"
        style={{ fontSize:26, fontFamily:"'IBM Plex Mono',monospace", textAlign:"center", padding:"12px 6px" }} />

      <div style={{ display:"flex", gap:6, marginTop:9 }}>
        {[500, 1000, 2500, 5000].map(k => (
          <button key={k} onClick={()=>bump(k)} className="tapfade"
            style={{ flex:1, padding:"8px 0", borderRadius:4, fontSize:11.5, fontWeight:600,
              border:"1px solid var(--rule)", background:"transparent", color:"var(--ink2)" }}>
            +{k >= 1000 ? `${k/1000}k` : k}
          </button>
        ))}
      </div>

      <div className="mono" style={{ fontSize:11, color: n >= target ? "var(--moss)" : "var(--ink3)", marginTop:10 }}>
        {n >= target
          ? `${n.toLocaleString()} — target hit`
          : `${Math.max(0, target - n).toLocaleString()} to go of ${target.toLocaleString()}`}
      </div>

      <div style={{ display:"flex", gap:7, marginTop:13 }}>
        <Btn kind="solid" size="md" full onClick={save}>Save</Btn>
        {D.day.steps != null && (
          <Btn kind="ghost" size="md" onClick={()=>{ patchDay(date,{steps:null}); flash("Steps cleared"); onDone(); }}>Clear</Btn>
        )}
      </div>
    </div>
  );
}

/* ---------- what should I eat ----------

   Ranks the library against what's actually left in the day rather than just
   listing food. Protein is weighted hardest because that's the number people
   miss on a cut, and anything that would blow the remaining calories is pushed
   down rather than hidden — sometimes the honest answer is "this is what's
   left, and it costs you". */

const HUNGER = [
  { id:"bite",  label:"A bite",   lo:0,   hi:260 },
  { id:"snack", label:"Something real", lo:180, hi:520 },
  { id:"meal",  label:"A full meal",    lo:400, hi:9999 },
];

const slotForNow = () => {
  const h = new Date().getHours();
  return h < 10.5 ? "breakfast" : h < 15 ? "lunch" : h < 21 ? "dinner" : "snack";
};

function suggestMeals({ ctx, hunger, slot }) {
  const { D, state } = ctx, P = D.P;
  const band = HUNGER.find(h => h.id === hunger) || HUNGER[1];
  const calLeft = Math.round(D.calTarget - D.cal);
  const proLeft = Math.round(P.proteinTarget - D.pro);

  const pool = [
    ...state.customFoods.map(f => ({ n:f.name, c:f.calories, p:f.protein, cb:f.carbs, f:f.fat, m:f.slot, custom:true })),
    ...MEALS,
  ];

  return pool
    .filter(m => m.c >= band.lo && m.c <= band.hi)
    .map(m => {
      const fits = D.day.free || calLeft <= 0 ? true : m.c <= calLeft;
      const closesProtein = proLeft > 0 ? Math.min(m.p, proLeft) : 0;
      let score = 0;
      score += closesProtein * 3;               // protein is the scarce thing
      score += (m.p / Math.max(m.c, 1)) * 260;  // density, not just raw grams
      if (fits) score += 45; else score -= 55;
      if (m.m === slot) score += 22;
      if (m.custom) score += 10;                // your own food first
      return { ...m, fits, closesProtein, score };
    })
    .sort((a,b) => b.score - a.score)
    .slice(0, 6);
}

function Suggest({ ctx, onDone }) {
  const { D, addFood, flash } = ctx, P = D.P;
  const [slot, setSlot] = useState(slotForNow());
  const calLeft = Math.round(D.calTarget - D.cal);
  const proLeft = Math.round(P.proteinTarget - D.pro);
  const [hunger, setHunger] = useState(calLeft > 0 && calLeft < 300 ? "bite" : "snack");
  const picks = suggestMeals({ ctx, hunger, slot });

  const log = (m) => {
    addFood({ name:m.n, calories:m.c, protein:m.p, carbs:m.cb, fat:m.f, slot });
    flash(`${m.n} logged`);
    onDone();
  };

  return (
    <div>
      <div style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.55 }}>
        {D.day.free
          ? <>Free day — no target to protect. Pick whatever you actually want.</>
          : calLeft > 0
          ? <>You've got <strong>{calLeft.toLocaleString()} calories</strong> left{proLeft > 0 && <> and need <strong>{proLeft}g more protein</strong></>}.</>
          : <>You're <strong>{Math.abs(calLeft).toLocaleString()} over</strong> for today{proLeft > 0 && <>, and still <strong>{proLeft}g short on protein</strong></>}. Protein's still worth having — the week absorbs the calories.</>}
      </div>

      <div style={{ marginTop:12 }}><Eyebrow>How hungry</Eyebrow></div>
      <div style={{ marginTop:6 }}>
        <Toggle color="var(--ink)" value={hunger} onPick={setHunger}
          opts={HUNGER.map(h => [h.id, h.label])} />
      </div>

      <div style={{ marginTop:12 }}><Eyebrow>Log it as</Eyebrow></div>
      <div style={{ display:"flex", gap:5, marginTop:6 }}>
        {MEAL_SLOTS.map(s => (
          <button key={s} onClick={()=>setSlot(s)} className="tapfade"
            style={{ flex:1, padding:"6px 0", borderRadius:4, fontSize:11, fontWeight:600,
              background: slot===s?"var(--ink)":"transparent", color: slot===s?"#FCFCFA":"var(--ink3)",
              border: slot===s?"1px solid var(--ink)":"1px solid var(--rule)" }}>
            {SLOT_LABEL[s].split(" ")[0]}
          </button>
        ))}
      </div>

      <div style={{ marginTop:14 }}><Eyebrow>Worth eating</Eyebrow></div>
      <div style={{ marginTop:6 }}>
        {picks.length === 0 ? (
          <div style={{ fontSize:12.5, color:"var(--ink3)", padding:"12px 0", lineHeight:1.5 }}>
            Nothing in the library that size. Try a different amount, or use Describe a meal.
          </div>
        ) : picks.map(m => (
          <button key={m.n} onClick={()=>log(m)} className="tapfade"
            style={{ width:"100%", textAlign:"left", background:"transparent",
              padding:"10px 0", borderBottom:"1px solid var(--rule)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10, alignItems:"baseline" }}>
              <span style={{ fontSize:13.5, fontWeight:600 }}>{m.n}</span>
              <span className="mono" style={{ fontSize:11, color:"var(--ink3)", whiteSpace:"nowrap" }}>
                {m.c} · {m.p}p
              </span>
            </div>
            <div className="mono" style={{ fontSize:10, marginTop:3,
              color: m.fits ? "var(--moss)" : "var(--warn)" }}>
              {m.closesProtein > 0 ? `+${m.p}g protein — closes ${Math.round(m.closesProtein)}g of the gap` : `${m.p}g protein`}
              {m.fits ? "" : ` · ${(m.c - Math.max(calLeft,0)).toLocaleString()} over what's left`}
              {m.custom ? " · yours" : ""}
            </div>
          </button>
        ))}
      </div>

      <Btn kind="ghost" size="md" full style={{ marginTop:13 }} onClick={onDone}>Nothing here</Btn>
    </div>
  );
}

/* ---------- how any of this works ----------

   Written against live numbers rather than generic documentation: the whole
   point is reading "your target is 1,900 because the app thinks you burn
   2,650", not "target = burn - deficit". Each card that isn't self-evident
   carries a ? that opens just its own section. */

const guideSections = (ctx) => {
  const { D } = ctx, P = D.P;
  const wkBudget = D.calTarget * 7;
  const lb = round(D.totalDeficit / 3500, 1);
  return [
    { id:"chain", title:"Where every number comes from", body: (
      <>
        <p>Each step feeds the next, so if the first one is wrong they all are.</p>
        <ol style={{ paddingLeft:17, margin:"9px 0 0" }}>
          <li><strong>Your burn.</strong> What your body spends in a day. Right now: <strong>{D.burn.toLocaleString()}</strong> ({burnLabel(D.burnSource)}). Left alone, the app works it out from your height, weight, age and activity level.</li>
          <li><strong>Minus your deficit</strong> of {P.deficit}/day → <strong>today's target, {D.calTarget.toLocaleString()}</strong>. {P.deficit} a day is {(P.deficit*7).toLocaleString()} a week, and a pound of fat is about 3,500 calories — so roughly {round(P.deficit*7/3500,1)} lb a week.</li>
          <li><strong>Times seven</strong> → the week's budget, <strong>{wkBudget.toLocaleString()}</strong>.</li>
          <li><strong>What's left, spread over the days remaining</strong> → the per-day pace on the budget card.</li>
        </ol>
        <p style={{ marginTop:9 }}>Change your burn and all four move together.</p>
      </>
    )},
    { id:"budget", title:"The week budget", body: (
      <>
        <p>Calories work like money in a weekly account, not a daily pass/fail. A big dinner isn't a failure — it's a withdrawal you cover across the other days. Your body settles up over a week; it doesn't reset at midnight.</p>
        <p style={{ marginTop:9 }}>You have <strong>{wkBudget.toLocaleString()}</strong> for the week and have spent <strong>{Math.round(D.weekSpent).toLocaleString()}</strong>, leaving about <strong>{D.perDayLeft.toLocaleString()}/day</strong> across today and the {D.daysAfter} day{D.daysAfter===1?"":"s"} after it.</p>
        <p style={{ marginTop:9 }}><strong>One catch worth knowing.</strong> A day earlier this week that you never logged is counted as if you ate the full target, not zero. Otherwise skipping the log would look like free calories and the number would flatter you.</p>
      </>
    )},
    { id:"burn", title:"Calories burned", body: (
      <>
        <p>Left alone the app estimates your burn from your body and activity level. Tap the Burn tile to set it yourself — four ways, because the number means different things depending on where it came from:</p>
        <ul style={{ paddingLeft:17, margin:"9px 0 0" }}>
          <li><strong>From my training</strong> — adds up the calories on the runs, walks and sessions you logged today. Follows the log on its own.</li>
          <li><strong>Whole day</strong> — the total on your watch, resting burn included. Replaces the estimate.</li>
          <li><strong>Active + resting</strong> — both halves your watch reports, added together. Leave resting blank and it's estimated from your body.</li>
          <li><strong>Extra today</strong> — work that went beyond a normal day, added on top.</li>
        </ul>
        <p style={{ marginTop:9 }}>The estimate already assumes the training in your plan. That's why logging one workout as a whole-day total would <em>cut</em> your food instead of raising it — the sheet warns you if a number looks like the wrong kind.</p>
      </>
    )},
    { id:"ledger", title:"The deficit ledger", body: (
      <>
        <p>For every day you logged, it works out what you burned minus what you ate, adds them all up, and divides by 3,500 — the calories in a pound of fat.</p>
        <p style={{ marginTop:9 }}>You're at <strong>{Math.round(D.totalDeficit).toLocaleString()} calories banked</strong>, about <strong>{lb} lb</strong>.</p>
        <p style={{ marginTop:9 }}>It's kept separate from the scale on purpose. The scale swings on salt, water and sleep; this only moves when you actually eat under your burn.</p>
      </>
    )},
    { id:"trend", title:"Trend weight vs the scale", body: (
      <>
        <p>Two numbers, and they're not the same thing.</p>
        <p style={{ marginTop:9 }}><strong>Scale weight</strong> is this morning's reading — {D.latest} lb. It moves a couple of pounds either way for reasons that have nothing to do with fat.</p>
        <p style={{ marginTop:9 }}><strong>Trend</strong> is the average of your last seven weigh-ins — {D.latestTrend} lb. One reading is noise; seven make a signal.</p>
        <p style={{ marginTop:9 }}>Judge progress on the trend, always. That's the whole reason it wants a weigh-in every morning, same conditions each time.</p>
      </>
    )},
    { id:"protein", title:"Why protein has its own alarm", body: (
      <>
        <p>{P.proteinTarget}g is a floor, not a target. Eating under your burn means your body takes the weight from somewhere, and protein plus training is what decides whether that's fat or muscle.</p>
        <p style={{ marginTop:9 }}>Losing 30 lb where 8 of it is muscle is a much worse result than the scale makes it look — you end up lighter, weaker and easier to regain on.</p>
        <p style={{ marginTop:9 }}>The <strong>protein rescue</strong> card appears when you're short and nearly out of calories to fix it, so it offers high-protein, low-calorie options rather than just telling you to eat more.</p>
      </>
    )},
    { id:"streak", title:"The streak", body: (
      <>
        <p>Days in a row you logged and got within about 85% of your protein floor. You're on <strong>{D.streak}</strong>.</p>
        <p style={{ marginTop:9 }}>A free day you logged honestly passes straight through without breaking it. That's deliberate — all-or-nothing thinking ends more cuts than any single meal does.</p>
      </>
    )},
    { id:"free", title:"Free days", body: (
      <>
        <p>Mark a party, a meal out or a day you're not cooking as a free day. Log what you can; the week absorbs it.</p>
        <p style={{ marginTop:9 }}>Nothing to make up the next day. You eat normally, the weekly total takes the hit, and the streak survives — which is the point.</p>
      </>
    )},
  ];
};

function Guide({ ctx, only, onDone, onAll }) {
  const all = guideSections(ctx);
  const shown = only ? all.filter(s => s.id === only) : all;
  return (
    <div>
      {shown.map((s,i) => (
        <div key={s.id} style={{ marginTop: i === 0 ? 0 : 18 }}>
          <Eyebrow>{s.title}</Eyebrow>
          <div style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.6, marginTop:6 }}>{s.body}</div>
        </div>
      ))}
      <div style={{ display:"flex", gap:7, marginTop:16 }}>
        <Btn kind="solid" size="md" full onClick={onDone}>Got it</Btn>
        {only && <Btn kind="ghost" size="md" onClick={onAll}>Explain all of it</Btn>}
      </div>
    </div>
  );
}

/* A quiet ? beside a card that isn't self-evident. */
function Why({ onClick, label, dark }) {
  return (
    <button onClick={onClick} className="tapfade" aria-label={`What does ${label} mean?`}
      style={{ width:17, height:17, borderRadius:9, padding:0, flexShrink:0,
        border:`1px solid ${dark ? "rgba(252,252,250,.32)" : "var(--rule)"}`,
        background:"transparent", color: dark ? "rgba(252,252,250,.6)" : "var(--ink3)",
        fontSize:10, fontWeight:700, lineHeight:1 }}>?</button>
  );
}

/* ---------- end of day ---------- */

const Row = ({ k, v, hint }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline",
    padding:"7px 0", borderBottom:"1px solid var(--rule)", gap:12 }}>
    <span style={{ fontSize:12.5, color:"var(--ink2)" }}>{k}</span>
    <span className="mono" style={{ fontSize:12.5, fontWeight:600, textAlign:"right" }}>
      {v}{hint && <span style={{ color:"var(--ink3)", fontWeight:400 }}> {hint}</span>}
    </span>
  </div>
);

/* Computed locally rather than through the API: it costs nothing, works with no
   key and no signal, and every number in it is already derived. An AI note on
   top would read nicer but would make the whole thing unavailable exactly when
   you most want it — sitting in bed at 11pm with one bar. */
function DailyReport({ ctx, onDone }) {
  const { D, date, setTab } = ctx;
  const P = D.P, day = D.day;

  const runMiles  = day.workouts.filter(w=>w.type==="run").reduce((a,w)=>a+(w.miles||0),0);
  const walkMiles = day.workouts.filter(w=>w.type==="walk").reduce((a,w)=>a+(w.miles||0),0);
  const ate = day.food.length > 0;
  const overBy = Math.round(D.cal - D.calTarget);
  const proShort = Math.round(P.proteinTarget - D.pro);

  const wins = [];
  if (day.free) wins.push("You took a free day and logged it honestly. That's the habit that keeps a cut alive.");
  else if (ate && overBy <= 0) wins.push(`Came in at ${Math.round(D.cal).toLocaleString()} against a ${D.calTarget.toLocaleString()} target — ${Math.abs(overBy).toLocaleString()} under.`);
  if (D.pro >= P.proteinTarget) wins.push(`Protein floor cleared: ${Math.round(D.pro)}g of ${P.proteinTarget}g.`);
  if (runMiles > 0) wins.push(`Ran ${round(runMiles,1)} mi.`);
  if (walkMiles > 0) wins.push(`Walked ${round(walkMiles,1)} mi.`);
  if (day.workouts.length > 0 && runMiles === 0 && walkMiles === 0)
    wins.push(`Trained: ${day.workouts.map(w=>w.name).join(", ")}.`);
  if (D.trainingCal > 0) wins.push(`Burned about ${D.trainingCal.toLocaleString()} cal in training.`);
  if (day.steps != null && day.steps >= P.stepTarget) wins.push(`${day.steps.toLocaleString()} steps — target hit.`);
  if ((day.water||0) >= P.waterTarget) wins.push("Water target done.");
  if (day.weight != null) wins.push("Weighed in — the trend line only works if you keep feeding it.");
  if (D.streak >= 2) wins.push(`${D.streak} days logged in a row.`);

  const gaps = [];
  if (!ate) gaps.push("No food logged today. Even a rough guess beats a blank day — the weekly budget is built off these.");
  if (ate && !day.free && overBy > 0)
    gaps.push(`${overBy.toLocaleString()} over target. That's ${round(overBy/3500,2)} lb of this week's loss — spend it out over the next few days rather than starving tomorrow.`);
  if (ate && proShort > 0) gaps.push(`${proShort}g short on protein. That's the one number worth chasing on a cut — it's what keeps the weight you lose from being muscle.`);
  if (day.steps == null) gaps.push("No step count in yet.");
  else if (day.steps < P.stepTarget) gaps.push(`${(P.stepTarget - day.steps).toLocaleString()} steps short.`);
  if (day.weight == null) gaps.push("No weigh-in. Morning, after the bathroom, before food — same conditions every time.");

  const tISO = addDays(date, 1);
  const tmpl = DAY_TEMPLATE[dow(tISO)];
  const tdow = dow(tISO);
  const tMiles = tdow === 1 ? D.wk.mon : tdow === 5 ? D.wk.fri : tdow === 6 ? D.wk.sat : null;
  const newWeek = tdow === 1;

  const toGoal = round(D.latestTrend - P.goalYear, 1);

  return (
    <div>
      <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)" }}>
        {fmtShort(date)} · day {String(daysBetween(P.startDate, date)+1).padStart(3,"0")} · week {D.wk.w} of 21
      </div>

      <div style={{ marginTop:13 }}><Eyebrow>The numbers</Eyebrow></div>
      <div style={{ marginTop:5 }}>
        <Row k="Eaten" v={`${Math.round(D.cal).toLocaleString()}`} hint={day.free ? "free day" : `of ${D.calTarget.toLocaleString()}`} />
        <Row k="Protein" v={`${Math.round(D.pro)}g`} hint={`of ${P.proteinTarget}g`} />
        <Row k="Carbs · Fat" v={`${Math.round(D.carb)}g · ${Math.round(D.fat)}g`} />
        <Row k="Burned" v={D.burn.toLocaleString()} hint={burnLabel(D.burnSource)} />
        <Row k="Steps" v={day.steps != null ? day.steps.toLocaleString() : "—"} hint={`of ${P.stepTarget.toLocaleString()}`} />
        {(runMiles > 0 || walkMiles > 0) &&
          <Row k="Distance" v={`${round(runMiles + walkMiles,1)} mi`} hint={walkMiles > 0 ? `${round(runMiles,1)} run · ${round(walkMiles,1)} walk` : "run"} />}
        <Row k="Weight" v={day.weight != null ? `${day.weight} lb` : "—"} hint={`trend ${D.latestTrend}`} />
      </div>

      {wins.length > 0 && (
        <>
          <div style={{ marginTop:15 }}><Eyebrow color="var(--moss)">What went well</Eyebrow></div>
          <ul style={{ margin:"7px 0 0", paddingLeft:17 }}>
            {wins.map((w,i)=>(
              <li key={i} style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.5, marginBottom:5 }}>{w}</li>
            ))}
          </ul>
        </>
      )}

      {gaps.length > 0 && (
        <>
          <div style={{ marginTop:15 }}><Eyebrow color="var(--bib)">Worth a look</Eyebrow></div>
          <ul style={{ margin:"7px 0 0", paddingLeft:17 }}>
            {gaps.map((g,i)=>(
              <li key={i} style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.5, marginBottom:5 }}>{g}</li>
            ))}
          </ul>
        </>
      )}

      <div style={{ marginTop:16, padding:13, background:"rgba(22,32,43,.04)", borderRadius:5 }}>
        <Eyebrow>Where this leaves you</Eyebrow>
        <div className="dsp" style={{ fontSize:28, marginTop:3 }}>
          {D.latestTrend} <span className="mono" style={{ fontSize:12, color:"var(--ink3)" }}>lb trend</span>
        </div>
        <div style={{ fontSize:12.5, color:"var(--ink2)", marginTop:6, lineHeight:1.55 }}>
          {D.lost > 0
            ? <>Down {round(D.lost,1)} lb from {P.startWeight} since you started, about {round(D.perWeek,2)} lb a week
              {daysBetween(P.startDate, date) < 14 && <> — though that rate is off only {daysBetween(P.startDate, date)+1} days,
                so it's mostly water weight and noise for now</>}. </>
            : <>Still settling in at {P.startWeight}. The trend line needs a couple of weeks of weigh-ins before it means anything. </>}
          {toGoal > 0
            ? <>{toGoal} lb to go to {P.goalYear}.{D.projDate ? <> At this rate that lands around {fmtShort(D.projDate)}.</> : <> Keep logging and a projection will show up here.</>}</>
            : <>You're at or past {P.goalYear}. Worth a conversation about whether to hold here.</>}
        </div>
      </div>

      <div style={{ marginTop:12, padding:13, borderRadius:5, background:"rgba(30,111,217,.07)" }}>
        <Eyebrow color="var(--lane)">Tomorrow — {parseISO(tISO).toLocaleDateString("en-US",{weekday:"long"})}</Eyebrow>
        <div style={{ fontSize:14.5, fontWeight:700, marginTop:4 }}>{tmpl.name}</div>
        {tMiles ? (
          <div className="mono" style={{ fontSize:11, color:"var(--lane)", marginTop:3 }}>{tMiles} mi on the board</div>
        ) : null}
        <div style={{ fontSize:12, color:"var(--ink2)", marginTop:6, lineHeight:1.5 }}>{tmpl.detail}</div>
        {newWeek && (
          <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", marginTop:7 }}>
            New week starts — week {D.wk.w + 1} of 21.
          </div>
        )}
      </div>

      <p style={{ margin:"14px 0 0", fontSize:12.5, color:"var(--ink2)", lineHeight:1.55 }}>
        {gaps.length === 0
          ? "Clean day. Do it again tomorrow and the graph takes care of itself."
          : "One day doesn't decide this. Log tomorrow, hit the protein, and keep the streak honest."}
      </p>

      <div style={{ display:"flex", gap:7, marginTop:14 }}>
        <Btn kind="solid" size="md" full onClick={onDone}>Done</Btn>
        <Btn kind="ghost" size="md" onClick={()=>{ onDone(); ctx.openGuide(); }}>What do these mean?</Btn>
      </div>
    </div>
  );
}

/* ---------- calories burned, and what it does to today's target ---------- */

/* Your eating target is derived: calTarget = burn − deficit. So this sheet is
   really a target editor, and the total-vs-workout distinction decides whether
   the number entered replaces the whole day's burn or gets added on top of a
   resting baseline. Mixing those up is the dangerous case — entering a 500 cal
   run as a whole-day total collapses the target to the 1700 floor. Hence the
   live target readout and the sanity warning: both make a wrong pick visible
   before it's saved. */
function BurnForm({ ctx, onDone }) {
  const { D, date, patchDay, flash } = ctx;
  const [kind, setKind] = useState(D.day.burnKind || "total");
  const [val, setVal] = useState(D.day.burn != null ? String(D.day.burn) : "");
  const [rest, setRest] = useState(D.day.restBurn != null ? String(D.day.restBurn) : "");

  const n = Math.round(+val || 0);
  const restEst = Math.round(D.formulaBurn * 0.62);
  const restN = rest.trim() === "" ? restEst : Math.round(+rest || 0);
  // In training mode a blank input means "follow the logged workouts".
  const act = kind === "training" && val.trim() === "" ? D.trainingCal : n;
  const effBurn = kind === "training" ? Math.round(D.formulaBurn * 0.774 + act)
                : kind === "active" ? restN + n
                : kind === "extra"  ? Math.round(D.formulaBurn + n)
                : n;
  const newTarget = Math.max(1700, Math.round((effBurn - D.P.deficit) / 25) * 25);
  const usualTarget = Math.max(1700, Math.round((D.formulaBurn - D.P.deficit) / 25) * 25);
  const delta = newTarget - usualTarget;

  // A whole-day total below roughly half the estimate isn't a whole day; a
  // whole day's active calories don't run to four figures of this size.
  const looksLikeWorkout = kind === "total" && n > 0 && n < D.formulaBurn * 0.5;
  const looksLikeWholeDay = kind === "active" && n > 2500;

  /* Switching into training mode starts it in auto. Carrying a number over from
     another mode leaves the sheet advertising "follow my training" while a stale
     override drives the target — the headline figure and the math disagree. */
  const pickKind = (k) => { if (k === "training" && kind !== "training") setVal(""); setKind(k); };

  const reset = () => { patchDay(date, { burn:null, restBurn:null, burnKind:"total", burnFrom:null }); flash("Back to the estimate"); onDone(); };
  const save = () => {
    if (kind === "training") {
      // Blank is meaningful here: it means keep following the logged workouts.
      if (val.trim() !== "" && (n <= 0 || n > 12000)) { flash("That doesn't look like a calorie burn", "err"); return; }
      patchDay(date, { burn: val.trim() === "" ? null : n, burnKind:"training", burnFrom:"manual" });
      flash(`Following your training — eat ${newTarget.toLocaleString()} today`);
      onDone(); return;
    }
    if (kind === "active") {
      if (val.trim() === "" && rest.trim() === "") { reset(); return; }
      if (n > 12000 || restN > 12000) { flash("That doesn't look like a calorie burn", "err"); return; }
      patchDay(date, { burn: val.trim() === "" ? null : n, restBurn: rest.trim() === "" ? null : restN,
        burnKind:"active", burnFrom:"manual" });
      flash(`Burn set — eat ${newTarget.toLocaleString()} today`);
      onDone(); return;
    }
    if (val.trim() === "") { reset(); return; }
    if (n <= 0 || n > 12000) { flash("That doesn't look like a calorie burn", "err"); return; }
    patchDay(date, { burn:n, restBurn:null, burnKind:kind, burnFrom:"manual" });
    flash(`Burn set — eat ${newTarget.toLocaleString()} today`);
    onDone();
  };

  return (
    <div>
      <div style={{ marginBottom:7 }}>
        <Toggle color="var(--moss)" value={kind} onPick={pickKind}
          opts={[["training","From my training"]]} />
      </div>
      <Toggle color="var(--ink)" value={kind} onPick={pickKind}
        opts={[["total","Whole day"],["active","Active + resting"],["extra","Extra today"]]} />
      <p style={{ margin:"9px 0 11px", fontSize:12, color:"var(--ink2)", lineHeight:1.5 }}>
        {kind === "training"
          ? "Adds up the calories on the runs, walks and sessions you've logged today, over a light-day baseline. Updates itself as you log more."
          : kind === "total"
          ? "The total your watch shows for the whole day, resting burn included. Replaces the estimate."
          : kind === "active"
          ? "Both halves your watch reports, added together. Active is the whole day's movement, not one workout."
          : "Work that went beyond a normal day for you. Added on top of the estimate."}
      </p>

      {kind === "active" && (
        <div style={{ marginBottom:11 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <div>
              <div className="eyebrow" style={{ fontSize:8, marginBottom:3 }}>active</div>
              <input type="number" inputMode="numeric" step="10" value={val} autoFocus
                onChange={e=>setVal(e.target.value)} placeholder="900"
                style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, textAlign:"center", padding:"10px 4px" }} />
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize:8, marginBottom:3 }}>resting</div>
              <input type="number" inputMode="numeric" step="10" value={rest}
                onChange={e=>setRest(e.target.value)} placeholder={String(restEst)}
                style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, textAlign:"center", padding:"10px 4px" }} />
            </div>
          </div>
          <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", marginTop:7, lineHeight:1.45 }}>
            {n.toLocaleString()} active + {restN.toLocaleString()} resting = <strong style={{ color:"var(--ink2)" }}>{(n + restN).toLocaleString()} total</strong>
            {rest.trim() === "" && <> · resting estimated from your body — type your own if your watch reports it</>}
          </div>
        </div>
      )}

      {kind === "training" && (
        <div style={{ margin:"0 0 11px", padding:"11px 12px", background:"rgba(76,140,74,.09)", borderRadius:5 }}>
          <div className="eyebrow" style={{ color:"var(--moss)" }}>Logged training today</div>
          <div className="dsp" style={{ fontSize:24, color:"var(--moss)", marginTop:2 }}>
            {D.trainingCal.toLocaleString()}<span className="mono" style={{ fontSize:11 }}> cal</span>
          </div>
          <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:3, lineHeight:1.45 }}>
            {D.trainingCal === 0
              ? "Nothing logged yet — log a run, walk or session and this fills in."
              : "Leave the box empty to track this automatically."}
          </div>
        </div>
      )}

      {kind === "extra" && (
        <div style={{ margin:"0 0 11px", padding:"10px 12px", background:"rgba(30,111,217,.07)",
          borderRadius:5, fontSize:11.5, color:"var(--ink2)", lineHeight:1.45 }}>
          Your {D.formulaBurn.toLocaleString()} estimate already assumes the training in your plan —
          the runs, Cindy, court sports. Only put a number here for work that went <em>beyond</em> a
          normal day, or you'll be eating the same calories back twice.
        </div>
      )}

      {kind !== "active" && (
        <input type="number" inputMode="numeric" step="10" value={val} autoFocus
          onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
          placeholder={kind === "training" ? String(D.trainingCal || 0) : kind === "total" ? String(D.formulaBurn) : "400"}
          style={{ fontSize:26, fontFamily:"'IBM Plex Mono',monospace", textAlign:"center", padding:"12px 6px" }} />
      )}

      {(n > 0 || kind === "training" || kind === "active") && (
        <div className="rise" style={{ marginTop:11, padding:"12px 13px", borderRadius:5,
          background: delta >= 0 ? "rgba(76,140,74,.09)" : "rgba(198,65,58,.08)" }}>
          <div className="eyebrow" style={{ color: delta >= 0 ? "var(--moss)" : "var(--warn)" }}>Eat today</div>
          <div className="dsp" style={{ fontSize:30, marginTop:2,
            color: delta >= 0 ? "var(--moss)" : "var(--warn)" }}>{newTarget.toLocaleString()}</div>
          <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", marginTop:3 }}>
            {delta === 0 ? "same as your usual day"
              : `${delta > 0 ? "+" : ""}${delta.toLocaleString()} vs your usual ${usualTarget.toLocaleString()}`}
            {kind !== "total" && ` · ${effBurn.toLocaleString()} total burn`}
          </div>
        </div>
      )}

      {(looksLikeWorkout || looksLikeWholeDay) && (
        <div style={{ marginTop:10, padding:"10px 12px", border:"1px solid var(--warn)", borderRadius:5,
          fontSize:12, color:"var(--ink2)", lineHeight:1.45 }}>
          {looksLikeWorkout
            ? <>That looks like a single workout, not a whole day — a whole day for you is around {D.formulaBurn.toLocaleString()}. Switch to <strong>Just the workout</strong> or your target drops to {newTarget.toLocaleString()}.</>
            : <>That looks like a whole-day total, not one workout. Switch to <strong>Whole day</strong>, or your target jumps to {newTarget.toLocaleString()}.</>}
        </div>
      )}

      <div style={{ display:"flex", gap:7, marginTop:13 }}>
        <Btn kind="solid" size="md" full onClick={save} disabled={val.trim() !== "" && n <= 0}>Save</Btn>
        {(D.day.burn != null || D.day.burnKind === "training") && (
          <Btn kind="ghost" size="md" onClick={reset}>Reset</Btn>
        )}
      </div>
      <div className="mono" style={{ fontSize:9.5, color:"var(--ink3)", marginTop:9, lineHeight:1.5 }}>
        Without a number here the app estimates {D.formulaBurn.toLocaleString()} for you.
        Importing a Garmin summary overwrites whatever you set.
      </div>
    </div>
  );
}

/* ---------- swap the board for whatever you actually feel like ---------- */

function SwapPicker({ ctx, onDone }) {
  const { date, patchDay, flash } = ctx;
  const sched = DAY_TEMPLATE[dow(date)];
  const [custom, setCustom] = useState("");
  return (
    <div>
      <p style={{ margin:"0 0 12px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
        The plan says <strong style={{ color:"var(--ink)" }}>{sched.name}</strong>. Pick anything else —
        it swaps the board for today only, and tomorrow goes back to normal.
      </p>
      {Object.entries(ACT_GROUPS).map(([g,label]) => (
        <div key={g} style={{ marginBottom:13 }}>
          <Eyebrow>{label}</Eyebrow>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:7 }}>
            {ACTIVITIES.filter(a=>a.group===g).map(a => (
              <button key={a.n} className="tapfade"
                onClick={()=>{ patchDay(date, { swap:{ name:a.n, met:a.met,
                  detail:`Swapped in for ${sched.name.toLowerCase()}. Log it on the Train tab when you're done.` } });
                  flash(`${a.n} it is`); onDone(); }}
                style={{ padding:"7px 11px", border:"1px solid var(--rule)", borderRadius:4,
                  fontSize:12.5, fontWeight:600 }}>{a.n}</button>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop:6 }}>
        <Eyebrow>Something else entirely</Eyebrow>
        <div style={{ display:"flex", gap:8, marginTop:7 }}>
          <input type="text" value={custom} onChange={e=>setCustom(e.target.value)}
            placeholder="skate session, dodgeball, whatever" />
          <Btn kind="solid" size="md" disabled={!custom.trim()}
            onClick={()=>{ patchDay(date, { swap:{ name:custom.trim(), met:6.0,
              detail:`Swapped in for ${sched.name.toLowerCase()}.` } }); flash("Board updated"); onDone(); }}>Set</Btn>
        </div>
      </div>
      <div style={{ marginTop:16, paddingTop:13, borderTop:"1px solid var(--rule)" }}>
        <Btn kind="quiet" size="md" full onClick={()=>{
          patchDay(date, { swap:{ name:"Rest day", met:1.2,
            detail:"Called it. Rest is training too — you're in a deficit and running more every week." } });
          flash("Rest day it is"); onDone(); }}>
          Actually, I'm resting today
        </Btn>
      </div>
    </div>
  );
}

/* ---------- free days: logged honestly, absorbed, moved on from ---------- */

function FreeDay({ ctx }) {
  const { D, date, patchDay, addFood, flash } = ctx;
  const free = D.day.free;
  const [sheet, setSheet] = useState(false);

  if (!free) return (
    <button className="tapfade" onClick={()=>{ patchDay(date,{free:true}); flash("Free day — go enjoy it"); }}
      style={{ width:"100%", padding:"12px 14px", border:"1px dashed var(--rule)", borderRadius:6,
        background:"transparent", textAlign:"left", display:"flex", justifyContent:"space-between",
        alignItems:"center", gap:10 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600 }}>Party, dinner out, or a day you're not cooking?</div>
        <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:2, lineHeight:1.4 }}>
          Mark it a free day. Log what you can, and the week absorbs it.
        </div>
      </div>
      <span className="dsp" style={{ fontSize:22, color:"var(--lane)", flexShrink:0 }}>→</span>
    </button>
  );

  return (
    <Card style={{ borderColor:"var(--lane)", background:"rgba(30,111,217,.05)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
        <div>
          <Eyebrow color="var(--lane)">Free day</Eyebrow>
          <div className="dsp" style={{ fontSize:22, marginTop:3 }}>OFF THE LEASH</div>
        </div>
        <Btn kind="quiet" size="sm" onClick={()=>{ patchDay(date,{free:false}); flash("Back on plan"); }}>
          Never mind
        </Btn>
      </div>

      <p style={{ margin:"10px 0 0", fontSize:12.5, color:"var(--ink2)", lineHeight:1.55 }}>
        No target on this one. Log roughly what you had — a guess beats a blank — and it gets
        counted in the week budget above. Nothing to make up for tomorrow: you eat normally,
        the average handles it.
      </p>

      <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
        <Btn kind="lane" size="md" onClick={()=>setSheet("items")}>Log what I had</Btn>
        <Btn kind="ghost" size="md" onClick={()=>setSheet("night")}>Estimate the whole night</Btn>
      </div>

      {D.cal > 0 && (
        <div style={{ marginTop:12, paddingTop:11, borderTop:"1px solid rgba(30,111,217,.25)",
          display:"flex", justifyContent:"space-between" }}>
          <MiniStat label="Logged today" val={`${Math.round(D.cal).toLocaleString()} cal`} />
          <MiniStat label="Over your normal day" val={`+${Math.max(0, Math.round(D.cal - D.calTarget)).toLocaleString()}`} />
          <MiniStat label="Costs you" val={`${round(Math.max(0,(D.cal - D.calTarget))/3500,2)} lb`} hint="of this week's loss" />
        </div>
      )}

      {sheet === "items" && (
        <Sheet onClose={()=>setSheet(false)} title="What was there?">
          <p style={{ margin:"0 0 12px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
            Tap everything you had. Round up rather than down — you're not being graded, you're
            keeping the week's number honest.
          </p>
          {PARTY.map(m => (
            <button key={m.n} className="tapfade"
              onClick={()=>{ addFood({ name:m.n, calories:m.c, protein:m.p, carbs:m.cb, fat:m.f, slot:"snack", party:true }); flash(`${m.n} +${m.c}`); }}
              style={{ width:"100%", textAlign:"left", display:"flex", justifyContent:"space-between",
                alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid var(--rule)" }}>
              <span style={{ fontSize:13, fontWeight:500 }}>{m.n}</span>
              <span className="mono" style={{ fontSize:10.5, color:"var(--ink3)", flexShrink:0 }}>{m.c} · {m.p}p</span>
            </button>
          ))}
          <Btn kind="solid" size="lg" full style={{ marginTop:14 }} onClick={()=>setSheet(false)}>
            Done — {Math.round(D.cal).toLocaleString()} logged
          </Btn>
        </Sheet>
      )}

      {sheet === "night" && (
        <Sheet onClose={()=>setSheet(false)} title="Estimate the whole night">
          <NightEstimate ctx={ctx} onDone={()=>setSheet(false)} />
        </Sheet>
      )}
    </Card>
  );
}

function NightEstimate({ ctx, onDone }) {
  const { addFood, flash } = ctx;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr(null);
    try { setRes(await estimateFood(`An entire night out, all food and drinks combined: ${text}`)); }
    catch (e) { setErr(aiError(e, "Couldn't work that out. Try listing it plainly — 'four beers, three pizza slices, some wings'.")); }
    setBusy(false);
  };

  return (
    <div>
      <p style={{ margin:"0 0 10px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
        Describe the whole thing in one go, drinks included. Best guess is fine — an honest
        estimate beats leaving the day blank, every single time.
      </p>
      <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} autoFocus
        placeholder="cookout — burger, two hot dogs, mac and cheese, chips, 4 beers, slice of cake" />
      <Btn kind="lane" size="md" full style={{ marginTop:9 }} onClick={run} disabled={busy || !text.trim()}>
        {busy ? "Adding it up…" : "Estimate the night"}
      </Btn>
      {err && <div style={{ marginTop:10, fontSize:12.5, color:"var(--warn)", lineHeight:1.45 }}>{err}</div>}
      {res && (
        <div className="rise" style={{ marginTop:14, padding:13, background:"rgba(22,32,43,.04)", borderRadius:5 }}>
          <div style={{ fontSize:14, fontWeight:600 }}>{res.name}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:10 }}>
            {[["cal",res.calories],["protein",res.protein+"g"],["carbs",res.carbs+"g"],["fat",res.fat+"g"]].map(([k,v])=>(
              <div key={k}>
                <div className="eyebrow" style={{ fontSize:8 }}>{k}</div>
                <div className="mono" style={{ fontSize:15, fontWeight:600, marginTop:1 }}>{v}</div>
              </div>
            ))}
          </div>
          {res.note && <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:9, lineHeight:1.4 }}>{res.note}</div>}
          <Btn kind="solid" size="md" full style={{ marginTop:12 }}
            onClick={()=>{ addFood({ name:res.name, calories:Math.round(res.calories), protein:Math.round(res.protein),
              carbs:Math.round(res.carbs), fat:Math.round(res.fat), slot:"snack", estimated:true, party:true });
              flash("Night logged"); onDone(); }}>
            Log the night
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ---------- the week is the unit, not the day ---------- */

function WeekBudget({ ctx }) {
  const { D } = ctx;
  const pct = (D.weekSpent / D.weekBudget) * 100;
  const over = D.weekSpent > D.weekBudget;
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <Eyebrow>Week {D.wk.w} budget</Eyebrow>
            <Why label="the week budget" onClick={()=>ctx.openGuide("budget")} />
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
            <span className="dsp" style={{ fontSize:30 }}>{Math.round(D.weekSpent).toLocaleString()}</span>
            <span className="mono" style={{ fontSize:11, color:"var(--ink3)" }}>/ {D.weekBudget.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <Eyebrow>{D.daysAfter > 0 ? `${D.daysAfter} days left` : "last day"}</Eyebrow>
          <div className="dsp" style={{ fontSize:24, marginTop:3, color: over ? "var(--warn)" : "var(--ink)" }}>
            {D.perDayLeft.toLocaleString()}
          </div>
          <div className="mono" style={{ fontSize:9.5, color:"var(--ink3)" }}>cal/day to land it</div>
        </div>
      </div>
      <div style={{ marginTop:11 }}>
        <Meter pct={pct} color={over ? "var(--warn)" : "var(--bib)"} height={7} />
      </div>
      <div style={{ display:"flex", gap:3, marginTop:9 }}>
        {D.weekDays.map((d,i) => {
          const dd = ctx.state.days[d];
          const c = dd ? dd.food.reduce((a,f)=>a+(f.calories||0),0) : 0;
          const isFree = dd?.free;
          const isToday = d === ctx.date;
          return (
            <div key={d} style={{ flex:1, textAlign:"center" }}>
              <div style={{ height:26, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
                <div style={{ width:"72%", height: c ? `${clamp((c/(D.calTarget*1.6))*26, 3, 26)}px` : "2px",
                  background: !c ? "rgba(22,32,43,.12)" : isFree ? "var(--lane)"
                    : c > D.calTarget ? "var(--warn)" : "var(--bib)",
                  borderRadius:1, opacity: isToday ? 1 : .72 }} />
              </div>
              <div className="mono" style={{ fontSize:8, color: isToday?"var(--ink)":"var(--ink3)",
                fontWeight: isToday?600:400, marginTop:3 }}>
                {["M","T","W","T","F","S","S"][i]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:9, lineHeight:1.45 }}>
        {over
          ? `Over by ${Math.round(D.weekSpent - D.weekBudget).toLocaleString()}. That's roughly ${round((D.weekSpent-D.weekBudget)/3500,1)} lb of this week's loss — not the whole cut. Next week starts clean.`
          : D.freeDaysThisWeek > 0
            ? `${D.freeDaysThisWeek} free day${D.freeDaysThisWeek>1?"s":""} this week, already absorbed into the number above.`
            : "Your body works in weeks, not days. This is the number that actually moves the scale."}
      </div>
    </Card>
  );
}

const MiniStat = ({ label, val, hint, onClick }) => {
  const inner = (
    <>
      <div className="eyebrow" style={{ fontSize:8.5 }}>{label}</div>
      <div className="mono" style={{ fontSize:14, fontWeight:600, marginTop:2 }}>{val}</div>
      {hint && <div className="mono" style={{ fontSize:8.5, color:"var(--ink3)", marginTop:1 }}>{hint}</div>}
    </>
  );
  return onClick
    ? <button onClick={onClick} className="tapfade" aria-label={`Set ${label.toLowerCase()}`}
        style={{ flex:1, minWidth:0, textAlign:"left", background:"transparent", padding:0 }}>{inner}</button>
    : <div style={{ flex:1, minWidth:0 }}>{inner}</div>;
};

/* "estimated" / "from Garmin" / "set by you" — the +bmr variants mean the number
   entered was workout-only and the resting baseline was added on top. */
const burnLabel = (src) =>
  src === "estimate" ? "estimated"
  : src === "manual" ? "set by you"
  : src === "manual+bmr" ? "active, set by you"
  : src === "manual+extra" ? "estimate + extra"
  : src === "garmin+bmr" ? "active, from Garmin"
  : src === "garmin+extra" ? "estimate + extra"
  : src === "training" ? "from your training"
  : src === "training+set" ? "training, adjusted"
  : "from Garmin";

const RunChip = ({ miles }) => (
  <div style={{ border:"1px solid var(--lane)", borderRadius:3, padding:"4px 8px 5px", textAlign:"center", flexShrink:0 }}>
    <div className="dsp" style={{ fontSize:20, color:"var(--lane)" }}>{miles}</div>
    <div className="eyebrow" style={{ fontSize:8, color:"var(--lane)" }}>miles</div>
  </div>
);

function Ledger({ D, ctx }) {
  const poundsEarned = D.totalDeficit / 3500;
  return (
    <Card style={{ background:"var(--ink)", borderColor:"var(--ink)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div className="eyebrow" style={{ color:"rgba(252,252,250,.5)" }}>Deficit ledger</div>
            <Why label="the deficit ledger" dark onClick={()=>ctx.openGuide("ledger")} />
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
            <span className="dsp" style={{ fontSize:34, color:"var(--bib)" }}>{round(poundsEarned,1)}</span>
            <span className="mono" style={{ fontSize:11, color:"rgba(252,252,250,.55)" }}>lb earned</span>
          </div>
          <div className="mono" style={{ fontSize:10, color:"rgba(252,252,250,.45)", marginTop:3 }}>
            {Math.round(D.totalDeficit).toLocaleString()} cal banked
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div className="eyebrow" style={{ color:"rgba(252,252,250,.5)" }}>Miles run</div>
          <div className="dsp" style={{ fontSize:34, color:"#FCFCFA", marginTop:3 }}>{round(D.totalMiles,1)}</div>
          <div className="mono" style={{ fontSize:10, color:"rgba(252,252,250,.45)", marginTop:3 }}>
            26.2 is {round(26.2 - D.wk.sat,1)} past your long run
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   GARMIN IMPORT — drop a screenshot, Claude reads the numbers
   ============================================================ */

function GarminCard({ ctx }) {
  const { D, date, patchDay, addWorkout, flash } = ctx;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [manual, setManual] = useState(false);
  const [mBurn, setMBurn] = useState("");
  const [mSteps, setMSteps] = useState("");
  const inputRef = useRef(null);

  const handle = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("That's not an image. Screenshot the Garmin app and try again."); return; }
    setBusy(true); setErr(null); setResult(null);
    try {
      const b64 = await fileToBase64(file);
      const media = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const r = await readGarminShot(b64, media);
      setResult(r);
    } catch (e) {
      setErr(aiError(e, "Couldn't read that screenshot. Try a tighter crop of just the stats, or enter the numbers by hand below."));
    }
    setBusy(false);
  };

  const apply = () => {
    const r = result;
    const patch = {};
    if (r.totalCalories) { patch.burn = r.totalCalories; patch.burnKind = "total"; patch.burnFrom = "garmin"; }
    else if (r.activeCalories) { patch.burn = r.activeCalories; patch.burnKind = "active"; patch.burnFrom = "garmin"; }
    if (r.steps) patch.steps = r.steps;
    patch.garmin = { ...r, importedAt: Date.now() };
    patchDay(date, patch);

    if (r.isSingleActivity && r.distanceMiles) {
      addWorkout({
        type: /basket|soccer|futsal|cardio|strength/i.test(r.activityName||"") && !/run/i.test(r.activityName||"") ? "sport" : "run",
        name: r.activityName || "Run",
        miles: round(r.distanceMiles,2),
        minutes: r.durationMinutes ? round(r.durationMinutes,1) : null,
        hr: r.avgHeartRate || null,
        calories: r.activeCalories || null,
        source: "garmin",
      });
    }
    flash("Garmin data imported");
    setResult(null);
  };

  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Eyebrow>Garmin import</Eyebrow>
        {D.day.garmin && <span className="mono" style={{ fontSize:9.5, color:"var(--moss)" }}>✓ synced today</span>}
      </div>

      {!result && !busy && (
        <>
          <p style={{ margin:"8px 0 12px", fontSize:13, lineHeight:1.5, color:"var(--ink2)" }}>
            Screenshot your Garmin day summary or a finished activity. It reads calories, steps, distance,
            duration and heart rate, then sets your calorie target off your real burn instead of a formula.
          </p>
          <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }}
            onChange={e => handle(e.target.files?.[0])} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn kind="bib" size="md" onClick={()=>inputRef.current?.click()}>Upload screenshot</Btn>
            <Btn kind="ghost" size="md" onClick={()=>setManual(true)}>Type it in</Btn>
          </div>
          {err && <div style={{ marginTop:10, fontSize:12.5, color:"var(--warn)", lineHeight:1.45 }}>{err}</div>}
          {manual && (
            <div className="rise" style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--rule)" }}>
              <div style={{ display:"flex", gap:9 }}>
                <div style={{ flex:1 }}>
                  <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>Total calories burned</div>
                  <input type="number" inputMode="numeric" value={mBurn} placeholder="2940" autoFocus
                    onChange={e=>setMBurn(e.target.value)}
                    style={{ fontFamily:"'IBM Plex Mono',monospace", textAlign:"center", fontSize:16 }} />
                </div>
                <div style={{ flex:1 }}>
                  <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>Steps</div>
                  <input type="number" inputMode="numeric" value={mSteps} placeholder="11400"
                    onChange={e=>setMSteps(e.target.value)}
                    style={{ fontFamily:"'IBM Plex Mono',monospace", textAlign:"center", fontSize:16 }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <Btn kind="solid" size="sm" full disabled={!mBurn && !mSteps} onClick={()=>{
                  const patch = {};
                  if (+mBurn > 0) { patch.burn = +mBurn; patch.burnKind = "total"; patch.burnFrom = "garmin"; }
                  if (+mSteps > 0) patch.steps = +mSteps;
                  patchDay(date, patch); setManual(false); setMBurn(""); setMSteps(""); flash("Saved");
                }}>Save</Btn>
                <Btn kind="quiet" size="sm" onClick={()=>setManual(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </>
      )}

      {busy && (
        <div style={{ padding:"22px 0", textAlign:"center" }}>
          <div className="pulse dsp" style={{ fontSize:22, color:"var(--bib)" }}>READING THE SCREEN</div>
          <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", marginTop:5 }}>pulling numbers off your watch data</div>
        </div>
      )}

      {result && (
        <div className="rise" style={{ marginTop:10 }}>
          <div style={{ fontSize:12.5, color:"var(--ink2)", marginBottom:10, lineHeight:1.45 }}>{result.readAs}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9 }}>
            {[
              ["Total cal", result.totalCalories],
              ["Active cal", result.activeCalories],
              ["Steps", result.steps?.toLocaleString()],
              ["Distance", result.distanceMiles ? `${round(result.distanceMiles,2)} mi` : null],
              ["Duration", result.durationMinutes ? `${round(result.durationMinutes,0)} min` : null],
              ["Avg HR", result.avgHeartRate],
            ].filter(([,v]) => v != null && v !== "").map(([k,v]) => (
              <div key={k} style={{ padding:"7px 9px", background:"rgba(22,32,43,.04)", borderRadius:4 }}>
                <div className="eyebrow" style={{ fontSize:8.5 }}>{k}</div>
                <div className="mono" style={{ fontSize:14, fontWeight:600, marginTop:2 }}>{v}</div>
              </div>
            ))}
          </div>
          {result.confidence === "low" && (
            <div style={{ marginTop:9, fontSize:11.5, color:"var(--warn)" }}>
              Low confidence read — double check these before you apply them.
            </div>
          )}
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <Btn kind="solid" size="md" onClick={apply} full>Apply to {fmtShort(date)}</Btn>
            <Btn kind="quiet" size="md" onClick={()=>setResult(null)}>Discard</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- weight ---------- */

function WeightCard({ ctx }) {
  const { D, date, patchDay, flash } = ctx;
  const [val, setVal] = useState("");
  const logged = D.day.weight;

  const save = () => {
    const n = parseFloat(val);
    if (isNaN(n) || n < 80 || n > 400) { flash("Enter a weight between 80 and 400", "err"); return; }
    patchDay(date, { weight: n });
    setVal(""); flash(`${n} lb logged`);
  };

  return (
    <Card style={{ padding:14 }}>
      <Eyebrow>Morning weight</Eyebrow>
      {logged != null ? (
        <>
          <div className="dsp" style={{ fontSize:36, marginTop:4 }}>{logged}</div>
          <div className="mono" style={{ fontSize:10, color:"var(--ink3)" }}>
            trend {D.latestTrend} lb
          </div>
          <button onClick={()=>patchDay(date,{weight:null})} className="tapfade"
            style={{ marginTop:7, fontSize:11, color:"var(--ink3)", textDecoration:"underline" }}>change</button>
        </>
      ) : (
        <>
          <input type="number" inputMode="decimal" step="0.1" placeholder="195.4" value={val}
            onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
            style={{ marginTop:8, fontSize:19, fontFamily:"'IBM Plex Mono',monospace" }} />
          <Btn kind="solid" size="sm" onClick={save} full style={{ marginTop:7 }}>Log weight</Btn>
        </>
      )}
    </Card>
  );
}

/* ---------- water ---------- */

function WaterCard({ ctx }) {
  const { D, date, patchDay } = ctx;
  const oz = D.day.water || 0;
  const target = D.P.waterTarget;
  const doubleDay = [1,3,5,6].includes(dow(date));
  const goal = doubleDay ? 128 : target;
  return (
    <Card style={{ padding:14 }}>
      <Eyebrow>Water</Eyebrow>
      <div style={{ display:"flex", alignItems:"baseline", gap:4, marginTop:4 }}>
        <span className="dsp" style={{ fontSize:36, color: oz>=goal?"var(--lane)":"var(--ink)" }}>{oz}</span>
        <span className="mono" style={{ fontSize:10, color:"var(--ink3)" }}>/ {goal} oz</span>
      </div>
      <Meter pct={(oz/goal)*100} color="var(--lane)" height={5} />
      <div style={{ display:"flex", gap:6, marginTop:8 }}>
        {[8,16,32].map(n => (
          <button key={n} className="tapfade" onClick={()=>patchDay(date,{water:oz+n})}
            style={{ flex:1, padding:"6px 0", border:"1px solid var(--rule)", borderRadius:4,
              fontSize:11.5, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace" }}>+{n}</button>
        ))}
      </div>
      {doubleDay && <div className="mono" style={{ fontSize:9, color:"var(--ink3)", marginTop:6 }}>
        double-session day — gallon + electrolytes
      </div>}
    </Card>
  );
}

/* ============================================================
   FOOD
   ============================================================ */

function Food({ ctx }) {
  const { D, date, addFood, removeFood, flash, state, update, patchDay } = ctx;
  const [mode, setMode] = useState(null);      // "library" | "describe" | "manual"
  const [slot, setSlot] = useState("breakfast");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);      // the logged item being edited

  const bySlot = (s) => D.day.food.filter(f => (f.slot||"snack") === s);
  const openAdd = (s) => { setSlot(s); setMode("library"); setQ(""); };

  return (
    <div className="rise" style={{ display:"grid", gap:12 }}>
      <Card style={{ padding:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <Stat label={D.day.free ? "Eaten — free day" : "Eaten"} value={Math.round(D.cal)}
            unit={D.day.free ? "no target" : `of ${D.calTarget}`} size={32}
            color={D.day.free ? "var(--lane)" : undefined} />
          <Stat label="Protein" value={`${Math.round(D.pro)}g`} color={D.pro>=D.P.proteinTarget?"var(--moss)":"var(--ink)"}
            unit={`of ${D.P.proteinTarget}`} size={32} />
        </div>
        <div style={{ marginTop:11 }}><Meter pct={(D.cal/D.calTarget)*100}
          color={D.day.free ? "var(--lane)" : D.cal>D.calTarget ? "var(--warn)" : "var(--bib)"} /></div>
        <div style={{ display:"flex", gap:16, marginTop:11 }}>
          <MiniStat label="Carbs" val={`${Math.round(D.carb)}g`} hint="200–250 target" />
          <MiniStat label="Fat" val={`${Math.round(D.fat)}g`} hint="60–70 target" />
          <MiniStat label="7-day avg" val={`${D.avgCal || "—"}`} hint={`${D.avgPro||0}g protein`} />
        </div>
      </Card>

      <div style={{ display:"flex", gap:8 }}>
        <Btn kind="bib" size="md" onClick={()=>{setMode("describe"); setSlot("dinner");}} full>✦ Describe a meal</Btn>
        <Btn kind="ghost" size="md" onClick={()=>{setMode("manual"); setSlot("snack");}}>Manual</Btn>
      </div>

      <button className="tapfade" onClick={()=>setMode("suggest")}
        style={{ padding:"10px 12px", border:"1px dashed var(--rule)", borderRadius:5, textAlign:"left",
          fontSize:12.5, color:"var(--ink2)", background:"transparent" }}>
        Hungry but don't know what you want?{" "}
        <strong style={{ color:"var(--bib)" }}>Find something that fits →</strong>
      </button>

      {!D.day.free && (
        <button className="tapfade" onClick={()=>{ patchDay(date,{free:true}); flash("Free day — go enjoy it"); }}
          style={{ padding:"9px 12px", border:"1px dashed var(--rule)", borderRadius:5, textAlign:"left",
            fontSize:12.5, color:"var(--ink2)", background:"transparent" }}>
          Eating out or at a party today? <strong style={{ color:"var(--lane)" }}>Make it a free day →</strong>
        </button>
      )}

      {MEAL_SLOTS.map(s => {
        const items = bySlot(s);
        const cal = items.reduce((a,f)=>a+(f.calories||0),0);
        const pro = items.reduce((a,f)=>a+(f.protein||0),0);
        return (
          <Card key={s} style={{ padding:"13px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <Eyebrow>{SLOT_LABEL[s]}</Eyebrow>
              <span className="mono" style={{ fontSize:11, color:"var(--ink3)" }}>
                {cal ? `${Math.round(cal)} cal · ${Math.round(pro)}g p` : ""}
              </span>
            </div>
            {items.length === 0 ? (
              <button onClick={()=>openAdd(s)} className="tapfade"
                style={{ width:"100%", marginTop:9, padding:"11px 0", border:"1px dashed var(--rule)",
                  borderRadius:4, fontSize:12.5, color:"var(--ink3)", fontWeight:500 }}>
                Nothing logged — add {SLOT_LABEL[s].toLowerCase()}
              </button>
            ) : (
              <>
                <div style={{ marginTop:8 }}>
                  {items.map(f => (
                    <div key={f.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0",
                      borderBottom:"1px solid var(--rule)" }}>
                      <button onClick={()=>setEdit(f)} className="tapfade" aria-label={`Edit ${f.name}`}
                        style={{ flex:1, minWidth:0, textAlign:"left", background:"transparent", padding:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, lineHeight:1.3 }}>{f.name}</div>
                        <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:2 }}>
                          {f.qty > 0 && f.unit ? `${+(+f.qty).toFixed(2)} ${f.unit} · ` : ""}
                          {Math.round(f.calories)} cal · {Math.round(f.protein)}p · {Math.round(f.carbs)}c · {Math.round(f.fat)}f
                          {f.estimated && <span style={{ color:"var(--bib)" }}> · est</span>}
                          {f.party && <span style={{ color:"var(--lane)" }}> · free</span>}
                        </div>
                      </button>
                      <button onClick={()=>removeFood(f.id)} className="tapfade" aria-label={`Remove ${f.name}`}
                        style={{ color:"var(--ink3)", fontSize:16, padding:"2px 4px" }}>×</button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>openAdd(s)} className="tapfade"
                  style={{ marginTop:9, fontSize:12, fontWeight:600, color:"var(--bib)" }}>+ Add more</button>
              </>
            )}
          </Card>
        );
      })}

      {mode && (
        <Sheet onClose={()=>setMode(null)} title={
          mode==="library" ? `Add to ${SLOT_LABEL[slot].toLowerCase()}` :
          mode==="describe" ? "Describe what you ate" :
          mode==="suggest" ? "What should I eat?" : "Manual entry"}>
          {mode==="library" && <Library q={q} setQ={setQ} slot={slot} setSlot={setSlot} ctx={ctx} onDone={()=>setMode(null)} />}
          {mode==="describe" && <Describe slot={slot} ctx={ctx} onDone={()=>setMode(null)} />}
          {mode==="suggest" && <Suggest ctx={ctx} onDone={()=>setMode(null)} />}
          {mode==="manual" && <Manual slot={slot} setSlot={setSlot} ctx={ctx} onDone={()=>setMode(null)} />}
        </Sheet>
      )}

      {edit && (
        <Sheet onClose={()=>setEdit(null)} title="Edit meal">
          <EditFood item={edit} ctx={ctx} onDone={()=>setEdit(null)} />
        </Sheet>
      )}
    </div>
  );
}

function Sheet({ children, onClose, title }) {
  useEffect(() => {
    const esc = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  /* Portalled to <body> deliberately. Each tab renders inside a .rise wrapper,
     and hcrise finishes on an identity matrix rather than transform:none — which
     is still enough to make that wrapper the containing block for position:fixed
     children. Rendered in place, the overlay sizes itself to the tab instead of
     the viewport and hangs off the bottom of the screen, cutting off whatever
     sits last in the sheet. Don't inline this back. */
  return createPortal(
    /* The .hc class carries every design token (--card, --ink, --rule) and the
       `.hc input` rules, and it lives on the app root — which we've just escaped
       by portalling to <body>. Re-apply it here or the sheet renders unstyled.
       Its own page-level layout (full-height flow background, safe-area padding)
       is zeroed out; the overlay inside is position:fixed and does the painting. */
    <div className="hc" style={{ minHeight:0, background:"transparent", paddingTop:0 }}>
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(22,32,43,.42)",
      zIndex:70, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} className="rise"
        style={{ background:"var(--card)", width:"100%", maxWidth:520, maxHeight:"88vh", overflowY:"auto",
          borderRadius:"10px 10px 0 0", padding:"16px 16px 26px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
          <div className="dsp" style={{ fontSize:22 }}>{title.toUpperCase()}</div>
          <button onClick={onClose} className="tapfade" aria-label="Close"
            style={{ fontSize:21, color:"var(--ink3)", lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
    </div>,
    document.body
  );
}

function Library({ q, setQ, slot, setSlot, ctx, onDone }) {
  const { addFood, flash, state } = ctx;
  const all = [
    ...state.customFoods.map(f=>({ n:f.name, c:f.calories, p:f.protein, cb:f.carbs, f:f.fat, m:f.slot, custom:true })),
    ...MEALS,
    ...PARTY.map(m=>({ ...m, m:"party" })),
  ];
  const list = all.filter(m => !q || m.n.toLowerCase().includes(q.toLowerCase()));
  const grouped = q ? { "Results": list } : [...MEAL_SLOTS, "party"].reduce((o,s) => {
    o[s === "party" ? "Night out & takeout" : SLOT_LABEL[s]] = list.filter(m => m.m === s); return o;
  }, {});
  return (
    <div>
      <input type="text" placeholder="Search meals, drinks, takeout…" value={q} onChange={e=>setQ(e.target.value)} autoFocus />
      <div style={{ display:"flex", gap:5, margin:"11px 0 4px" }}>
        {MEAL_SLOTS.map(s => (
          <button key={s} onClick={()=>setSlot(s)} className="tapfade"
            style={{ flex:1, padding:"6px 0", borderRadius:4, fontSize:11, fontWeight:600,
              background: slot===s ? "var(--ink)" : "transparent", color: slot===s ? "#FCFCFA" : "var(--ink3)",
              border: slot===s ? "1px solid var(--ink)" : "1px solid var(--rule)" }}>
            {SLOT_LABEL[s].split(" ")[0]}
          </button>
        ))}
      </div>
      {Object.entries(grouped).map(([label, items]) => items.length === 0 ? null : (
        <div key={label} style={{ marginTop:14 }}>
          <Eyebrow>{label}</Eyebrow>
          <div style={{ marginTop:6 }}>
            {items.map(m => (
              <button key={m.n} className="tapfade"
                onClick={()=>{ addFood({ name:m.n, calories:m.c, protein:m.p, carbs:m.cb, fat:m.f, slot }); flash(`${m.n} logged`); onDone(); }}
                style={{ width:"100%", textAlign:"left", display:"flex", justifyContent:"space-between",
                  alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--rule)" }}>
                <span style={{ fontSize:13, fontWeight:500 }}>{m.n}{m.custom && <span className="mono" style={{ fontSize:9, color:"var(--bib)" }}> ★</span>}</span>
                <span className="mono" style={{ fontSize:10.5, color:"var(--ink3)", flexShrink:0 }}>{m.c} · {m.p}p</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div style={{ padding:"22px 0", textAlign:"center", color:"var(--ink3)", fontSize:13 }}>
          Nothing matches "{q}". Close this and hit Describe a meal — it'll work out the macros.
        </div>
      )}
    </div>
  );
}

function Describe({ slot, ctx, onDone }) {
  const { addFood, flash, update } = ctx;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr(null);
    try { setRes(await estimateFood(text)); }
    catch (e) { setErr(aiError(e, "Couldn't work that one out. Try adding a portion size — 'two cups', '8 oz', 'a fist-sized scoop'.")); }
    setBusy(false);
  };

  const save = (alsoSave) => {
    const item = { name:res.name, calories:Math.round(res.calories), protein:Math.round(res.protein),
      carbs:Math.round(res.carbs), fat:Math.round(res.fat), slot:res.slot||slot, estimated:true };
    addFood(item);
    if (alsoSave) update(s => { s.customFoods = [...s.customFoods.filter(f=>f.name!==item.name), item]; return s; });
    flash(alsoSave ? "Logged and saved to your library" : `${item.name} logged`);
    onDone();
  };

  return (
    <div>
      <p style={{ margin:"0 0 10px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
        Write it how you'd say it out loud. Portion sizes make the estimate much sharper.
      </p>
      <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} autoFocus
        placeholder="chipotle chicken bowl, brown rice, black beans, fajitas, mild salsa, no cheese" />
      <Btn kind="bib" size="md" full style={{ marginTop:9 }} onClick={run} disabled={busy || !text.trim()}>
        {busy ? "Working it out…" : "Estimate macros"}
      </Btn>
      {err && <div style={{ marginTop:10, fontSize:12.5, color:"var(--warn)", lineHeight:1.45 }}>{err}</div>}
      {res && (
        <div className="rise" style={{ marginTop:14, padding:13, background:"rgba(22,32,43,.04)", borderRadius:5 }}>
          <div style={{ fontSize:14, fontWeight:600 }}>{res.name}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:10 }}>
            {[["cal",res.calories],["protein",res.protein+"g"],["carbs",res.carbs+"g"],["fat",res.fat+"g"]].map(([k,v])=>(
              <div key={k}>
                <div className="eyebrow" style={{ fontSize:8 }}>{k}</div>
                <div className="mono" style={{ fontSize:15, fontWeight:600, marginTop:1 }}>{v}</div>
              </div>
            ))}
          </div>
          {res.note && <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:9, lineHeight:1.4 }}>{res.note}</div>}
          <div style={{ display:"flex", gap:7, marginTop:12 }}>
            <Btn kind="solid" size="sm" onClick={()=>save(false)} full>Log it</Btn>
            <Btn kind="ghost" size="sm" onClick={()=>save(true)}>Log + save ★</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Manual({ slot, setSlot, ctx, onDone }) {
  const { addFood, flash, update } = ctx;
  const [f, setF] = useState({ name:"", calories:"", protein:"", carbs:"", fat:"" });
  const set = (k,v) => setF(p => ({ ...p, [k]:v }));
  const ok = f.name.trim() && f.calories !== "";
  const submit = (save) => {
    const item = { name:f.name.trim(), calories:+f.calories||0, protein:+f.protein||0,
      carbs:+f.carbs||0, fat:+f.fat||0, slot };
    addFood(item);
    if (save) update(s => { s.customFoods = [...s.customFoods.filter(x=>x.name!==item.name), item]; return s; });
    flash(`${item.name} logged`); onDone();
  };
  return (
    <div>
      <input type="text" placeholder="What is it?" value={f.name} onChange={e=>set("name",e.target.value)} autoFocus />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7, marginTop:9 }}>
        {[["calories","cal"],["protein","P"],["carbs","C"],["fat","F"]].map(([k,l])=>(
          <div key={k}>
            <div className="eyebrow" style={{ fontSize:8, marginBottom:3 }}>{l}</div>
            <input type="number" inputMode="numeric" value={f[k]} onChange={e=>set(k,e.target.value)}
              style={{ fontFamily:"'IBM Plex Mono',monospace", padding:"8px 6px", textAlign:"center" }} />
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:5, marginTop:11 }}>
        {MEAL_SLOTS.map(s => (
          <button key={s} onClick={()=>setSlot(s)} className="tapfade"
            style={{ flex:1, padding:"6px 0", borderRadius:4, fontSize:11, fontWeight:600,
              background: slot===s?"var(--ink)":"transparent", color: slot===s?"#FCFCFA":"var(--ink3)",
              border: slot===s?"1px solid var(--ink)":"1px solid var(--rule)" }}>
            {SLOT_LABEL[s].split(" ")[0]}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", gap:7, marginTop:13 }}>
        <Btn kind="solid" size="md" onClick={()=>submit(false)} disabled={!ok} full>Log it</Btn>
        <Btn kind="ghost" size="md" onClick={()=>submit(true)} disabled={!ok}>Log + save ★</Btn>
      </div>
    </div>
  );
}

const UNITS = ["cup", "oz", "g", "tbsp", "piece", "serving"];

/* Edit a meal that's already logged: rename it, set the portion, override any
   macro, move it to another slot.

   Amount and macros are linked through `per` — the macros for one unit. Typing
   an amount rescales from that baseline (2 cups = twice 1 cup), and typing a
   macro rewrites the baseline so the next amount change stays consistent.
   Round-tripping 1 → 3 → 1 lands back where it started, which a
   multiply-in-place approach doesn't. */
function EditFood({ item, ctx, onDone }) {
  const { updateFood, removeFood, update, flash } = ctx;
  const [name, setName] = useState(item.name);
  const [slot, setSlot] = useState(item.slot || "snack");
  const [qty, setQty] = useState(item.qty > 0 ? String(item.qty) : "1");
  const [unit, setUnit] = useState(item.unit || "");
  const [confirmDel, setConfirmDel] = useState(false);
  const [m, setM] = useState({
    calories: Math.round(item.calories || 0), protein: Math.round(item.protein || 0),
    carbs: Math.round(item.carbs || 0), fat: Math.round(item.fat || 0),
  });
  /* qty and per drive the arithmetic, so they live in refs and are written
     synchronously. Reading them from state instead would make two taps of + in
     the same tick both scale from the same stale value — 1 → 1.5 → 1.5. */
  const qtyRef = useRef(item.qty > 0 ? String(item.qty) : "1");
  const perRef = useRef(null);
  if (perRef.current === null) {
    const q = +item.qty > 0 ? +item.qty : 1;
    perRef.current = { calories:(item.calories||0)/q, protein:(item.protein||0)/q,
      carbs:(item.carbs||0)/q, fat:(item.fat||0)/q };
  }

  const applyQty = (v) => {
    qtyRef.current = v;
    setQty(v);
    const q = +v, per = perRef.current;
    if (q > 0) setM({ calories:Math.round(per.calories*q), protein:Math.round(per.protein*q),
      carbs:Math.round(per.carbs*q), fat:Math.round(per.fat*q) });
  };
  const step = (delta) => {
    const next = Math.max(0.5, Math.round(((+qtyRef.current || 1) + delta) * 2) / 2);
    applyQty(String(next));
  };
  const setMacro = (k, v) => {
    setM(p => ({ ...p, [k]:v }));
    const q = +qtyRef.current > 0 ? +qtyRef.current : 1;
    perRef.current = { ...perRef.current, [k]:(+v || 0) / q };
  };

  const ok = name.trim() !== "";
  const save = (alsoLibrary) => {
    const patch = {
      name: name.trim(), slot,
      calories:+m.calories||0, protein:+m.protein||0, carbs:+m.carbs||0, fat:+m.fat||0,
      qty: +qty > 0 ? +qty : null,
      unit: unit.trim() || null,
    };
    updateFood(item.id, patch);
    if (alsoLibrary) update(s => {
      s.customFoods = [...s.customFoods.filter(x => x.name !== patch.name), { ...patch }];
      return s;
    });
    flash(alsoLibrary ? "Updated and saved to your library" : "Meal updated");
    onDone();
  };

  return (
    <div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="What is it?" />

      <div style={{ marginTop:13 }}><Eyebrow>How much</Eyebrow></div>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:7 }}>
        <button onClick={()=>step(-0.5)} className="tapfade" aria-label="Less"
          style={{ width:38, padding:"9px 0", border:"1px solid var(--rule)", borderRadius:4,
            fontSize:16, fontWeight:600, background:"transparent" }}>−</button>
        <input type="number" inputMode="decimal" step="0.5" min="0" value={qty}
          onChange={e=>applyQty(e.target.value)}
          style={{ width:64, textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", padding:"8px 4px" }} />
        <button onClick={()=>step(0.5)} className="tapfade" aria-label="More"
          style={{ width:38, padding:"9px 0", border:"1px solid var(--rule)", borderRadius:4,
            fontSize:16, fontWeight:600, background:"transparent" }}>+</button>
        <input type="text" value={unit} onChange={e=>setUnit(e.target.value)} placeholder="cups, oz, g…"
          style={{ flex:1, padding:"8px 10px" }} />
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:7 }}>
        {UNITS.map(u => (
          <button key={u} onClick={()=>setUnit(unit===u ? "" : u)} className="tapfade"
            style={{ padding:"5px 10px", borderRadius:4, fontSize:11, fontWeight:600,
              background: unit===u ? "var(--ink)" : "transparent",
              color: unit===u ? "#FCFCFA" : "var(--ink3)",
              border: unit===u ? "1px solid var(--ink)" : "1px solid var(--rule)" }}>{u}</button>
        ))}
      </div>
      <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:8, lineHeight:1.45 }}>
        Changing the amount scales the macros below. Type over any number to set it yourself.
      </div>

      <div style={{ marginTop:14 }}><Eyebrow>Macros</Eyebrow></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7, marginTop:7 }}>
        {[["calories","cal"],["protein","P"],["carbs","C"],["fat","F"]].map(([k,l])=>(
          <div key={k}>
            <div className="eyebrow" style={{ fontSize:8, marginBottom:3 }}>{l}</div>
            <input type="number" inputMode="numeric" value={m[k]} onChange={e=>setMacro(k, e.target.value)}
              style={{ fontFamily:"'IBM Plex Mono',monospace", padding:"8px 6px", textAlign:"center" }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop:14 }}><Eyebrow>Meal</Eyebrow></div>
      <div style={{ display:"flex", gap:5, marginTop:7 }}>
        {MEAL_SLOTS.map(s => (
          <button key={s} onClick={()=>setSlot(s)} className="tapfade"
            style={{ flex:1, padding:"6px 0", borderRadius:4, fontSize:11, fontWeight:600,
              background: slot===s?"var(--ink)":"transparent", color: slot===s?"#FCFCFA":"var(--ink3)",
              border: slot===s?"1px solid var(--ink)":"1px solid var(--rule)" }}>
            {SLOT_LABEL[s].split(" ")[0]}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:7, marginTop:15 }}>
        <Btn kind="solid" size="md" onClick={()=>save(false)} disabled={!ok} full>Save</Btn>
        <Btn kind="ghost" size="md" onClick={()=>save(true)} disabled={!ok}>Save + ★</Btn>
      </div>

      {confirmDel ? (
        <div style={{ marginTop:13, padding:11, border:"1px solid var(--warn)", borderRadius:5 }}>
          <div style={{ fontSize:12.5, color:"var(--ink2)" }}>Remove this from today's log?</div>
          <div style={{ display:"flex", gap:7, marginTop:9 }}>
            <Btn kind="quiet" size="sm" full onClick={()=>setConfirmDel(false)}>Keep it</Btn>
            <Btn kind="bib" size="sm" full onClick={()=>{ removeFood(item.id); flash("Removed"); onDone(); }}>Remove</Btn>
          </div>
        </div>
      ) : (
        <button className="tapfade" onClick={()=>setConfirmDel(true)}
          style={{ marginTop:13, fontSize:11.5, color:"var(--ink3)", textDecoration:"underline", display:"block" }}>
          Remove from log
        </button>
      )}
    </div>
  );
}

/* ============================================================
   TRAIN
   ============================================================ */

function Train({ ctx }) {
  const { D, date, addWorkout, removeWorkout, flash, state } = ctx;
  const [sheet, setSheet] = useState(null);
  const [editW, setEditW] = useState(null);   // the logged workout being edited
  const sched = DAY_TEMPLATE[dow(date)];
  const milePct = D.weekTarget ? (D.weekMiles / D.weekTarget) * 100 : 0;

  const lastCindy = state.benchmarks.length ? state.benchmarks[state.benchmarks.length-1] : null;
  const bestCindy = state.benchmarks.reduce((b,x) => !b || x.rounds > b.rounds ? x : b, null);

  return (
    <div className="rise" style={{ display:"grid", gap:12 }}>

      {/* weekly mileage */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <Eyebrow color="var(--lane)">Week {D.wk.w} mileage</Eyebrow>
            <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:3 }}>
              <span className="dsp" style={{ fontSize:38, color:"var(--lane)" }}>{round(D.weekMiles,1)}</span>
              <span className="mono" style={{ fontSize:12, color:"var(--ink3)" }}>/ {D.weekTarget} mi</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <Eyebrow>Remaining</Eyebrow>
            <div className="dsp" style={{ fontSize:24, marginTop:3,
              color: D.weekMiles >= D.weekTarget ? "var(--moss)" : "var(--ink)" }}>
              {D.weekMiles >= D.weekTarget ? "DONE" : `${round(D.weekTarget - D.weekMiles,1)} mi`}
            </div>
          </div>
        </div>
        <div style={{ marginTop:12 }}><Meter pct={milePct} color="var(--lane)" height={7} /></div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
          {[["Mon",D.wk.mon,1],["Fri",D.wk.fri,5],["Sat",D.wk.sat,6]].map(([l,m,dnum]) => {
            const dayISO = addDays(D.wkStart, dnum===0?6:dnum-1);
            const done = (state.days[dayISO]?.workouts||[]).filter(w=>w.type==="run").reduce((a,w)=>a+(w.miles||0),0);
            return (
              <div key={l} style={{ textAlign:"center", flex:1 }}>
                <div className="eyebrow" style={{ fontSize:8.5 }}>{l}</div>
                <div className="mono" style={{ fontSize:13, fontWeight:600, marginTop:2,
                  color: done >= m ? "var(--moss)" : "var(--ink2)" }}>
                  {done > 0 ? round(done,1) : "—"}<span style={{ color:"var(--ink3)", fontWeight:400 }}>/{m}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* logging buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <Btn kind="lane" size="lg" onClick={()=>setSheet("run")}>Run or walk</Btn>
        <Btn kind="solid" size="lg" onClick={()=>setSheet("strength")}>Log strength</Btn>
        <Btn kind="bib" size="lg" onClick={()=>setSheet("cindy")}>Start Cindy</Btn>
        <Btn kind="ghost" size="lg" onClick={()=>setSheet("session")}>Any session</Btn>
      </div>

      {/* today's log */}
      <Card>
        <Eyebrow>Logged {fmtShort(date)}</Eyebrow>
        {D.day.workouts.length === 0 ? (
          <div style={{ marginTop:10, padding:"14px 0", fontSize:13, color:"var(--ink3)", lineHeight:1.5 }}>
            Nothing yet. {D.swap
              ? <>You swapped in <strong style={{ color:"var(--ink2)" }}>{D.swap.name}</strong> today.</>
              : <>The board says <strong style={{ color:"var(--ink2)" }}>{sched.name}</strong>.</>}
          </div>
        ) : (
          <div style={{ marginTop:8 }}>
            {D.day.workouts.map(w => (
              <div key={w.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0",
                borderBottom:"1px solid var(--rule)" }}>
                <div style={{ width:3, alignSelf:"stretch", borderRadius:2, background:
                  w.type==="run"?"var(--lane)":w.type==="cindy"?"var(--bib)":(w.type==="sport"||w.type==="session"||w.type==="walk")?"var(--moss)":"var(--ink2)" }} />
                <button onClick={()=>setEditW(w)} className="tapfade" aria-label={`Edit ${w.name}`}
                  style={{ flex:1, minWidth:0, textAlign:"left", background:"transparent", padding:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600 }}>{w.name}</div>
                  <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", marginTop:2 }}>
                    {w.miles ? `${round(w.miles,2)} mi · ` : ""}
                    {w.minutes ? `${round(w.minutes,0)} min · ` : ""}
                    {w.miles && w.minutes ? `${fmtPace(paceOf(w.miles,w.minutes))}/mi · ` : ""}
                    {w.rounds != null ? `${w.rounds} rounds${w.reps?` + ${w.reps}`:""} · ` : ""}
                    {w.hr ? `${w.hr} bpm · ` : ""}
                    {w.calories ? `~${w.calories} cal · ` : ""}
                    {w.source==="garmin" ? "garmin" : "manual"}
                  </div>
                </button>
                <button onClick={()=>removeWorkout(w.id)} className="tapfade" aria-label={`Remove ${w.name}`}
                  style={{ color:"var(--ink3)", fontSize:16, padding:"2px 4px" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* cindy board */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", background:"var(--ink)" }}>
          <div className="eyebrow" style={{ color:"rgba(252,252,250,.5)" }}>The Cindy board</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:5 }}>
            <div>
              <div className="dsp" style={{ fontSize:38, color:"var(--bib)" }}>
                {bestCindy ? bestCindy.rounds : "—"}
              </div>
              <div className="mono" style={{ fontSize:9.5, color:"rgba(252,252,250,.5)" }}>
                {bestCindy ? `best · ${fmtShort(bestCindy.date)}` : "no score yet"}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="dsp" style={{ fontSize:24, color:"#FCFCFA" }}>{lastCindy ? lastCindy.rounds : "—"}</div>
              <div className="mono" style={{ fontSize:9.5, color:"rgba(252,252,250,.5)" }}>last attempt</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"12px 16px 14px" }}>
          <div style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
            5 pull-ups · 10 push-ups · 15 air squats. As many rounds as possible in 20 minutes.
          </div>
          {state.benchmarks.length > 1 && (
            <div style={{ marginTop:12, height:56 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.benchmarks.map(b=>({ d:fmtShort(b.date), r:b.rounds }))}>
                  <XAxis dataKey="d" tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }} axisLine={false} tickLine={false} />
                  <Bar dataKey="r" fill="#FF4D19" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {sheet==="run" && <Sheet onClose={()=>setSheet(null)} title="Log a run or walk"><RunForm ctx={ctx} onDone={()=>setSheet(null)} /></Sheet>}
      {sheet==="strength" && <Sheet onClose={()=>setSheet(null)} title="Log strength"><StrengthForm ctx={ctx} onDone={()=>setSheet(null)} /></Sheet>}
      {sheet==="session" && <Sheet onClose={()=>setSheet(null)} title="Log any session"><SessionForm ctx={ctx} onDone={()=>setSheet(null)} /></Sheet>}
      {sheet==="cindy" && <Sheet onClose={()=>setSheet(null)} title="Cindy — 20 min AMRAP"><Cindy ctx={ctx} onDone={()=>setSheet(null)} /></Sheet>}
      {editW && <Sheet onClose={()=>setEditW(null)} title="Edit workout"><EditWorkout item={editW} ctx={ctx} onDone={()=>setEditW(null)} /></Sheet>}
    </div>
  );
}

/* Module level, same reason as NumField — a component declared inside another
   component's render is a new type every render and gets remounted. */
function Toggle({ opts, value, onPick, color }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {opts.map(([k,l])=>(
        <button key={k} onClick={()=>onPick(k)} className="tapfade"
          style={{ flex:1, padding:"7px 0", borderRadius:4, fontSize:11.5, fontWeight:600,
            background: value===k?color:"transparent", color: value===k?"#fff":"var(--ink3)",
            border: value===k?`1px solid ${color}`:"1px solid var(--rule)" }}>{l}</button>
      ))}
    </div>
  );
}

/* Runs and walks share this form. They are stored as different workout types on
   purpose: weekMiles, the plan bar and the per-day dots all filter on
   type === "run", so typing a walk as a run would quietly count walking miles
   toward the week's running target. A treadmill run is still a run and still
   counts — only the surface differs. */
function RunForm({ ctx, onDone }) {
  const { addWorkout, flash, D } = ctx;
  const [m, setM] = useState(""); const [t, setT] = useState(""); const [hr, setHr] = useState("");
  const [kind, setKind] = useState("easy");
  const [mode, setMode] = useState("run");          // run | walk
  const [surface, setSurface] = useState("outside"); // outside | treadmill
  const [kcal, setKcal] = useState("");              // blank = use the estimate
  const pace = paceOf(+m, +t);
  const isWalk = mode === "walk";

  const estKcal = activityCalories({ miles:m, minutes:t, lbs:D.latest, walking:isWalk });
  const finalKcal = kcal.trim() !== "" ? Math.round(+kcal) || 0 : estKcal;

  const baseName = isWalk ? "Walk"
    : kind==="long" ? "Long Run" : kind==="tempo" ? "Tempo Run" : "Easy Run";
  const name = surface==="treadmill" ? `Treadmill ${baseName}` : baseName;

  return (
    <div>
      <div style={{ marginBottom:8 }}>
        <Toggle opts={[["run","Run"],["walk","Walk"]]} value={mode} onPick={setMode} color="var(--ink)" />
      </div>
      <div style={{ marginBottom:8 }}>
        <Toggle opts={[["outside","Outside"],["treadmill","Treadmill"]]} value={surface} onPick={setSurface} color="var(--ink2)" />
      </div>
      {!isWalk && (
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {[["easy","Easy / Zone 2"],["long","Long run"],["tempo","Tempo"]].map(([k,l])=>(
            <button key={k} onClick={()=>setKind(k)} className="tapfade"
              style={{ flex:1, padding:"7px 0", borderRadius:4, fontSize:11.5, fontWeight:600,
                background: kind===k?"var(--lane)":"transparent", color: kind===k?"#fff":"var(--ink3)",
                border: kind===k?"1px solid var(--lane)":"1px solid var(--rule)" }}>{l}</button>
          ))}
        </div>
      )}
      {isWalk && (
        <div style={{ fontSize:11.5, color:"var(--ink3)", marginBottom:12, lineHeight:1.45 }}>
          Walk miles are logged separately and don't count toward the week's running target.
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9 }}>
        {[["Miles",m,setM,"4.0"],["Minutes",t,setT,"38"],["Avg HR",hr,setHr,"148"]].map(([l,v,set,ph])=>(
          <div key={l}>
            <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>{l}</div>
            <input type="number" inputMode="decimal" step="0.01" value={v} placeholder={ph}
              onChange={e=>set(e.target.value)}
              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, textAlign:"center", padding:"9px 4px" }} />
          </div>
        ))}
      </div>
      {pace && (
        <div style={{ marginTop:12, padding:"11px 13px", background:"rgba(30,111,217,.07)", borderRadius:5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div className="eyebrow" style={{ color:"var(--lane)" }}>Pace</div>
              <div className="dsp" style={{ fontSize:26, color:"var(--lane)", marginTop:2 }}>{fmtPace(pace)}<span className="mono" style={{ fontSize:11 }}> /mi</span></div>
            </div>
            {hr && +hr > 165 && kind === "easy" && !isWalk && (
              <div style={{ fontSize:11, color:"var(--warn)", textAlign:"right", maxWidth:170, lineHeight:1.4 }}>
                {hr} bpm is above Zone 2. The plan wants 80% of miles conversational — slow this one down next time.
              </div>
            )}
          </div>
        </div>
      )}
      {estKcal > 0 && (
        <div style={{ marginTop:11 }}>
          <Eyebrow>Calories burned</Eyebrow>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:6 }}>
            <input type="number" inputMode="numeric" step="10" value={kcal}
              onChange={e=>setKcal(e.target.value)} placeholder={String(estKcal)}
              style={{ width:96, textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", padding:"9px 4px" }} />
            <div className="mono" style={{ fontSize:10.5, color:"var(--ink3)", lineHeight:1.45 }}>
              {kcal.trim() === ""
                ? <>estimated from {t ? "your pace" : "the distance"} · type to override</>
                : <>set by you · clear to go back to {estKcal}</>}
            </div>
          </div>
        </div>
      )}
      <Btn kind="lane" size="lg" full style={{ marginTop:13 }} disabled={!m}
        onClick={()=>{
          addWorkout({ type: isWalk ? "walk" : "run", name,
            miles:+m, minutes:+t||null, hr:+hr||null,
            calories: finalKcal || null,
            kind: isWalk ? null : kind, surface });
          flash(`${m} mi ${isWalk ? "walked" : "logged"} · ${finalKcal} cal`); onDone(); }}>
        Log {m||"—"} miles
      </Btn>
    </div>
  );
}

function StrengthForm({ ctx, onDone }) {
  const { addWorkout, flash, date } = ctx;
  const push = dow(date) !== 5;
  const [sets, setSets] = useState(
    push ? [{ n:"Dips", r:"" },{ n:"Decline Push-ups", r:"" },{ n:"Hanging Leg Raises", r:"" }]
         : [{ n:"Pull-ups", r:"" },{ n:"Chin-ups", r:"" },{ n:"L-Sit Hold (sec)", r:"" }]);
  const [rounds, setRounds] = useState("4");
  const [note, setNote] = useState("");
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom:8 }}>{push ? "Upper push + core" : "Upper pull + core"} · total reps per movement</div>
      {sets.map((s,i)=>(
        <div key={i} style={{ display:"flex", gap:9, alignItems:"center", marginBottom:8 }}>
          <input type="text" value={s.n} onChange={e=>setSets(p=>p.map((x,j)=>j===i?{...x,n:e.target.value}:x))} style={{ flex:1 }} />
          <input type="number" inputMode="numeric" value={s.r} placeholder="reps"
            onChange={e=>setSets(p=>p.map((x,j)=>j===i?{...x,r:e.target.value}:x))}
            style={{ width:76, textAlign:"center", fontFamily:"'IBM Plex Mono',monospace" }} />
        </div>
      ))}
      <button onClick={()=>setSets(p=>[...p,{n:"",r:""}])} className="tapfade"
        style={{ fontSize:12, fontWeight:600, color:"var(--bib)", marginTop:2 }}>+ Add movement</button>
      <div style={{ display:"flex", gap:9, marginTop:13 }}>
        <div style={{ width:90 }}>
          <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>Sets</div>
          <input type="number" value={rounds} onChange={e=>setRounds(e.target.value)}
            style={{ textAlign:"center", fontFamily:"'IBM Plex Mono',monospace" }} />
        </div>
        <div style={{ flex:1 }}>
          <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>How'd it feel</div>
          <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="dips felt strong, leg raises sloppy" />
        </div>
      </div>
      <Btn kind="solid" size="lg" full style={{ marginTop:13 }}
        onClick={()=>{ addWorkout({ type:"strength", name: push?"Upper Push & Core":"Upper Pull & Core",
          sets:+rounds||4, movements:sets.filter(s=>s.n&&s.r), note }); flash("Strength logged"); onDone(); }}>
        Log session
      </Btn>
    </div>
  );
}

function SessionForm({ ctx, onDone }) {
  const { addWorkout, flash, D, date, patchDay } = ctx;
  const suggested = D.swap?.name || (dow(date)===2 || dow(date)===0 ? "Basketball" : "Weights");
  const [pick, setPick] = useState(ACTIVITIES.find(a=>a.n===suggested) || ACTIVITIES[0]);
  const [customName, setCustomName] = useState("");
  const [min, setMin] = useState("60");
  const [intensity, setIntensity] = useState("moderate");
  const [note, setNote] = useState("");
  const [swapToo, setSwapToo] = useState(false);

  const mult = { light:0.8, moderate:1.0, hard:1.2 }[intensity];
  const name = customName.trim() || pick.n;
  const met = customName.trim() ? 6.0 : pick.met;
  const kcal = metCalories(met, +min||0, D.latest, mult);

  return (
    <div>
      {Object.entries(ACT_GROUPS).map(([g,label]) => (
        <div key={g} style={{ marginBottom:12 }}>
          <Eyebrow>{label}</Eyebrow>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:7 }}>
            {ACTIVITIES.filter(a=>a.group===g).map(a => {
              const on = !customName.trim() && pick.n === a.n;
              return (
                <button key={a.n} onClick={()=>{ setPick(a); setCustomName(""); }} className="tapfade"
                  style={{ padding:"7px 11px", borderRadius:4, fontSize:12.5, fontWeight:600,
                    background: on ? "var(--moss)" : "transparent", color: on ? "#fff" : "var(--ink2)",
                    border: on ? "1px solid var(--moss)" : "1px solid var(--rule)" }}>{a.n}</button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginBottom:13 }}>
        <Eyebrow>Or type your own</Eyebrow>
        <input type="text" value={customName} onChange={e=>setCustomName(e.target.value)}
          placeholder="dodgeball, skate session, boxing class" style={{ marginTop:7 }} />
      </div>

      <div style={{ display:"flex", gap:9 }}>
        <div style={{ width:96 }}>
          <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>Minutes</div>
          <input type="number" inputMode="numeric" value={min} onChange={e=>setMin(e.target.value)}
            style={{ textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", fontSize:16 }} />
        </div>
        <div style={{ flex:1 }}>
          <div className="eyebrow" style={{ fontSize:8.5, marginBottom:4 }}>Intensity</div>
          <div style={{ display:"flex", gap:5 }}>
            {["light","moderate","hard"].map(i=>(
              <button key={i} onClick={()=>setIntensity(i)} className="tapfade"
                style={{ flex:1, padding:"9px 0", borderRadius:4, fontSize:11, fontWeight:600, textTransform:"capitalize",
                  background: intensity===i?"var(--ink)":"transparent", color: intensity===i?"#FCFCFA":"var(--ink3)",
                  border: intensity===i?"1px solid var(--ink)":"1px solid var(--rule)" }}>{i}</button>
            ))}
          </div>
        </div>
      </div>

      <input type="text" value={note} onChange={e=>setNote(e.target.value)}
        placeholder="how'd it go?" style={{ marginTop:10 }} />

      {kcal > 0 && (
        <div style={{ marginTop:12, padding:"11px 13px", background:"rgba(76,140,74,.08)", borderRadius:5,
          display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div>
            <div className="eyebrow" style={{ color:"var(--moss)" }}>Estimated burn</div>
            <div className="dsp" style={{ fontSize:26, color:"var(--moss)", marginTop:2 }}>
              {kcal.toLocaleString()}<span className="mono" style={{ fontSize:11 }}> cal</span>
            </div>
          </div>
          <div className="mono" style={{ fontSize:10, color:"var(--ink3)", textAlign:"right", maxWidth:150, lineHeight:1.4 }}>
            off your bodyweight and effort. Garmin overrides this if you import it.
          </div>
        </div>
      )}

      {!D.swap && (
        <button onClick={()=>setSwapToo(v=>!v)} className="tapfade"
          style={{ display:"flex", alignItems:"center", gap:9, marginTop:13, width:"100%", textAlign:"left" }}>
          <div style={{ width:17, height:17, borderRadius:3, flexShrink:0,
            border: swapToo ? "1px solid var(--moss)" : "1px solid var(--rule)",
            background: swapToo ? "var(--moss)" : "transparent", color:"#fff", fontSize:11,
            display:"grid", placeItems:"center" }}>{swapToo ? "✓" : ""}</div>
          <span style={{ fontSize:12.5, color:"var(--ink2)" }}>
            This replaces today's {DAY_TEMPLATE[dow(date)].name.toLowerCase()}
          </span>
        </button>
      )}

      <Btn kind="solid" size="lg" full style={{ marginTop:13 }} disabled={!name || !(+min>0)}
        onClick={()=>{
          addWorkout({ type:"session", name:`${name} — ${intensity}`, minutes:+min||null,
            intensity, calories:kcal, note });
          if (swapToo) patchDay(date, { swap:{ name, met, detail:`Swapped in for ${DAY_TEMPLATE[dow(date)].name.toLowerCase()}.` } });
          flash(`${name} logged`); onDone(); }}>
        Log {name || "session"}
      </Btn>
    </div>
  );
}

/* ---------- CINDY: 20-minute AMRAP clock ---------- */

function Cindy({ ctx, onDone }) {
  const { addWorkout, update, flash, date, state } = ctx;
  const TOTAL = 20 * 60;
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [splits, setSplits] = useState([]);
  const [partial, setPartial] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => {
      if (e + 1 >= TOTAL) { setRunning(false); setDone(true); return TOTAL; }
      return e + 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);

  const left = TOTAL - elapsed;
  const mm = String(Math.floor(left/60)).padStart(2,"0");
  const ss = String(left%60).padStart(2,"0");
  const avgRound = rounds > 0 ? elapsed / rounds : null;
  const projected = avgRound ? Math.floor(TOTAL / avgRound) : null;
  const best = state.benchmarks.reduce((b,x)=> !b || x.rounds > b.rounds ? x : b, null);

  const tapRound = () => {
    if (!running) return;
    setSplits(s => [...s, { at: elapsed, split: elapsed - (s.length ? s[s.length-1].at : 0) }]);
    setRounds(r => r + 1);
  };

  const save = () => {
    const b = { id:uid(), date, rounds, reps: partial ? +partial : 0, elapsed };
    update(s => { s.benchmarks = [...s.benchmarks, b].sort((a,c)=>a.date.localeCompare(c.date)); return s; });
    addWorkout({ type:"cindy", name:"Cindy — 20 min AMRAP", rounds, reps:+partial||0, minutes:20 });
    flash(best && rounds > best.rounds ? `NEW PR — ${rounds} rounds` : `${rounds} rounds logged`);
    onDone();
  };

  if (done) return (
    <div style={{ textAlign:"center", padding:"10px 0 4px" }}>
      <Eyebrow color="var(--bib)">Time</Eyebrow>
      <div className="dsp" style={{ fontSize:76, color:"var(--bib)", marginTop:4 }}>{rounds}</div>
      <div className="mono" style={{ fontSize:12, color:"var(--ink3)" }}>rounds completed</div>
      {best && (
        <div style={{ marginTop:10, fontSize:13, fontWeight:600,
          color: rounds > best.rounds ? "var(--moss)" : "var(--ink2)" }}>
          {rounds > best.rounds ? `New PR — ${rounds - best.rounds} up on your best`
            : rounds === best.rounds ? "Matched your best" : `${best.rounds - rounds} off your best of ${best.rounds}`}
        </div>
      )}
      <div style={{ marginTop:16, textAlign:"left" }}>
        <div className="eyebrow" style={{ marginBottom:5 }}>Partial reps into the next round</div>
        <input type="number" inputMode="numeric" value={partial} onChange={e=>setPartial(e.target.value)}
          placeholder="e.g. 5 pull-ups + 4 push-ups = 9" />
      </div>
      <Btn kind="bib" size="lg" full style={{ marginTop:13 }} onClick={save}>Save to the board</Btn>
    </div>
  );

  return (
    <div style={{ textAlign:"center" }}>
      <div className="mono" style={{ fontSize:11.5, color:"var(--ink2)", lineHeight:1.6, marginBottom:14 }}>
        5 PULL-UPS · 10 PUSH-UPS · 15 AIR SQUATS
      </div>

      <div className="dsp" style={{ fontSize:82, lineHeight:.9, color: left < 60 ? "var(--bib)" : "var(--ink)" }}>
        {mm}:{ss}
      </div>
      <div style={{ margin:"12px 0 6px" }}>
        <Meter pct={(elapsed/TOTAL)*100} color="var(--bib)" height={4} />
      </div>

      <div style={{ display:"flex", justifyContent:"space-around", margin:"16px 0 18px" }}>
        <div><div className="eyebrow">Rounds</div><div className="dsp" style={{ fontSize:34, marginTop:2 }}>{rounds}</div></div>
        <div><div className="eyebrow">Avg round</div><div className="dsp" style={{ fontSize:34, marginTop:2 }}>
          {avgRound ? `${Math.floor(avgRound)}s` : "—"}</div></div>
        <div><div className="eyebrow">On pace for</div><div className="dsp" style={{ fontSize:34, marginTop:2,
          color: projected && best && projected > best.rounds ? "var(--moss)" : "var(--ink)" }}>
          {projected ?? "—"}</div></div>
      </div>

      {!running && elapsed === 0 ? (
        <Btn kind="bib" size="lg" full onClick={()=>setRunning(true)} style={{ padding:"18px 0", fontSize:17 }}>
          Start the clock
        </Btn>
      ) : (
        <>
          <button onClick={tapRound} className="tapfade"
            style={{ width:"100%", padding:"30px 0", background:"var(--bib)", color:"#fff", borderRadius:6,
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:30, letterSpacing:".02em" }}>
            + ROUND {rounds + 1}
          </button>
          <div style={{ display:"flex", gap:8, marginTop:9 }}>
            <Btn kind="quiet" size="sm" onClick={()=>setRunning(r=>!r)} full>{running ? "Pause" : "Resume"}</Btn>
            <Btn kind="quiet" size="sm" onClick={()=>{ setRounds(r=>Math.max(0,r-1)); }} full>Undo round</Btn>
            <Btn kind="ghost" size="sm" onClick={()=>{ setRunning(false); setDone(true); }} full>Finish early</Btn>
          </div>
        </>
      )}
      <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:12, lineHeight:1.5 }}>
        Keep this screen open. Tap the block every time you finish 15 squats.
      </div>
    </div>
  );
}

/* Edit a workout that's already logged.

   Which fields show depends on what the workout actually is — a run gets
   distance, a Cindy gets rounds and partial reps, and anything that already
   carries a note keeps it. Nothing is invented: a field appears only when the
   type uses it or the workout already has a value for it, so the sheet never
   offers to set a number the log has no way to display.

   Blank saves back as null, not 0. The row renders each stat behind a
   truthiness check, so a 0 would print "0 mi ·" where the field should just
   disappear. */
/* Module level on purpose. Declared inside EditWorkout it would be a new
   component type on every render, so React would unmount and remount the input
   on each keystroke — the field loses focus and the phone keyboard closes after
   a single character. */
function NumField({ label, value, onChange, step, hint }) {
  return (
    <div>
      <div className="eyebrow" style={{ fontSize:8, marginBottom:3 }}>{label}</div>
      <input type="number" inputMode="decimal" step={step||"1"} value={value}
        onChange={e=>onChange(e.target.value)} placeholder="—"
        style={{ fontFamily:"'IBM Plex Mono',monospace", padding:"8px 6px", textAlign:"center", width:"100%" }} />
      {hint && <div className="mono" style={{ fontSize:9, color:"var(--ink3)", marginTop:3, textAlign:"center" }}>{hint}</div>}
    </div>
  );
}

function EditWorkout({ item, ctx, onDone }) {
  const { updateWorkout, removeWorkout, flash } = ctx;
  const [name, setName] = useState(item.name || "");
  const [confirmDel, setConfirmDel] = useState(false);
  const [f, setF] = useState({
    miles: item.miles ?? "", minutes: item.minutes ?? "", hr: item.hr ?? "",
    calories: item.calories ?? "", rounds: item.rounds ?? "", reps: item.reps ?? "",
    note: item.note ?? "",
  });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));

  const isRun = item.type === "run" || item.type === "sport" || item.miles != null;
  const isCindy = item.type === "cindy" || item.rounds != null;
  const hasNote = item.note != null;

  const pace = (+f.miles > 0 && +f.minutes > 0) ? fmtPace(paceOf(+f.miles, +f.minutes)) : null;

  const num = (v, p) => v === "" || v == null ? null : round(+v, p);
  const save = () => {
    const patch = { name: name.trim() || item.name, minutes: num(f.minutes, 1),
      hr: num(f.hr, 0), calories: num(f.calories, 0) };
    if (isRun) patch.miles = num(f.miles, 2);
    if (isCindy) { patch.rounds = num(f.rounds, 0); patch.reps = num(f.reps, 0) ?? 0; }
    if (hasNote) patch.note = f.note.trim() || null;
    updateWorkout(item.id, patch);
    flash("Workout updated");
    onDone();
  };

  const Num = (k, label, step, hint) => (
    <NumField label={label} value={f[k]} onChange={v=>set(k,v)} step={step} hint={hint} />
  );

  return (
    <div>
      <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="What was it?" />

      {isRun && (
        <>
          <div style={{ marginTop:13 }}><Eyebrow>Distance & time</Eyebrow></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:7 }}>
            {Num("miles","miles","0.01")}
            {Num("minutes","minutes","0.5")}
          </div>
          <div className="mono" style={{ fontSize:11, color: pace ? "var(--lane)" : "var(--ink3)", marginTop:8 }}>
            {pace ? `${pace} /mi` : "Fill both to see your pace"}
          </div>
        </>
      )}

      {isCindy && (
        <>
          <div style={{ marginTop:13 }}><Eyebrow>Score</Eyebrow></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:7 }}>
            {Num("rounds","rounds")}
            {Num("reps","+ reps",null,"partial round")}
          </div>
        </>
      )}

      <div style={{ marginTop:13 }}><Eyebrow>{isRun || isCindy ? "Also" : "Effort"}</Eyebrow></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginTop:7 }}>
        {!isRun && Num("minutes","minutes","0.5")}
        {Num("hr","avg bpm")}
        {Num("calories","calories","5")}
      </div>

      {hasNote && (
        <>
          <div style={{ marginTop:13 }}><Eyebrow>Note</Eyebrow></div>
          <textarea rows={2} value={f.note} onChange={e=>set("note", e.target.value)}
            style={{ marginTop:7 }} placeholder="How did it feel?" />
        </>
      )}

      <Btn kind="solid" size="md" full style={{ marginTop:15 }} onClick={save}>Save</Btn>

      {confirmDel ? (
        <div style={{ marginTop:13, padding:11, border:"1px solid var(--warn)", borderRadius:5 }}>
          <div style={{ fontSize:12.5, color:"var(--ink2)" }}>Remove this workout from the log?</div>
          <div style={{ display:"flex", gap:7, marginTop:9 }}>
            <Btn kind="quiet" size="sm" full onClick={()=>setConfirmDel(false)}>Keep it</Btn>
            <Btn kind="bib" size="sm" full onClick={()=>{ removeWorkout(item.id); flash("Removed"); onDone(); }}>Remove</Btn>
          </div>
        </div>
      ) : (
        <button className="tapfade" onClick={()=>setConfirmDel(true)}
          style={{ marginTop:13, fontSize:11.5, color:"var(--ink3)", textDecoration:"underline", display:"block" }}>
          Remove from log
        </button>
      )}
    </div>
  );
}

/* ============================================================
   STATS
   ============================================================ */

function Stats({ ctx }) {
  const { D, state, date, flash } = ctx;
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);

  // goal line: interpolate the plan's weekly weight anchors
  const chart = useMemo(() => {
    const map = {};
    PLAN.forEach(w => { for (let i=0;i<7;i++) map[addDays(w.start,i)] = w.weight; });
    const first = D.trend.length ? D.trend[0].date : D.P.startDate;
    const days = new Set([...D.trend.map(t=>t.date), ...Object.keys(map).filter(k => daysBetween(first,k) >= 0 && daysBetween(k, iso(new Date())) >= -28)]);
    return [...days].sort().map(d => {
      const t = D.trend.find(x=>x.date===d);
      return { date:d, label:fmtShort(d), actual:t?t.w:null, trend:t?t.trend:null, plan:map[d] ?? null };
    });
  }, [D.trend, D.P.startDate]);

  const mileByWeek = useMemo(() => PLAN.filter(w => daysBetween(w.start, iso(new Date())) >= 0).map(w => {
    const miles = Array.from({length:7},(_,i)=>addDays(w.start,i)).reduce((s,d) =>
      s + ((state.days[d]?.workouts||[]).filter(x=>x.type==="run").reduce((a,x)=>a+(x.miles||0),0)), 0);
    return { w:`W${w.w}`, actual:round(miles,1), target:w.mon+w.fri+w.sat };
  }), [state.days]);

  const cal14 = useMemo(() => Array.from({length:14},(_,i)=>addDays(date, i-13)).map(d => {
    const dd = state.days[d];
    const c = dd ? dd.food.reduce((a,f)=>a+(f.calories||0),0) : 0;
    const p = dd ? dd.food.reduce((a,f)=>a+(f.protein||0),0) : 0;
    return { label: parseISO(d).toLocaleDateString("en-US",{weekday:"narrow"}), cal:c, pro:p };
  }), [state.days, date]);

  const runWeek = async () => {
    setBusy(true);
    try {
      const days = D.weekDays.map(d => {
        const dd = state.days[d]; if (!dd) return { date:d, logged:false };
        return { date:d, weekday:parseISO(d).toLocaleDateString("en-US",{weekday:"short"}),
          calories:Math.round(dd.food.reduce((a,f)=>a+(f.calories||0),0)),
          protein:Math.round(dd.food.reduce((a,f)=>a+(f.protein||0),0)),
          freeDay: !!dd.free, swappedSession: dd.swap?.name || null,
          weight:dd.weight, steps:dd.steps, burn:dd.burn,
          workouts:dd.workouts.map(w=>({ type:w.type, name:w.name, miles:w.miles, minutes:w.minutes, hr:w.hr, rounds:w.rounds })) };
      });
      setReview(await coachReview({ week:D.wk.w, block:D.wk.block, weekTitle:D.wk.title,
        mileageTarget:D.weekTarget, mileageActual:round(D.weekMiles,1),
        calorieTarget:D.calTarget, proteinTarget:D.P.proteinTarget,
        trendWeight:D.latestTrend, startWeight:D.P.startWeight, goalWeight:D.P.goalYear,
        planWeightThisWeek:D.wk.weight, weeklyCalorieBudget:D.weekBudget,
        weeklyCaloriesEaten:Math.round(D.weekSpent), freeDays:D.freeDaysThisWeek, days }));
    } catch(e) { flash(aiError(e, "Coach review failed — try again in a second"), "err"); }
    setBusy(false);
  };

  return (
    <div className="rise" style={{ display:"grid", gap:12 }}>

      <Card>
        <Eyebrow>Where you stand</Eyebrow>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:9 }}>
          <Stat label="Trend" value={D.latestTrend} unit="lb" size={30} />
          <Stat label="Down" value={round(D.lost,1)} unit="lb" color="var(--bib)" size={30} />
          <Stat label="Per week" value={round(D.perWeek,2)} unit="lb" size={30}
            color={D.perWeek > 2.2 ? "var(--warn)" : "var(--moss)"} />
        </div>
        <div style={{ marginTop:13, paddingTop:12, borderTop:"1px solid var(--rule)",
          display:"flex", justifyContent:"space-between", gap:10 }}>
          <div>
            <Eyebrow>vs plan for week {D.wk.w}</Eyebrow>
            <div className="mono" style={{ fontSize:13, fontWeight:600, marginTop:3,
              color: D.latestTrend <= D.wk.weight ? "var(--moss)" : "var(--ink2)" }}>
              {D.latestTrend <= D.wk.weight
                ? `${round(D.wk.weight - D.latestTrend,1)} lb ahead`
                : `${round(D.latestTrend - D.wk.weight,1)} lb behind`}
              <span style={{ color:"var(--ink3)", fontWeight:400 }}> · plan says {D.wk.weight}</span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <Eyebrow>{D.P.goalYear} lb on</Eyebrow>
            <div className="mono" style={{ fontSize:13, fontWeight:600, marginTop:3 }}>
              {D.projDate ? fmtShort(D.projDate) : "log more days"}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding:"14px 8px 8px" }}>
        <div style={{ padding:"0 8px" }}><Eyebrow>Weight — trend vs plan</Eyebrow></div>
        <div style={{ height:190, marginTop:8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top:6, right:10, left:-16, bottom:0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4D19" stopOpacity={.22} />
                  <stop offset="100%" stopColor="#FF4D19" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(22,32,43,.07)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
              <YAxis domain={['dataMin - 3','dataMax + 2']} tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }}
                axisLine={false} tickLine={false} width={38} />
              <Tooltip contentStyle={{ background:"#16202B", border:"none", borderRadius:4, fontSize:11.5 }}
                labelStyle={{ color:"#94A0AA" }} itemStyle={{ color:"#FCFCFA" }} />
              <Line type="monotone" dataKey="plan" stroke="#94A0AA" strokeWidth={1.5} strokeDasharray="3 4" dot={false} name="Plan" />
              <Line type="monotone" dataKey="actual" stroke="rgba(22,32,43,.28)" strokeWidth={0} dot={{ r:2, fill:"rgba(22,32,43,.3)" }} name="Daily" connectNulls />
              <Area type="monotone" dataKey="trend" stroke="#FF4D19" strokeWidth={2.5} fill="url(#wg)" dot={false} name="Trend" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", gap:14, padding:"4px 10px 4px", flexWrap:"wrap" }}>
          <Legend color="#FF4D19" label="7-day trend" />
          <Legend color="#94A0AA" label="Plan target" dash />
          <Legend color="rgba(22,32,43,.3)" label="Daily weigh-in" dot />
        </div>
      </Card>

      <Card style={{ padding:"14px 8px 10px" }}>
        <div style={{ padding:"0 8px" }}><Eyebrow>Weekly mileage vs target</Eyebrow></div>
        <div style={{ height:150, marginTop:8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mileByWeek} margin={{ top:6, right:8, left:-20, bottom:0 }}>
              <CartesianGrid stroke="rgba(22,32,43,.07)" vertical={false} />
              <XAxis dataKey="w" tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }} axisLine={false} tickLine={false} width={34} />
              <Tooltip contentStyle={{ background:"#16202B", border:"none", borderRadius:4, fontSize:11.5 }}
                labelStyle={{ color:"#94A0AA" }} itemStyle={{ color:"#FCFCFA" }} />
              <Bar dataKey="target" fill="rgba(22,32,43,.1)" radius={[2,2,0,0]} name="Target" />
              <Bar dataKey="actual" fill="#1E6FD9" radius={[2,2,0,0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card style={{ padding:"14px 8px 10px" }}>
        <div style={{ padding:"0 8px", display:"flex", justifyContent:"space-between" }}>
          <Eyebrow>Last 14 days — intake</Eyebrow>
          <span className="mono" style={{ fontSize:10, color:"var(--ink3)", paddingRight:4 }}>target {D.calTarget}</span>
        </div>
        <div style={{ height:130, marginTop:8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cal14} margin={{ top:6, right:8, left:-20, bottom:0 }}>
              <CartesianGrid stroke="rgba(22,32,43,.07)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:"#94A0AA", fontFamily:"IBM Plex Mono" }} axisLine={false} tickLine={false} width={38} />
              <Tooltip contentStyle={{ background:"#16202B", border:"none", borderRadius:4, fontSize:11.5 }}
                labelStyle={{ color:"#94A0AA" }} itemStyle={{ color:"#FCFCFA" }} />
              <ReferenceLine y={D.calTarget} stroke="#FF4D19" strokeDasharray="3 4" strokeWidth={1.5} />
              <Bar dataKey="cal" fill="#16202B" radius={[2,2,0,0]} name="Calories" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <Eyebrow color="var(--bib)">Weekly coach review</Eyebrow>
        {!review && !busy && (
          <>
            <p style={{ margin:"8px 0 12px", fontSize:13, color:"var(--ink2)", lineHeight:1.5 }}>
              Reads your last seven days — food, mileage, weight, heart rate — and tells you the one thing to fix.
              Best run on Sunday night before you meal prep.
            </p>
            <Btn kind="solid" size="md" full onClick={runWeek}>Review week {D.wk.w}</Btn>
          </>
        )}
        {busy && <div className="pulse dsp" style={{ fontSize:20, color:"var(--bib)", padding:"18px 0", textAlign:"center" }}>READING YOUR WEEK</div>}
        {review && (
          <div className="rise">
            <p style={{ fontSize:13.5, lineHeight:1.62, color:"var(--ink)", whiteSpace:"pre-wrap", margin:"9px 0 0" }}>{review}</p>
            <Btn kind="quiet" size="sm" style={{ marginTop:11 }} onClick={()=>setReview(null)}>Close</Btn>
          </div>
        )}
      </Card>

      <PhotoCard date={date} flash={flash} />
      <ExportCard state={state} flash={flash} />
    </div>
  );
}

const Legend = ({ color, label, dash, dot }) => (
  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
    <div style={{ width: dot?6:14, height: dot?6:2.5, borderRadius: dot?3:1, background:color,
      opacity: dash?.8:1, ...(dash?{ backgroundImage:`repeating-linear-gradient(90deg,${color} 0 3px,transparent 3px 6px)`, background:"none" }:{}) }} />
    <span className="mono" style={{ fontSize:9.5, color:"var(--ink3)" }}>{label}</span>
  </div>
);

function PhotoCard({ date, flash }) {
  const [photos, setPhotos] = useState({});
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      try { const raw = await Store.get(PHOTO_KEY); if (raw) setPhotos(JSON.parse(raw)); }
      catch (e) { /* none saved yet */ }
    })();
  }, []);

  const add = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const data = await compressImage(file);
      const next = { ...photos, [date]: data };
      setPhotos(next);
      await Store.set(PHOTO_KEY, JSON.stringify(next));
      flash("Photo saved");
    } catch (e) { flash("Couldn't save that photo", "err"); }
    setBusy(false);
  };

  const remove = async (d) => {
    const next = { ...photos }; delete next[d];
    setPhotos(next); setView(null);
    try { await Store.set(PHOTO_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const keys = Object.keys(photos).sort();

  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Eyebrow>Progress photos</Eyebrow>
        <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>add(e.target.files?.[0])} />
        <Btn kind="ghost" size="sm" onClick={()=>ref.current?.click()} disabled={busy}>
          {busy ? "Saving…" : keys.includes(date) ? "Replace" : "+ Add"}
        </Btn>
      </div>
      {keys.length === 0 ? (
        <p style={{ margin:"9px 0 0", fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
          Same spot, same light, same time of day — Sunday morning before breakfast. The scale stalls for
          two weeks at a time and lies to you. These won't.
        </p>
      ) : (
        <div className="noscroll" style={{ display:"flex", gap:7, marginTop:10, overflowX:"auto" }}>
          {keys.map(d => (
            <button key={d} className="tapfade" onClick={()=>setView(d)}
              style={{ flex:"0 0 auto", width:78, borderRadius:4, overflow:"hidden", border:"1px solid var(--rule)" }}>
              <img src={photos[d]} alt={`Progress ${fmtShort(d)}`} style={{ width:"100%", height:100, objectFit:"cover", display:"block" }} />
              <div className="mono" style={{ fontSize:9, padding:"4px 0", color:"var(--ink3)" }}>{fmtShort(d)}</div>
            </button>
          ))}
        </div>
      )}
      {view && (
        <Sheet onClose={()=>setView(null)} title={fmtShort(view)}>
          <img src={photos[view]} alt={`Progress ${fmtShort(view)}`}
            style={{ width:"100%", borderRadius:5, display:"block" }} />
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <Btn kind="quiet" size="sm" full onClick={()=>setView(null)}>Close</Btn>
            <Btn kind="ghost" size="sm" onClick={()=>remove(view)}>Delete</Btn>
          </div>
        </Sheet>
      )}
    </Card>
  );
}

function ExportCard({ state, flash }) {
  const dump = () => {
    const rows = [["date","weight","calories","protein","carbs","fat","steps","burn","run_miles","workouts"]];
    Object.entries(state.days).sort().forEach(([d,v]) => rows.push([
      d, v.weight ?? "",
      Math.round(v.food.reduce((a,f)=>a+(f.calories||0),0)),
      Math.round(v.food.reduce((a,f)=>a+(f.protein||0),0)),
      Math.round(v.food.reduce((a,f)=>a+(f.carbs||0),0)),
      Math.round(v.food.reduce((a,f)=>a+(f.fat||0),0)),
      v.steps ?? "", v.burn ?? "",
      round(v.workouts.filter(w=>w.type==="run").reduce((a,w)=>a+(w.miles||0),0),2),
      v.workouts.map(w=>w.name).join(" | "),
    ]));
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    try {
      const url = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
      const a = document.createElement("a");
      a.href = url; a.download = `the-cut-${iso(new Date())}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
      flash("CSV downloaded");
    } catch (e) {
      navigator.clipboard?.writeText(csv);
      flash("Download blocked — copied to your clipboard instead");
    }
  };
  return (
    <Card style={{ padding:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
        <div>
          <Eyebrow>Your data</Eyebrow>
          <div className="mono" style={{ fontSize:11, color:"var(--ink3)", marginTop:3 }}>
            {Object.keys(state.days).length} days · {state.benchmarks.length} Cindy scores
          </div>
        </div>
        <Btn kind="ghost" size="sm" onClick={dump}>Export CSV</Btn>
      </div>
    </Card>
  );
}

/* ============================================================
   PLAN — the 21 weeks, readable
   ============================================================ */

function PlanView({ ctx }) {
  const { D, state, setDate, setTab } = ctx;
  const today = iso(new Date());
  const [open, setOpen] = useState(D.wk.w);
  const blocks = ["Foundation","Volume","Crucible","Milestone","Final Cut"];

  return (
    <div className="rise" style={{ display:"grid", gap:12 }}>
      <Card style={{ background:"var(--ink)", borderColor:"var(--ink)" }}>
        <div className="eyebrow" style={{ color:"rgba(252,252,250,.5)" }}>21 weeks · Aug 3 → Dec 27</div>
        <div className="dsp" style={{ fontSize:30, color:"#FCFCFA", marginTop:5 }}>
          {D.P.startWeight} <span style={{ color:"var(--bib)" }}>→</span> {D.P.goalYear} LB
        </div>
        <div style={{ marginTop:12, display:"flex", gap:2 }}>
          {PLAN.map(w => {
            const past = daysBetween(w.start, today) >= 0;
            const now = w.w === D.wk.w;
            return <div key={w.w} title={`Week ${w.w}`} style={{ flex:1, height: now?14:9, borderRadius:1,
              background: now ? "var(--bib)" : past ? "rgba(252,252,250,.55)" : "rgba(252,252,250,.16)",
              alignSelf:"flex-end" }} />;
          })}
        </div>
        <div className="mono" style={{ fontSize:10, color:"rgba(252,252,250,.45)", marginTop:7 }}>
          week {D.wk.w} of 21 · {21 - D.wk.w} to go
        </div>
      </Card>

      {blocks.map(b => (
        <div key={b}>
          <div style={{ display:"flex", alignItems:"center", gap:9, margin:"6px 2px 8px" }}>
            <Eyebrow color={b===D.wk.block?"var(--bib)":undefined}>{b}</Eyebrow>
            <div style={{ flex:1, height:1, background:"var(--rule)" }} />
            <span className="mono" style={{ fontSize:9.5, color:"var(--ink3)" }}>
              {PLAN.filter(w=>w.block===b)[0].weight} → {PLAN.filter(w=>w.block===b).slice(-1)[0].weight} lb
            </span>
          </div>
          <div style={{ display:"grid", gap:7 }}>
            {PLAN.filter(w => w.block === b).map(w => {
              const past = daysBetween(addDays(w.start,6), today) > 0;
              const now = w.w === D.wk.w;
              const isOpen = open === w.w;
              return (
                <Card key={w.w} style={{ padding:0, overflow:"hidden",
                  borderColor: now?"var(--bib)":"var(--rule)", opacity: past && !now ? .62 : 1 }}>
                  <button onClick={()=>setOpen(isOpen?null:w.w)} className="tapfade"
                    style={{ width:"100%", textAlign:"left", padding:"11px 13px", display:"flex",
                      alignItems:"center", gap:11 }}>
                    <div className="dsp" style={{ fontSize:22, width:26, color: now?"var(--bib)":"var(--ink3)" }}>
                      {String(w.w).padStart(2,"0")}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:600, lineHeight:1.25 }}>
                        {w.title}{w.pr && <span className="mono" style={{ fontSize:9, color:"var(--bib)", marginLeft:6 }}>PR TEST</span>}
                      </div>
                      <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:2 }}>
                        {fmtShort(w.start)} · {w.mon+w.fri+w.sat} mi · target {w.weight} lb
                      </div>
                    </div>
                    <span style={{ color:"var(--ink3)", fontSize:12, transform: isOpen?"rotate(90deg)":"none",
                      transition:"transform .2s" }}>›</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding:"0 13px 13px" }}>
                      <div style={{ display:"flex", gap:7, marginBottom:9 }}>
                        {[["Mon",w.mon],["Fri",w.fri],["Sat",w.sat]].map(([l,m])=>(
                          <div key={l} style={{ flex:1, padding:"7px 0", background:"rgba(30,111,217,.07)",
                            borderRadius:4, textAlign:"center" }}>
                            <div className="eyebrow" style={{ fontSize:8, color:"var(--lane)" }}>{l}</div>
                            <div className="dsp" style={{ fontSize:19, color:"var(--lane)", marginTop:1 }}>{m}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ margin:0, fontSize:12.5, lineHeight:1.55, color:"var(--ink2)" }}>{w.note}</p>
                      {now && (
                        <Btn kind="ghost" size="sm" style={{ marginTop:10 }}
                          onClick={()=>{ setDate(today); setTab("today"); }}>Go to today</Btn>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <Card>
        <Eyebrow>The four rules that keep you healthy</Eyebrow>
        <div style={{ marginTop:10, display:"grid", gap:11 }}>
          {[
            ["Zone 2 is 80% of your miles","If you can't talk in full sentences, you're running the easy days too hard — and that's how the whole thing falls apart in week 9."],
            ["Never run in court shoes","Dedicated running pair. Replace at 300–400 miles. Basketball shoes have no business on pavement."],
            ["Thursday is zero impact","Walk your 10k, foam roll quads and calves, and that's it. No running, no jumping, no lifting."],
            ["Gallon + electrolytes on double days","Court play plus a run, or Cindy plus a run. Cramping and tendon tightness are dehydration first, everything else second."],
          ].map(([t,d]) => (
            <div key={t} style={{ display:"flex", gap:10 }}>
              <div style={{ width:2, background:"var(--bib)", borderRadius:1, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{t}</div>
                <div style={{ fontSize:12, color:"var(--ink2)", marginTop:2, lineHeight:1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */

const SetRow = ({ label, val, onChange, unit, step="1", hint }) => (
  <div style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 0", borderBottom:"1px solid var(--rule)" }}>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:13, fontWeight:500 }}>{label}</div>
      {hint && <div className="mono" style={{ fontSize:9.5, color:"var(--ink3)", marginTop:2, lineHeight:1.4 }}>{hint}</div>}
    </div>
    <input type="number" step={step} value={val} onChange={e=>onChange(e.target.value)}
      style={{ width:78, textAlign:"center", fontFamily:"'IBM Plex Mono',monospace", padding:"7px 4px" }} />
    {unit && <span className="mono" style={{ fontSize:10, color:"var(--ink3)", width:22 }}>{unit}</span>}
  </div>
);

function Settings({ ctx, onClose }) {
  const { state, update, flash, D } = ctx;
  const [p, setP] = useState(state.profile);
  const [wipe, setWipe] = useState(false);
  const [backup, setBackup] = useState(false);
  const [key, setKey] = useState(apiKey || "");
  const set = (k,v) => setP(prev => ({ ...prev, [k]: v }));
  const preview = estimateBurn(p, D.latest);

  const save = () => {
    update(s => { s.profile = { ...p,
      startWeight:+p.startWeight, goalNov:+p.goalNov, goalYear:+p.goalYear,
      age:+p.age, heightFt:+p.heightFt, heightIn:+p.heightIn, activity:+p.activity,
      deficit:+p.deficit, proteinTarget:+p.proteinTarget, stepTarget:+p.stepTarget, waterTarget:+p.waterTarget };
      return s; });
    flash("Saved"); onClose();
  };

  return (
    <Sheet onClose={onClose} title="Settings">
      <Eyebrow>Goals</Eyebrow>
      <SetRow label="Starting weight" val={p.startWeight} onChange={v=>set("startWeight",v)} unit="lb" step="0.1" />
      <SetRow label="November target" val={p.goalNov} onChange={v=>set("goalNov",v)} unit="lb" hint="the plan's original finish line" />
      <SetRow label="Year-end target" val={p.goalYear} onChange={v=>set("goalYear",v)} unit="lb" hint="what the projection measures against" />

      <div style={{ marginTop:16 }}><Eyebrow>Your body</Eyebrow></div>
      <SetRow label="Age" val={p.age} onChange={v=>set("age",v)} />
      <SetRow label="Height — feet" val={p.heightFt} onChange={v=>set("heightFt",v)} unit="ft" />
      <SetRow label="Height — inches" val={p.heightIn} onChange={v=>set("heightIn",v)} unit="in" />
      <div style={{ padding:"11px 0", borderBottom:"1px solid var(--rule)" }}>
        <div style={{ fontSize:13, fontWeight:500, marginBottom:7 }}>Activity outside training</div>
        <div style={{ display:"flex", gap:5 }}>
          {[[1.375,"Light"],[1.55,"Moderate"],[1.725,"On feet all day"]].map(([v,l])=>(
            <button key={v} onClick={()=>set("activity",v)} className="tapfade"
              style={{ flex:1, padding:"8px 0", borderRadius:4, fontSize:11, fontWeight:600,
                background: +p.activity===v?"var(--ink)":"transparent", color: +p.activity===v?"#FCFCFA":"var(--ink3)",
                border: +p.activity===v?"1px solid var(--ink)":"1px solid var(--rule)" }}>{l}</button>
          ))}
        </div>
        <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:7 }}>
          fallback burn estimate: {preview.toLocaleString()} cal — overridden any day you import Garmin
        </div>
      </div>

      <div style={{ marginTop:16 }}><Eyebrow>Daily targets</Eyebrow></div>
      <SetRow label="Deficit" val={p.deficit} onChange={v=>set("deficit",v)} unit="cal" step="25" hint="750 ≈ 1.5 lb/week. Drop toward 500 as you get leaner." />
      <SetRow label="Protein floor" val={p.proteinTarget} onChange={v=>set("proteinTarget",v)} unit="g" step="5" />
      <SetRow label="Steps" val={p.stepTarget} onChange={v=>set("stepTarget",v)} step="500" />
      <SetRow label="Water" val={p.waterTarget} onChange={v=>set("waterTarget",v)} unit="oz" step="8" />

      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        <Btn kind="solid" size="lg" full onClick={save}>Save settings</Btn>
      </div>

      {Store.kind !== "artifact" && (
        <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid var(--rule)" }}>
          <Eyebrow>AI features</Eyebrow>
          <p style={{ margin:"6px 0 9px", fontSize:12, color:"var(--ink2)", lineHeight:1.5 }}>
            Garmin screenshot reading, meal estimates and the weekly coach need an Anthropic API key.
            It's stored in this browser only and goes nowhere but Anthropic. Everything else in the
            app works fine without one.
          </p>
          <input type="text" value={key} onChange={e=>setKey(e.target.value)}
            placeholder="sk-ant-..." autoComplete="off" spellCheck={false}
            style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11 }} />
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <Btn kind="ghost" size="sm" full onClick={async()=>{ await saveApiKey(key); flash(key.trim()?"Key saved":"Key cleared"); }}>
              {key.trim() ? "Save key" : "Clear key"}
            </Btn>
          </div>
          <div className="mono" style={{ fontSize:9.5, color:"var(--ink3)", marginTop:7, lineHeight:1.5 }}>
            Use a dedicated key with a spend limit. Anyone with access to this browser could read it.
          </div>
        </div>
      )}

      <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid var(--rule)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div>
            <Eyebrow>Backup</Eyebrow>
            <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:3 }}>
              {Object.keys(state.days).length} days · {ctx.storageOK
                ? (Store.kind === "local" ? "saved in this browser" : "saving normally") : "storage blocked"}
            </div>
          </div>
          <Btn kind="ghost" size="sm" onClick={()=>setBackup(true)}>Copy / restore</Btn>
        </div>
      </div>

      <div style={{ marginTop:18, paddingTop:16, borderTop:"1px solid var(--rule)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div>
            <Eyebrow>How this works</Eyebrow>
            <div className="mono" style={{ fontSize:10, color:"var(--ink3)", marginTop:3 }}>
              every number, and where it comes from
            </div>
          </div>
          <Btn kind="ghost" size="sm" onClick={()=>{ onClose(); ctx.openGuide(); }}>Explain it</Btn>
        </div>
      </div>
      {backup && <Sheet onClose={()=>setBackup(false)} title="Backup & restore"><Backup ctx={ctx} /></Sheet>}

      {!wipe ? (
        <button className="tapfade" onClick={()=>setWipe(true)}
          style={{ marginTop:18, fontSize:11.5, color:"var(--ink3)", textDecoration:"underline", display:"block" }}>
          Erase all logged data
        </button>
      ) : (
        <div style={{ marginTop:18, padding:12, border:"1px solid var(--warn)", borderRadius:5 }}>
          <div style={{ fontSize:12.5, color:"var(--ink2)", lineHeight:1.5 }}>
            This erases every logged day, meal, run and Cindy score. There's no undo.
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <Btn kind="quiet" size="sm" full onClick={()=>setWipe(false)}>Keep my data</Btn>
            <Btn kind="bib" size="sm" full onClick={()=>{
              update(s => { s.days = {}; s.benchmarks = []; s.customFoods = []; return s; });
              flash("Log cleared"); onClose();
            }}>Erase everything</Btn>
          </div>
        </div>
      )}
    </Sheet>
  );
}
