// Lightweight, privacy-respecting event tracking.
// Events go to whichever of these exist on the host page: window.dataLayer (Google Tag Manager),
// window.gtag (GA4), window.va (Vercel Web Analytics), and an optional first-party beacon endpoint.
// Nothing personal is sent: no names, emails, or photos, only game events and counts.
import { config } from './config.js'

const SESSION_KEY = 'choicewright:session'
const STATS_KEY = 'choicewright:stats'

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

function bumpStat(name) {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    stats[name] = (stats[name] || 0) + 1
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {}
}

const seen = new Set()

export function track(name, props = {}) {
  const event = {
    event: 'first_key',
    name,
    ...props,
    session: sessionId(),
    partner: config.partner?.name || undefined,
    path: typeof location !== 'undefined' ? location.pathname : '',
    t: Date.now(),
  }
  bumpStat(name)
  try {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(event)
    // trackConversion is the host page's bridge to its marketing tags (Google, Meta). It maps
    // the meaningful events to standard conversions. Only the non-personal props above are sent.
    if (typeof window.trackConversion === 'function') window.trackConversion(name, props)
    else if (typeof window.gtag === 'function') window.gtag('event', name, props)
    if (typeof window.va === 'function') window.va('event', { name: 'game_' + name, data: props })
    if (config.analytics.endpoint) {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' })
      if (navigator.sendBeacon) navigator.sendBeacon(config.analytics.endpoint, blob)
      else fetch(config.analytics.endpoint, { method: 'POST', body: blob, keepalive: true }).catch(() => {})
    }
    if (config.analytics.debug) console.log('[first-key]', name, props)
  } catch {}
}

export function trackOnce(name, props) {
  if (seen.has(name)) return
  seen.add(name)
  track(name, props)
}

export function stats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
  } catch {
    return {}
  }
}
