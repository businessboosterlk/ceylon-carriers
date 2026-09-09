// Sitemap for the five pages. Built at build time, so lastmod is the build date.
// On GitHub Pages this lives under the /ceylon-carriers/ subpath, so submit it
// directly in Search Console. On the real domain it sits at the root and robots.txt
// can point at it.
import { BASE } from '../scripts/config.js';

export function GET({ site }) {
  const root = (site ? String(site).replace(/\/$/, '') : '') + BASE;
  const today = new Date().toISOString().slice(0, 10);
  const pages = ['', 'sri-lanka-tours/', 'holidays-abroad/', 'about/', 'contact/'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map(p => `  <url><loc>${root}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
