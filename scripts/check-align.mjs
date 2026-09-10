// LEFT-ALIGN CHECK. Run against the BUILT site: node scripts/check-align.mjs
//
// Why this exists. On 2026-09-10 Thulaib rejected the inner pages because the
// hero copy sat in the middle of the screen instead of hard left, and said he
// had asked for it multiple times. The cause was not taste, it was mechanical:
// `.phero` is display:flex, so its inner `.container` became a shrink-to-fit
// flex item and `margin:0 auto` centred it. Measured 210px of left margin on a
// 1265px viewport. A rule in a document did not stop it. This check does.
//
// TRAP, found 2026-09-10: this Mac has Anton INSTALLED as a system font, CI does
// not. So the same check measured different glyphs in the two places and the
// numbers disagreed (t-headline needed 1.042 here, 1.087 there). Blocking the
// webfont locally does not reproduce it, because the local install still wins.
// That is why every failure now prints the font it measured, and why the section
// headings are set above the FALLBACK's requirement rather than Anton's: every
// visitor sees the fallback for a moment before the webfont arrives.
//
// It asserts, on every built page, that the hero headline starts at exactly the
// same x as the brand mark in the nav, and that no heading block is centred.
//
// SECOND CHECK, added 2026-09-10 after Thulaib found the comma in "SRI LANKA,"
// sitting on the word below. Uppercase Anton needs a line-height RATIO of 1.013
// to clear its own comma; the hero was set to 0.94, which overlapped by 7.3px at
// a 100px font. This measures the glyphs actually painted (text-transform
// included, which an earlier pass got wrong by measuring the lowercase source)
// and fails if any heading's ink is taller than its line box, or if the
// clearance is too thin to trust.
// Playwright: use the copy already on Thulaib's Mac when it is there, otherwise
// the devDependency (which is what CI installs). Either way the check runs.
let chromium;
try { ({ chromium } = await import('/Users/thulaibhassen/bb-systems/batch/node_modules/playwright/index.mjs')); }
catch { ({ chromium } = await import('playwright')); }
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const DIST = resolve(process.argv[2] || 'dist');
const BASE = '/ceylon-carriers';
const PAGES = ['', 'sri-lanka-tours/', 'holidays-abroad/', 'about/', 'contact/'];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(await readFile(f));
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let pass = 0; const fails = [];

for (const path of PAGES) {
  const url = `http://localhost:${port}${BASE}/${path}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const left = e => e ? Math.round(e.getBoundingClientRect().left) : null;
    const logo = q('.nav-logo');
    // the hero headline: .phero-title on inner pages, .hero-title on the home page
    const title = q('.phero-title') || q('.hero-title');
    const centred = [...document.querySelectorAll('.section-head, .phero-inner, .hero-copy, h1, h2')]
      .filter(e => getComputedStyle(e).textAlign === 'center')
      .map(e => e.tagName + '.' + String(e.className).slice(0, 30));
    return { logoLeft: left(logo), titleLeft: left(title), centred,
             hasTitle: !!title, hasLogo: !!logo };
  });

  // --- TYPE CLEARANCE: do any glyphs land on the line beneath? ---
  await page.evaluate(() => document.fonts.ready);
  const type = await page.evaluate(() => {
    const cv = document.createElement('canvas').getContext('2d');
    const bad = [];
    for (const el of document.querySelectorAll('h1, h2, h3, .phero-title, .film-title, .t-display')) {
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight);
      if (!fs || !lh || !isFinite(lh)) continue;
      // only matters when the element actually wraps to more than one line
      const lines = Math.round(el.getBoundingClientRect().height / lh);
      if (lines < 2) continue;
      let txt = el.textContent.trim();
      if (cs.textTransform === 'uppercase') txt = txt.toUpperCase();
      else if (cs.textTransform === 'lowercase') txt = txt.toLowerCase();
      if (!txt) continue;
      cv.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      const m = cv.measureText(txt);
      const ink = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const clearance = lh - ink;
      // demand real margin, not a hairline: 2% of the font size
      if (clearance < fs * 0.02) {
        bad.push({ font: (document.fonts.check(`${fs}px Anton`) ? 'Anton' : 'FALLBACK, Anton did not load'),
                   sel: el.className ? '.' + String(el.className).split(' ')[0] : el.tagName,
                   text: txt.slice(0, 40), fontSize: +fs.toFixed(1),
                   lineHeight: +lh.toFixed(1), ink: +ink.toFixed(1),
                   clearance: +clearance.toFixed(1), lines });
      }
    }
    return bad;
  });

  const name = path || '(home)';
  if (path === PAGES[0]) {
    const f = await page.evaluate(() => document.fonts.check('100px Anton') ? 'Anton' : 'FALLBACK (Anton did not load)');
    console.log(`  display font in this environment: ${f}`);
  }
  if (type.length) {
    for (const t of type) {
      fails.push(`${name}: "${t.text}" (${t.sel}, measured in ${t.font}) has ${t.clearance}px of clearance across ${t.lines} lines. `
        + `Its glyphs are ${t.ink}px tall in a ${t.lineHeight}px line box, so a descender lands on the line below. `
        + `Raise line-height (${(t.lineHeight / t.fontSize).toFixed(3)} now, needs about ${((t.ink / t.fontSize) + 0.02).toFixed(3)}).`);
    }
  }
  if (!r.hasTitle || !r.hasLogo) { fails.push(`${name}: no hero title or no nav logo found`); continue; }
  if (r.titleLeft !== r.logoLeft) {
    fails.push(`${name}: hero headline starts at ${r.titleLeft}px but the brand mark is at ${r.logoLeft}px. The hero copy must sit hard left, level with the brand.`);
  } else if (r.centred.length) {
    fails.push(`${name}: centred heading block(s): ${r.centred.join(', ')}`);
  } else if (type.length) {
    // already recorded above
  } else {
    pass++;
    console.log(`  PASS  ${name.padEnd(20)} hero at ${r.titleLeft}px, nothing centred, no glyph collisions`);
  }
}

await browser.close();
server.close();

console.log(`\nLAYOUT CHECK (alignment + type clearance): ${pass} of ${PAGES.length} pages pass`);
if (fails.length) { console.error('\nFAIL:'); fails.forEach(f => console.error('  ' + f)); process.exit(1); }
process.exit(0);
