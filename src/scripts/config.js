// ONE place for every real-world value on this site. Pages and scripts import it.
// Edit here, never inside a page. Source of each value is noted.
export const SITE = {
  name: 'Ceylon Carriers Travels',
  founded: '1973',
  // WhatsApp Business line, digits only, no plus. Confirmed by Thulaib 2026-09-09.
  whatsapp: '94768232406',
  phones: ['+94 768 232406', '+94 768 232404'],            // ceyloncarrierstravels.com footer
  emails: {
    general: 'info@ceyloncarrierstravels.com',
    holidays: 'sales@ceyloncarrierstravels.com',            // outbound enquiries
    inbound: 'inbound@ceyloncarrierstravels.com'            // Sri Lanka tour enquiries
  },
  address: { street: '60/7, 1/1, Horton Place', city: 'Colombo 07', country: 'Sri Lanka' },
  social: { facebook: 'https://facebook.com/ceyloncarrierstravels', instagram: 'https://instagram.com/ceyloncarrierstravels', tiktok: '' }, // from ceyloncarrierstravels.com footer, 2026-09-09. TikTok handle not recorded
  // Static exchange rates used only by the dormant currency selector.
  rates: { LKR:1, USD:0.0033, GBP:0.0026, AUD:0.0050, EUR:0.0031 },
  symbols:{ LKR:'LKR', USD:'US$', GBP:'£', AUD:'A$', EUR:'€' }
};
// Astro sets BASE_URL from astro.config (/ceylon-carriers/ on GitHub Pages, / on the real domain).
export const BASE = String(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
export const IMG = BASE + 'images/';
export function waURL(msg){
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
}

// LAUNCH SWITCH: the preview must not compete with the client's live domain in Google.
// Change to 'index, follow' on the day the real domain points at this build.
export const ROBOTS = 'noindex, nofollow';
