import { ACCOUNTS } from '../engine/accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from '../engine/transactionTypes.js'
import { runWeeklySplit } from '../engine/weeklySplit.js'
import { transferBetweenAccounts } from '../engine/transfer.js'
import { createCorrection } from '../engine/correction.js'
import { createFutureSnapshot } from '../engine/futureSnapshot.js'
import { CURRENT_VERSION } from '../storage/storage.js'

export const SEED_SETTINGS = {
  currency: 'USD',
  summerStart: '2026-06-01',
  summerEnd: '2026-08-15',
  splitPercentages: { spend: 60, save: 30, give: 10 },
  weeklyIncomeAmount: 1000, // $10.00, in cents
}

export const SEED_OPERATORS = [
  { id: 'op_parent', name: 'Mom', role: 'parent' },
  { id: 'op_child', name: 'Neyou', role: 'child' },
]

export const SEED_RESPONSIBILITIES = [
  { id: 'resp_dishes', title: 'Dishes after dinner', frequency: 'daily' },
  { id: 'resp_room', title: 'Make bed & tidy room', frequency: 'daily' },
  { id: 'resp_trash', title: 'Take out the trash', frequency: 'weekly' },
]

export const SEED_ACHIEVEMENTS = [
  { id: 'ach_first_save', title: 'First $2.00 saved', rewardCents: 200 },
  { id: 'ach_full_week', title: 'Full week of responsibilities done', rewardCents: 300 },
]

// Builds a small, believable stretch of ledger history by calling the real
// engine functions (not hand-authored entries), so importing this seed also
// proves the engine accepts its own output end to end.
export function buildSeedLedger() {
  let ledger = []
  const commit = (entries) => {
    ledger = [...ledger, ...(Array.isArray(entries) ? entries : [entries])]
  }

  commit(
    runWeeklySplit({
      ledger,
      totalAmount: SEED_SETTINGS.weeklyIncomeAmount,
      splitPercentages: SEED_SETTINGS.splitPercentages,
      approvedBy: 'op_parent',
      notes: 'Week 1 weekly income split',
      timestamp: '2026-06-01T09:00:00.000Z',
    })
  )

  commit(
    transferBetweenAccounts({
      ledger,
      type: TRANSACTION_TYPES.ACHIEVEMENT_REWARD,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SPEND,
      amount: 200,
      approvedBy: 'op_parent',
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
      approvedBy: 'op_parent',
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
      approvedBy: 'op_parent',
      notes: 'Birthday gift from Grandma',
      timestamp: '2026-06-10T12:00:00.000Z',
    })
  )

  commit(
    runWeeklySplit({
      ledger,
      totalAmount: SEED_SETTINGS.weeklyIncomeAmount,
      splitPercentages: SEED_SETTINGS.splitPercentages,
      approvedBy: 'op_parent',
      notes: 'Week 2 weekly income split',
      timestamp: '2026-06-08T09:00:00.000Z',
    })
  )

  commit(
    createFutureSnapshot({
      amount: 500000, // $5,000.00 custodial account statement balance
      notes: 'Custodial account statement balance, June 2026',
      approvedBy: 'op_parent',
      timestamp: '2026-06-15T00:00:00.000Z',
    })
  )

  return ledger
}

export function buildSeedState() {
  return {
    version: CURRENT_VERSION,
    settings: SEED_SETTINGS,
    operators: SEED_OPERATORS,
    responsibilities: SEED_RESPONSIBILITIES,
    achievements: SEED_ACHIEVEMENTS,
    ledger: buildSeedLedger(),
  }
}
