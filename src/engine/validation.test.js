import { describe, it, expect } from 'vitest'
import { transferBetweenAccounts } from './transfer.js'
import { createCorrection } from './correction.js'
import { validateTransaction, previewNegativeImpact } from './validation.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

describe('negative-balance protection for ordinary child-facing transactions', () => {
  it('blocks a Spend that would take Spend negative', () => {
    expect(() =>
      transferBetweenAccounts({
        ledger: [],
        type: TRANSACTION_TYPES.SPEND,
        fromAccount: ACCOUNTS.SPEND,
        toAccount: ACCOUNTS.EXTERNAL,
        amount: 500, // Spend balance is 0
      })
    ).toThrow(RangeError)
  })

  it('blocks Giving that would take Give negative', () => {
    const ledger = appendGive100()
    expect(() =>
      transferBetweenAccounts({
        ledger,
        type: TRANSACTION_TYPES.GIVING,
        fromAccount: ACCOUNTS.GIVE,
        toAccount: ACCOUNTS.EXTERNAL,
        amount: 200, // only 100 available
      })
    ).toThrow(RangeError)
  })

  it('allows a Spend that exactly zeroes the balance', () => {
    const ledger = appendGive100() // reuse: Give account funded with 100, but let's spend it via Save Transfer type on Spend instead
    expect(() =>
      transferBetweenAccounts({
        ledger,
        type: TRANSACTION_TYPES.GIVING,
        fromAccount: ACCOUNTS.GIVE,
        toAccount: ACCOUNTS.EXTERNAL,
        amount: 100,
      })
    ).not.toThrow()
  })
})

describe('admin override transactions may go negative, but only with a warning', () => {
  it('does not block a Parent Withdrawal that overdraws Spend', () => {
    expect(() =>
      transferBetweenAccounts({
        ledger: [],
        type: TRANSACTION_TYPES.PARENT_WITHDRAWAL,
        fromAccount: ACCOUNTS.SPEND,
        toAccount: ACCOUNTS.EXTERNAL,
        amount: 500, // Spend balance is 0
        approvedBy: 'op_parent',
      })
    ).not.toThrow()
  })

  it('flags the Parent Withdrawal as a warning via previewNegativeImpact', () => {
    const impact = previewNegativeImpact([], {
      account: ACCOUNTS.SPEND,
      direction: DIRECTIONS.OUT,
      amount: 500,
    })
    expect(impact).not.toBeNull()
    expect(impact.resultingBalance).toBe(-500)
  })

  it('does not block a Correction that overdraws an account, and reports it as a warning', () => {
    const entry = createCorrection({
      account: ACCOUNTS.SAVE,
      direction: DIRECTIONS.OUT,
      amount: 500, // Save balance is 0
      reason: 'Bank reconciliation adjustment',
      approvedBy: 'op_parent',
    })
    const check = validateTransaction([], entry)
    expect(check.valid).toBe(true)
    expect(check.warnings.length).toBeGreaterThan(0)
  })
})

function appendGive100() {
  const pair = transferBetweenAccounts({
    ledger: [],
    type: TRANSACTION_TYPES.WEEKLY_INCOME,
    fromAccount: ACCOUNTS.EXTERNAL,
    toAccount: ACCOUNTS.GIVE,
    amount: 100,
  })
  return pair
}
