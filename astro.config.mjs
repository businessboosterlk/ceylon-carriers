// Ceylon Carriers Travels. Astro static site, BB stack standard (2026-09-09).
//
// TWO VALUES CHANGE WHEN THE SITE MOVES TO ITS REAL DOMAIN:
//   SITE_URL  = https://ceyloncarrierstravels.com
//   BASE_PATH = /
// Set them as environment variables in the build (GitHub Actions or the host)
// and nothing else in the project needs to change. The defaults below are the
// GitHub Pages preview at businessboosterlk.github.io/ceylon-carriers/.
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL || 'https://businessboosterlk.github.io';
const base = process.env.BASE_PATH || '/ceylon-carriers';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' }
});
