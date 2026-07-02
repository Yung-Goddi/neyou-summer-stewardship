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

// Badges are a separate, non-monetary recognition board from the
// cash-reward SEED_ACHIEVEMENTS above (see src/engine/badges.js) - no
// reward amount, no approval workflow, just a category + title/description/
// icon and a Bronze/Silver/Gold level a parent awards directly. Categories
// are a fixed set for now (only badges themselves are meant to be added/
// edited/deleted from Manage/Config); cat_secret_badges is the one category
// with secret: true, which the child's Badges screen uses to hide its
// contents entirely until each one is earned.
export const SEED_BADGE_CATEGORIES = [
  { id: 'cat_home_hero', label: 'Home Hero', secret: false },
  { id: 'cat_money_master', label: 'Money Master', secret: false },
  { id: 'cat_learning_explorer', label: 'Learning Explorer', secret: false },
  { id: 'cat_character_builder', label: 'Character Builder', secret: false },
  { id: 'cat_life_skills', label: 'Life Skills', secret: false },
  { id: 'cat_special_achievements', label: 'Special Achievements', secret: false },
  { id: 'cat_secret_badges', label: 'Secret Badges', secret: true },
]

export const SEED_BADGES = [
  // Home Hero
  { id: 'badge_room_rescue', categoryId: 'cat_home_hero', title: 'Room Rescue', description: 'Got a messy room back in shape.', icon: '🧹' },
  { id: 'badge_kitchen_helper', categoryId: 'cat_home_hero', title: 'Kitchen Helper', description: 'Pitched in with kitchen chores.', icon: '🍽️' },
  { id: 'badge_laundry_learner', categoryId: 'cat_home_hero', title: 'Laundry Learner', description: 'Helped with a load of laundry.', icon: '🧺' },
  { id: 'badge_cleaning_champion', categoryId: 'cat_home_hero', title: 'Cleaning Champion', description: 'Went above and beyond cleaning up.', icon: '🏆' },
  { id: 'badge_responsibility_star', categoryId: 'cat_home_hero', title: 'Responsibility Star', description: 'Stayed on top of daily responsibilities.', icon: '⭐' },

  // Money Master
  { id: 'badge_coin_counter', categoryId: 'cat_money_master', title: 'Coin Counter', description: 'Got great at counting coins.', icon: '🪙' },
  { id: 'badge_dollar_detective', categoryId: 'cat_money_master', title: 'Dollar Detective', description: 'Figured out a money problem.', icon: '🔍' },
  { id: 'badge_smart_shopper', categoryId: 'cat_money_master', title: 'Smart Shopper', description: 'Made a smart choice while shopping.', icon: '🛍️' },
  { id: 'badge_super_saver', categoryId: 'cat_money_master', title: 'Super Saver', description: 'Saved money toward a goal.', icon: '🐷' },
  { id: 'badge_budget_boss', categoryId: 'cat_money_master', title: 'Budget Boss', description: 'Planned out spending, saving, and giving.', icon: '📊' },

  // Learning Explorer
  { id: 'badge_reading_rookie', categoryId: 'cat_learning_explorer', title: 'Reading Rookie', description: 'Finished a book or reading goal.', icon: '📖' },
  { id: 'badge_word_wizard', categoryId: 'cat_learning_explorer', title: 'Word Wizard', description: 'Showed off great vocabulary or spelling.', icon: '🔤' },
  { id: 'badge_math_master', categoryId: 'cat_learning_explorer', title: 'Math Master', description: 'Nailed a math skill.', icon: '➗' },
  { id: 'badge_curious_mind', categoryId: 'cat_learning_explorer', title: 'Curious Mind', description: 'Asked great questions and explored a topic.', icon: '🔭' },
  { id: 'badge_lifelong_learner', categoryId: 'cat_learning_explorer', title: 'Lifelong Learner', description: 'Kept learning even when it was hard.', icon: '🎓' },

  // Character Builder
  { id: 'badge_kind_heart', categoryId: 'cat_character_builder', title: 'Kind Heart', description: 'Showed real kindness to someone.', icon: '💗' },
  { id: 'badge_helpful_hands', categoryId: 'cat_character_builder', title: 'Helpful Hands', description: 'Helped out without being asked.', icon: '🤲' },
  { id: 'badge_thankful_spirit', categoryId: 'cat_character_builder', title: 'Thankful Spirit', description: 'Showed gratitude for what she has.', icon: '🙏' },
  { id: 'badge_never_gives_up', categoryId: 'cat_character_builder', title: 'Never Gives Up', description: 'Kept trying through something tough.', icon: '💪' },
  { id: 'badge_truth_teller', categoryId: 'cat_character_builder', title: 'Truth Teller', description: 'Told the truth even when it was hard.', icon: '🗣️' },

  // Life Skills
  { id: 'badge_breakfast_builder', categoryId: 'cat_life_skills', title: 'Breakfast Builder', description: 'Made her own breakfast.', icon: '🥣' },
  { id: 'badge_plant_protector', categoryId: 'cat_life_skills', title: 'Plant Protector', description: 'Took care of a plant.', icon: '🌱' },
  { id: 'badge_animal_friend', categoryId: 'cat_life_skills', title: 'Animal Friend', description: 'Took great care of a pet.', icon: '🐾' },
  { id: 'badge_adventure_ready', categoryId: 'cat_life_skills', title: 'Adventure Ready', description: 'Packed and prepared for an outing herself.', icon: '🎒' },
  { id: 'badge_independent_kid', categoryId: 'cat_life_skills', title: 'Independent Kid', description: 'Handled something on her own.', icon: '🧭' },

  // Special Achievements
  { id: 'badge_responsibility_royalty', categoryId: 'cat_special_achievements', title: 'Responsibility Royalty', description: 'Owned her responsibilities like a pro.', icon: '👑' },
  { id: 'badge_30_day_streak', categoryId: 'cat_special_achievements', title: '30-Day Streak', description: 'Kept up responsibilities for 30 days.', icon: '🔥' },
  { id: 'badge_100_chores_completed', categoryId: 'cat_special_achievements', title: '100 Chores Completed', description: 'Completed 100 chores total.', icon: '💯' },
  { id: 'badge_first_100_saved', categoryId: 'cat_special_achievements', title: 'First $100 Saved', description: 'Saved her first $100.', icon: '💵' },
  { id: 'badge_summer_champion', categoryId: 'cat_special_achievements', title: 'Summer Champion', description: 'Crushed it all summer long.', icon: '🏅' },

  // Secret Badges (hidden from the child until earned - see cat_secret_badges.secret)
  { id: 'badge_surprise_helper', categoryId: 'cat_secret_badges', title: 'Surprise Helper', description: 'Helped out in a way nobody expected.', icon: '🎁' },
  { id: 'badge_random_act_of_kindness', categoryId: 'cat_secret_badges', title: 'Random Act of Kindness', description: 'Did something kind out of the blue.', icon: '✨' },
  { id: 'badge_joy_bringer', categoryId: 'cat_secret_badges', title: 'Joy Bringer', description: 'Brought some real joy to the family.', icon: '😄' },
  { id: 'badge_dads_choice_award', categoryId: 'cat_secret_badges', title: "Dad's Choice Award", description: "Dad's personal pick for something great.", icon: '🥇' },
  { id: 'badge_above_and_beyond', categoryId: 'cat_secret_badges', title: 'Above and Beyond', description: 'Went way further than expected.', icon: '🚀' },
]

export const SEED_BADGE_AWARDS = []

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
    badgeCategories: SEED_BADGE_CATEGORIES,
    badges: SEED_BADGES,
    badgeAwards: SEED_BADGE_AWARDS,
    givingCategories: SEED_GIVING_CATEGORIES,
    savingsGoal: SEED_SAVINGS_GOAL,
    approvals: buildSeedApprovals(achievementRewardTransferId),
    ledger,
  }
}
