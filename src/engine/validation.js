import { HOME_ACCOUNTS } from './accounts.js'
import { BALANCE_ENFORCED_TYPES, TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { calculateBalance } from './balance.js'

// Checks a single candidate entry against the ledger as it stands *before*
// that entry is appended. Returns { valid, errors } instead of throwing so
// callers (like a UI form) can show a message instead of catching an
// exception.
export function validateTransaction(ledger, entry) {
  const errors = []

  if (entry.type === TRANSACTION_TYPES.CORRECTION && !entry.notes?.trim()) {
    errors.push('Corrections require a reason.')
  }

  const mustStayNonNegative =
    entry.direction === DIRECTIONS.OUT &&
    HOME_ACCOUNTS.includes(entry.account) &&
    BALANCE_ENFORCED_TYPES.includes(entry.type)

  if (mustStayNonNegative) {
    const currentBalance = calculateBalance(ledger, entry.account)
    if (currentBalance - entry.amount < 0) {
      errors.push(
        `This would take ${entry.account} below zero (balance is ${currentBalance} cents, ` +
          `transaction is ${entry.amount} cents).`
      )
    }
  }

  return { valid: errors.length === 0, errors }
}
