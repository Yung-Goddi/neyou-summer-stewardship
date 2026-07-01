import { isValidAccount } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'
import { assertCents } from './money.js'

let sequence = 0

// Ids only need to be unique within this device's ledger, so a timestamp +
// incrementing counter + short random suffix is enough (no UUID dependency).
function generateId(prefix) {
  sequence += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${sequence}_${random}`
}

// Builds one immutable ledger entry. This is the only place entries get
// created, so every validation rule for a single entry lives here.
export function createTransaction({
  type,
  account,
  direction,
  amount,
  notes = '',
  approvedBy = null,
  transferId = null,
  batchId = null,
  timestamp = new Date().toISOString(),
}) {
  if (!Object.values(TRANSACTION_TYPES).includes(type)) {
    throw new RangeError(`Unknown transaction type: ${type}`)
  }
  if (!isValidAccount(account)) {
    throw new RangeError(`Unknown account: ${account}`)
  }
  if (!Object.values(DIRECTIONS).includes(direction)) {
    throw new RangeError(`Unknown direction: ${direction}`)
  }
  assertCents(amount, 'amount')

  // Future snapshots record a point-in-time value and are allowed to be
  // zero (e.g. a Future account that hasn't been funded yet). Every other
  // transaction type must move a real, positive amount of money.
  const zeroAllowed = type === TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT
  if (amount < 0 || (amount === 0 && !zeroAllowed)) {
    throw new RangeError('Transaction amount must be a positive number of cents')
  }

  if (type === TRANSACTION_TYPES.CORRECTION && !notes.trim()) {
    throw new RangeError('Corrections require a reason in notes')
  }

  return Object.freeze({
    id: generateId('txn'),
    type,
    account,
    direction,
    amount,
    timestamp,
    notes,
    approvedBy,
    transferId,
    batchId,
  })
}

export function generateTransferId() {
  return generateId('xfer')
}

export function generateBatchId() {
  return generateId('batch')
}
