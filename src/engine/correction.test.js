import { describe, it, expect } from 'vitest'
import { createCorrection, createResetToZeroCorrection, createSetBalanceCorrection } from './correction.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

function ledgerWithSpendBalance(amount) {
  return [
    {
      id: 'led_1',
      type: TRANSACTION_TYPES.PARENT_DEPOSIT,
      account: ACCOUNTS.SPEND,
      direction: DIRECTIONS.IN,
      amount,
      notes: '',
      approvedBy: 'op_dad',
      timestamp: '2026-06-01T00:00:00.000Z',
    },
  ]
}

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

describe('createResetToZeroCorrection', () => {
  it('returns a correction that zeroes out a positive balance', () => {
    const ledger = ledgerWithSpendBalance(500)
    const entry = createResetToZeroCorrection({ ledger, account: ACCOUNTS.SPEND, approvedBy: 'op_dad' })
    expect(entry.direction).toBe(DIRECTIONS.OUT)
    expect(entry.amount).toBe(500)
    expect(entry.account).toBe(ACCOUNTS.SPEND)
  })

  it('returns null when the account is already at zero', () => {
    const entry = createResetToZeroCorrection({ ledger: [], account: ACCOUNTS.SPEND, approvedBy: 'op_dad' })
    expect(entry).toBeNull()
  })
})

describe('createSetBalanceCorrection', () => {
  it('computes an IN correction when the target is above the current balance', () => {
    const ledger = ledgerWithSpendBalance(200)
    const entry = createSetBalanceCorrection({
      ledger,
      account: ACCOUNTS.SPEND,
      targetAmount: 500,
      approvedBy: 'op_dad',
    })
    expect(entry.direction).toBe(DIRECTIONS.IN)
    expect(entry.amount).toBe(300)
  })

  it('computes an OUT correction when the target is below the current balance', () => {
    const ledger = ledgerWithSpendBalance(500)
    const entry = createSetBalanceCorrection({
      ledger,
      account: ACCOUNTS.SPEND,
      targetAmount: 200,
      approvedBy: 'op_dad',
    })
    expect(entry.direction).toBe(DIRECTIONS.OUT)
    expect(entry.amount).toBe(300)
  })

  it('returns null when already at the target', () => {
    const ledger = ledgerWithSpendBalance(500)
    const entry = createSetBalanceCorrection({
      ledger,
      account: ACCOUNTS.SPEND,
      targetAmount: 500,
      approvedBy: 'op_dad',
    })
    expect(entry).toBeNull()
  })

  it('rejects a negative target', () => {
    expect(() =>
      createSetBalanceCorrection({ ledger: [], account: ACCOUNTS.SPEND, targetAmount: -100, approvedBy: 'op_dad' })
    ).toThrow(RangeError)
  })
})
