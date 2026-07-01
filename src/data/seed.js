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
      itemId: 'resp_dishes',
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
      itemId: 'resp_trash',
      status: APPROVAL_STATUSES.PENDING,
      date: today,
      approvedBy: 'op_child',
      notes: 'Take out the trash',
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
    approvals: buildSeedApprovals(achievementRewardTransferId),
    ledger,
  }
}
