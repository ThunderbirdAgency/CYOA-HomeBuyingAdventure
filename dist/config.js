// Presenter, partner, lead, and analytics configuration.
// A host page can override anything by defining window.FIRST_KEY_CONFIG before app.js loads.
// URL parameters: ?partner=Name (or ?agent=Name) attributes the play session to a referring agent,
// ?debug=1 logs analytics events to the console.

const ON_HLT = typeof location !== 'undefined' && /erikmillerhlt\.com$/i.test(location.hostname)
// Paths resolve against this module, so they work from the game root and from arcade/ pages alike.
const here = (rel) => (typeof import.meta !== 'undefined' && import.meta.url ? new URL(rel, import.meta.url).href : rel)

const defaults = {
  presenter: {
    name: 'Erik Miller',
    firstName: 'Erik',
    role: 'Mortgage Consultant',
    company: 'Patriot Home Mortgage',
    nmls: '263103',
    companyNmls: '715386',
    phone: '(623) 696-8683',
    phoneHref: '+16236968683',
    email: 'Erik.Miller@PatriotHomeMortgage.com',
    site: 'https://www.erikmillerhlt.com',
    headshot: here('assets/erik.webp'),
    licensedIn: 'Arizona',
    legal:
      'Erik Miller NMLS #263103 · AZ LO-0927960 · Patriot Home Mortgage is a dba of Belem Servicing LLC · Company NMLS #715386 · AZ NMLS #BK-976140 · Equal Housing Lender',
    tagline: 'The lender at the gate.',
  },
  assistant: {
    name: 'Albert Luc',
    firstName: 'Albert',
    role: 'Senior Support Specialist & Assistant Originator',
    nmls: '1474341',
    headshot: here('assets/albert.png'),
    line: 'Erik’s right hand and Hearthvale’s paperwork wizard. Knows what a lender needs before they ask.',
  },
  // Where the optional contact forms post. On erikmillerhlt.com this is the site's own lead API,
  // which forwards to GoHighLevel. Anywhere else, post cross-origin to the same API.
  leadEndpoint: ON_HLT ? '/api/lead/' : 'https://www.erikmillerhlt.com/api/lead/',
  // Where "Play the full adventure" links go from a standalone mini-game.
  gameUrl: here('./'),
  arcadeUrl: here('./arcade/'),
  analytics: { debug: false, endpoint: '' },
  partner: null, // { name, role, headshot } — a co-branded agent who appears in the game
  fictional: {
    rate: 0.065, // fictional 30-year rate used only to show how coins change a payment
    years: 30,
    coinValue: 100, // one coin = $100 of fictional down payment
  },
}

function deepMerge(base, extra) {
  const out = { ...base }
  for (const [k, v] of Object.entries(extra || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object')
      out[k] = deepMerge(base[k], v)
    else if (v !== undefined) out[k] = v
  }
  return out
}

function cleanName(s) {
  return String(s || '')
    .replace(/[^\w\s.'’-]/g, '')
    .trim()
    .slice(0, 40)
}

const overrides = typeof window !== 'undefined' ? window.FIRST_KEY_CONFIG || {} : {}
export const config = deepMerge(defaults, overrides)

if (typeof location !== 'undefined') {
  const params = new URLSearchParams(location.search)
  const partnerName = cleanName(params.get('partner') || params.get('agent'))
  if (partnerName) config.partner = { ...(config.partner || {}), name: partnerName, role: 'Real estate agent' }
  if (params.get('debug')) config.analytics.debug = true
}
if (config.partner && !config.partner.name) config.partner = null

export const presenter = config.presenter
export const partner = config.partner
export const assistant = config.assistant

// Fictional payment change from extra down payment. Standard amortization, no taxes or insurance.
export function monthlyFor(principal, rate = config.fictional.rate, years = config.fictional.years) {
  const r = rate / 12,
    n = years * 12
  if (!principal) return 0
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}
export function coinsToDollars(coins) {
  return Math.max(0, Math.floor(Number(coins) || 0)) * config.fictional.coinValue
}
export function coinsToMonthlySavings(coins) {
  return Math.round(monthlyFor(coinsToDollars(coins)))
}
