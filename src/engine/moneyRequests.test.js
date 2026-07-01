import { describe, it, expect } from 'vitest'
import { createMoneyRequest, getRequestRoute } from './moneyRequests.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES } from './transactionTypes.js'
import { APPROVAL_KINDS, APPROVAL_STATUSES } from './approvals.js'

describe('createMoneyRequest', () => {
  it('creates a pending approval event, not a ledger entry', () => {
    const request = createMoneyRequest({
      type: TRANSACTION_TYPES.SPEND,
      amount: 350,
      notes: 'New book',
      requestedBy: 'op_child',
    })
    expect(request.kind).toBe(APPROVAL_KINDS.MONEY_REQUEST)
    expect(request.status).toBe(APPROVAL_STATUSES.PENDING)
    expect(request.approvedBy).toBe('op_child')
    expect(request.transferId).toBeNull()
  })

  it('routes each request type to the right from/to accounts', () => {
    expect(getRequestRoute(TRANSACTION_TYPES.SPEND)).toEqual({
      fromAccount: ACCOUNTS.SPEND,
      toAccount: ACCOUNTS.EXTERNAL,
    })
    expect(getRequestRoute(TRANSACTION_TYPES.SAVE_TRANSFER)).toEqual({
      fromAccount: ACCOUNTS.SPEND,
      toAccount: ACCOUNTS.SAVE,
    })
    expect(getRequestRoute(TRANSACTION_TYPES.GIVING)).toEqual({
      fromAccount: ACCOUNTS.GIVE,
      toAccount: ACCOUNTS.EXTERNAL,
    })
  })

  it('stores type/amount/route in payload for the parent to act on later', () => {
    const request = createMoneyRequest({ type: TRANSACTION_TYPES.GIVING, amount: 100 })
    expect(request.payload).toEqual({
      type: TRANSACTION_TYPES.GIVING,
      amount: 100,
      fromAccount: ACCOUNTS.GIVE,
      toAccount: ACCOUNTS.EXTERNAL,
    })
  })

  it('rejects an unrequestable type', () => {
    expect(() => createMoneyRequest({ type: TRANSACTION_TYPES.PARENT_BONUS, amount: 100 })).toThrow(
      RangeError
    )
  })

  it('rejects a non-positive amount', () => {
    expect(() => createMoneyRequest({ type: TRANSACTION_TYPES.SPEND, amount: 0 })).toThrow(RangeError)
    expect(() => createMoneyRequest({ type: TRANSACTION_TYPES.SPEND, amount: -50 })).toThrow(RangeError)
  })
})
