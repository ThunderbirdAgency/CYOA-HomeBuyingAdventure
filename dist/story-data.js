import { defaultProfile, cleanProfile as cleanProfileForRestore } from './profile.js'
export const sources = {
  budget: {
    title: 'Planning the full cost of a home',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/',
    note: 'Monthly ownership costs, cash for closing, and keeping an emergency cushion.',
  },
  loans: {
    title: 'Request and review multiple Loan Estimates',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/compare/request-and-review-multiple-loan-estimates/',
    note: 'Compare equivalent loan offers; a Loan Estimate is not a loan approval.',
  },
  inspection: {
    title: 'Schedule a home inspection',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/close/schedule-a-home-inspection/',
    note: 'Inspection versus appraisal; repair negotiations depend on the contract and circumstances.',
  },
  credit: {
    title: 'Credit reports and scores',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/',
    note: 'Reports, scores, checking your own information, and recognizing credit-repair scams.',
  },
  dispute: {
    title: 'How to dispute an error on your credit report',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-dispute-an-error-on-my-credit-report-en-314/',
    note: 'Contact the reporting company and information provider, explain the error, and supply supporting documents.',
  },
  rebuild: {
    title: 'How to rebuild your credit',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/how-to-rebuild-your-credit/',
    note: 'Pay on time, manage balances, and build a record over time; no guaranteed score gain.',
  },
  ftc: {
    title: 'Disputing errors on your credit reports',
    publisher: 'Federal Trade Commission',
    url: 'https://consumer.ftc.gov/articles/disputing-errors-your-credit-reports',
    note: 'Review your reports and dispute inaccurate or incomplete information with evidence.',
  },
  loanTypes: {
    title: 'Understand loan options',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/loan-options/',
    note: 'Conventional, FHA, VA, and USDA loans differ in down payment, mortgage insurance, and who qualifies.',
  },
  va: {
    title: 'VA-backed home loans',
    publisher: 'U.S. Department of Veterans Affairs',
    url: 'https://www.va.gov/housing-assistance/home-loans/',
    note: 'Nearly 90% of VA-backed purchase loans are made with no down payment; a funding fee and closing costs apply.',
  },
  homePlus: {
    title: 'Home Plus down payment assistance',
    publisher: 'Arizona Industrial Development Authority',
    url: 'https://www.homeplusaz.com/',
    note: 'Up to 4% in down payment and closing cost assistance, available statewide. Terms and eligibility change; confirm current rules.',
  },
  homeInFive: {
    title: 'Home in Five Advantage',
    publisher: 'Maricopa County program',
    url: 'https://www.homein5.org/',
    note: 'Up to 5% assistance for down payment and closing costs, with an additional 1% for eligible buyers. Confirm current rules.',
  },
  preapproval: {
    title: 'Get a preapproval letter',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/explore/get-a-preapproval-letter/',
    note: 'What lenders look at, the documents they may ask for, and what a preapproval letter does and does not promise.',
  },
  agency: {
    title: 'Property Buyer’s Checklist (Home or Land)',
    publisher: 'Arizona Department of Real Estate',
    url: 'https://azre.gov/consumers/property-buyers-checklist-home-or-land',
    note: 'The seller’s broker represents the seller, not you. You may wish to retain a buyer’s broker to represent you in the transaction.',
  },
  process: {
    title: 'Buying a house',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/process/',
    note: 'The order of the steps: preparing, shopping, making an offer, and closing.',
  },
  downPayment: {
    title: 'Determine your down payment',
    publisher: 'Consumer Financial Protection Bureau',
    url: 'https://www.consumerfinance.gov/owning-a-home/prepare/determine-your-down-payment/',
    note: 'A larger down payment usually means a lower monthly payment and can reduce or avoid mortgage insurance.',
  },
}
export const locations = [
  {
    id: 'cottage',
    name: 'Your cottage',
    quest: 'Get out of rent day',
    x: 23,
    y: 70,
    symbol: '✉',
    start: 'wake',
    requires: [],
  },
  {
    id: 'homes',
    name: 'Three-door lane',
    quest: 'Get a house under contract',
    x: 80,
    y: 45,
    symbol: '⌂',
    start: 'openhouse',
    requires: [],
  },
  {
    id: 'guild',
    name: 'Hearthvale Realty',
    quest: 'Choose an agent who works for you',
    x: 25,
    y: 20,
    symbol: '⚑',
    start: 'office',
    requires: [],
  },
  {
    id: 'market',
    name: 'The provisioner',
    quest: 'Know what you can carry',
    x: 28,
    y: 44,
    symbol: '◇',
    start: 'market',
    requires: [],
  },
  {
    id: 'gate',
    name: 'The Loan Castle',
    quest: 'Get pre-approved',
    x: 75,
    y: 70,
    symbol: '⚿',
    start: 'castle',
    // You can walk up to the gate whenever you like, but nobody writes a loan for a buyer
    // with no one representing them. Find an agent first.
    needs: 'agent',
    requires: [],
  },
  {
    id: 'lookout',
    name: 'The mapmaker’s tower',
    quest: 'Chart the road ahead',
    x: 57,
    y: 23,
    symbol: '▤',
    start: 'course',
    requires: [],
  },
]
export const items = [
  {
    id: 'compass',
    symbol: '✥',
    title: 'The Budget Compass',
    text: 'A home should leave room for the rest of your life.',
  },
  {
    id: 'lens',
    symbol: '◈',
    title: 'The Clear-Sight Lens',
    text: 'Compare the details. Ask who benefits and what you are paying for.',
  },
  {
    id: 'map',
    symbol: '▤',
    title: 'The Homeward Map',
    text: 'Understand the steps, then choose where your own journey begins.',
  },
  {
    id: 'key',
    symbol: '⚿',
    title: 'The First Key',
    text: 'You earned a clearer next step, not a mortgage approval.',
  },
  {
    id: 'satchel',
    symbol: '▣',
    title: 'The Ready Satchel',
    text: 'Your five documents, recovered from the Augusta wind and organized by Albert. Half of pre-approval is having these ready.',
    bonus: true,
  },
  {
    id: 'rune',
    symbol: '◎',
    title: 'The Compass Rune',
    text: 'A number is not your story. The Credit Compass series will open here.',
    bonus: true,
  },
]

// Coins scattered along Hearthvale's paths. Walk over one to pick it up. Positions are map percentages.
export const mapCoins = [
  { id: 'c1', x: 16.9, y: 45.7 },
  { id: 'c2', x: 33.6, y: 30.1 },
  { id: 'c3', x: 84.1, y: 64.5 },
  { id: 'c4', x: 71.6, y: 52.7 },
  { id: 'c5', x: 37.2, y: 44.9 },
  { id: 'c6', x: 17.4, y: 27.7 },
  { id: 'c7', x: 54.9, y: 36.3 },
  { id: 'c8', x: 45.6, y: 21.5 },
  { id: 'c9', x: 66.9, y: 69.1 },
  { id: 'c10', x: 18.5, y: 79.3 },
  { id: 'c11', x: 81.5, y: 75.4 },
  { id: 'c12', x: 78.4, y: 57.4 },
]

// The player's paperwork, scattered by the Augusta wind. Appears once Albert marks the map; walk over each to recover it.
export const mapDocs = [
  { id: 'paystub', label: 'Your pay stubs', x: 45.6, y: 62.1, why: 'Recent pay stubs show current income.' },
  { id: 'w2', label: 'Your W-2s', x: 64.8, y: 42.6, why: 'Two years of W-2s (or tax returns if self-employed) show income history.' },
  { id: 'bank', label: 'Your bank statements', x: 44.0, y: 34.0, why: 'Statements show savings for the down payment, closing costs, and reserves.' },
  { id: 'photoid', label: 'Your photo ID', x: 91.9, y: 48.0, why: 'A government ID confirms who is applying.' },
  { id: 'tax', label: 'Your tax returns', x: 34.1, y: 58.2, why: 'Returns fill in the income picture, especially for bonuses or self-employment.' },
]

// The three agents you can end up with. Percival is the one holding the open house, so he is
// the seller's agent until and unless you hire him yourself.
export const agents = [
  {
    id: 'wren',
    name: 'Wren Alcott',
    tag: 'asks first, talks second',
    line: 'Wanted to know what you were trying to get away from before she said a word about houses.',
  },
  {
    id: 'dashiell',
    name: 'Dashiell Vane',
    tag: 'fast, busy, everywhere',
    line: 'Sold more houses this year than anyone on the board, and can tell you all of them.',
  },
  {
    id: 'percival',
    name: 'Percival Bright',
    tag: 'the one from the open house',
    line: 'Holds the door at Lantern House. Works for the seller unless you say otherwise.',
  },
]

// Inspections you can order once an offer is accepted. Cost comes out of the emergency pouch.
export const inspectionKinds = [
  {
    id: 'home',
    name: 'General home inspection',
    cost: 450,
    finds: 'The whole house, top to bottom: roof, systems, structure, and the things that turn into other things.',
  },
  {
    id: 'roof',
    name: 'Roof specialist',
    cost: 300,
    finds: 'A roofer goes up and puts a number and a remaining life on what the general inspector could only flag.',
  },
  {
    id: 'sewer',
    name: 'Sewer scope',
    cost: 250,
    finds: 'A camera down the line. Older pipe, tree roots, and a bill nobody sees coming.',
  },
  {
    id: 'termite',
    name: 'Termite and pest',
    cost: 150,
    finds: 'Wood-destroying insects. Cheap to check, expensive to discover afterwards.',
  },
]

// A hidden spot on the map. Not a quest location; finding it is its own reward.
export const secretSpots = [
  { id: 'portal', x: 39, y: 13, name: 'A ring of humming stones', start: 'portal', radius: 9 },
]

// Future chapters. Shown in the Series panel and as a locked pin on the map.
export const episodes = [
  {
    number: 1,
    id: 'first-key',
    title: 'The First Key',
    status: 'playable',
    tagline: 'Gather three tools, face a house decision, and reach the lantern bridge.',
  },
  {
    number: 2,
    id: 'preapproval-scroll',
    title: 'The Pre-Approval Scroll',
    status: 'next',
    tagline: 'Gather your documents, meet the lender, and learn what a pre-approval really says.',
    teaser: [
      'The road beyond the bridge leads to the house on the hill, where a scroll is waiting.',
      'Pay stubs, statements, and a credit picture: what a lender looks at, why, and what a pre-approval letter does and does not promise.',
      'Meet Erik at the gate for a fictional pre-approval walkthrough. No documents are uploaded in the game.',
    ],
  },
  {
    number: 3,
    id: 'offer-at-dawn',
    title: 'The Offer at Dawn',
    status: 'planned',
    tagline: 'Write an offer, understand earnest money, and choose your contingencies.',
  },
  {
    number: 4,
    id: 'under-contract',
    title: 'Under Contract',
    status: 'planned',
    tagline: 'Inspection, appraisal, underwriting, and the deadlines that keep a deal alive.',
  },
  {
    number: 5,
    id: 'closing-day',
    title: 'Closing Day',
    status: 'planned',
    tagline: 'Read the Closing Disclosure, do the final walkthrough, and turn the key.',
  },
]
export const teaserPins = [
  { id: 'episode2', x: 91, y: 9, name: 'The house on the hill', label: 'EPISODE 2', episode: 2 },
]
// A choice. `extra` carries typed effects the engine applies on the way through —
// `order` books an inspection, for instance — so scenes stay data rather than code.
const c = (label, to, detail = '', set = {}, extra = {}) => ({ label, to, detail, set, ...extra })
export const episode = {
  id: 'first-key',
  version: 4,
  title: 'The First Key',
  estimatedMinutes: 10,
  nodes: {
    wake: {
      speaker: 'Bartleby Quill · your landlord',
      symbol: '✉',
      title: 'You were having such a nice dream.',
      text: [
        `You are asleep. In the dream there is a door with your name on it. Then the door starts knocking, which dream doors do not usually do, and you open your eyes to find Bartleby Quill already standing in your kitchen in a plum coat and a hat one size too tall, ledger open, palm out.`,
        `“Rent,” he beams. “Plus a convenience fee. A doorknob levy, you have two. And the sunlight surcharge, your window faces east, which is a premium exposure.” He lifts your month out of the jar on the shelf, licks a fingertip, and turns a page. “Also the walls are looking beige. Do not paint them.”`,
        `The door closes. The jar is lighter. Through the window, the roofs of Hearthvale are going gold, and somewhere out there is a door that nobody gets to knock on but you.`,
      ],
      minigame: 'rent-day',
      minigameLabel: 'Keep what you can →',
      minigameBlurb: 'Bartleby is coming back for the rest. Catch the coins before he does.',
      choices: [
        c('Right. I want a door of my own.', 'rowan', 'Get up. Go outside. Start.'),
      ],
    },
    rowan: {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'Then let’s go and get one, {{name}}.',
      text: [
        `Someone is leaning on your fence as though they have been waiting a while. “Rowan. I help people stop paying Bartleby.” They tip their chin at the town. “Two places worth your boots today. There is an open house on Three-Door Lane, and there is the realty office up the hill. Either one. Nobody minds which order.”`,
        `“One question before you go, because it decides everything after it. If a door had your name on it, what would you want on the other side?”`,
      ],
      choices: [
        c('Somewhere to settle in.', '@next', 'Stability. A place that stays put.', { goal: 'stability' }),
        c('More room for my life.', '@next', 'Space. For people, work, or both.', { goal: 'space' }),
        c('Walls I am allowed to paint.', '@next', 'Control. Bartleby would hate it.', { goal: 'control' }),
      ],
      complete: 'cottage',
    },
    'cottage-again': {
      speaker: 'Your cottage · rented, for now',
      symbol: '✉',
      title: 'Still Bartleby’s. For now.',
      text: [
        `The kettle is where you left it. So is the receipt with its cheerful little stamp, and the jar with less in it than there was this morning.`,
        `{{questHint}}`,
      ],
      choices: [c('Back out to Hearthvale.', '@close', 'The town is waiting.')],
    },
    market: {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'The price on the sign.',
      text: [
        `Mira’s shop smells of oranges and bread. You reach for the largest travel pack. She raises an eyebrow. “Everything fits in that one. Including the things you don’t need.”`,
        `She rolls out two brochures. Willow Cottage: $1,600 a month, in bold. Lantern House: $2,200. “Those are only the loan payments. Turn them over.”`,
        `The quieter numbers tell the rest of the story.`,
      ],
      widget: 'compare',
      source: 'budget',
      choices: [
        c('Willow: keep more room in the budget.', 'budget-choice', 'Total housing budget: $2,400/month.', {
          home: 'willow',
          housing: 2400,
        }),
        c('Lantern: I value the extra space.', 'budget-choice', 'Total housing budget: $3,300/month.', {
          home: 'lantern',
          housing: 3300,
        }),
      ],
    },
    'budget-choice': {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'What is left for living?',
      text: [
        `Mira counts out six stacks. “Take-home, $6,000. Living costs and debts, $2,100. You want to save $500.”`,
        `She slides your home’s costs across. That leaves {{margin}} a month to absorb anything you did not see coming.`,
        `“Space is worth something. So is sleeping through a strange noise from the refrigerator. Which trade can you live with?”`,
      ],
      widget: 'monthly',
      source: 'budget',
      choices: [
        c('Keep this choice and plan for surprises.', 'reserve', 'Your tradeoff follows you into the story.'),
        c('Look at the two homes again.', 'market', 'Nothing is committed yet.'),
      ],
    },
    reserve: {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'Pack for the unexpected.',
      text: [
        `Mira sets your savings out: $18,000. Ten for the down payment, three for closing costs, one to move. Four thousand left.`,
        `Across the shop, a beautiful furniture set. You can picture it. Mira sets an empty emergency pouch beside it. “Same coins. Two jobs.”`,
        `Split the $4,000. Practice with a fictional cushion, not a recommended reserve.`,
      ],
      widget: 'reserve',
      source: 'budget',
      choices: [
        c('Pack my satchel.', 'market-end', 'Keep the chosen reserve and spend the rest on furniture.'),
      ],
    },
    'market-end': {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'You found the Budget Compass.',
      text: [
        `The little brass compass does not point north. It points toward a question: “Can I carry this and still live my life?”`,
        `Your emergency pouch now holds {{reserve}}. Your choice will matter when something unexpected happens. Mira wraps the compass in a cloth. “Take it with you. A bigger number on an approval letter doesn’t get to decide what feels comfortable in your kitchen.”`,
      ],
      lesson:
        'Include taxes, insurance, utilities, upkeep, and other applicable costs. Keep closing expenses and emergency money separate from the down payment.',
      source: 'budget',
      item: 'compass',
      complete: 'market',
      minigame: 'coin-catch',
      minigameLabel: 'Mira’s coin game →',
      minigameBlurb: 'Catch coins for the pouch. Dodge the things you do not need.',
      choices: [c('Go to my next stop.', '@next', 'Your map will lead the way.')],
    },
    'market-again': {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'The number is still the number.',
      text: [
        `Mira looks up from a crate of oranges. “{{homeName}}, {{housing}} a month all in, and {{reserve}} kept back for whatever the house does next. You worked that out yourself, which is why it will still be true in November.”`,
        `“Come back and change it any time your life changes. That is not a failure. That is the number doing its job.”`,
        `{{questHint}}`,
      ],
      source: 'budget',
      choices: [c('Back to the road.', '@close')],
    },
    office: {
      speaker: 'Sage · the broker',
      symbol: '⚑',
      title: 'Hearthvale Realty. Nobody is selling you anything yet.',
      text: [
        `Maps on every wall. Some show houses, some show numbers, none show everything. Sage looks up from a desk with three coffee cups on it and no coffee in any of them.`,
        `“You want somebody on your side. Good. Sit in with all three, ask them anything, walk out with none of them if you like — interviewing an agent costs you nothing and there is no version of this where you owe me a cup of coffee.”`,
        `“The only thing I will say twice: you are not choosing the nicest one. You are choosing the one who will tell you a house is wrong for you when you have already decided it is right.”`,
      ],
      widget: 'agents',
      source: 'agency',
      choices: [
        c('Talk to Wren Alcott.', 'office-wren', 'Asks first, talks second.'),
        c('Talk to Dashiell Vane.', 'office-dashiell', 'Fast, busy, everywhere.'),
        c('Ask about Percival Bright.', 'office-percival', 'The one from the open house.'),
      ],
    },
    'office-wren': {
      speaker: 'Wren Alcott · buyer’s agent',
      symbol: '⚑',
      title: 'She asks you three questions first.',
      text: [
        `Wren does not mention a single house. She asks what you are paying now, what you are trying to get away from, and what would make you regret this in two years. Then she writes down your answers, not hers.`,
        `“I represent you and only you,” she says. “I get paid a commission out of the sale; the amount and who pays it goes in the agreement in writing before you owe me anything. If a house I show you is wrong, I will say so, and you will find that annoying at least once.”`,
        `“And I do not hold my own listings open and then represent the buyer at the same house. Some people do it properly. I would rather only have one of you to answer to.”`,
      ],
      source: 'agency',
      choices: [
        c('Her. Let’s work together.', 'office-hire-wren', 'One side of the table: yours.'),
        c('Let me meet the others.', 'office', 'Back to Sage’s desk.'),
      ],
    },
    'office-dashiell': {
      speaker: 'Dashiell Vane · buyer’s agent',
      symbol: '⚑',
      title: 'He has sold more houses than anyone on the board.',
      text: [
        `Dashiell shakes your hand while finishing a call and has your price range out of you in ninety seconds. “Sixty-one closings this year. I know what gets accepted in this town and I know it today, not last spring.”`,
        `“Same as anyone: I represent you, I am paid out of the sale, it is in the agreement.” He glances at his phone twice. “I move fast because the good ones go fast. If you want somebody to sit with you for an hour deciding, that is Wren, and she is excellent, and she is slower.”`,
        `He is not wrong about any of it. Whether that is what you want is a different question.`,
      ],
      source: 'agency',
      choices: [
        c('Him. I want somebody quick.', 'office-hire-dashiell', 'Fast, sharp, a little distracted.'),
        c('Let me meet the others.', 'office', 'Back to Sage’s desk.'),
      ],
    },
    'office-percival': {
      speaker: 'Sage · the broker',
      symbol: '⚑',
      title: 'The one holding the door on the lane.',
      text: [
        `“Percival? Straight as they come, and he is the seller’s agent at Lantern House, which is the whole of it.” Sage turns a pencil over. “If you want him for yourself he has to disclose it and you both sign for it. He will tell you that himself, which is more than some.”`,
        `“{{percivalStatus}}”`,
      ],
      source: 'agency',
      choices: [
        c('Talk to Wren instead.', 'office-wren'),
        c('Talk to Dashiell instead.', 'office-dashiell'),
      ],
    },
    'office-hire-wren': {
      speaker: 'Wren Alcott · your agent',
      symbol: '⚑',
      title: 'Signed. Yours, and only yours.',
      text: [
        `The representation agreement is two pages and Wren goes through both of them out loud: what she does, how she is paid, how long it runs, and how you end it if you want to. You sign. She signs.`,
        `“Right,” she says, standing, coat already on. “Before we look at one more front door, we go and get you a number. Falling in love with a house you cannot finance is the most expensive free activity in Hearthvale.”`,
        `“The lender is at the gate of the Loan Castle. Bring your pouch. Bring your paperwork if you can find it.”`,
      ],
      hire: 'wren',
      sign: true,
      complete: 'guild',
      lesson:
        'Interviewing agents is free. Ask who they represent, how they are paid, and how you end the agreement — and get the answers in writing before you sign.',
      source: 'agency',
      choices: [c('To the Loan Castle.', '@close', 'Wren will meet you there.')],
    },
    'office-hire-dashiell': {
      speaker: 'Dashiell Vane · your agent',
      symbol: '⚑',
      title: 'Signed, between two other calls.',
      text: [
        `He reads you the agreement quickly but completely, and stops to answer when you interrupt him, which is the part that decides you.`,
        `“Good. Now the boring bit that everybody wants to skip.” He is already halfway to the door. “Lender first. I do not write offers for buyers without a pre-approval letter, because the seller’s side bins them, and I would rather waste neither of our afternoons.”`,
        `“Loan Castle. The gate with the flag. Go.”`,
      ],
      hire: 'dashiell',
      sign: true,
      complete: 'guild',
      lesson:
        'Interviewing agents is free. Ask who they represent, how they are paid, and how you end the agreement — and get the answers in writing before you sign.',
      source: 'agency',
      choices: [c('To the Loan Castle.', '@close', 'He will meet you there. Probably.')],
    },
    'office-again': {
      speaker: 'Sage · the broker',
      symbol: '⚑',
      title: 'You have someone. Good.',
      text: [
        `Sage waves you in without getting up. “{{agentName}}, isn’t it? Good pick. No, I am not going to try to swap you; that is not how this office works.”`,
        `“Anything you signed can be ended — read your agreement, that is what the last page is for. Most people never need to. Some people should, sooner than they do.”`,
        `{{questHint}}`,
      ],
      source: 'agency',
      choices: [c('Back to Hearthvale.', '@close')],
    },
    course: {
      speaker: 'Ellis · the mapmaker',
      symbol: '▤',
      title: 'A big journey, in smaller steps.',
      text: [
        `Ellis clears a desk by the tower window. “From up here everyone looks like they know where they’re going. Get closer and they’re all figuring it out one turn at a time.”`,
        `They draw the road from here to a front door. “Details depend on your situation. This is the shape of it.”`,
      ],
      widget: 'roadmap',
      choices: [
        c(
          'I want to understand the numbers first.',
          'course-end',
          'Make budgeting the focus of my next chapter.',
          { focus: 'budget' },
        ),
        c(
          'I want someone to explain the process.',
          'course-end',
          'Make the buying roadmap my next chapter.',
          { focus: 'process' },
        ),
        c(
          'I want to know what to look for in a home.',
          'course-end',
          'Make choosing a home my next chapter.',
          { focus: 'homes' },
        ),
      ],
    },
    'course-end': {
      speaker: 'Ellis · the mapmaker',
      symbol: '▤',
      title: 'You found the Homeward Map.',
      text: [
        `Ellis draws a little house at the far end of the road. “That is the long-term destination. Today’s finish line is the bridge, where you will choose a practical next step.”`,
        `The map changes to match what you just said. Your next chapter will focus on {{focusText}}. You can change your goal, timing, or question in My Adventurer whenever your situation changes.`,
        `The lights of Three-Door Lane are coming on. “Go look at your house,” Ellis says. “And keep those questions with you.”`,
      ],
      item: 'map',
      complete: 'lookout',
      choices: [
        c('Back to the road.', '@next', 'The next step is marked on your map.'),
      ],
    },
    openhouse: {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'An open house on Three-Door Lane.',
      text: [
        `Three front doors in a row. A garden, a sunny upstairs room, a workbench in the window. The middle one is propped open with a brass sign and the smell of something baking that nobody is going to eat.`,
        `A man in a very good coat is at your elbow before the door has finished closing. “Percival Bright. Welcome, welcome. Kitchen’s original, roof’s newer, and the light in here at four o’clock will ruin you for other houses.” He is already writing something on a clipboard.`,
        `“Quick one for the sheet,” he says, pleasantly. “Are you working with an agent?”`,
      ],
      source: 'agency',
      choices: [
        c('No. It’s just me.', 'oh-none', 'The true answer.'),
        c('Yes, I’ve got someone.', 'oh-lie', 'You do not. It just came out.'),
        c('Why does that matter?', 'oh-why', 'Fair question to ask a stranger with a clipboard.'),
      ],
    },
    'oh-lie': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Wonderful. Which one?',
      text: [
        `“Wonderful,” says Percival, and his pen stops. “Which one? I know everybody.” The pause goes on slightly too long for a house this quiet.`,
        `“Let me ask it the other way,” he says, kindly. “Did you sign anything? A buyer-broker agreement, an exclusive representation form, anything with your name at the bottom?”`,
      ],
      source: 'agency',
      choices: [
        c('No. I made that up.', 'oh-why', 'Honesty, one item late.'),
        c('Yes. I signed something.', 'oh-signed', 'Then this conversation has rules.'),
      ],
    },
    'oh-signed': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Then I’ll show you the house and nothing else.',
      text: [
        `Percival caps the pen and puts it away, which is the first thing he has done slowly. “If you have signed with someone, you are their client, and I am the seller’s. I’ll happily show you the kitchen. I am not going to talk to you about what to offer, what it is worth, or what I would do. That is your agent’s job and it is not a small one.”`,
        `“Bring them with you next time and you get two people arguing on your behalf instead of one.” He holds the door. “Off you go. The four o’clock light will still be here.”`,
        `Outside, on the lane, the truth catches up with you: there is nobody to bring. That is the next errand.`,
        `{{signedHint}}`,
      ],
      lesson:
        'A written representation agreement makes you someone’s client. Sign one when you have chosen who you want on your side, not to end an awkward conversation at a door.',
      source: 'agency',
      choices: [
        c('Go and find an actual agent.', '@close', 'Hearthvale Realty is up the hill.'),
      ],
    },
    'oh-none': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Then let me be useful, and honest.',
      text: [
        `“Good,” he says, and means it. “Then here is the part most people at this door do not say out loud. I work for the seller. They hired me, they pay me, and my job is to get them the best result in this house. I will not lie to you. I also will not tell you what it is worth to you or what to offer, because that is not who I am working for.”`,
        `“That is not a warning. It is just the shape of it.” He taps the sign. “A buyer’s agent works the other way round: for you, from the first showing to the last signature.”`,
      ],
      lesson:
        'The seller’s broker represents the seller, not you. You may wish to retain a buyer’s broker to represent you in the transaction.',
      source: 'agency',
      choices: [
        c('So how do I get one of those?', 'oh-dual', 'And what does it cost me?'),
        c('Show me the house first.', 'oh-house', 'You did come here for a house.'),
      ],
    },
    'oh-why': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Because we are not on the same side.',
      text: [
        `“Because I work for the seller,” Percival says, without a flicker. “They hired me. My job is the best result for them. I will answer anything you ask me about this house truthfully, and I will not advise you on what to offer, because I am not the one on your side of the table.”`,
        `“Most buyers find that out somewhere around the third house. You are finding it out on the doormat of the first, which is a better place for it.”`,
      ],
      lesson:
        'The seller’s broker represents the seller, not you. You may wish to retain a buyer’s broker to represent you in the transaction.',
      source: 'agency',
      choices: [
        c('So how do I get one of those?', 'oh-dual', 'And what does it cost me?'),
        c('Show me the house first.', 'oh-house', 'You did come here for a house.'),
      ],
    },
    'oh-house': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'The four o’clock light.',
      text: [
        `You walk it. Lantern House: a sunny upstairs room, a kitchen that has fed a lot of people, a garden gone a little wild at the back. You remember what brought you here — {{priority}} — and the house says yes to it without being asked.`,
        `You stop in the doorway of the upstairs room. The afternoon light is exactly right, and every question in your head goes quiet.`,
        `Percival lets it sit, because he is good at this. Then: “It is a good house. It is also a house, and houses have a back of the envelope. Do you want to talk about who is holding the envelope for you?”`,
      ],
      source: 'agency',
      choices: [c('All right. Talk to me about agents.', 'oh-dual')],
    },
    'oh-dual': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'I could do it. You should hear how first.',
      text: [
        `“Two roads,” he says. “One: you go up the hill to the realty office and pick somebody whose only job is you. Costs you nothing to interview them. That is the ordinary road and it is a good one.”`,
        `“Two: I represent you as well as the seller. It happens. It has to be disclosed and agreed in writing, some states do not allow it at all, and here is the honest part — the day it matters is the day we are haggling over three thousand dollars of roof, and I am supposed to be arguing hard for both of you at once. I am good. I am not two people.”`,
        `He shrugs, cheerful again. “Ask me anything. Or go and meet the others. I will not sulk. Much.”`,
      ],
      lesson:
        'One agent representing both sides has to be disclosed and agreed in writing, and some states prohibit it. Ask who your agent represents and how they are paid before you sign anything.',
      source: 'agency',
      choices: [
        c('Interview him properly first.', 'oh-interview', 'Three questions worth asking anyone.'),
        c('Fine. Represent me too.', 'oh-hire', 'One agent, both sides, in writing.'),
        c('I’ll go and meet the others.', '@close', 'Hearthvale Realty is up the hill.'),
      ],
    },
    'oh-interview': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Three questions, and he answers them.',
      text: [
        `“Who do you represent?” The seller, today. Both of you, if you sign for that, and it is in writing or it is nothing.`,
        `“How do you get paid?” A commission out of the sale, and the amount and who pays it is negotiable and written into the agreement. “Anyone who tells you it is free is telling you it is not itemised.”`,
        `“What happens when I want to see a house you have listed?” “Then I am on both sides again, and you should know that before we walk in, not after.”`,
        `He puts the clipboard down. “Those three questions, asked of anyone, out loud, before you sign. That is the whole trick. Now — do you want me, or do you want to go and meet Wren?”`,
      ],
      lesson:
        'Ask any agent three things before you sign: who do you represent, how are you paid, and what happens if I want to see a home you have listed.',
      source: 'agency',
      choices: [
        c('You. Let’s do it in writing.', 'oh-hire', 'Dual agency, eyes open.'),
        c('I’ll go and meet Wren.', '@close', 'Hearthvale Realty is up the hill.'),
      ],
    },
    'oh-hire': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Signed, and both sides know it.',
      text: [
        `The form is one page and Percival reads it aloud rather than sliding it over: he represents the seller, he now also represents you, both parties have agreed to it in writing, and there are things he cannot do for either of you as a result.`,
        `“You will get straight answers from me,” he says, signing. “What you will not get is somebody in your corner and nobody in theirs. Remember that on roof day.”`,
        `Your agent is Percival Bright. Next stop is the one everybody skips: find out what you can actually borrow, before you fall any further in love with an upstairs room.`,
      ],
      hire: 'percival',
      dual: true,
      complete: 'guild',
      source: 'agency',
      choices: [
        c('To the Loan Castle, then.', '@close', 'You need a number before you need a house.'),
      ],
    },
    'openhouse-again': {
      speaker: 'Percival Bright · listing agent',
      symbol: '⌂',
      title: 'Still open. Still baking.',
      text: [
        `Percival is where you left him, clipboard in hand, sign in the door, that same pan of something in the oven that nobody has eaten.`,
        `“Take another walk round if you like. Come back when you have a lender behind you and we will have a very different conversation.”`,
        `{{questHint}}`,
      ],
      choices: [c('Back to the lane.', '@close')],
    },
    castle: {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '⚿',
      title: 'The gate with the flag on it.',
      text: [
        `The bridge is lit end to end and a banner snaps over the gatehouse: Patriot Home Mortgage. The man under it is not made up. “{{presenterName}}, {{presenterRole}} with {{presenterCompany}}. Everything else in this town is invented. I am the exception, and so is the paperwork.”`,
        `“{{myAgent}} says you are looking at Three-Door Lane. Good. Before anybody writes anything, we do the part that people are afraid of and then feel silly about: we find out what you can actually borrow, and what it costs you every month.”`,
        `“{{preapprovalStatus}}”`,
      ],
      widget: 'downpayment',
      source: 'preapproval',
      minigame: 'down-payment-dash',
      minigameLabel: 'Run for the down payment →',
      minigameBlurb: 'Every coin you grab comes off the payment. Mind the surprise expenses.',
      choices: [
        c('Let’s do the pre-approval.', 'preapproval', 'The letter that makes an offer real.', {}, { when: 'no-preapproval' }),
        c('Read my letter again.', 'preapproval-done', 'What it does and does not promise.', {}, { when: 'preapproved' }),
        c('I’m ready to claim my key.', 'bridge-choice', 'One last choice, and it is a real-world one.', {}, { when: 'ready-to-close' }),
        c('How do I compare two lenders?', 'erik-offers', 'Loan Estimates, side by side.'),
        c('What programs help buyers in Arizona?', 'arizona', 'Down payment help, VA, FHA, and what to ask.'),
        c('Say hello to {{assistantFirst}}.', 'albert', 'The paperwork wizard is in the keep.'),
      ],
    },
    preapproval: {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '⚑',
      title: 'Two things, and neither of them is a credit score speech.',
      text: [
        `“Pre-approval is a lender saying: based on what you have shown us, here is what we expect to lend you. It is not a promise, it is not final until underwriting is finished, and it does not get to decide what payment feels comfortable in your kitchen. That part stays yours.”`,
        `“What I need is boring and short. One: your documents, all of them, in one place — that is {{assistantFirst}}’s department and he is unbearable about it in the best way. Two: a number you actually want to live with, which you work out at Mira’s shop, not here.”`,
        `“{{preapprovalChecklist}}”`,
      ],
      widget: 'documents',
      source: 'preapproval',
      choices: [
        c('Write me the letter.', 'preapproval-done', 'Both boxes ticked.', {}, { when: 'preapproval-ready' }),
        c('Go and get the missing piece.', '@close', 'The gate stays open until you do.', {}, { when: 'preapproval-blocked' }),
        c('Ask {{assistantFirst}} about the paperwork.', 'albert', 'He knows where everything went.'),
      ],
    },
    'preapproval-done': {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '⚑',
      title: '{{preapprovalHeadline}}',
      text: [
        `{{preapprovalBody}}`,
        `“Read the second paragraph, because nobody does. This letter is an estimate based on what you gave me. It changes if your income changes, if your debts change, or if you go and buy a car between now and closing. Do not go and buy a car between now and closing.”`,
        `“Now go and make an offer. {{myAgent}} writes it, I stand behind it, and the seller finds out you are the real thing.”`,
      ],
      lesson:
        'A pre-approval letter is an estimate based on the documents you provided, not a final loan approval. It can change if your income, debts, or credit change before closing.',
      source: 'preapproval',
      approve: true,
      complete: 'gate',
      choices: [
        c('Take it to Three-Door Lane.', '@close', '{{myAgent}} will meet you at the house.'),
      ],
    },
    'erik-offers': {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '◈',
      title: 'Put them side by side or do not bother.',
      text: [
        `A messenger jogs past waving a scroll: LOWEST PAYMENT IN ALL HEARTHVALE. {{presenterFirst}} watches him go. “Lowest payment is a fine thing to advertise and a terrible thing to compare, because it leaves out everything that is not the payment.”`,
        `“Ask every lender for a Loan Estimate for the same loan, same price, same down payment. It is a standard form, three pages, and the whole point of it is that it stacks. Then look at the interest rate, the mortgage insurance, the closing costs, and whether the payment can change later.”`,
        `“And a Loan Estimate is not an approval. It is a quote. Different documents, different jobs. Learn which job each one is doing and nobody gets to hurry you.”`,
      ],
      lesson:
        'Request Loan Estimates from more than one lender for the same loan, and compare the rate, mortgage insurance, closing costs, and whether the payment can change. A Loan Estimate is not a loan approval.',
      source: 'loans',
      item: 'lens',
      minigame: 'offer-match',
      minigameLabel: 'Two offers, eight rounds →',
      minigameBlurb: 'Spot the one that is hiding something. Coins for every round you call right.',
      choices: [
        c('Back to the gate.', 'castle'),
        c('Let’s do the pre-approval.', 'preapproval'),
      ],
    },
    'offer-write': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Right. What are we writing?',
      text: [
        `{{myAgent}} spreads the paperwork on the bonnet of a cart on Three-Door Lane. “{{homeName}}, asking {{askingPrice}}. Your letter says {{preapprovalAmount}}, so the money is not the question. The question is what the seller says.”`,
        `“Two other people walked this house today. I do not know what they wrote and neither does anyone who tells you they do. An offer is not a purchase. It is a proposal, and the seller can say yes, no, or ‘nearly’.”`,
        `“{{offerHint}} Your call. I will write whatever you decide and I will tell you what I think of it first.”`,
      ],
      widget: 'offer',
      source: 'process',
      choices: [
        c('Come in under asking.', 'offer-under', 'Save money if it lands.', { offerKind: 'under' }),
        c('Offer the asking price, clean, letter attached.', 'offer-asking', 'Straight down the middle.', { offerKind: 'asking' }),
        c('Over asking, and waive the inspection.', 'offer-waive', '{{myAgent}} is going to have something to say.', { offerKind: 'waive' }),
      ],
    },
    'offer-under': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Not a no. Not a yes either.',
      text: [
        `The answer comes back the same evening, and it is a counter: the seller will not take {{underPrice}}, but they will take asking, and they would like a shorter inspection period in exchange for waiting for you.`,
        `“That is a good outcome from a low offer,” {{myAgent}} says. “Somebody else came in at asking and the seller still wrote back to us, which tells you they want a buyer with a lender behind them more than they want an extra week of drama.”`,
        `“Now. You can take the counter, or you can go lower again and find out how patient they are. I have seen both work. I have also seen the second one lose a house on a Tuesday.”`,
      ],
      lesson:
        'An offer is a proposal. A seller can accept, reject, or counter, and a counter usually trades price against terms like timelines and contingencies.',
      source: 'process',
      choices: [
        c('Take the counter.', 'offer-accepted', 'Asking price, shorter inspection window.', { offerPrice: 'asking' }),
        c('Go lower again.', 'offer-lost', 'Find out how patient they are.'),
      ],
    },
    'offer-asking': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Clean, funded, and boring. Sellers love boring.',
      text: [
        `Asking price, your pre-approval letter stapled to the front, ordinary timelines, nothing clever. {{myAgent}} sends it at six and the phone rings at nine.`,
        `“Accepted,” they say. “And I will tell you exactly why, because it will be useful for the rest of your life: there was another offer at the same number without a letter. Same money on paper. The seller took the one that could prove it could close.”`,
        `“That is what the boring afternoon at the castle bought you.”`,
      ],
      lesson:
        'Between two similar offers, sellers usually take the one that can prove it can close. A pre-approval letter is what does the proving.',
      source: 'process',
      choices: [c('We’re under contract.', 'offer-accepted', 'Now the real checking starts.', { offerPrice: 'asking' })],
    },
    'offer-waive': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: '“I will write it. Let me say this first.”',
      text: [
        `{{myAgent}} puts the pen down. “Over asking will probably win it. Waiving the inspection will definitely win it, and it is the one thing in this pile you cannot undo. You are telling the seller you will buy the house without knowing what is wrong with it, and agreeing not to ask for anything when you find out.”`,
        `“People do it. In a fast market people do it a lot. Some of them are fine. The ones who are not are the ones who find a sewer line under a slab in November.”`,
        `“There is a middle: over asking, keep the inspection, and shorten the window instead. Costs you the same in money and none of it in blindfold.”`,
      ],
      lesson:
        'Waiving an inspection can make an offer more competitive and removes your chance to find problems before you own them. Shortening the inspection period is a middle path.',
      source: 'inspection',
      choices: [
        c('Take the middle. Over asking, inspection stays.', 'offer-accepted', 'The sensible version of aggressive.', { offerPrice: 'over' }),
        c('No, waive it. I want the house.', 'offer-blind', 'Eyes shut, on purpose.', { offerPrice: 'over', waive: true }),
      ],
    },
    'offer-blind': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'You won it. That was the easy part.',
      text: [
        `Accepted in four hours. Over asking, no inspection, the fastest yes anybody on this lane has had all season. {{myAgent}} congratulates you and does not entirely mean it.`,
        `“Right. No inspection means no inspector, which means the first person to find out what is wrong with this house is you, on a weekend, with a bucket.”`,
        `“I will still be here for that part. Fair warning: so will the bill.”`,
      ],
      source: 'inspection',
      accept: true,
      waive: true,
      complete: 'homes',
      choices: [c('Go to closing.', 'homes-end', 'Nothing left to check. By choice.')],
    },
    'offer-lost': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'It sold on the Tuesday.',
      text: [
        `The second low offer does not get a counter. It gets a one-line message the next morning saying the sellers have accepted another offer, thank you for your interest.`,
        `“That is the honest version of this game,” {{myAgent}} says. “You did nothing wrong except decide that a house you wanted was a negotiation you wanted to win. Sometimes the price is the price.”`,
        `“{{otherHomeName}} is still open on the same lane, and between us, it has the better bones. Take a night. Then we go again.”`,
      ],
      lesson:
        'Losing a house is a normal part of buying one. Your pre-approval, your documents, and your agent all carry over to the next offer.',
      source: 'process',
      lose: true,
      switchHome: true,
      choices: [c('Take the night.', '@close', 'The lane will still be there.')],
    },
    'offer-lost-again': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Second time round, and you know the drill.',
      text: [
        `{{homeName}}: a different set of compromises, a garden that has clearly been loved by somebody with a plan, and a seller who has had it on the market a fortnight longer. Asking {{askingPrice}}. {{myAgent}} has the paperwork out before you have finished the walkthrough.`,
        `“Same letter, same lender, same you. The only thing that changed is you have done this once and did not enjoy the ending.”`,
      ],
      source: 'process',
      choices: [
        c('Asking price. Clean. Send it.', 'offer-accepted', 'The lesson, applied.', { offerPrice: 'asking' }),
      ],
    },
    'offer-accepted': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Under contract. Now you get to be suspicious.',
      text: [
        `Signatures both ways. {{myAgent}} writes the dates on the back of your hand because you will not remember them otherwise: inspection window, loan deadline, closing.`,
        `“This is the part of the process that exists entirely for you,” they say. “For a few days you are allowed to go through this house like somebody who does not trust it, and then decide what to do about what you find. After that you own the roof and everything under it.”`,
        `“So. Who do we send in?”`,
      ],
      accept: true,
      complete: 'homes',
      source: 'inspection',
      choices: [c('Book the inspections.', 'inspect-choose', 'Choose who looks, and at what.')],
    },
    'inspect-choose': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Who looks, and at what.',
      text: [
        `“A general inspector walks the whole house and flags what he cannot see all the way into. Specialists go the rest of the way. Each one costs you money now, out of your own pocket, before you own anything.”`,
        `“That is the trade and I am not going to pretend otherwise: you are paying to find out. Finding out is cheaper than not, right up until it is money you did not have.”`,
        `Your emergency pouch holds {{reserve}}. {{inspectionStatus}}`,
      ],
      widget: 'inspections',
      lesson:
        'An inspection is paid by the buyer, before closing, and is your chance to learn what is wrong while you can still act on it. An appraisal is about value for the lender and is not a substitute.',
      source: 'inspection',
      choices: [
        c('General home inspection — $450', 'inspect-choose', 'The whole house, top to bottom.', {}, { order: 'home' }),
        c('Roof specialist — $300', 'inspect-choose', 'A number and a remaining life on the roof.', {}, { order: 'roof' }),
        c('Sewer scope — $250', 'inspect-choose', 'A camera down the line.', {}, { order: 'sewer' }),
        c('Termite and pest — $150', 'inspect-choose', 'Cheap to check, expensive to discover.', {}, { order: 'termite' }),
        c('That’s enough. Send them in.', 'inspect-report', 'Whatever you have ordered is what you will know.'),
      ],
    },
    'inspect-report': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'The reports come back.',
      text: [
        `{{inspectionFindings}}`,
        `{{inspectionMissed}}`,
        `“An appraisal will happen too, and people always ask, so: that one is for the lender, and it is about what the house is worth, not what is wrong with it. It is not this. Do not let anyone tell you it is.”`,
      ],
      widget: 'repair',
      lesson:
        'An appraisal is not a substitute for an independent home inspection. What you did not pay to look at is what you will find out about later.',
      source: 'inspection',
      choices: [
        c('Ask the seller to handle the roof.', 'negotiate', 'A request, not a guarantee.', { resolution: 'negotiate' }),
        c('Pay for it myself and move on.', 'self-fund', 'See what it does to the pouch.', { resolution: 'self-fund' }),
        c('Use the inspection contingency and step back.', 'step-back', 'Keep the option to find another house.', { resolution: 'step-back' }),
      ],
    },
    negotiate: {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'A deal has two sides.',
      text: [
        `In this branch the seller agrees to have the roof repair completed before closing, subject to the written agreement and to somebody actually verifying the work. The tidy ending belongs to this story; real sellers say no all the time, especially when there is another buyer behind you.`,
        `Your emergency pouch stays at {{reserve}}. You still have a loan to finish, a walkthrough to do, and deadlines on the back of your hand. A promise made out loud is not a repair.`,
        `“You did not win that by demanding a perfect house,” {{myAgent}} says. “You paid somebody to find one specific thing and then asked for one specific thing. That is the whole technique.”`,
      ],
      source: 'inspection',
      choices: [c('Take it to closing.', 'homes-end')],
    },
    'self-fund': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'Earlier choices have footsteps.',
      text: [
        `You run it again. After the $3,000 roof, your pouch would hold {{afterRepair}}. {{reserveResult}}`,
        `“That is why Mira made you split that four thousand,” {{myAgent}} says. “The furniture and the roof were spending the same money the whole time. You could only see one of them in the shop.”`,
        `You can still change your mind. Deciding differently is not losing an argument with yourself.`,
      ],
      source: 'budget',
      choices: [
        c('Handle the repair another way.', 'inspect-report', 'Go back to the three options.'),
        c('Keep it, and plan to prepare longer.', 'homes-end', 'An informed pause is a real outcome.', { resolution: 'prepare' }),
      ],
    },
    'step-back': {
      speaker: '{{myAgent}} · your agent',
      symbol: '⌂',
      title: 'The courage to choose another door.',
      text: [
        `You have {{myAgent}} walk you through the contingencies and the deadlines before you do anything, because whether you can cancel — and whether a deposit comes back — depends entirely on the agreement you signed and where the calendar is.`,
        `In this story, you use the inspection contingency inside the window and step back. There is disappointment. There is also a lane with two other front doors on it and a pouch that still has {{reserve}} in it.`,
        `“You have not failed to buy a house,” {{myAgent}} says. “You found out what this one was going to ask of you, which is the entire reason we paid somebody to look.”`,
      ],
      source: 'inspection',
      choices: [c('Continue with a clearer plan.', 'homes-end')],
    },
    'homes-end': {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'You came back with better questions.',
      text: [
        `Rowan is at the end of the lane, where they have apparently been the whole time. “Well then. You found out who was on whose side, you found out what you could carry, you got the letter, and you wrote an offer like somebody who had done it before.”`,
        `“{{resolutionLine}}”`,
        `“Go and see {{presenterFirst}} at the gate. There is one thing left and it is yours to choose.”`,
      ],
      minigame: 'inspection-hunt',
      minigameLabel: 'Search the house →',
      minigameBlurb: 'Seven things are wrong in there. Find them before the clock does.',
      choices: [c('To the Loan Castle.', '@close', 'Claim your First Key.')],
    },
    albert: {
      speaker: '{{assistantName}} · the paperwork wizard',
      symbol: '▣',
      title: 'Welcome to the Loan Castle keep.',
      text: [
        `Inside the gate tower, past a wall of neatly labeled shelves, someone looks up from a perfectly squared stack of folders and grins. “You made it! I’m {{assistantName}}. Erik does the lending. I make sure nothing is missing when it is time to lend, and I answer the phone when it rings at nine at night.”`,
        `“Everybody who knows Erik knows me. Around here they call me the paperwork wizard: pay stubs, W-2s, bank statements, ID, tax returns. I know what a lender needs before they ask for it. I collect everything except money; the money stays in your pouch.”`,
        `“{{docsStatus}}”`,
      ],
      choices: [
        c('What does a lender need from me?', 'albert-docs', 'The five documents, and why each one matters.'),
        c('Help me get my papers back.', 'albert-quest', 'The Augusta wind. Albert saw where everything landed.'),
        c('Back to Erik at the gate.', 'castle'),
      ],
    },
    'albert-docs': {
      speaker: '{{assistantName}} · the paperwork wizard',
      symbol: '▣',
      title: 'Five papers, one folder.',
      text: [
        `{{assistantFirst}} pulls a clean folder off the shelf and labels five tabs without looking. “When you are ready to get pre-approved, these are what a lender usually asks to see. Not today. But the earlier they are in one place, the faster the real conversation goes, and keeping them in one place is my whole job.”`,
        `“A pre-approval letter is a lender saying, based on what you showed us, here is what we expect to lend. It is not a promise until underwriting finishes, and it does not decide what payment feels comfortable. That part is still yours.”`,
      ],
      widget: 'documents',
      lesson:
        'Gather pay stubs, W-2s or tax returns, bank statements, and photo ID before you ask for pre-approval. A preapproval letter is an estimate, not a final approval.',
      source: 'preapproval',
      choices: [
        c('Help me get my papers back.', 'albert-quest', 'The Augusta wind. Albert saw where everything landed.'),
        c('Back to Erik at the gate.', 'castle'),
      ],
    },
    'albert-quest': {
      speaker: '{{assistantName}} · the paperwork wizard',
      symbol: '▣',
      title: 'The Augusta wind.',
      text: [
        `“Here is the thing,” {{assistantFirst}} says, nodding toward the window. “The Augusta wind came through Hearthvale this morning. It does that every autumn. It blew your cottage window open and I watched your paperwork go sailing over the rooftops: pay stubs, W-2s, bank statements, your photo ID, your tax returns. All five.”`,
        `“Good news: I was watching. I know where every one of them landed.” He unfolds your map and marks five spots. “A pay stub on the cottage road, a W-2 by the pond, bank statements up near the tower, your ID out on the lane, tax returns down by the farm. Walk over each one and it is yours again. I will keep the tally.”`,
        `“Bring them back and I will pack you a satchel that is ready before anyone asks for it. Take your time. I have been chasing paperwork for other people for years; I am very good at it.”`,
      ],
      choices: [c('I’ll go get them.', '@close', 'Your papers are marked on the map now.')],
    },
    'albert-done': {
      speaker: '{{assistantName}} · the paperwork wizard',
      symbol: '▣',
      title: 'All five. Not a page missing.',
      text: [
        `{{assistantFirst}} meets you at the keep door with a folder already open. Pay stubs, W-2s, bank statements, photo ID, tax returns: he checks each one against his list and slides it into its tab. “That is everything the wind took. Do you know how many people show up to a first meeting with none of these? You are ahead of the game, and the game is only ten minutes old.”`,
        `He hands you a small canvas satchel with a brass clasp and drops a few coins in the outside pocket. “The satchel is for the documents. Keep them in it, keep them current, and the Augusta wind can do whatever it likes. The coins are because Erik said so. Money still is not my department.”`,
        `“When it is the real thing, Erik and I will tell you exactly which versions of each we need. Pre-approval is a folder and a conversation. You already have the folder.”`,
      ],
      lesson:
        'Keep your documents in one place and current. When you ask for pre-approval, a good team tells you exactly which versions they need.',
      source: 'preapproval',
      item: 'satchel',
      coins: 15,
      choices: [c('Back to Hearthvale.', '@close', 'Bonus complete.')],
    },
    arizona: {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '☀',
      title: 'Field notes from Arizona.',
      text: [
        `“Hearthvale is green. Arizona is mostly sunshine, and it has a few programs worth knowing about. These change, so treat this as a map, not the terrain.”`,
        `“Home Plus, run by the Arizona Industrial Development Authority, offers up to 4% in down payment and closing cost help statewide. In Maricopa County, Home in Five Advantage offers up to 5%, with an extra 1% for eligible buyers. VA-backed loans let most eligible veterans and service members buy with no down payment. FHA loans allow a lower down payment and are available to buyers with lower credit scores.”`,
        `“Assistance usually comes as a second loan that is forgiven over time if you stay in the home, and each program has income limits and homebuyer education requirements. Ask which ones you qualify for and what they cost. That is a normal question. I answer it every week.”`,
      ],
      widget: 'arizona',
      lesson:
        'Down payment assistance, VA, and FHA programs each have rules that change. Ask a licensed lender which apply to you and what they cost before you count on them.',
      source: 'homePlus',
      choices: [
        c('What would you ask me first?', 'lender-questions'),
        c('Back to the gate.', 'castle'),
      ],
    },
    'lender-questions': {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '?',
      title: 'Three questions, none of them scary.',
      text: [
        `“One: when would you like to be moved in? Your answer was {{timelineText}}, which is a fine answer.”`,
        `“Two: what monthly payment would let you sleep well? You practiced that at Mira’s shop. Three: what do savings and credit look like right now? Not a test. It tells me which programs and paths make sense, and what to work on if we need to wait.”`,
        `“You do not have to answer any of that today. When you want to, the gate is open: call, text, or send me your buying plan from this game and I will read it before we talk.”`,
      ],
      choices: [
        c('Tell me about Arizona programs.', 'arizona'),
        c('Back to the gate.', 'castle'),
      ],
    },
    'bridge-choice': {
      speaker: 'Rowan · the pathfinder',
      symbol: '⚿',
      title: 'Choose your next step.',
      text: [
        `Rowan is waiting where the lanterns meet the road. “Well? What will you do with what you learned?”`,
        `Choose a real-world next step. This does not commit you to a purchase, share your details, or submit an application.`,
      ],
      choices: [
        c('Understand my own numbers.', 'ending', 'Start a household budget and preparation checklist.', {
          nextStep: 'numbers',
        }),
        c('Prepare for a buyer or lender conversation.', 'ending', 'Bring the questions I collected.', {
          nextStep: 'conversation',
        }),
        c('Give myself time to get ready.', 'ending', 'Make a preparation plan without rushing.', {
          nextStep: 'prepare',
        }),
      ],
    },
    ending: {
      speaker: 'Your adventure · chapter complete',
      symbol: '⚿',
      title: 'First quest complete, {{name}}!',
      text: [
        `You turn the little brass key in your hand. It is not a deed, an approval, or a promise. It is the beginning of knowing what to ask—and the confidence to ask it.`,
        `{{endingText}}`,
        `You found out who works for whom, hired somebody who works for you, worked out a number you can live with, got the letter that proved it, and wrote an offer like a person who had done it before. {{inspectionSummary}}`,
        `Your First Key now opens Your Buying Plan: a short checklist shaped by your answers. This opening quest is only the beginning.`,
      ],
      item: 'key',
      ending: true,
      choices: [
        c('Unlock my buying plan.', '@plan', 'Continue with a checklist based on my answers.'),
        c('Save my field journal.', '@journal', 'Take my story and questions with me.'),
        c('Make my adventurer card.', '@card', 'A shareable picture of your pixel self and your first key.'),
      ],
    },
    // Bonus content: found by exploring, not on the quest path.
    portal: {
      speaker: 'The ring of stones · a sealed portal',
      symbol: '◎',
      title: 'Something hums near the waterfall.',
      text: [
        `Off the marked paths, half hidden by mist, a ring of standing stones hums like a struck bell. Runes glow along the inner faces. You can read them, somehow: THE CREDIT COMPASS. A NUMBER IS NOT YOUR STORY.`,
        `A smaller line runs around the base: “The seal opens for a traveler who leaves a name with the keeper of the gate.” The keeper of the gate is {{presenterName}}, the lender.`,
        `Beyond the stones is a preview of a new series about reading your credit reports, fixing errors, and spotting shortcut sellers. No pressure. The main road to the bridge is still open either way.`,
      ],
      choices: [
        c('Leave my name with the keeper and open the seal.', '@portal-unlock', 'Optional. A short form. The portal opens whatever happens next.'),
        c('Leave it sealed for now.', '@close', 'You can come back any time.'),
      ],
    },
    'portal-open': {
      speaker: 'The Credit Compass · a preview',
      symbol: '◎',
      title: 'The stones part.',
      text: [
        `The runes brighten and the ring opens onto a quiet reading room that was not there a moment ago. On a lectern sits a ledger with your name on the cover. {{portalDelivery}}`,
        `“Every borrower has one of these,” a voice says. It is nobody you have met; the Credit Compass has its own guides. “Three companies keep a copy. You are allowed to read yours for free, and reading it is where every credit story starts.”`,
      ],
      source: 'credit',
      choices: [c('Read the ledger.', 'ledger', 'A three-minute preview of the Credit Compass.')],
    },
    ledger: {
      speaker: 'The Credit Compass · The Hidden Ledger',
      symbol: '▤',
      title: 'What a score is, and is not.',
      text: [
        `The ledger lists accounts, balances, payment history, and who has asked to see it. A score is a summary of this record at one moment, built by a formula. It is not a grade on you as a person, and it changes as the record changes.`,
        `“Lenders read the whole ledger, not only the number,” the voice says. “Late payments, high balances compared to limits, and very new accounts weigh on it. Time and on-time payments lift it. Nobody can promise a specific jump by a specific date. Anyone who does is selling something.”`,
        `You turn a page and stop. There is an entry you do not recognize.`,
      ],
      lesson:
        'You can get your credit reports for free. Read them before a lender does, and know that no one can guarantee a score increase.',
      source: 'credit',
      choices: [c('What if an entry is wrong?', 'ledger-dispute', 'Finish the preview and claim the rune.')],
    },
    'ledger-dispute': {
      speaker: 'The Credit Compass · The False Entry',
      symbol: '✎',
      title: 'An error is not a verdict.',
      text: [
        `“Then you dispute it,” the voice says. “In writing, to the company that keeps the report and to the company that reported the account. Explain what is wrong, include copies of anything that proves it, and keep your own copies. They must investigate.”`,
        `“That is the whole trick. No secret letter, no fee, no promise to erase true history. The Credit Compass series will walk through it entry by entry: the hidden ledger, the false entry, the steady path, and the shortcut seller.”`,
        `A small stone rune drops into your pouch, and a handful of coins follow it. The room folds back into mist, and you are standing by the waterfall again with the bridge in sight.`,
      ],
      lesson:
        'Dispute errors in writing with the credit reporting company and the information provider, with evidence. Keep copies.',
      source: 'dispute',
      item: 'rune',
      coins: 25,
      choices: [c('Carry the rune back to Hearthvale.', '@close', 'Bonus complete.')],
    },
  },
}
export const journalLessons = {
  cottage: 'I named what I want a home to make possible.',
  homes:
    'I learned that the agent holding an open house works for the seller, and that one agent representing both sides has to be disclosed and agreed in writing.',
  guild:
    'I interviewed agents before choosing one, and asked who they represent, how they are paid, and how the agreement ends.',
  market: 'I compared full monthly housing budgets and practiced keeping money for surprises.',
  gate:
    'I got a pre-approval letter, learned it is an estimate rather than a final approval, and used it to make an offer a seller could believe.',
  lookout: 'I mapped the main stages of homebuying and chose the focus of my buying plan.',
  portal: 'I previewed the Credit Compass: read my reports for free, dispute errors in writing, and ignore guaranteed-score promises.',
  albert:
    'The Augusta wind scattered my paperwork and Albert helped me recover the five documents a lender usually asks for: pay stubs, W-2s, bank statements, photo ID, and tax returns.',
  arizona:
    'I learned that Arizona down payment assistance, VA, and FHA programs exist and that a licensed lender can tell me which apply.',
}
export function initialState() {
  return {
    version: 4,
    profile: defaultProfile(),
    planTasks: [],
    planStarted: false,
    started: false,
    done: [],
    inventory: [],
    vars: { priority: 'stability', home: 'willow', housing: 2400, reserve: 4000 },
    node: 'wake',
    location: 'cottage',
    history: [],
    journal: [],
    player: { x: 30, y: 76, facing: 1 },
    elapsed: 0,
    ended: false,
    coins: 0,
    coinsCollected: [],
    minigames: {},
    portal: 'hidden', // hidden → found → open
    albertMet: false,
    metPercival: false, // you have been to the open house on Three-Door Lane
    docQuest: 'hidden', // hidden → active → complete
    docs: [],
    // Who is on your side, and how far the purchase has got.
    agent: null, // null | 'percival' | 'wren' | 'dashiell'
    buyerBroker: false, // did you sign a written representation agreement
    dualAgency: false, // one agent, both sides of the same deal
    preapproved: false,
    offer: 'none', // none → submitted → countered → accepted | lost
    offerTries: 0,
    inspections: [], // 'home' | 'roof' | 'sewer' | 'termite'
    inspectionSpend: 0,
    visitedArizona: false,
    lead: {},
    avatar: null,
  }
}
export function addCoins(state, n) {
  state.coins = Math.max(0, Math.round((state.coins || 0) + n))
  return state.coins
}
export function collectMapCoin(state, id) {
  if (!mapCoins.some((c) => c.id === id) || state.coinsCollected.includes(id)) return false
  state.coinsCollected.push(id)
  addCoins(state, 3)
  return true
}
export function collectDoc(state, id) {
  if (state.docQuest !== 'active' || !mapDocs.some((d) => d.id === id) || state.docs.includes(id)) return false
  state.docs.push(id)
  if (state.docs.length === mapDocs.length) state.docQuest = 'complete'
  return true
}
/** Record a mini-game result; only improvements over the best previous run add coins. */
export function recordMinigame(state, result) {
  const prev = state.minigames[result.id] || { score: 0, coins: 0, plays: 0 }
  const gained = Math.max(0, result.coins - prev.coins)
  state.minigames[result.id] = {
    score: Math.max(prev.score, result.score),
    coins: Math.max(prev.coins, result.coins),
    plays: prev.plays + 1,
  }
  addCoins(state, gained)
  return gained
}
/**
 * The one thing to do next, and how to say it. The town is open — you can walk into any of the
 * six places in any order — so this is guidance rather than a gate, and it follows the actual
 * shape of a purchase: someone on your side, a number you can live with, a letter, an offer,
 * an inspection, then the key.
 */
export function nextStep(state) {
  if (state.ended) return { id: null, hint: 'Your first key is earned. The arcade and the ring of stones are still open.' }
  if (!state.done.includes('cottage')) return { id: 'cottage', hint: 'Wake up. Bartleby has already been.' }
  if (!state.agent)
    return {
      id: state.metPercival ? 'guild' : 'homes',
      hint: 'Get somebody on your side. The open house on Three-Door Lane, or Hearthvale Realty up the hill — either order.',
    }
  if (!state.preapproved) {
    if (!state.done.includes('market'))
      return { id: 'market', hint: 'Mira first. Work out the number you can actually live with.' }
    if (state.docQuest !== 'complete')
      return {
        id: 'gate',
        hint: state.docQuest === 'active'
          ? 'Your paperwork is scattered across Hearthvale. Walk over each sheet, then see Albert.'
          : 'See Albert in the keep. The Augusta wind took something of yours this morning.',
      }
    return { id: 'gate', hint: 'Budget set, papers found. Go and get your pre-approval letter.' }
  }
  if (state.offer !== 'accepted')
    return {
      id: 'homes',
      hint: state.offer === 'lost' ? 'That one sold. Your agent has another door on the same lane.' : 'You have the letter. Go and write an offer.',
    }
  if (state.vars.waived) return { id: 'gate', hint: 'No inspection to wait for. Erik is at the gate.' }
  if (!state.inspections.length) return { id: 'homes', hint: 'Under contract. Decide who inspects what, and pay for it.' }
  if (!state.vars.resolution) return { id: 'homes', hint: 'The reports are back. Decide what to do about them.' }
  return { id: 'gate', hint: 'One choice left, and it is a real-world one. Erik is at the gate.' }
}

export function unlocked(state, loc) {
  if (!loc.requires.every((id) => state.done.includes(id))) return false
  if (loc.needs === 'agent' && !state.agent) return false
  return true
}

/** What the player is told they still need before a place will let them in. */
export function blockedBecause(state, loc) {
  const missing = loc.requires.filter((id) => !state.done.includes(id))
  if (missing.length)
    return 'First: ' + missing.map((id) => locations.find((l) => l.id === id).name).join(' and ')
  if (loc.needs === 'agent' && !state.agent)
    return 'Bring an agent. Nobody at the gate writes a loan for a buyer with no one on their side.'
  return ''
}

/**
 * Which scene a place opens with. Every location is a room you can walk back into, so the door
 * has to know how far you have got: the lane is an open house until you have a lender, then it
 * is where you write the offer, then it is where the inspectors meet you.
 */
export function startFor(state, loc) {
  switch (loc.id) {
    case 'cottage':
      return state.done.includes('cottage') ? 'cottage-again' : 'wake'
    case 'homes':
      if (state.offer === 'accepted') {
        // Once the roof question is settled — or you waived the right to ask it — the lane is
        // where Rowan is waiting, not where the inspectors are.
        if (state.vars.waived || state.vars.resolution) return 'homes-end'
        return 'inspect-choose'
      }
      if (state.offer === 'lost') return 'offer-lost-again'
      if (state.preapproved) return 'offer-write'
      return state.metPercival ? 'openhouse-again' : 'openhouse'
    case 'guild':
      return state.agent ? 'office-again' : 'office'
    case 'market':
      return state.done.includes('market') ? 'market-again' : 'market'
    case 'gate':
      return 'castle'
    default:
      return loc.start
  }
}
/**
 * Apply a choice's data without moving the player. Split out from choose() because some
 * choices route to an action (@next, @plan) rather than a scene, and their answers must
 * still be recorded — the opening scene asks the player's timing on an @next choice.
 */
/**
 * Some choices only make sense at a certain point in the purchase — you cannot ask for your key
 * before you have a house, and there is no point offering pre-approval twice. Scenes stay data;
 * this is the small allow-list of conditions they may name.
 */
/** Both halves of getting qualified: every document recovered, and a budget you have set. */
export function readyForPreapproval(state) {
  return state.docQuest === 'complete' && state.done.includes('market')
}

export function choiceVisible(state, choice) {
  switch (choice.when) {
    case undefined:
      return true
    case 'no-preapproval':
      return !state.preapproved
    case 'preapproved':
      return state.preapproved
    case 'ready-to-close':
      return state.offer === 'accepted' && (!!state.vars.resolution || state.vars.waived === true)
    case 'preapproval-ready':
      return readyForPreapproval(state)
    case 'preapproval-blocked':
      return !readyForPreapproval(state)
    default:
      return true
  }
}

export function applyChoice(state, choice) {
  if (choice.order) {
    const kind = inspectionKinds.find((k) => k.id === choice.order)
    if (kind && !state.inspections.includes(choice.order)) {
      state.inspections.push(choice.order)
      state.inspectionSpend += kind.cost
      state.vars.reserve = Math.max(0, Math.round(state.vars.reserve - kind.cost))
    }
  }
  if (!choice.set) return state
  Object.assign(state.vars, choice.set)
  // Profile answers are asked in dialogue rather than on a setup form.
  if (choice.set.focus) state.profile.question = choice.set.focus
  if (choice.set.goal) {
    state.profile.goal = choice.set.goal
    state.vars.priority = choice.set.goal
  }
  if (choice.set.timeline) state.profile.timeline = choice.set.timeline
  return state
}
export function choose(state, choice) {
  applyChoice(state, choice)
  state.node = choice.to
  return state
}
export function enter(state, node) {
  if (node.complete && !state.done.includes(node.complete)) state.done.push(node.complete)
  if (node.item && !state.inventory.includes(node.item)) {
    state.inventory.push(node.item)
    if (node.coins) addCoins(state, node.coins)
  }
  if (node.ending) state.ended = true
  // Scene-level effects. These are the moments that change who you are in the story rather
  // than what you know: signing with an agent, holding a letter, being under contract.
  if (node.hire && agents.some((a) => a.id === node.hire)) state.agent = node.hire
  if (node.dual) state.dualAgency = true
  if (node.sign) state.buyerBroker = true
  if (node.approve) state.preapproved = true
  if (node.accept) state.offer = 'accepted'
  if (node.lose) {
    state.offer = 'lost'
    state.offerTries += 1
  }
  // Losing the house means the other door on the lane, with the payment that goes with it.
  if (node.switchHome) {
    state.vars.home = state.vars.home === 'willow' ? 'lantern' : 'willow'
    state.vars.housing = state.vars.home === 'willow' ? 2400 : 3300
  }
  if (node.waive) state.vars.waived = true
  if (state.node === 'arizona') state.visitedArizona = true
  if (state.node === 'albert') state.albertMet = true
  if (state.node === 'openhouse') state.metPercival = true
  if (state.node === 'albert-quest' && state.docQuest === 'hidden') state.docQuest = 'active'
  return state
}
export function restoreState(raw) {
  const s = initialState()
  if (!raw || ![1, 2, 3, 4].includes(raw.version) || !Array.isArray(raw.done)) return s
  // Versions 1-3 were a different quest: three tools and a bridge, with no agent, no offer and
  // no pre-approval. There is no honest way to map that half-finished journey onto this one, so
  // an old save keeps who you are — your character, your photo, your coins and your mini-game
  // records — and the quest itself starts again.
  if (raw.version < 4) {
    if (raw.profile) s.profile = cleanProfileForRestore(raw.profile)
    s.coins = Math.max(0, Math.round(Number(raw.coins) || 0))
    s.coinsCollected = (Array.isArray(raw.coinsCollected) ? raw.coinsCollected : []).filter((id) =>
      mapCoins.some((c) => c.id === id),
    )
    if (raw.minigames && typeof raw.minigames === 'object')
      for (const [k, v] of Object.entries(raw.minigames))
        if (/^[a-z-]{1,40}$/.test(k) && v && typeof v === 'object')
          s.minigames[k] = {
            score: Math.max(0, Math.round(Number(v.score) || 0)),
            coins: Math.max(0, Math.round(Number(v.coins) || 0)),
            plays: Math.max(0, Math.round(Number(v.plays) || 0)),
          }
    s.avatar =
      typeof raw.avatar === 'string' &&
      raw.avatar.length < 400000 &&
      /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(raw.avatar)
        ? raw.avatar
        : null
    s.started = raw.started === true
    return s
  }
  Object.assign(s, raw)
  s.version = 4
  s.profile = cleanProfileForRestore(raw.profile)
  s.planTasks = Array.isArray(raw.planTasks) ? raw.planTasks.filter((v) => typeof v === 'string') : []
  s.planStarted = raw.planStarted === true
  s.done = raw.done.filter((id) => locations.some((l) => l.id === id))
  s.inventory = (Array.isArray(raw.inventory) ? raw.inventory : []).filter((id) =>
    items.some((i) => i.id === id),
  )
  s.vars = { ...initialState().vars, ...(raw.vars && typeof raw.vars === 'object' ? raw.vars : {}) }
  for (const k of ['housing', 'reserve']) s.vars[k] = Number.isFinite(Number(s.vars[k])) ? Number(s.vars[k]) : initialState().vars[k]
  for (const k of Object.keys(s.vars)) if (typeof s.vars[k] === 'string') s.vars[k] = s.vars[k].replace(/[^\w-]/g, '').slice(0, 40)
  s.player = { x: 30, y: 76, facing: 1, ...raw.player }
  s.history = []
  s.coins = Math.max(0, Math.round(Number(raw.coins) || 0))
  s.coinsCollected = (Array.isArray(raw.coinsCollected) ? raw.coinsCollected : []).filter((id) =>
    mapCoins.some((c) => c.id === id),
  )
  s.minigames = {}
  if (raw.minigames && typeof raw.minigames === 'object')
    for (const [k, v] of Object.entries(raw.minigames))
      if (/^[a-z-]{1,40}$/.test(k) && v && typeof v === 'object')
        s.minigames[k] = { score: Math.max(0, Math.round(Number(v.score) || 0)), coins: Math.max(0, Math.round(Number(v.coins) || 0)), plays: Math.max(0, Math.round(Number(v.plays) || 0)) }
  s.portal = ['hidden', 'found', 'open'].includes(raw.portal) ? raw.portal : 'hidden'
  s.visitedArizona = raw.visitedArizona === true
  s.albertMet = raw.albertMet === true
  s.metPercival = raw.metPercival === true
  s.docQuest = ['hidden', 'active', 'complete'].includes(raw.docQuest) ? raw.docQuest : 'hidden'
  s.docs = (Array.isArray(raw.docs) ? raw.docs : []).filter((id) => mapDocs.some((d) => d.id === id))
  s.lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  s.avatar =
    typeof raw.avatar === 'string' && raw.avatar.length < 400000 && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(raw.avatar)
      ? raw.avatar
      : null
  const AGENTS = ['percival', 'wren', 'dashiell']
  s.agent = AGENTS.includes(raw.agent) ? raw.agent : null
  s.buyerBroker = raw.buyerBroker === true
  s.dualAgency = raw.dualAgency === true
  s.preapproved = raw.preapproved === true
  s.offer = ['none', 'submitted', 'countered', 'accepted', 'lost'].includes(raw.offer) ? raw.offer : 'none'
  s.offerTries = Math.max(0, Math.min(20, Math.round(Number(raw.offerTries) || 0)))
  s.inspections = (Array.isArray(raw.inspections) ? raw.inspections : []).filter((id) =>
    inspectionKinds.some((k) => k.id === id),
  )
  s.inspectionSpend = Math.max(0, Math.round(Number(raw.inspectionSpend) || 0))
  if (!episode.nodes[s.node]) s.node = 'wake'
  if (!locations.some((l) => l.id === s.location)) s.location = 'cottage'
  return s
}
