import { createTransaction, generateTransferId } from './transaction.js'
import { DIRECTIONS } from './transactionTypes.js'
import { validateTransaction } from './validation.js'

// Moves money between two accounts as one linked pair of entries (an OUT
// leg and an IN leg) sharing a transferId, so the ledger always shows both
// sides of a movement. Used for Spend, Save Transfer, Giving, Weekly
// Income, Achievement Reward, Parent Bonus, Parent Deposit and Parent
// Withdrawal - anything that isn't a Correction or a Future snapshot.
//
// Returns the two new entries; it does not mutate or append to `ledger`.
// The caller commits them with appendToLedger.
export function transferBetweenAccounts({
  ledger,
  type,
  fromAccount,
  toAccount,
  amount,
  notes = '',
  approvedBy = null,
  batchId = null,
  timestamp = new Date().toISOString(),
  transferId = generateTransferId(),
}) {
  const outEntry = createTransaction({
    type,
    account: fromAccount,
    direction: DIRECTIONS.OUT,
    amount,
    notes,
    approvedBy,
    transferId,
    batchId,
    timestamp,
  })

  const outCheck = validateTransaction(ledger, outEntry)
  if (!outCheck.valid) {
    throw new RangeError(outCheck.errors.join(' '))
  }

  const inEntry = createTransaction({
    type,
    account: toAccount,
    direction: DIRECTIONS.IN,
    amount,
    notes,
    approvedBy,
    transferId,
    batchId,
    timestamp,
  })

  return [outEntry, inEntry]
}
