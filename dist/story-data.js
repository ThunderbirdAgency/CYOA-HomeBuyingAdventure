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
    quest: 'Answer the letter',
    x: 23,
    y: 70,
    symbol: '✉',
    start: 'letter',
    requires: [],
  },
  {
    id: 'market',
    name: 'The provisioner',
    quest: 'Find your breathing room',
    x: 28,
    y: 44,
    symbol: '◇',
    start: 'market',
    requires: ['cottage'],
  },
  {
    id: 'guild',
    name: 'The guides’ guild',
    quest: 'Gather the right questions',
    x: 25,
    y: 20,
    symbol: '⚑',
    start: 'guild',
    requires: ['cottage'],
  },
  {
    id: 'lookout',
    name: 'The mapmaker’s tower',
    quest: 'Chart the path to your home',
    x: 57,
    y: 23,
    symbol: '▤',
    start: 'course',
    requires: ['market', 'guild'],
  },
  {
    id: 'homes',
    name: 'Three-door lane',
    quest: 'Choose with your eyes open',
    x: 80,
    y: 45,
    symbol: '⌂',
    start: 'homes',
    requires: ['lookout'],
  },
  {
    id: 'gate',
    name: 'The lantern bridge',
    quest: 'Claim your first key',
    x: 75,
    y: 70,
    symbol: '⚿',
    start: 'bridge',
    requires: ['homes', 'lookout'],
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
  { id: 'c1', x: 34, y: 72 },
  { id: 'c2', x: 43, y: 60 },
  { id: 'c3', x: 37, y: 36 },
  { id: 'c4', x: 44, y: 24 },
  { id: 'c5', x: 51, y: 14 },
  { id: 'c6', x: 66, y: 32 },
  { id: 'c7', x: 62, y: 50 },
  { id: 'c8', x: 88, y: 32 },
  { id: 'c9', x: 82, y: 62 },
  { id: 'c10', x: 55, y: 78 },
  { id: 'c11', x: 14, y: 88 },
  { id: 'c12', x: 8, y: 30 },
]

// The player's paperwork, scattered by the Augusta wind. Appears once Albert marks the map; walk over each to recover it.
export const mapDocs = [
  { id: 'paystub', label: 'Your pay stubs', x: 19, y: 57, why: 'Recent pay stubs show current income.' },
  { id: 'w2', label: 'Your W-2s', x: 47, y: 38, why: 'Two years of W-2s (or tax returns if self-employed) show income history.' },
  { id: 'bank', label: 'Your bank statements', x: 69, y: 19, why: 'Statements show savings for the down payment, closing costs, and reserves.' },
  { id: 'photoid', label: 'Your photo ID', x: 91, y: 52, why: 'A government ID confirms who is applying.' },
  { id: 'tax', label: 'Your tax returns', x: 41, y: 88, why: 'Returns fill in the income picture, especially for bonuses or self-employment.' },
]

// A hidden spot on the map. Not a quest location; finding it is its own reward.
export const secretSpots = [
  { id: 'portal', x: 7, y: 14, name: 'A ring of humming stones', start: 'portal', radius: 9 },
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
const c = (label, to, detail = '', set = {}) => ({ label, to, detail, set })
export const episode = {
  id: 'first-key',
  version: 3,
  title: 'The First Key',
  estimatedMinutes: 10,
  nodes: {
    letter: {
      speaker: 'Bartleby Quill · your landlord',
      symbol: '✉',
      title: 'Rent day. Again.',
      text: [
        `Three knocks, cheerful as a birthday. Bartleby Quill fills your doorway in a plum coat and a hat one size too tall, ledger open, palm already out. “Rent!” he beams, as though announcing a festival.`,
        `“And a small convenience fee. And a doorknob levy, you have two. And the sunlight surcharge, your window faces east, which is a premium exposure.” He licks a fingertip and turns a page. “Also the walls are looking beige. Do not paint them.”`,
        `He tips his hat, pockets your month, and is gone. On the table, beside the receipt with its cheerful little stamp, is a sketch of a place you could make your own. Not a castle. Just a front door that opens onto your next chapter.`,
      ],
      minigame: 'rent-day',
      minigameLabel: 'Keep what you can →',
      minigameBlurb: 'Bartleby is on his way back. Catch the coins before he does.',
      choices: [
        c('Enough. What are my options?', 'rowan', 'A note under the door is already waiting.'),
      ],
    },
    rowan: {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'Here is your quest, {{name}}.',
      text: [
        `Outside, someone is leaning on the fence as if they had been waiting a while. “Rowan,” they say. “I help people stop paying Bartleby.”`,
        `“One question before we start, and it is the only one that matters. If a door had your name on it, what would you want on the other side?”`,
      ],
      choices: [
        c('Somewhere to settle in.', 'purpose', 'Stability. A place that stays put.', { goal: 'stability' }),
        c('More room for my life.', 'purpose', 'Space. For people, work, or both.', { goal: 'space' }),
        c('Walls I am allowed to paint.', 'purpose', 'Control. Bartleby would hate it.', { goal: 'control' }),
      ],
    },
    purpose: {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'Then we walk.',
      text: [
        `“{{goalText}}. Good reason.” Rowan unfolds a map of Hearthvale and taps three places. “Three tools, one house decision, one bridge. Ten minutes. Nothing here can go wrong for you.”`,
        `“Last thing: when might you actually want to move?”`,
      ],
      choices: [
        c('Within six months.', '@next', 'Soon. Let’s be ready.', { timeline: 'soon' }),
        c('Sometime this year or next.', '@next', 'There is time to prepare.', { timeline: 'later' }),
        c('Honestly, I’m just looking.', '@next', 'No deadline. Explore.', { timeline: 'exploring' }),
      ],
      complete: 'cottage',
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
    guild: {
      speaker: 'Sage · the guild keeper',
      symbol: '⚑',
      title: 'Choose your questions first.',
      text: [
        `Maps everywhere. Some show houses, some show numbers, none show everything. Sage pulls out a chair. “Agent finds the house. Lender does the money. Inspector checks the bones. Ask each one what they do and how they get paid.”`,
        `A messenger bursts in waving a scroll. “Lowest payment in all Hearthvale!” Sage waits for the door to shut. “So. What would you ask him?”`,
      ],
      source: 'loans',
      choices: [
        c('What costs and loan features are behind that payment?', 'guild-wise', 'Compare the whole offer.', {
          question: 'whole-offer',
        }),
        c(
          'Can I stop shopping if this is the lowest payment?',
          'guild-hasty',
          'A smaller payment sounds like enough.',
          { question: 'payment-only' },
        ),
      ],
    },
    'guild-hasty': {
      speaker: 'Sage · the guild keeper',
      symbol: '⚑',
      title: 'The smallest number can hide a larger story.',
      text: [
        `Sage turns the scroll over. The payment leaves out several costs, and a ribbon covers the section about fees. “We haven’t learned enough to call this a bargain.”`,
        `“Ask for comparable Loan Estimates. Look at the loan type, interest rate, mortgage insurance, closing costs, and whether payments can change. Two offers only make sense beside each other when you know what is different.”`,
        `The messenger returns for his ribbon. You keep the questions.`,
      ],
      source: 'loans',
      choices: [c('Ask for comparable offers.', 'guild-end', 'A useful question beats a confident guess.')],
    },
    'guild-wise': {
      speaker: 'Sage · the guild keeper',
      symbol: '⚑',
      title: 'A question worth carrying.',
      text: [
        `“Exactly.” Sage lays two blank frames side by side. “Ask lenders for Loan Estimates for the same loan features. Then compare the costs and terms. A low advertised payment is a starting point for questions.”`,
        `You jot down: What is included? What can change? What must I bring to closing? What are my alternatives?`,
        `“And receiving a Loan Estimate does not mean you are approved. Documents have jobs. Learn which job each one is doing.”`,
      ],
      source: 'loans',
      choices: [c('Add those questions to my journal.', 'guild-end')],
    },
    'guild-end': {
      speaker: 'Sage · the guild keeper',
      symbol: '◈',
      title: 'You found the Clear-Sight Lens.',
      text: [
        `Sage gives you a small lens with a green rim. Through it, the tiny writing on the ornate scroll looks just as large as the headline.`,
        `“A good guide makes the details clearer,” Sage says. “They should leave you with more understanding, not fewer questions.”`,
        `Beyond the guild, the mapmaker’s tower is glowing. When you have gathered your first two tools, the path to it will open.`,
      ],
      lesson:
        'Request comparable Loan Estimates and review both upfront and ongoing costs. Ask questions before choosing a lender.',
      source: 'loans',
      item: 'lens',
      complete: 'guild',
      minigame: 'offer-match',
      minigameLabel: 'Sage’s scroll test →',
      minigameBlurb: 'Two offers, eight rounds. Spot the one that is hiding something.',
      choices: [c('Go to my next stop.', '@next')],
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
        c('Visit Three-Door Lane.', '@next', 'One house decision stands between you and the bridge.'),
      ],
    },
    homes: {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'A house, and the life around it.',
      text: [
        `Three front doors. A garden, a sunny upstairs room, a workbench in the window. You remember what brought you here: {{priority}}.`,
        `“{{homeName}}, then. Let’s walk it.” You stop in the doorway. The afternoon light is exactly right, and every question in your head goes quiet.`,
        `Then a drop of water hits the windowsill. Dark patch above it. Nell watches your face. “Still want to ask those questions?”`,
      ],
      source: 'inspection',
      choices: [
        c(
          'Have the condition investigated before deciding.',
          'inspection',
          'Bring in an independent inspector.',
          { repairAction: 'inspect' },
        ),
        c('The appraisal should tell me whether everything works.', 'appraisal', 'Isn’t that enough?', {
          repairAction: 'appraisal',
        }),
      ],
    },
    appraisal: {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'Two different jobs.',
      text: [
        `“An appraisal and an inspection answer different questions,” Nell says. “The appraisal is about value for the lending process. An independent inspection examines condition.”`,
        `The sun shifts. The stain is still there. You do not need to panic, but you do need more information. Nell helps you prepare questions for the inspector: Where is the water coming from? What else should be checked? Should a specialist look at it?`,
      ],
      lesson: 'An appraisal is not a substitute for an independent home inspection.',
      source: 'inspection',
      choices: [c('Get the condition investigated.', 'inspection')],
    },
    inspection: {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'An unwelcome discovery.',
      text: [
        `For our fictional scenario, a qualified roofer follows up on the inspection and estimates $3,000 to fix the leak. Nell sets the written estimate on the table. The house still feels right. The repair does not disappear because of that.`,
        `You have {{reserve}} in the emergency pouch you packed earlier. Paying $3,000 from it would leave {{afterRepair}}. Your ongoing monthly breathing room is {{margin}}.`,
        `The seller might negotiate, but agreement is not guaranteed. The contract and deadlines matter. How do you want to respond?`,
      ],
      widget: 'repair',
      source: 'inspection',
      choices: [
        c('Ask the seller to address the repair.', 'negotiate', 'A request, not a guarantee.', {
          resolution: 'negotiate',
        }),
        c(
          'Accept the cost and look at what remains.',
          'self-fund',
          'See the effect of the earlier furniture choice.',
          { resolution: 'self-fund' },
        ),
        c(
          'Explore stepping back under the contract.',
          'step-back',
          'Preserve the option to find a different home.',
          { resolution: 'step-back' },
        ),
      ],
    },
    negotiate: {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'A deal has two sides.',
      text: [
        `In this branch, the seller agrees to have the specified repair completed before closing, subject to the written agreement and verification. The tidy ending comes from this authored scenario; real sellers can say no.`,
        `Your emergency pouch stays at {{reserve}}. You still need to review the work and confirm your loan and closing requirements. A verbal promise does not finish the job.`,
        `“You didn’t win by demanding a perfect house,” Nell says. “You got the information and made a specific request.”`,
      ],
      source: 'inspection',
      choices: [c('Carry the plan to the bridge.', 'homes-end')],
    },
    'self-fund': {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'Earlier choices have footsteps.',
      text: [
        `You run the numbers again. After this $3,000 repair, your pouch would hold {{afterRepair}}. {{reserveResult}}`,
        `“That is why we practiced at the market,” Nell says. “The furniture and the repair were spending the same money, even when you could only see one of them.”`,
        `You can reconsider before moving on. Choosing a home is not a test of whether you can defend your first answer.`,
      ],
      source: 'budget',
      choices: [
        c('Reconsider how to handle the repair.', 'inspection', 'Try a different path.'),
        c(
          'Keep this as my lesson and plan to prepare longer.',
          'homes-end',
          'An informed pause is a valid outcome.',
          { resolution: 'prepare' },
        ),
      ],
    },
    'step-back': {
      speaker: 'Nell · the neighborhood guide',
      symbol: '⌂',
      title: 'The courage to choose another door.',
      text: [
        `You ask Nell to explain the contract’s contingencies and deadlines before taking action. Whether you can cancel and recover a deposit depends on your actual agreement and circumstances.`,
        `In this story, your next step is to review those options and pause this purchase. There is disappointment. There is also room for another possibility.`,
        `Outside, the other two doors are still catching the sun. You have not failed to find a home. You have learned what this one asks of you.`,
      ],
      source: 'inspection',
      choices: [c('Continue with a clearer plan.', 'homes-end')],
    },
    'homes-end': {
      speaker: 'Rowan · the pathfinder',
      symbol: '✦',
      title: 'You came back with better questions.',
      text: [
        `Rowan is waiting at the end of the lane. You show them the compass, lens, and map. None has made the world simple. Each has made it easier to understand.`,
        `“Ready for the bridge?” they ask. “There is one last choice waiting there.”`,
        `The lanterns along the stone rail begin to glow. Beyond them is the road toward your next chapter. You take a breath and open the map.`,
      ],
      complete: 'homes',
      minigame: 'inspection-hunt',
      minigameLabel: 'Search the house →',
      minigameBlurb: 'Seven things are wrong in there. Find them before the clock does.',
      choices: [c('Go to the lantern bridge.', '@next', 'Claim your First Key.')],
    },
    bridge: {
      speaker: 'Rowan · the pathfinder',
      symbol: '⚿',
      title: 'The door beyond the bridge.',
      text: [
        `From the bridge you can see the whole town: your cottage, Mira’s awning, the tower. A short walk on a map. Longer in your head.`,
        `A banner snaps above the gate. “That flag belongs to the lender who keeps this gate,” Rowan says. “Only person in Hearthvale who isn’t made up. Go say hello.”`,
      ],
      choices: [
        c('Meet the lender at the gate.', 'lender', 'Bring your coin pouch. He has a trick with it.'),
      ],
    },
    lender: {
      speaker: '{{presenterName}} · the lender at the gate',
      symbol: '⚑',
      title: 'Let’s look at that pouch, {{name}}.',
      text: [
        `“Everything else here is made up. I’m not. {{presenterName}}, {{presenterRole}} with {{presenterCompany}}. This game is my way of saying the first conversation should be easy.”`,
        `He weighs your pouch. “{{coins}} coins, and a coin is $100 of down payment here. That’s {{coinDollars}} more down, about {{coinSavings}} off the payment on a fictional 30-year loan at {{fictionalRate}}. More down can shrink mortgage insurance too.”`,
        `“Games around town fill the pouch. In real life it’s savings, gifts, and assistance programs. Ask me about those any time.”{{partnerLine}}`,
      ],
      widget: 'downpayment',
      source: 'downPayment',
      minigame: 'down-payment-dash',
      minigameLabel: 'Run for the down payment →',
      minigameBlurb: 'Every coin you grab comes off the payment. Mind the surprise expenses.',
      choices: [
        c('What programs help buyers in Arizona?', 'arizona', 'Down payment help, VA, FHA, and what to ask.'),
        c('What would you ask me first?', 'lender-questions', 'Three questions, none of them scary.'),
        c('Say hello to {{assistantFirst}}.', 'albert', 'My right hand, the paperwork wizard, is in the castle keep.'),
        c('I’m ready to choose my next step.', 'bridge-choice', 'Back to Rowan and the bridge.'),
      ],
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
        c('Back to Erik.', 'lender'),
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
        c('Back to Erik.', 'lender'),
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
        c('Good to know. Back to the bridge.', 'bridge-choice'),
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
        c('I’m ready to choose my next step.', 'bridge-choice'),
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
        `You collected all three tools, faced your first house decision, and reached the bridge. Your First Key now opens Your Buying Plan: a short checklist shaped by your goals and questions. This opening quest is only the beginning.`,
      ],
      complete: 'gate',
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
  market: 'I compared full monthly housing budgets and practiced keeping money for surprises.',
  guild:
    'I learned to ask for comparable loan offers and understand the details behind an advertised payment.',
  lookout: 'I mapped the main stages of homebuying and chose the focus of my buying plan.',
  homes: 'I practiced responding to a repair finding, including negotiating or preparing longer.',
  gate: 'I chose a next step I can take outside the adventure.',
  portal: 'I previewed the Credit Compass: read my reports for free, dispute errors in writing, and ignore guaranteed-score promises.',
  albert:
    'The Augusta wind scattered my paperwork and Albert helped me recover the five documents a lender usually asks for: pay stubs, W-2s, bank statements, photo ID, and tax returns.',
  arizona:
    'I learned that Arizona down payment assistance, VA, and FHA programs exist and that a licensed lender can tell me which apply.',
}
export function initialState() {
  return {
    version: 3,
    profile: defaultProfile(),
    planTasks: [],
    planStarted: false,
    started: false,
    done: [],
    inventory: [],
    vars: { priority: 'stability', home: 'willow', housing: 2400, reserve: 4000 },
    node: 'letter',
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
    docQuest: 'hidden', // hidden → active → complete
    docs: [],
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
export function unlocked(state, loc) {
  return loc.requires.every((id) => state.done.includes(id))
}
/**
 * Apply a choice's data without moving the player. Split out from choose() because some
 * choices route to an action (@next, @plan) rather than a scene, and their answers must
 * still be recorded — the opening scene asks the player's timing on an @next choice.
 */
export function applyChoice(state, choice) {
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
  if (state.node === 'arizona') state.visitedArizona = true
  if (state.node === 'albert') state.albertMet = true
  if (state.node === 'albert-quest' && state.docQuest === 'hidden') state.docQuest = 'active'
  return state
}
export function restoreState(raw) {
  const s = initialState()
  if (!raw || ![1, 2, 3].includes(raw.version) || !Array.isArray(raw.done)) return s
  Object.assign(s, raw)
  s.version = 3
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
  s.docQuest = ['hidden', 'active', 'complete'].includes(raw.docQuest) ? raw.docQuest : 'hidden'
  s.docs = (Array.isArray(raw.docs) ? raw.docs : []).filter((id) => mapDocs.some((d) => d.id === id))
  s.lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  s.avatar =
    typeof raw.avatar === 'string' && raw.avatar.length < 400000 && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(raw.avatar)
      ? raw.avatar
      : null
  if (
    raw.version === 1 &&
    (raw.done.includes('archive') || ['archive', 'shortcut', 'dispute', 'archive-end'].includes(raw.node))
  ) {
    s.node = 'course'
    s.location = 'lookout'
    s.ended = false
    s.done = s.done.filter((id) => id !== 'gate')
    s.inventory = s.inventory.filter((id) => id !== 'key')
  }
  if (!episode.nodes[s.node]) s.node = 'letter'
  if (!locations.some((l) => l.id === s.location)) s.location = 'cottage'
  return s
}
