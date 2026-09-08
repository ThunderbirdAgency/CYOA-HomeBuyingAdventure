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
      speaker: '{{name}} · a new beginning',
      symbol: '✉',
      title: 'Rent day. Again.',
      text: [
        `Your boots are by the door. Another workday is finished, and another rent payment has left your account. The cottage is comfortable enough. The “no painting the walls” rule is less comfortable.`,
        `The landlord’s receipt arrives with its usual cheerful stamp. You put it beside a sketch of a place you could make your own. Not a castle. Just a front door that opens onto your next chapter.`,
        `A note slips under the door: “There is a path from wondering to knowing what to do next. Meet me outside. Bring your questions. — Rowan.”`,
      ],
      choices: [c('Meet Rowan outside.', 'rowan', 'Your first quest begins here.')],
    },
    rowan: {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'Here is your quest, {{name}}.',
      text: [
        `“You’re here for {{goalText}}. That is a good reason to begin.” Rowan unfolds a map. “This first adventure is a practice run. You’ll meet your guides, weigh two homes, and handle one surprise.”`,
        `“Collect three tools: Mira’s Budget Compass, Sage’s Clear-Sight Lens, and the Homeward Map. Then visit Three-Door Lane and cross the lantern bridge. That earns your First Key and unlocks your own buying plan.”`,
        `Today’s household and dollar amounts are fictional. Your character and goals personalize the journey; the game is not deciding what you can borrow.`,
      ],
      choices: [
        c('I’m in. Show me the first stop.', 'purpose', 'Get a clear destination and start exploring.'),
      ],
    },
    purpose: {
      speaker: 'Rowan · your guide',
      symbol: '✦',
      title: 'One step at a time.',
      text: [
        `“Tap a glowing place to visit it. Talk to the person there and choose what to do. The button above your map will always take you to your next stop.”`,
        `“There is no countdown, and you don’t have to answer everything perfectly. The back button lets you explore another choice. Waiting or walking away can be a wise decision, too.”`,
        `Rowan taps your map. “First, {{firstStop}}. I’ll meet you at the bridge when you have the three tools.”`,
      ],
      choices: [c('Go to my first stop.', '@next', 'Follow the highlighted destination.')],
      complete: 'cottage',
    },
    market: {
      speaker: 'Mira · the provisioner',
      symbol: '◇',
      title: 'The price on the sign.',
      text: [
        `Mira’s shop smells of oranges and fresh bread. Behind the counter hang travel packs of every size. You reach for the largest. She raises an eyebrow. “Everything fits in that one. Including the things you don’t need.”`,
        `She rolls out two home brochures. Willow Cottage shows $1,600 a month in bold letters. Lantern House shows $2,200. “Those are only the principal-and-interest payments in our fictional offers. Turn the brochures over.”`,
        `The quieter numbers tell the rest of the story. Look at the full monthly household cost before deciding which pack you want to carry.`,
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
        `Mira counts out six stacks of coins. “Your take-home income is $6,000. Everyday expenses and existing debt payments use $2,100. You also want to save $500 each month.”`,
        `She slides your chosen home’s costs across the counter. The remaining amount is {{margin}} a month. That money must absorb anything you did not anticipate.`,
        `“Extra space has value. So does being able to sleep when the refrigerator makes a strange noise. Which tradeoff can you live with?”`,
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
        `Now Mira sets your savings on the counter: $18,000. In this story, $10,000 is earmarked for the down payment, $3,000 for other closing costs, and $1,000 for moving. That leaves $4,000.`,
        `Across the shop is a beautiful furniture set. You imagine it in your new living room. Mira puts an empty emergency pouch beside it. “Same coins. Two jobs.”`,
        `Choose how much of the remaining $4,000 to keep in the pouch. This is practice with a small fictional cushion, not a recommendation for your own reserve target.`,
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
      choices: [c('Go to my next stop.', '@next', 'Your map will lead the way.')],
    },
    guild: {
      speaker: 'Sage · the guild keeper',
      symbol: '⚑',
      title: 'Choose your questions first.',
      text: [
        `The guild hall is full of maps. Some show houses; others show numbers. Nobody’s map shows everything. Sage pulls out a chair. “An agent can help with the property search and transaction. A lender works on financing. An inspector examines the home’s condition. Ask each person what they do, how they are paid, and where their work ends.”`,
        `A messenger bursts in carrying an ornate scroll. “The lowest payment in all Hearthvale!” he announces. Sage waits until the door closes. “What would you ask before trusting that claim?”`,
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
      choices: [c('Go to my next stop.', '@next')],
    },
    course: {
      speaker: 'Ellis · the mapmaker',
      symbol: '▤',
      title: 'A big journey, in smaller steps.',
      text: [
        `Ellis clears a desk by the tower window. “From up here, everyone looks as if they know where they’re going. Come closer and you find out most people are figuring it out one turn at a time.”`,
        `Your route is taking shape: {{goalText}}. Your question is {{questionText}}. Ellis draws a path across a blank sheet and marks the major stages of buying a home.`,
        `“The details depend on your situation. Your agent and lender can explain what applies to you. Here is the broad shape of the journey.”`,
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
        `Nell meets you beside three front doors. One has a wide garden, one a sunny upstairs room, and one a workbench visible through the window. You remember what brought you here: {{priority}}.`,
        `“You chose {{homeName}} at the market. Let’s walk through it.” You pause in the doorway. The afternoon light is exactly right. For a moment, every question in your head disappears.`,
        `Then a drop of water lands on the windowsill. There is a dark patch above it. Nell watches your expression. “Still want to ask those questions?”`,
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
      choices: [c('Go to the lantern bridge.', '@next', 'Claim your First Key.')],
    },
    bridge: {
      speaker: 'Rowan · the pathfinder',
      symbol: '⚿',
      title: 'The door beyond the bridge.',
      text: [
        `From the bridge, you can see the whole town: the cottage where you began, the provisioner’s awning, the mapmaker’s tower. It is a small distance on a map. It feels longer in your head.`,
        `Above the gate towers, a banner snaps in the wind. “That flag belongs to the lender who keeps this gate,” Rowan says. “He is the one person in Hearthvale who is not made up. Go say hello before you choose your next step.”`,
        `“You could collect keys forever. But eventually the useful question is what you will do with what you learned.”`,
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
        `“Everything else in Hearthvale is fiction. I’m not. I’m {{presenterName}}, a {{presenterRole}} with {{presenterCompany}}, and this game is my way of saying the first conversation should be easy.”`,
        `He weighs your coin pouch in one hand. “{{coins}} coins. In this story a coin is worth $100 of down payment, so that is {{coinDollars}} more toward the house. On a fictional 30-year loan at {{fictionalRate}}, that lowers the monthly payment by about {{coinSavings}}. A bigger down payment can also shrink or remove mortgage insurance.”`,
        `“Play the arcade games around town and the pouch gets heavier. In real life the pouch is savings, gifts, and assistance programs. Ask me about those any time.”{{partnerLine}}`,
      ],
      widget: 'downpayment',
      source: 'downPayment',
      minigame: 'down-payment-dash',
      choices: [
        c('What programs help buyers in Arizona?', 'arizona', 'Down payment help, VA, FHA, and what to ask.'),
        c('What would you ask me first?', 'lender-questions', 'Three questions, none of them scary.'),
        c('I’m ready to choose my next step.', 'bridge-choice', 'Back to Rowan and the bridge.'),
      ],
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
export function choose(state, choice) {
  if (choice.set) Object.assign(state.vars, choice.set)
  if (choice.set?.focus) state.profile.question = choice.set.focus
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
  s.vars = { ...initialState().vars, ...raw.vars }
  s.player = { x: 30, y: 76, facing: 1, ...raw.player }
  s.history = []
  s.coins = Math.max(0, Math.round(Number(raw.coins) || 0))
  s.coinsCollected = (Array.isArray(raw.coinsCollected) ? raw.coinsCollected : []).filter((id) =>
    mapCoins.some((c) => c.id === id),
  )
  s.minigames = raw.minigames && typeof raw.minigames === 'object' ? raw.minigames : {}
  s.portal = ['hidden', 'found', 'open'].includes(raw.portal) ? raw.portal : 'hidden'
  s.visitedArizona = raw.visitedArizona === true
  s.lead = raw.lead && typeof raw.lead === 'object' ? raw.lead : {}
  s.avatar = typeof raw.avatar === 'string' && raw.avatar.startsWith('data:image/png;base64,') && raw.avatar.length < 60000 ? raw.avatar : null
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
