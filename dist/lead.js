// Optional, low-pressure contact forms.
// Every form here is opt-in and the game never withholds progress if the player declines,
// or if delivery fails. Posts to the erikmillerhlt.com lead API, which forwards to GoHighLevel.
import { config, presenter } from './config.js'
import { track } from './analytics.js'

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

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
    localStorage.setItem(REMEMBER, JSON.stringify({ name: v.name, email: v.email, phone: v.phone }))
  } catch {}
}

function validEmail(s) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(String(s || ''))
}
function digits(s) {
  return String(s || '').replace(/\D/g, '')
}

/**
 * Open a contact form.
 * @param {object} o
 * @param {string} o.funnel   game | game-plan | game-portal | game-episode | game-question
 * @param {string} o.eyebrow  small label above the title
 * @param {string} o.title
 * @param {string} o.intro    one or two sentences, plain language
 * @param {string} o.submit   button label
 * @param {string} [o.messageLabel] show a free-text field with this label
 * @param {object} [o.context] extra fields sent with the lead (game state summary)
 * @param {boolean} [o.optionalPhone] phone not required (default: email OR phone required)
 * @returns {Promise<{ok:boolean, delivered:boolean, name:string, email:string, skipped?:boolean}>}
 */
export function requestLead(o) {
  const d = ensureDialog()
  const prev = remembered()
  const startedAt = Date.now()
  track('lead_open', { funnel: o.funnel })
  return new Promise((resolve) => {
    let done = false
    const finish = (r) => {
      if (done) return
      done = true
      d.close()
      resolve(r)
    }
    d.innerHTML = `<form method="dialog" class="lead-form" novalidate>
      <div class="story-top"><span class="eyebrow">${esc(o.eyebrow || 'A MESSAGE FOR ' + presenter.firstName.toUpperCase())}</span><button type="button" class="lead-close" aria-label="Close">✕</button></div>
      <div class="lead-body">
        <div class="lead-presenter"><img src="${esc(presenter.headshot)}" alt="" width="56" height="56"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)} · NMLS #${esc(presenter.nmls)}</small></div></div>
        <h2>${esc(o.title)}</h2>
        <p>${esc(o.intro)}</p>
        <div class="lead-fields">
          <label>Your name<input name="name" type="text" autocomplete="name" maxlength="60" value="${esc(prev.name || '')}" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" maxlength="120" value="${esc(prev.email || '')}" placeholder="you@example.com"></label>
          <label>Mobile <span class="muted">(optional)</span><input name="phone" type="tel" autocomplete="tel" maxlength="20" value="${esc(prev.phone || '')}" placeholder="(555) 555-5555"></label>
          ${o.messageLabel ? `<label class="wide">${esc(o.messageLabel)}<textarea name="message" rows="3" maxlength="600"></textarea></label>` : ''}
          <input name="hp" type="text" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
        </div>
        <label class="lead-consent"><input type="checkbox" name="consent"><span>It's okay to text me. Message and data rates may apply. Reply STOP to opt out.</span></label>
        <p class="lead-error" hidden></p>
        <div class="utility-actions"><button type="submit" class="primary">${esc(o.submit || 'Send')}</button><button type="button" class="secondary lead-skip">Not right now</button></div>
        <p class="small">Optional. Sends only what you type here plus a short summary of your game choices, so ${esc(presenter.firstName)} knows what you were exploring. Not a loan application and no credit pull. Licensed in ${esc(presenter.licensedIn)}.</p>
      </div></form>`
    const form = d.querySelector('form'),
      err = d.querySelector('.lead-error')
    d.querySelector('.lead-close').onclick = () => finish({ ok: false, skipped: true, delivered: false })
    d.querySelector('.lead-skip').onclick = () => finish({ ok: false, skipped: true, delivered: false })
    d.oncancel = (e) => {
      e.preventDefault()
      finish({ ok: false, skipped: true, delivered: false })
    }
    form.onsubmit = async (e) => {
      e.preventDefault()
      const v = Object.fromEntries(new FormData(form).entries())
      v.name = String(v.name || '').trim()
      v.email = String(v.email || '').trim().toLowerCase()
      v.phone = String(v.phone || '').trim()
      if (!v.name) return showError('Please add your name so we know who to answer.')
      if (!validEmail(v.email) && digits(v.phone).length < 10)
        return showError('Add an email address or a mobile number so we have a way to reply.')
      const btn = form.querySelector('button[type=submit]')
      btn.disabled = true
      btn.textContent = 'Sending…'
      remember(v)
      const payload = {
        funnel: o.funnel || 'game',
        name: v.name,
        email: v.email,
        phone: v.phone,
        consent: v.consent ? 'yes' : '',
        hp: v.hp || '',
        started_at: startedAt,
        submitted_at: new Date().toISOString(),
        page: location.pathname + location.search,
        referrer: document.referrer || '',
        partner: config.partner?.name || '',
        source_game: 'The First Key',
        ...(v.message ? { message: String(v.message).slice(0, 600) } : {}),
        ...(o.context || {}),
      }
      let delivered = false,
        reason = ''
      try {
        const r = await fetch(config.leadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const j = await r.json().catch(() => ({}))
        delivered = r.ok && j.ok !== false
        if (!delivered) reason = j.error || 'http_' + r.status
      } catch (e2) {
        reason = 'network'
      }
      track('lead_submit', { funnel: o.funnel, delivered, reason })
      finish({ ok: true, delivered, reason, name: v.name, email: v.email, phone: v.phone })
    }
    function showError(t) {
      err.textContent = t
      err.hidden = false
    }
    if (!d.open) d.showModal()
    setTimeout(() => form.querySelector(prev.name ? 'input[name=email]' : 'input[name=name]')?.focus(), 30)
  })
}

/** Direct contact links (no form). */
export function contactLinks() {
  return {
    call: 'tel:' + presenter.phoneHref,
    text: 'sms:' + presenter.phoneHref,
    email:
      'mailto:' +
      presenter.email +
      '?subject=' +
      encodeURIComponent('A question from The First Key game'),
    site: presenter.site,
  }
}
