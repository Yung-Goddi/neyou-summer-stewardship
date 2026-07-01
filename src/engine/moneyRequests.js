import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES } from './transactionTypes.js'
import { createApprovalEvent, APPROVAL_KINDS, APPROVAL_STATUSES } from './approvals.js'
import { generateId } from './id.js'

// The three money moves a child can ask for. Each maps to the ledger
// transfer it becomes once a parent approves it - see getRequestRoute.
export const REQUESTABLE_TYPES = Object.freeze([
  TRANSACTION_TYPES.SPEND,
  TRANSACTION_TYPES.SAVE_TRANSFER,
  TRANSACTION_TYPES.GIVING,
])

const REQUEST_ROUTES = Object.freeze({
  [TRANSACTION_TYPES.SPEND]: { fromAccount: ACCOUNTS.SPEND, toAccount: ACCOUNTS.EXTERNAL },
  [TRANSACTION_TYPES.SAVE_TRANSFER]: { fromAccount: ACCOUNTS.SPEND, toAccount: ACCOUNTS.SAVE },
  [TRANSACTION_TYPES.GIVING]: { fromAccount: ACCOUNTS.GIVE, toAccount: ACCOUNTS.EXTERNAL },
})

export function getRequestRoute(type) {
  const route = REQUEST_ROUTES[type]
  if (!route) throw new RangeError(`Unknown money request type: ${type}`)
  return route
}

// A child submitting a request only ever appends a 'pending' approval
// event - nothing in the ledger moves yet. A parent later approves or
// rejects it from the Approvals screen; approving is what actually calls
// transferBetweenAccounts (see ApprovalsScreen.jsx), so the same
// negative-balance protection that guards every other child-facing
// transaction still applies at that moment, not just at request time.
export function createMoneyRequest({
  type,
  amount,
  notes = '',
  category = null,
  requestedBy = null,
  timestamp = new Date().toISOString(),
}) {
  if (!REQUESTABLE_TYPES.includes(type)) {
    throw new RangeError(`Unknown money request type: ${type}`)
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new RangeError('Money requests must be a positive number of cents')
  }

  const { fromAccount, toAccount } = getRequestRoute(type)

  return createApprovalEvent({
    kind: APPROVAL_KINDS.MONEY_REQUEST,
    itemId: generateId('req'),
    status: APPROVAL_STATUSES.PENDING,
    date: timestamp.slice(0, 10),
    notes,
    approvedBy: requestedBy,
    timestamp,
    // category is only meaningful for Giving requests (who/what it's
    // going to - Church, Charity, a friend...), but there's no harm in
    // carrying it as null for the other two types.
    payload: { type, amount, fromAccount, toAccount, category },
  })
}
