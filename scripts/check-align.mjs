// LEFT-ALIGN CHECK. Run against the BUILT site: node scripts/check-align.mjs
//
// Why this exists. On 2026-09-10 Thulaib rejected the inner pages because the
// hero copy sat in the middle of the screen instead of hard left, and said he
// had asked for it multiple times. The cause was not taste, it was mechanical:
// `.phero` is display:flex, so its inner `.container` became a shrink-to-fit
// flex item and `margin:0 auto` centred it. Measured 210px of left margin on a
// 1265px viewport. A rule in a document did not stop it. This check does.
//
// It asserts, on every built page, that the hero headline starts at exactly the
// same x as the brand mark in the nav, and that no heading block is centred.
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

  const name = path || '(home)';
  if (!r.hasTitle || !r.hasLogo) { fails.push(`${name}: no hero title or no nav logo found`); continue; }
  if (r.titleLeft !== r.logoLeft) {
    fails.push(`${name}: hero headline starts at ${r.titleLeft}px but the brand mark is at ${r.logoLeft}px. The hero copy must sit hard left, level with the brand.`);
  } else if (r.centred.length) {
    fails.push(`${name}: centred heading block(s): ${r.centred.join(', ')}`);
  } else {
    pass++;
    console.log(`  PASS  ${name.padEnd(20)} hero headline and brand both at ${r.titleLeft}px`);
  }
}

await browser.close();
server.close();

console.log(`\nLEFT-ALIGN CHECK: ${pass} of ${PAGES.length} pages pass`);
if (fails.length) { console.error('\nFAIL:'); fails.forEach(f => console.error('  ' + f)); process.exit(1); }
process.exit(0);
