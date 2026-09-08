// Optional, low-pressure contact forms.
// Every form here is opt-in and the game never withholds progress if the player declines,
// or if delivery fails. Posts to the erikmillerhlt.com lead API, which verifies the request with
// Cloudflare Turnstile, queues it durably, and forwards it to GoHighLevel.
// When the API is not reachable from this page (another host, or verification not configured),
// the form is replaced by direct text and email links so the player always has a way to reach Erik.
import { config, presenter, assistant } from './config.js'
import { track } from './analytics.js'

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Must match the server's consent record exactly.
export const CONSENT_VERSION = '2026-09-05'
export const CONSENT_TEXT =
  'I agree to receive text messages from Erik Miller at Patriot Home Mortgage about my inquiry. Message and data rates may apply; frequency varies. Reply STOP to opt out or HELP for help. Consent is optional and is not a condition of purchase.'

const ERRORS = {
  arizona_only: `${presenter.firstName} is licensed in Arizona, so this form needs an Arizona ZIP code. You can still text or email from anywhere.`,
  invalid_zip: 'Please enter a five-digit ZIP code.',
  invalid_email: 'That email address does not look right.',
  invalid_phone: 'That phone number does not look right. Use a 10-digit U.S. number.',
  missing_contact: 'Add the contact detail that matches how you would like to be reached.',
  text_consent_required: 'To be reached by text, check the text-message consent box, or choose email or a phone call.',
  verification_failed: 'The bot check did not pass. Try again, or text instead.',
  verification_unavailable: 'The bot check could not load right now. Text or email instead.',
  too_many_attempts: 'Too many attempts from this connection. Try again later, or text instead.',
  origin_rejected: 'This form only works on erikmillerhlt.com. Text or email instead.',
  service_unavailable: 'The message service is briefly unavailable. Text or email instead.',
}

let dialog = null
function ensureDialog() {
  if (dialog) return dialog
  dialog = document.createElement('dialog')
  dialog.id = 'lead'
  dialog.className = 'lead'
  document.body.appendChild(dialog)
  return dialog
}

const REMEMBER = 'choicewright:contact'
function remembered() {
  try {
    return JSON.parse(localStorage.getItem(REMEMBER) || 'null') || {}
  } catch {
    return {}
  }
}
function remember(v) {
  try {
    localStorage.setItem(REMEMBER, JSON.stringify({ name: v.name, email: v.email, phone: v.phone, zip: v.zip }))
  } catch {}
}
function validEmail(s) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(String(s || ''))
}
function digits(s) {
  return String(s || '').replace(/\D/g, '')
}
function oneLine(s, max) {
  return String(s || '')
    .replace(/[\x00-\x1f]+/g, ' ')
    .trim()
    .slice(0, max)
}
function slug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/* ---------- Turnstile ---------- */
let siteKeyPromise = null
function siteKey() {
  siteKeyPromise ||= fetch(config.leadEndpoint, { cache: 'no-store', credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('lead api ' + r.status))))
    .then((b) => {
      if (!b.turnstile_site_key) throw new Error('no site key')
      return new Promise((resolve, reject) => {
        if (window.turnstile) return resolve(b.turnstile_site_key)
        const s = document.createElement('script')
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        s.async = true
        s.onload = () => resolve(b.turnstile_site_key)
        s.onerror = () => reject(new Error('turnstile script'))
        document.head.appendChild(s)
      })
    })
  siteKeyPromise.catch(() => {
    siteKeyPromise = null
  })
  return siteKeyPromise
}

export function contactLinks(subject = 'A question from The First Key game', body = '') {
  return {
    call: 'tel:' + presenter.phoneHref,
    text: 'sms:' + presenter.phoneHref + (body ? '?&body=' + encodeURIComponent(body) : ''),
    email: 'mailto:' + presenter.email + '?subject=' + encodeURIComponent(subject) + (body ? '&body=' + encodeURIComponent(body) : ''),
    site: presenter.site,
  }
}

function fallbackView(d, o, reason, finish) {
  const summary = contextSummary(o.context)
  const links = contactLinks(o.title, `Hi ${presenter.firstName}, ${o.fallbackIntro || 'I played The First Key.'} ${summary}`.slice(0, 900))
  d.innerHTML = `<div class="lead-form">
    <div class="story-top"><span class="eyebrow">${esc(o.eyebrow || 'REACH ' + presenter.firstName.toUpperCase())}</span><button type="button" class="lead-close" aria-label="Close">✕</button></div>
    <div class="lead-body">
      <div class="lead-presenter"><img src="${esc(presenter.headshot)}" alt="" width="56" height="56"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)} · NMLS #${esc(presenter.nmls)}</small></div></div>
      <h2>${esc(o.title)}</h2>
      <p>${esc(reason || ERRORS.origin_rejected)}</p>
      <p>Text or email starts a message with your game summary already filled in. ${esc(presenter.firstName)} and ${esc(assistant.firstName)} read every one.</p>
      <div class="utility-actions"><a class="primary" href="${esc(links.text)}">Text ${esc(presenter.firstName)}</a><a class="secondary" href="${esc(links.email)}">Email</a><a class="secondary" href="${esc(links.call)}">Call ${esc(presenter.phone)}</a><button type="button" class="secondary lead-skip">Not right now</button></div>
      <p class="small">Nothing is sent until you press send in your own messaging or email app. Not a loan application and no credit pull.</p>
    </div></div>`
  d.querySelector('.lead-close').onclick = () => finish({ ok: false, skipped: true, delivered: false, fallback: true })
  d.querySelector('.lead-skip').onclick = () => finish({ ok: false, skipped: true, delivered: false, fallback: true })
  d.querySelectorAll('a').forEach((a) => (a.onclick = () => {
    track('contact_click', { via: a.textContent.split(' ')[0].toLowerCase(), funnel: o.funnel })
    setTimeout(() => finish({ ok: true, delivered: false, fallback: true, name: '', email: '' }), 200)
  }))
}

function contextSummary(ctx) {
  if (!ctx) return ''
  return Object.entries(ctx)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${String(v).replace(/[;\n\r]+/g, ' ')}`)
    .join('; ')
    .slice(0, 2000)
}

/**
 * Open a contact form.
 * @param {object} o
 * @param {string} o.funnel   game-plan | game-question | game-portal | game-episode
 * @param {string} o.eyebrow  small label above the title
 * @param {string} o.title
 * @param {string} o.intro    one or two sentences, plain language
 * @param {string} o.submit   button label
 * @param {string} [o.messageLabel] show a free-text field with this label
 * @param {string} [o.goal]    the player's stated goal (required by the API)
 * @param {string} [o.timeline] the player's stated timing (required by the API)
 * @param {object} [o.context] game summary fields, sent as one line
 * @returns {Promise<{ok:boolean, delivered:boolean, skipped?:boolean, fallback?:boolean, name?:string, email?:string}>}
 */
export function requestLead(o) {
  const d = ensureDialog()
  const prev = remembered()
  track('lead_open', { funnel: o.funnel })
  return new Promise(async (resolve) => {
    let done = false
    let widget = null
    let token = ''
    const finish = (r) => {
      if (done) return
      done = true
      try {
        if (widget !== null && window.turnstile) window.turnstile.remove(widget)
      } catch {}
      d.close()
      resolve(r)
    }
    d.oncancel = (e) => {
      e.preventDefault()
      finish({ ok: false, skipped: true, delivered: false })
    }
    if (!d.open) d.showModal()
    d.innerHTML = `<div class="lead-body"><p class="small">One moment…</p></div>`
    let key = ''
    try {
      key = await siteKey()
    } catch (e) {
      track('lead_fallback', { funnel: o.funnel, reason: 'unreachable' })
      return fallbackView(d, o, ERRORS.origin_rejected, finish)
    }
    d.innerHTML = `<form method="dialog" class="lead-form" novalidate>
      <div class="story-top"><span class="eyebrow">${esc(o.eyebrow || 'A MESSAGE FOR ' + presenter.firstName.toUpperCase())}</span><button type="button" class="lead-close" aria-label="Close">✕</button></div>
      <div class="lead-body">
        <div class="lead-presenter"><img src="${esc(presenter.headshot)}" alt="" width="56" height="56"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)} · NMLS #${esc(presenter.nmls)}</small></div></div>
        <h2>${esc(o.title)}</h2>
        <p>${esc(o.intro)}</p>
        <div class="lead-fields">
          <label>Your name<input name="name" type="text" autocomplete="name" maxlength="60" value="${esc(prev.name || '')}" required></label>
          <label>ZIP code <span class="muted">(Arizona)</span><input name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]{5}" value="${esc(prev.zip || '')}" placeholder="85001" required></label>
          <label>How should ${esc(presenter.firstName)} reach you?<select name="preferred_contact"><option value="email">Email</option><option value="phone">Phone call</option><option value="text">Text message</option></select></label>
          <label class="f-email">Email<input name="email" type="email" autocomplete="email" maxlength="120" value="${esc(prev.email || '')}" placeholder="you@example.com"></label>
          <label class="f-phone" hidden>Mobile<input name="phone" type="tel" autocomplete="tel" maxlength="20" value="${esc(prev.phone || '')}" placeholder="(555) 555-5555"></label>
          ${o.messageLabel ? `<label class="wide">${esc(o.messageLabel)}<textarea name="message" rows="3" maxlength="600"></textarea></label>` : ''}
          <input name="hp" type="text" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
        </div>
        <label class="lead-consent f-consent" hidden><input type="checkbox" name="consent"><span>${esc(CONSENT_TEXT)}</span></label>
        <div class="lead-challenge"></div>
        <p class="lead-error" hidden></p>
        <div class="utility-actions"><button type="submit" class="primary">${esc(o.submit || 'Send')}</button><button type="button" class="secondary lead-skip">Not right now</button></div>
        <p class="small">Optional. Sends only what you type here plus a short summary of your game choices, so ${esc(presenter.firstName)} knows what you were exploring. Not a loan application and no credit pull. Licensed in ${esc(presenter.licensedIn)}.</p>
      </div></form>`
    const form = d.querySelector('form'),
      err = d.querySelector('.lead-error')
    const showError = (t) => {
      err.textContent = t
      err.hidden = false
    }
    const preference = () => {
      const v = form.elements.preferred_contact.value
      form.querySelector('.f-email').hidden = v !== 'email'
      form.querySelector('.f-phone').hidden = v === 'email'
      form.querySelector('.f-consent').hidden = v !== 'text'
    }
    form.elements.preferred_contact.onchange = preference
    preference()
    d.querySelector('.lead-close').onclick = () => finish({ ok: false, skipped: true, delivered: false })
    d.querySelector('.lead-skip').onclick = () => finish({ ok: false, skipped: true, delivered: false })
    try {
      widget = window.turnstile.render(d.querySelector('.lead-challenge'), {
        sitekey: key,
        action: 'lead',
        theme: 'dark',
        callback: (t) => {
          token = t
          err.hidden = true
        },
        'expired-callback': () => (token = ''),
        'error-callback': () => {
          token = ''
          showError(ERRORS.verification_unavailable)
        },
      })
    } catch {
      widget = null
    }
    form.onsubmit = async (e) => {
      e.preventDefault()
      const v = Object.fromEntries(new FormData(form).entries())
      const name = oneLine(v.name, 60),
        zip = digits(v.zip).slice(0, 5),
        preferred = ['email', 'phone', 'text'].includes(v.preferred_contact) ? v.preferred_contact : 'email',
        email = preferred === 'email' ? oneLine(v.email, 120).toLowerCase() : '',
        phone = preferred === 'email' ? '' : digits(v.phone),
        consent = preferred === 'text' && v.consent === 'on'
      if (!name) return showError('Please add your name so we know who to answer.')
      if (!/^\d{5}$/.test(zip)) return showError(ERRORS.invalid_zip)
      if (+zip < 85000 || +zip > 86599) return showError(ERRORS.arizona_only)
      if (preferred === 'email' && !validEmail(email)) return showError(ERRORS.invalid_email)
      if (preferred !== 'email' && phone.length !== 10 && !(phone.length === 11 && phone[0] === '1')) return showError(ERRORS.invalid_phone)
      if (preferred === 'text' && !consent) return showError(ERRORS.text_consent_required)
      if (!token) return showError(widget === null ? ERRORS.verification_unavailable : 'Please wait for the bot check to finish, then send again.')
      const btn = form.querySelector('button[type=submit]')
      btn.disabled = true
      btn.textContent = 'Sending…'
      remember({ name, email, phone, zip })
      const payload = {
        submission_id: crypto.randomUUID(),
        funnel: o.funnel,
        goal: oneLine(o.goal || 'Learning about buying a home', 120),
        timeline: oneLine(o.timeline || 'Just exploring', 60),
        zip,
        name,
        email,
        phone,
        preferred_contact: preferred,
        consent,
        consent_version: CONSENT_VERSION,
        partner: slug(config.partner?.name),
        page: location.pathname,
        turnstile_token: token,
        hp: v.hp || '',
        message: oneLine(v.message, 600),
        game_context: contextSummary(o.context),
      }
      let delivered = false,
        reason = ''
      try {
        const r = await fetch(config.leadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(55000),
        })
        const j = await r.json().catch(() => ({}))
        delivered = r.ok && j.ok === true
        if (!delivered) reason = j.error || 'http_' + r.status
      } catch {
        reason = 'network'
      }
      if (!delivered) {
        track('lead_error', { funnel: o.funnel, reason })
        btn.disabled = false
        btn.textContent = o.submit || 'Send'
        if (['verification_failed', 'verification_unavailable'].includes(reason) && window.turnstile && widget !== null) {
          token = ''
          try {
            window.turnstile.reset(widget)
          } catch {}
        }
        if (['origin_rejected', 'service_unavailable', 'network', 'too_many_attempts'].includes(reason) || reason.startsWith('http_5'))
          return fallbackView(d, o, ERRORS[reason] || ERRORS.service_unavailable, finish)
        return showError(ERRORS[reason] || 'That could not be sent. Check the details and try again, or text instead.')
      }
      track('lead_submit', { funnel: o.funnel, delivered: true })
      finish({ ok: true, delivered: true, reason: '', name, email, phone })
    }
    setTimeout(() => form.querySelector(prev.name ? 'input[name=zip]' : 'input[name=name]')?.focus(), 30)
  })
}
