import { describe, it, expect } from 'vitest'
import { createCorrection } from './correction.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

describe('createCorrection', () => {
  it('requires a non-empty reason', () => {
    expect(() =>
      createCorrection({
        account: ACCOUNTS.SPEND,
        direction: DIRECTIONS.IN,
        amount: 100,
        reason: '',
      })
    ).toThrow(RangeError)

    expect(() =>
      createCorrection({
        account: ACCOUNTS.SPEND,
        direction: DIRECTIONS.IN,
        amount: 100,
        reason: '   ',
      })
    ).toThrow(RangeError)
  })

  it('creates a correction entry when a reason is given', () => {
    const entry = createCorrection({
      account: ACCOUNTS.SPEND,
      direction: DIRECTIONS.IN,
      amount: 100,
      reason: 'Store refunded the wrong charge',
      approvedBy: 'op_parent',
    })
    expect(entry.type).toBe(TRANSACTION_TYPES.CORRECTION)
    expect(entry.notes).toBe('Store refunded the wrong charge')
    expect(entry.amount).toBe(100)
  })
})
