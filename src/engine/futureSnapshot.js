import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { createTransaction } from './transaction.js'

// Records the real-world statement value of the Future account at a point
// in time. It is not a transfer - nothing else in the ledger changes - it's
// a snapshot observation. calculateBalance(ledger, ACCOUNTS.FUTURE) always
// reports the most recent one of these.
export function createFutureSnapshot({
  amount,
  notes = '',
  approvedBy = null,
  timestamp = new Date().toISOString(),
}) {
  return createTransaction({
    type: TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT,
    account: ACCOUNTS.FUTURE,
    direction: DIRECTIONS.IN,
    amount,
    notes,
    approvedBy,
    timestamp,
  })
}
