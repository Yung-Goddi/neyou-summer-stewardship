import { HOME_ACCOUNTS } from './accounts.js'
import { BALANCE_ENFORCED_TYPES, TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { calculateBalance } from './balance.js'

// Computes what an OUT-direction entry against a Spend/Save/Give account
// would do to that account's balance, without applying it anywhere.
// Returns null if the entry doesn't touch a home account's OUT leg, or if
// the resulting balance would stay non-negative - i.e. null means "nothing
// to warn about here."
export function previewNegativeImpact(ledger, { account, direction, amount }) {
  if (direction !== DIRECTIONS.OUT || !HOME_ACCOUNTS.includes(account)) {
    return null
  }
  const currentBalance = calculateBalance(ledger, account)
  const resultingBalance = currentBalance - amount
  if (resultingBalance >= 0) return null
  return { account, currentBalance, amount, resultingBalance }
}

// Checks a single candidate entry against the ledger as it stands *before*
// that entry is appended. Returns { valid, errors, warnings } instead of
// throwing so callers (like a UI form) can decide how to react:
//   - errors: this entry must not be committed as-is (child-facing Spend,
//     Save Transfer, Giving, Weekly Income, Achievement Reward and Parent
//     Bonus can never take Spend/Save/Give negative).
//   - warnings: the entry is allowed to go through, but a human should
//     confirm it first. This is only for Parent Withdrawal and Correction -
//     administrative overrides a parent is trusted to make deliberately.
export function validateTransaction(ledger, entry) {
  const errors = []
  const warnings = []

  if (entry.type === TRANSACTION_TYPES.CORRECTION && !entry.notes?.trim()) {
    errors.push('Corrections require a reason.')
  }

  const impact = previewNegativeImpact(ledger, entry)
  if (impact) {
    const description =
      `This takes ${impact.account} from ${impact.currentBalance} cents to ` +
      `${impact.resultingBalance} cents.`
    if (BALANCE_ENFORCED_TYPES.includes(entry.type)) {
      errors.push(`This would take ${impact.account} below zero. ${description}`)
    } else {
      warnings.push(`${description} Confirm this is an intentional admin override.`)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
