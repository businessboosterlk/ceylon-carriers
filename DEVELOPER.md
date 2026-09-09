# Ceylon Carriers Travels website: developer handoff

Written 9 September 2026 by Business Booster. Read this before touching the code.
Deadline for the finished site: **31 October 2026**.

## What this is

A five-page marketing site for Ceylon Carriers Travels, a Colombo travel company
founded in 1973. Static HTML built by **Astro 7** from the files in `src/`. No
server is needed to run what is here today: every enquiry hands off to WhatsApp
with a pre-filled message. Your job is the backend and the go-live. This document
tells you where everything is and what must not change.

Stack, per Business Booster's standard: Astro for the pages. If you add a server,
it is **Node.js**, with **Next.js** where the app has pages and an API together.
Database, auth and storage are **Supabase**. Nothing else.

## Run it

```bash
npm install          # Node 22.12 or newer (see package.json engines)
npm run dev          # http://localhost:4637/ceylon-carriers/
npm run build        # writes dist/
npm run preview      # serves dist/ on the same port
```

The site lives under the `/ceylon-carriers/` sub-path on the preview host, so
every URL in dev and preview includes it. See "Moving to the real domain" below.

## Where things are

| Path | What it is |
|---|---|
| `src/scripts/config.js` | **The one place for every real-world value**: WhatsApp number, phones, emails, office address, social links, the `ROBOTS` launch switch. Edit here, never inside a page. |
| `src/layouts/Layout.astro` | Shared head (title, description, canonical, share preview, JSON-LD), nav, mobile menu, footer, sticky mobile bar and the four-step enquiry modal. Every page uses it. |
| `src/pages/index.astro` | The home page. Its markup is the July 2026 build, unchanged in design and copy. Do not restyle it without a written reason from the client. |
| `src/pages/sri-lanka-tours.astro` | Inbound page for visitors to Sri Lanka. Reads `src/data/tours.json`. |
| `src/pages/holidays-abroad.astro` | Outbound page for Sri Lankan travellers. Reads `src/data/packages.json`. |
| `src/pages/about.astro`, `contact.astro`, `404.astro` | The rest. |
| `src/pages/sitemap.xml.js` | Generates `sitemap.xml` at build time. |
| `src/data/tours.json` | The nine Sri Lanka tours: routes, highlights, inclusions, images. **This is the CMS swap point.** If you give the client a way to edit tours, feed this shape. |
| `src/data/packages.json` | The three priced packages abroad and the "ask for a quote" destinations. Same idea. |
| `src/styles/global.css` | The original stylesheet, extracted byte for byte from the single-file build. Owns the home page and the shared components. |
| `src/styles/pages.css` | Everything added for the inner pages. Builds on the tokens in `global.css`. |
| `src/scripts/site.js` | Behaviour shared by every page: nav, scroll reveal, count-up, WhatsApp links, enquiry modal, film band. Every block guards for elements that only exist on some pages. |
| `src/scripts/home.js` | Home page only: the Vibe Finder hero, destination toggle, testimonials, parallax, world map. |
| `src/scripts/seo.js` | Helpers for the JSON-LD graph (breadcrumbs, FAQ). |
| `public/` | Images, videos, `favicon.svg`, `og.jpg` (the WhatsApp share image), `llms.txt`. Copied to `dist/` as is. |
| `.github/workflows/deploy.yml` | Builds and publishes to GitHub Pages on every push to `main`. |

## How enquiries work today, and the backend contract

Every button ends in a WhatsApp message to the number in `config.js`, pre-filled
with what the visitor was looking at (tour name, package, page). The message
carries a `Sent from:` line naming the page, so the client can see which page
produced each lead. Two surfaces build these messages:

1. The four-step modal in `Layout.astro`, driven by the modal block in `site.js`.
2. The contact form in `contact.astro`, driven by the script at the bottom of that file.

Both validate **name and phone as required, email as optional**, then call
`window.open(waURL(message))`. Keep that behaviour: the client's sales desk runs on
WhatsApp and the owner wants it that way.

If the client asks you to also record enquiries server-side, the agreed shape is:

```
POST /api/enquiry
Content-Type: application/json
{ "name": "...", "phone": "...", "email": "" , "about": "Visiting Sri Lanka",
  "message": "...", "page": "contact", "source": "website" }
```

Build it as a Node route (Next.js API route or Express), write to a Supabase table,
and call it **in addition to** opening WhatsApp, never instead of. The two places
to add the call are marked by the `window.open(waURL(` lines.

## Launch checklist (nothing goes live until every line is ticked)

1. **`ROBOTS`** in `src/scripts/config.js` is `noindex, nofollow`. Change it to
   `index, follow` on the day the real domain points at this build. Not before:
   the preview must not compete with the client's live store in Google.
2. **Testimonials on the home page are sample copy.** Three quotes, invented as
   placeholders in July 2026. Replace with real client quotes (with written
   permission) or remove the section before launch. They are marked with an HTML
   comment in `index.astro`.
3. **Prices on the home page** show the client's Sri Lanka tours in US dollars,
   read from their store, where the same figures carry an LKR label. The client
   has not yet confirmed which currency is right, which is why the Sri Lanka Tours
   page says "price on request". Get the answer, then make both pages agree.
4. **The Maldives price on the home page (LKR 249,000)** could not be verified
   against any client record on 9 September 2026. Confirm or remove.
5. **TikTok**: the client posts there but no handle is on record. Add it to
   `config.js` under `social.tiktok` and the footer icon appears by itself.
6. **Office hours** are not on the site because nobody has stated them.
7. **Search Console and GA4** slots are in `Layout.astro` (two commented lines in
   the head). Fill them at launch and submit `sitemap.xml` in Search Console.
8. Run `npm run build` and open every page on a phone before you push.

## Moving to the real domain

The site is written to move with **two environment variables** and nothing else:

```
SITE_URL=https://ceyloncarrierstravels.com
BASE_PATH=/
```

Set them wherever the build runs (the GitHub Actions workflow has them at the
top) and rebuild. Every link, image path, canonical URL, share image and sitemap
entry follows. Then:

1. Point the domain at wherever `dist/` is hosted (GitHub Pages with a custom
   domain works and costs nothing; add a `CNAME` file to `public/` if you use it).
2. Flip `ROBOTS` (checklist item 1).
3. Add `robots.txt` to `public/` pointing at `/sitemap.xml`. It is deliberately
   absent on the preview because crawlers only read `robots.txt` at a domain root.
4. Keep the Shopify store live until the new site answers on the domain, then
   redirect the old product URLs (`/products/...`) to `/sri-lanka-tours/`.

## Things that must not change

- **Founding year is 1973.** It appears throughout the copy with no caveat. Do not
  "correct" it from any other source.
- **The home page design and copy.** The client signed it off in July 2026.
- **WhatsApp first.** Every call to action reaches WhatsApp with context.
- **Spelling is British English, no em dashes, no comma before "and".** The
  agency runs a checker on the rendered pages; keep new copy to the same rule.

## What was checked before handoff (9 September 2026)

- `npm run build`: 6 pages, no warnings.
- Business Booster stack check: PASS (Astro).
- House style on the rendered text of the four new pages: 8 of 8 rules each.
- Copy voice check on the four new pages: 100 of 100 each.
- Every page: one h1, unique title and description, canonical, absolute share
  image, JSON-LD graph, every image with alt text and dimensions, no missing
  asset, no placeholder phone number.
- Preview on desktop and a 375px phone: no horizontal overflow, no console
  errors, every WhatsApp link carries +94 768 232406.

## Contacts

Client day-to-day: Sue, Ceylon Carriers Travels, WhatsApp +94 768 232406.
Agency: Business Booster, Colombo. The person who briefed this build is Thulaib.
