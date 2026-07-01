import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

// Balances are never stored - they are always derived from the ledger.
// Spend/Save/Give/External are running sums of every entry posted against
// them. Future is different: it isn't money the app moves, it's a real
// outside account (529, brokerage, etc.) that a parent periodically reports
// a statement value for, so its "balance" is simply the most recent
// snapshot rather than a sum of transfers.
export function calculateBalance(ledger, account) {
  if (account === ACCOUNTS.FUTURE) {
    return calculateFutureBalance(ledger)
  }
  return ledger
    .filter((entry) => entry.account === account)
    .reduce((balance, entry) => {
      return entry.direction === DIRECTIONS.IN ? balance + entry.amount : balance - entry.amount
    }, 0)
}

export function calculateFutureBalance(ledger) {
  const snapshots = ledger
    .filter(
      (entry) =>
        entry.account === ACCOUNTS.FUTURE && entry.type === TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT
    )
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  if (snapshots.length === 0) return 0
  return snapshots[snapshots.length - 1].amount
}

export function calculateAllBalances(ledger) {
  return {
    [ACCOUNTS.SPEND]: calculateBalance(ledger, ACCOUNTS.SPEND),
    [ACCOUNTS.SAVE]: calculateBalance(ledger, ACCOUNTS.SAVE),
    [ACCOUNTS.GIVE]: calculateBalance(ledger, ACCOUNTS.GIVE),
    [ACCOUNTS.FUTURE]: calculateBalance(ledger, ACCOUNTS.FUTURE),
    [ACCOUNTS.EXTERNAL]: calculateBalance(ledger, ACCOUNTS.EXTERNAL),
  }
}
