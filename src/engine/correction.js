import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { createTransaction } from './transaction.js'
import { calculateBalance } from './balance.js'

// A Correction is a single new ledger entry that adjusts an account to fix
// a mistake. It never edits or removes the entry it's correcting - it just
// adds an honest new line, with a reason, that future readers can trace.
export function createCorrection({
  account,
  direction,
  amount,
  reason,
  approvedBy = null,
  timestamp = new Date().toISOString(),
}) {
  if (!reason || !reason.trim()) {
    throw new RangeError('Corrections require a reason.')
  }

  return createTransaction({
    type: TRANSACTION_TYPES.CORRECTION,
    account,
    direction,
    amount,
    notes: reason,
    approvedBy,
    timestamp,
  })
}

// A Correction that brings an account's derived balance to exactly zero.
// Returns null if the account is already at zero - there's nothing honest
// to post, and callers (the Balance Controls UI) use that to skip a no-op.
export function createResetToZeroCorrection({
  ledger,
  account,
  approvedBy = null,
  reason = 'Reset to zero by parent',
  timestamp = new Date().toISOString(),
}) {
  const current = calculateBalance(ledger, account)
  if (current === 0) return null

  return createCorrection({
    account,
    direction: current > 0 ? DIRECTIONS.OUT : DIRECTIONS.IN,
    amount: Math.abs(current),
    reason,
    approvedBy,
    timestamp,
  })
}

// A Correction that brings an account's derived balance to an exact target
// amount (in cents). Returns null if the account is already at that target.
export function createSetBalanceCorrection({
  ledger,
  account,
  targetAmount,
  approvedBy = null,
  reason = 'Manual balance adjustment',
  timestamp = new Date().toISOString(),
}) {
  if (targetAmount < 0) {
    throw new RangeError('Target balance cannot be negative.')
  }

  const current = calculateBalance(ledger, account)
  const diff = targetAmount - current
  if (diff === 0) return null

  return createCorrection({
    account,
    direction: diff > 0 ? DIRECTIONS.IN : DIRECTIONS.OUT,
    amount: Math.abs(diff),
    reason,
    approvedBy,
    timestamp,
  })
}
