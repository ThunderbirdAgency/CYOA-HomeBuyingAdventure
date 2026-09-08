import { presenter, config } from '../config.js'
import { track } from '../analytics.js'
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
document.querySelector('#presenter').innerHTML = `<div class="presenter-card"><img src="${esc(presenter.headshot)}" alt="" width="64" height="64"><div><strong>${esc(presenter.name)}</strong><small>${esc(presenter.role)} · ${esc(presenter.company)}<br>NMLS #${esc(presenter.nmls)} · Licensed in ${esc(presenter.licensedIn)}</small></div></div><div class="utility-actions"><a class="primary" href="${esc(config.gameUrl)}">Play the full adventure →</a><a class="secondary" href="tel:${esc(presenter.phoneHref)}">Call ${esc(presenter.firstName)}</a><a class="secondary" href="sms:${esc(presenter.phoneHref)}">Text ${esc(presenter.firstName)}</a></div>`
document.querySelector('#foot').innerHTML = `<span>A CHOICEWRIGHT ORIGINAL ✦ presented by ${esc(presenter.name)}</span><small>${esc(presenter.legal)}</small>`
track('arcade_index')
