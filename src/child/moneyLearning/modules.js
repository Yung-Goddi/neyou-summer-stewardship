import MeetTheMoney from './MeetTheMoney.jsx'
import CountCoins from './CountCoins.jsx'
import CountBills from './CountBills.jsx'
import MakeThisAmount from './MakeThisAmount.jsx'
import CanIAffordIt from './CanIAffordIt.jsx'
import MakingChange from './MakingChange.jsx'
import SaveSpendOrGive from './SaveSpendOrGive.jsx'

// The 7 practice modules. Every one of these is free, unlimited practice -
// no module here ever calls commitLedger/commitApprovals. Mastery
// achievements (see seed.js) reference these by id via moduleId, purely so
// MasteryScreen can link back to "go practice this."
export const MODULES = [
  { id: 'meet-the-money', title: 'Meet the Money', emoji: '🪙', description: 'Learn every coin and bill', Component: MeetTheMoney },
  { id: 'count-coins', title: 'Count Coins', emoji: '🔢', description: 'Add up a pile of coins', Component: CountCoins },
  { id: 'count-bills', title: 'Count Bills', emoji: '💵', description: 'Add up a stack of bills', Component: CountBills },
  { id: 'make-amount', title: 'Make This Amount', emoji: '🎯', description: 'Build an exact amount', Component: MakeThisAmount },
  { id: 'afford-it', title: 'Can I Afford It?', emoji: '🛍️', description: 'Decide if you have enough', Component: CanIAffordIt },
  { id: 'making-change', title: 'Making Change', emoji: '🧾', description: 'Figure out the change', Component: MakingChange },
  { id: 'save-spend-give', title: 'Save, Spend or Give?', emoji: '🤔', description: 'Think about real choices', Component: SaveSpendOrGive },
]

export const MODULES_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m]))
