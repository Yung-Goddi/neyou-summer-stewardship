import { TRANSACTION_TYPES } from './transactionTypes.js'
import { createTransaction } from './transaction.js'

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
