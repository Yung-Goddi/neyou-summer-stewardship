import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { createTransaction } from './transaction.js'
import { calculateBalance, calculateFutureBalance } from './balance.js'
import { createFutureSnapshot } from './futureSnapshot.js'

// An Initial Balance entry establishes (or re-establishes) the official
// starting point for one of the child's ledger-summed accounts (Spend,
// Save, Give, External) - a distinct, clearly-labeled type rather than a
// generic Correction, so Recent Activity shows plainly which entries set
// up the account vs. fixed a mistake. Diffs against the account's current
// balance (like a Correction would), so it's safe to call on a brand-new
// account or to re-run later against a live one. Returns null if the
// account is already at that target - no no-op entry gets posted.
export function createInitialBalanceEntry({
  ledger,
  account,
  targetAmount,
  approvedBy = null,
  timestamp = new Date().toISOString(),
}) {
  if (targetAmount < 0) {
    throw new RangeError('Initial balance cannot be negative.')
  }

  const current = calculateBalance(ledger, account)
  const diff = targetAmount - current
  if (diff === 0) return null

  return createTransaction({
    type: TRANSACTION_TYPES.INITIAL_BALANCE,
    account,
    direction: diff > 0 ? DIRECTIONS.IN : DIRECTIONS.OUT,
    amount: Math.abs(diff),
    notes: 'Initial balance',
    approvedBy,
    timestamp,
  })
}

// Applies a full set of starting-balance targets (in cents, keyed by
// ACCOUNTS.*) across every account at once - Spend/Save/Give/External via
// createInitialBalanceEntry above, Future via a fresh statement snapshot
// (its balance is never a running sum, so "setting" it means recording a
// new snapshot). Used by both the "Initialize Child Account" setup screen
// and "Reset to Starting Balances". Skips any account whose target is
// undefined, and any account already sitting at its target.
export function buildInitialBalanceEntries({ ledger, targets, approvedBy = null, timestamp = new Date().toISOString() }) {
  const entries = []

  for (const account of [ACCOUNTS.SPEND, ACCOUNTS.SAVE, ACCOUNTS.GIVE, ACCOUNTS.EXTERNAL]) {
    if (targets[account] === undefined) continue
    const entry = createInitialBalanceEntry({ ledger, account, targetAmount: targets[account], approvedBy, timestamp })
    if (entry) entries.push(entry)
  }

  if (targets[ACCOUNTS.FUTURE] !== undefined && calculateFutureBalance(ledger) !== targets[ACCOUNTS.FUTURE]) {
    entries.push(
      createFutureSnapshot({ amount: targets[ACCOUNTS.FUTURE], notes: 'Initial balance', approvedBy, timestamp })
    )
  }

  return entries
}
