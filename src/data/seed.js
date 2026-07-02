import { ACCOUNTS } from '../engine/accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from '../engine/transactionTypes.js'
import { runWeeklySplit } from '../engine/weeklySplit.js'
import { transferBetweenAccounts } from '../engine/transfer.js'
import { createCorrection } from '../engine/correction.js'
import { createFutureSnapshot } from '../engine/futureSnapshot.js'
import { createApprovalEvent, APPROVAL_KINDS, APPROVAL_STATUSES } from '../engine/approvals.js'
import { createMoneyRequest } from '../engine/moneyRequests.js'
import { CURRENT_VERSION } from '../storage/storage.js'

// SHA-256 of "1234" - a placeholder default PIN, meant to be changed in
// Manage/Config before this ever leaves a dev machine.
const DEFAULT_PARENT_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

export const SEED_SETTINGS = {
  currency: 'USD',
  summerStart: '2026-06-01',
  summerEnd: '2026-08-15',
  splitPercentages: { spend: 60, save: 30, give: 10 },
  weeklyIncomeAmount: 1000, // $10.00, in cents
  parentPinHash: DEFAULT_PARENT_PIN_HASH,
}

export const SEED_OPERATORS = [
  { id: 'op_dad', name: 'Dad', role: 'parent' },
  { id: 'op_mom', name: 'Mom', role: 'parent' },
  { id: 'op_child', name: 'Neyou', role: 'child' },
]

export const SEED_RESPONSIBILITIES = [
  { id: 'resp_feed_dog', title: 'Feed the dog', frequency: 'daily' },
  { id: 'resp_wash_dishes', title: 'Wash dishes she uses', frequency: 'daily' },
  { id: 'resp_clean_area', title: 'Clean her area', frequency: 'daily' },
  { id: 'resp_hygiene', title: 'Wash face/body after waking', frequency: 'daily' },
  { id: 'resp_breakfast', title: 'Eat breakfast before tablet', frequency: 'daily' },
  { id: 'resp_family_task', title: 'One family task', frequency: 'daily' },
  { id: 'resp_deep_clean', title: 'Bigger cleaning with Mom', frequency: 'weekly' },
]

// icon/description are what turns an achievement into a badge on the
// Badges screen - see src/child/BadgesScreen.jsx.
//
// The 8 entries below with category: 'mastery' are Phase 4's Money
// Learning mastery badges. They work exactly like any other achievement
// (same catalog, same approval mechanism, same one-time-ever reward) -
// category/moduleId are just extra fields MasteryScreen.jsx reads to
// filter this subset and link back to the matching practice module.
// assessmentInstructions is what ApprovalsScreen shows a parent under
// "Start Mastery Check" before they decide whether to approve: none of
// this is app-graded, a parent's real-cash judgment is the only thing
// that ever certifies mastery.
export const SEED_ACHIEVEMENTS = [
  {
    id: 'ach_first_save',
    title: 'First $2.00 saved',
    description: 'Save your first $2.00 toward a goal.',
    icon: '💰',
    rewardCents: 200,
  },
  {
    id: 'ach_full_week',
    title: 'Full Week Star',
    description: 'Complete every responsibility for a full week.',
    icon: '🌟',
    rewardCents: 300,
  },
  {
    id: 'ach_penny_master',
    title: 'Penny Master',
    description: 'Name every US coin on sight.',
    icon: '🥉',
    rewardCents: 100,
    category: 'mastery',
    moduleId: 'meet-the-money',
    assessmentInstructions:
      'Show Neyou a penny, nickel, dime, and quarter in any order and ask her to name each one and its value. She should get all four right without help.',
  },
  {
    id: 'ach_coin_counter',
    title: 'Coin Counter',
    description: 'Add up a pile of coins correctly.',
    icon: '🥈',
    rewardCents: 200,
    category: 'mastery',
    moduleId: 'count-coins',
    assessmentInstructions:
      'Put a small handful of real coins in front of Neyou (a mix of pennies, nickels, dimes, and quarters) and ask her to count the total out loud. She should get the exact total without help.',
  },
  {
    id: 'ach_coin_expert',
    title: 'Coin Expert',
    description: 'Build an exact amount using coins.',
    icon: '🥇',
    rewardCents: 300,
    category: 'mastery',
    moduleId: 'make-amount',
    assessmentInstructions:
      "Ask Neyou to hand you an exact amount using real coins - for example, '65 cents please.' She should build it correctly without help.",
  },
  {
    id: 'ach_bill_builder',
    title: 'Bill Builder',
    description: 'Name bills and add them up.',
    icon: '💵',
    rewardCents: 200,
    category: 'mastery',
    moduleId: 'count-bills',
    assessmentInstructions:
      'Show Neyou a mix of real bills ($1, $5, $10, $20) and ask her to name each one and add up the total. She should get it right without help.',
  },
  {
    id: 'ach_money_counter',
    title: 'Money Counter',
    description: 'Count coins and bills together.',
    icon: '💰',
    rewardCents: 300,
    category: 'mastery',
    assessmentInstructions:
      'Give Neyou a mix of real coins and bills together and ask her to count the total out loud. This combines everything from Coin Counter and Bill Builder.',
  },
  {
    id: 'ach_smart_shopper',
    title: 'Smart Shopper',
    description: 'Decide if you can afford something and figure out change.',
    icon: '🛍',
    rewardCents: 300,
    category: 'mastery',
    moduleId: 'afford-it',
    assessmentInstructions:
      "On a real trip to a store, show Neyou a price tag and ask her to decide if she can afford it with the money she has. If she pays with a bill, have her tell you how much change she should get back.",
  },
  {
    id: 'ach_generous_heart',
    title: 'Generous Heart',
    description: 'Choose to give and explain why.',
    icon: '💝',
    rewardCents: 200,
    category: 'mastery',
    moduleId: 'save-spend-give',
    assessmentInstructions:
      "Talk with Neyou about a real chance to give - an offering, a gift for someone, or helping someone in need. Ask her to explain why she'd choose to give in that moment.",
  },
  {
    id: 'ach_saving_champion',
    title: 'Saving Champion',
    description: 'Explain a savings goal and why it matters.',
    icon: '🏦',
    rewardCents: 300,
    category: 'mastery',
    moduleId: 'save-spend-give',
    assessmentInstructions:
      "Talk with Neyou about her savings goal. Ask her to explain what she's saving for and why she's choosing to wait instead of spending the money now.",
  },
]

export const SEED_GIVING_CATEGORIES = [
  { id: 'give_church', label: 'Church' },
  { id: 'give_charity', label: 'Charity' },
  { id: 'give_someone_in_need', label: 'Someone in need' },
  { id: 'give_friend', label: 'Friend' },
  { id: 'give_family', label: 'Family' },
  { id: 'give_other', label: 'Other' },
]

// Only one active goal in Summer V1 - "current" progress is always the
// live Save balance, never a separately tracked number, so it can never
// drift out of sync with the ledger. See ChildHome.jsx.
export const SEED_SAVINGS_GOAL = {
  title: 'Nintendo Game',
  targetCents: 6000, // $60.00
}

// Builds a small, believable stretch of ledger history by calling the real
// engine functions (not hand-authored entries), so importing this seed also
// proves the engine accepts its own output end to end.
export function buildSeedLedger() {
  let ledger = []
  const commit = (entries) => {
    ledger = [...ledger, ...(Array.isArray(entries) ? entries : [entries])]
    return entries
  }

  commit(
    runWeeklySplit({
      ledger,
      totalAmount: SEED_SETTINGS.weeklyIncomeAmount,
      splitPercentages: SEED_SETTINGS.splitPercentages,
      approvedBy: 'op_dad',
      notes: 'Week 1 weekly income split',
      timestamp: '2026-06-01T09:00:00.000Z',
    })
  )

  const achievementReward = commit(
    transferBetweenAccounts({
      ledger,
      type: TRANSACTION_TYPES.ACHIEVEMENT_REWARD,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SPEND,
      amount: 200,
      approvedBy: 'op_dad',
      notes: 'Achievement: First $2.00 saved',
      timestamp: '2026-06-03T18:00:00.000Z',
    })
  )

  commit(
    transferBetweenAccounts({
      ledger,
      type: TRANSACTION_TYPES.SPEND,
      fromAccount: ACCOUNTS.SPEND,
      toAccount: ACCOUNTS.EXTERNAL,
      amount: 350,
      approvedBy: 'op_child',
      notes: 'Ice cream at the shop',
      timestamp: '2026-06-05T15:30:00.000Z',
    })
  )

  commit(
    createCorrection({
      account: ACCOUNTS.SPEND,
      direction: DIRECTIONS.IN,
      amount: 100,
      reason: 'Ice cream shop rang up the wrong price, refunded $1.00',
      approvedBy: 'op_mom',
      timestamp: '2026-06-06T09:00:00.000Z',
    })
  )

  commit(
    transferBetweenAccounts({
      ledger,
      type: TRANSACTION_TYPES.GIVING,
      fromAccount: ACCOUNTS.GIVE,
      toAccount: ACCOUNTS.EXTERNAL,
      amount: 100,
      approvedBy: 'op_child',
      notes: 'Sunday offering',
      timestamp: '2026-06-07T10:00:00.000Z',
    })
  )

  commit(
    transferBetweenAccounts({
      ledger,
      type: TRANSACTION_TYPES.PARENT_DEPOSIT,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SAVE,
      amount: 1000,
      approvedBy: 'op_mom',
      notes: 'Birthday gift from Grandma',
      timestamp: '2026-06-10T12:00:00.000Z',
    })
  )

  commit(
    runWeeklySplit({
      ledger,
      totalAmount: SEED_SETTINGS.weeklyIncomeAmount,
      splitPercentages: SEED_SETTINGS.splitPercentages,
      approvedBy: 'op_dad',
      notes: 'Week 2 weekly income split',
      timestamp: '2026-06-08T09:00:00.000Z',
    })
  )

  commit(
    createFutureSnapshot({
      amount: 500000, // $5,000.00 custodial account statement balance
      notes: 'Custodial account statement balance, June 2026',
      approvedBy: 'op_dad',
      timestamp: '2026-06-15T00:00:00.000Z',
    })
  )

  return { ledger, achievementRewardTransferId: achievementReward[0].transferId }
}

// A handful of approval events so both the Parent Approvals screen and the
// child's "waiting for approval" list have something real to show out of
// the box: two historical ones already approved (one plain, one linked via
// transferId to the reward transfer created above), plus two still
// 'pending' - dated *today* rather than a fixed date, so a fresh install
// always shows something to act on regardless of when it's opened.
function buildSeedApprovals(achievementRewardTransferId) {
  const today = new Date().toISOString().slice(0, 10)

  return [
    createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_wash_dishes',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-06-03',
      approvedBy: 'op_dad',
      timestamp: '2026-06-03T19:30:00.000Z',
    }),
    createApprovalEvent({
      kind: APPROVAL_KINDS.ACHIEVEMENT,
      itemId: 'ach_first_save',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-06-03',
      approvedBy: 'op_dad',
      transferId: achievementRewardTransferId,
      notes: 'Reward posted to Spend',
      timestamp: '2026-06-03T18:00:00.000Z',
    }),
    createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_feed_dog',
      status: APPROVAL_STATUSES.PENDING,
      date: today,
      approvedBy: 'op_child',
      notes: 'Feed the dog',
    }),
    createMoneyRequest({
      type: TRANSACTION_TYPES.SPEND,
      amount: 250,
      notes: 'Stickers',
      requestedBy: 'op_child',
    }),
  ]
}

export function buildSeedState() {
  const { ledger, achievementRewardTransferId } = buildSeedLedger()
  return {
    version: CURRENT_VERSION,
    settings: SEED_SETTINGS,
    operators: SEED_OPERATORS,
    responsibilities: SEED_RESPONSIBILITIES,
    achievements: SEED_ACHIEVEMENTS,
    givingCategories: SEED_GIVING_CATEGORIES,
    savingsGoal: SEED_SAVINGS_GOAL,
    approvals: buildSeedApprovals(achievementRewardTransferId),
    ledger,
  }
}
