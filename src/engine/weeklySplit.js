import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES } from './transactionTypes.js'
import { splitCents } from './money.js'
import { transferBetweenAccounts } from './transfer.js'
import { generateBatchId } from './transaction.js'

// Splits one week's income across Spend/Save/Give and posts each portion as
// its own External -> account transfer, all tagged with a shared batchId so
// the three legs are visibly one event in the ledger. splitCents guarantees
// the three portions always add back up to totalAmount exactly.
export function runWeeklySplit({
  ledger,
  totalAmount,
  splitPercentages,
  notes = 'Weekly income split',
  approvedBy = null,
  timestamp = new Date().toISOString(),
}) {
  const [spendCents, saveCents, giveCents] = splitCents(totalAmount, [
    splitPercentages.spend,
    splitPercentages.save,
    splitPercentages.give,
  ])

  const batchId = generateBatchId()
  const destinations = [
    { account: ACCOUNTS.SPEND, amount: spendCents },
    { account: ACCOUNTS.SAVE, amount: saveCents },
    { account: ACCOUNTS.GIVE, amount: giveCents },
  ]

  let workingLedger = ledger
  const newEntries = []

  for (const destination of destinations) {
    if (destination.amount <= 0) continue // a 0% share posts no entry

    const pair = transferBetweenAccounts({
      ledger: workingLedger,
      type: TRANSACTION_TYPES.WEEKLY_INCOME,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: destination.account,
      amount: destination.amount,
      notes,
      approvedBy,
      batchId,
      timestamp,
    })
    newEntries.push(...pair)
    workingLedger = [...workingLedger, ...pair]
  }

  return newEntries
}
