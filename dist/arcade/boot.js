// Standalone arcade page bootstrap. The page names its game in data-game so no inline script is needed.
import { mountStandalone } from './arcade-core.js'
const id = document.currentScript?.dataset.game || new URL(import.meta.url).searchParams.get('game') || document.querySelector('script[data-game]')?.dataset.game
const KNOWN = ['rent-day', 'coin-catch', 'offer-match', 'inspection-hunt', 'down-payment-dash']
if (KNOWN.includes(id)) import(`./${id}.js`).then((m) => mountStandalone(m.default))
