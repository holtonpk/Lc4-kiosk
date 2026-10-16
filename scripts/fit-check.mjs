// Fit check for the StanbyME kiosk: every route must fit one 1920×1080
// (and 1080×1920) screen with no scrolling, nothing outside the viewport,
// touch targets ≥48×48 and text ≥20px. Saves a screenshot per route/size.
//
// Chrome for Testing has no build older than 113, so for the webOS 24
// simulator's engine (Chromium 108) install a snapshot:
//   npx @puppeteer/browsers install chromium@1056772
// Then, with the dev server running on :3000:
//   CHROME_PATH=/path/to/Chromium npm run fit-check
//
// Admin is a staff-only scrolling CMS, so only its PIN screen is checked,
// and it's exempt from the no-scroll rule.

import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = process.env.OUT_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".fit-check");
const CHROME = process.env.CHROME_PATH;
const WEBOS_UA =
  "Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.211 Safari/537.36 WebAppManager";
const SIZES = [
  {w: 1920, h: 1080, tag: "landscape"},
  {w: 1080, h: 1920, tag: "portrait"},
];
const MIN_TARGET = 48;
const MIN_TEXT = 20;

function measure() {
  const W = innerWidth;
  const H = innerHeight;
  const name = (el) =>
    (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30) ||
    el.tagName.toLowerCase() + "." + String(el.className).split(/\s+/).slice(0, 3).join(".");
  const visible = (el) => {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return c.visibility !== "hidden" && c.display !== "none" && r.width > 0 && r.height > 0;
  };
  // Ignore the Next.js dev-mode indicator and off-screen carousel pages (inert).
  const all = [...document.querySelectorAll("body *")].filter((el) => !el.closest("nextjs-portal, [inert]"));

  const scrollers = all
    .filter((el) => {
      const c = getComputedStyle(el);
      return /(auto|scroll)/.test(c.overflowY + c.overflowX) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
    })
    .map((el) => `${name(el)} (+${el.scrollHeight - el.clientHeight}px)`);
  const outside = all
    .filter(visible)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1;
    })
    .map(name);
  const smallTargets = all
    .filter((el) => el.matches("a[href],button,input,select,textarea,[role=button],[tabindex]:not([tabindex='-1'])") && visible(el))
    .map((el) => ({el, r: el.getBoundingClientRect()}))
    .filter(({r}) => r.width < 48 || r.height < 48)
    .map(({el, r}) => `${name(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const smallText = all
    .filter((el) => visible(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 20)
    .map((el) => `${name(el)} ${getComputedStyle(el).fontSize}`);

  return {
    docScroll: {y: document.documentElement.scrollHeight - H, x: document.documentElement.scrollWidth - W},
    scrollers,
    outside,
    smallTargets,
    smallText,
  };
}

async function carIds(page) {
  await page.goto(`${BASE}/garage`, {waitUntil: "load"});
  const html = await page.content();
  return [...new Set([...html.matchAll(/\\?"id\\?":\\?"([\w-]+)\\?"/g)].map((m) => m[1]))];
}

async function settle() {
  // Entrance animations run up to ~1.2s; images load eagerly. (Pages keep a
  // live Firestore connection open, so "networkidle" never happens — wait on
  // the load event plus this settle time instead.)
  await new Promise((r) => setTimeout(r, 2500));
}

(async () => {
  if (!CHROME) throw new Error("Set CHROME_PATH to a Chromium binary (see header comment).");
  fs.mkdirSync(OUT, {recursive: true});
  const browser = await puppeteer.launch({executablePath: CHROME, headless: true, args: ["--no-sandbox", "--hide-scrollbars"]});
  const page = await browser.newPage();
  await page.setUserAgent(WEBOS_UA);
  console.log(`engine: ${await browser.version()}`);

  const ids = await carIds(page);
  const views = [
    {name: "home", path: "/"},
    {name: "garage", path: "/garage"},
    ...ids.flatMap((id) =>
      ["Specs", "Photos", "Videos"].map((tab) => ({name: `car-${id}-${tab.toLowerCase()}`, path: `/car/${id}`, tab})),
    ),
    ...ids.slice(0, 1).map((id) => ({name: `car-${id}-lightbox`, path: `/car/${id}`, lightbox: true})),
    {name: "admin-pin", path: "/admin", allowScroll: true},
  ];

  let failures = 0;
  for (const size of SIZES) {
    await page.setViewport({width: size.w, height: size.h, deviceScaleFactor: 1});
    for (const v of views) {
      await page.goto(BASE + v.path, {waitUntil: "load", timeout: 120000});
      if (v.tab) await page.evaluate((t) => [...document.querySelectorAll("[role=tab]")].find((b) => b.textContent.trim() === t)?.click(), v.tab);
      if (v.lightbox) await page.click('[aria-label="View full screen"]');
      await settle();

      const m = await page.evaluate(measure);
      const problems = [];
      if (m.docScroll.y > 0 || m.docScroll.x > 0) problems.push(`document scrolls (+${m.docScroll.x}px x, +${m.docScroll.y}px y)`);
      if (!v.allowScroll && m.scrollers.length) problems.push(`scrolling containers: ${m.scrollers.join(", ")}`);
      if (!v.allowScroll && m.outside.length) problems.push(`${m.outside.length} elements outside viewport: ${m.outside.slice(0, 4).join(" | ")}`);
      if (m.smallTargets.length) problems.push(`targets < ${MIN_TARGET}px: ${m.smallTargets.slice(0, 4).join(" | ")}`);
      if (m.smallText.length) problems.push(`text < ${MIN_TEXT}px: ${m.smallText.slice(0, 4).join(" | ")}`);

      await page.screenshot({path: path.join(OUT, `${v.name}-${size.tag}.png`)});
      failures += problems.length ? 1 : 0;
      console.log(`${problems.length ? "FAIL" : "PASS"}  ${size.tag.padEnd(9)} ${v.name}`);
      for (const p of problems) console.log(`        - ${p}`);
    }
  }

  // Remote: arrow keys move focus across the garage, OK opens a car.
  await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});
  await page.goto(`${BASE}/garage`, {waitUntil: "load"});
  await settle();
  const focusTrail = [];
  for (const key of ["ArrowRight", "ArrowRight", "ArrowDown", "ArrowLeft"]) {
    await page.keyboard.press(key);
    focusTrail.push(await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 20) || document.activeElement?.tagName));
  }
  await Promise.all([page.waitForNavigation({waitUntil: "load"}).catch(() => null), page.keyboard.press("Enter")]);
  const remoteOk = new Set(focusTrail).size === focusTrail.length && page.url().includes("/car/");
  failures += remoteOk ? 0 : 1;
  console.log(`${remoteOk ? "PASS" : "FAIL"}  remote    focus ${focusTrail.join(" → ")} → OK opened ${page.url().replace(BASE, "")}`);

  await browser.close();
  console.log(`\n${failures ? `${failures} failing` : "all passing"} — screenshots in ${OUT}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
