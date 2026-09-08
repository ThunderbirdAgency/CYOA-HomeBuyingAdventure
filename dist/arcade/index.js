// The arcade hall. Five machines standing in a room; switch one on and it opens full-screen
// with the real game running inside its own bezel. Each game still has its own page for
// sharing — the cabinet just saves a page load.
import { presenter, config } from '../config.js'
import { track } from '../analytics.js'
import { runGame } from './arcade-core.js'

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const $ = (sel, root = document) => root.querySelector(sel)

const KNOWN = ['rent-day', 'coin-catch', 'offer-match', 'inspection-hunt', 'down-payment-dash']

/* ---------------------------------------------------------------- side panel and footer */
$('#presenter').innerHTML = `<div class="presenter-card"><img src="${esc(presenter.headshot)}" alt="" width="64" height="64"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)}<br>NMLS #${esc(presenter.nmls)} · Licensed in ${esc(presenter.licensedIn)}</small></div></div><div class="utility-actions"><a class="primary" href="${esc(config.gameUrl)}">Play the full adventure →</a><a class="secondary" href="tel:${esc(presenter.phoneHref)}">Call ${esc(presenter.firstName)}</a><a class="secondary" href="sms:${esc(presenter.phoneHref)}">Text ${esc(presenter.firstName)}</a></div>`

// Said before anyone plays, not after. Offer Match in particular puts two interest rates on
// screen, and both of them are invented for the game.
$('#disclosure').innerHTML = `<h3>Before you play</h3>
  <p>These are games. Every number in them — prices, rates, payments, coins — is made up for the
  story. Nothing here is a rate quote, an advertisement of terms, an offer, or a commitment to
  lend, and nothing you do in the arcade is an application.</p>
  <p>Your real interest rate and APR depend on your credit, loan program, occupancy, property,
  loan amount, down payment, and the market when you lock. Those numbers arrive on a Loan
  Estimate after you apply. ${esc(presenter.firstName)} will happily walk you through a real one.</p>
  <p>${esc(presenter.name)}, ${esc(presenter.role)} · NMLS #${esc(presenter.nmls)} · ${esc(presenter.company)} · Licensed in ${esc(presenter.licensedIn)} · Equal Housing Lender</p>`

$('#foot').innerHTML = `<span>A CHOICEWRIGHT ORIGINAL ✦ presented by ${esc(presenter.name)}</span><small>${esc(presenter.legal)}</small>`

/* ------------------------------------------------------------------ switching one on */
const stage = $('#cab-stage')
let running = null
let lastFocus = null

function closeCabinet() {
  if (!running) return
  running.session?.destroy()
  running = null
  stage.hidden = true
  stage.innerHTML = ''
  document.body.style.overflow = ''
  lastFocus?.focus()
}

async function openCabinet(id, cabinet) {
  if (!KNOWN.includes(id) || running) return
  lastFocus = cabinet.querySelector('.cab-body')
  const title = cabinet.querySelector('.cab-marquee span').textContent
  track('arcade_cabinet', { game: id })

  stage.hidden = false
  document.body.style.overflow = 'hidden'
  stage.innerHTML = `<div class="cab-open" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <span class="cab-marquee"><span>${esc(title)}</span></span>
      <div class="cab-open-screen" id="cab-screen"><p class="cab-loading">Warming up the machine…</p></div>
      <span class="cab-deck"><span class="stick"></span><span class="knob k1"></span><span class="knob k2"></span></span>
      <div class="cab-open-base">
        <button type="button" id="cab-back">← Back to the arcade</button>
        <span class="cab-open-lesson" id="cab-lesson"></span>
        <a class="cab-perma" href="${esc(id)}/">Its own page ↗</a>
      </div>
    </div>`
  $('#cab-back').onclick = closeCabinet
  $('#cab-back').focus() // the machine is now the page; take the keyboard with it

  let mod
  try {
    mod = await import(`./${id}.js`)
  } catch {
    $('#cab-screen').innerHTML = `<p class="cab-loading">That machine is out of order. <a href="${esc(id)}/">Try its own page</a>.</p>`
    return
  }
  const game = mod.default
  $('#cab-lesson').textContent = game.lesson
  $('#cab-screen').innerHTML = ''
  const session = runGame(game, {
    container: '#cab-screen',
    actions: [
      { label: 'Play the full adventure →', primary: true, onClick: () => (location.href = config.gameUrl) },
      { label: 'Back to the arcade', onClick: closeCabinet },
    ],
  })
  running = { id, session }
}

for (const cabinet of document.querySelectorAll('.cabinet')) {
  cabinet.querySelector('.cab-body').addEventListener('click', () => openCabinet(cabinet.dataset.game, cabinet))
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && running) {
    e.preventDefault()
    closeCabinet()
  }
})
// A machine can be linked directly: /arcade/#play=coin-catch
const wanted = new URLSearchParams(location.hash.slice(1)).get('play')
if (wanted) {
  const cabinet = document.querySelector(`.cabinet[data-game="${CSS.escape(wanted)}"]`)
  if (cabinet) openCabinet(wanted, cabinet)
}

track('arcade_index')
