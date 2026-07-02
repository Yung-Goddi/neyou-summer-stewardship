import { describe, it, expect } from 'vitest'
import { createInitialBalanceEntry, buildInitialBalanceEntries } from './initialBalance.js'
import { createFutureSnapshot } from './futureSnapshot.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

describe('createInitialBalanceEntry', () => {
  it('posts an IN entry bringing a zero-balance account up to the target', () => {
    const entry = createInitialBalanceEntry({ ledger: [], account: ACCOUNTS.SPEND, targetAmount: 400, approvedBy: 'op_dad' })
    expect(entry.type).toBe(TRANSACTION_TYPES.INITIAL_BALANCE)
    expect(entry.direction).toBe(DIRECTIONS.IN)
    expect(entry.amount).toBe(400)
    expect(entry.account).toBe(ACCOUNTS.SPEND)
  })

  it('posts an OUT entry when re-initializing a live account down to a lower target', () => {
    const ledger = [createInitialBalanceEntry({ ledger: [], account: ACCOUNTS.SPEND, targetAmount: 1150, approvedBy: 'op_dad' })]
    const entry = createInitialBalanceEntry({ ledger, account: ACCOUNTS.SPEND, targetAmount: 400, approvedBy: 'op_dad' })
    expect(entry.direction).toBe(DIRECTIONS.OUT)
    expect(entry.amount).toBe(750)
  })

  it('returns null when already at the target', () => {
    const entry = createInitialBalanceEntry({ ledger: [], account: ACCOUNTS.SPEND, targetAmount: 0, approvedBy: 'op_dad' })
    expect(entry).toBeNull()
  })

  it('rejects a negative target', () => {
    expect(() =>
      createInitialBalanceEntry({ ledger: [], account: ACCOUNTS.SPEND, targetAmount: -1, approvedBy: 'op_dad' })
    ).toThrow(RangeError)
  })
})

describe('buildInitialBalanceEntries', () => {
  it('posts one entry per non-zero target on a fresh ledger, skipping zero targets', () => {
    const entries = buildInitialBalanceEntries({
      ledger: [],
      targets: { [ACCOUNTS.SPEND]: 400, [ACCOUNTS.SAVE]: 400, [ACCOUNTS.GIVE]: 200, [ACCOUNTS.FUTURE]: 0, [ACCOUNTS.EXTERNAL]: 0 },
      approvedBy: 'op_dad',
    })
    expect(entries).toHaveLength(3)
    expect(entries.map((e) => e.account).sort()).toEqual([ACCOUNTS.GIVE, ACCOUNTS.SAVE, ACCOUNTS.SPEND].sort())
  })

  it('skips accounts whose target is undefined', () => {
    const entries = buildInitialBalanceEntries({
      ledger: [],
      targets: { [ACCOUNTS.SPEND]: 500 },
      approvedBy: 'op_dad',
    })
    expect(entries).toHaveLength(1)
    expect(entries[0].account).toBe(ACCOUNTS.SPEND)
  })

  it('posts a Future snapshot only when the target differs from the latest snapshot', () => {
    const withSnapshot = [createFutureSnapshot({ amount: 79603, approvedBy: 'op_dad' })]

    const noChange = buildInitialBalanceEntries({ ledger: withSnapshot, targets: { [ACCOUNTS.FUTURE]: 79603 }, approvedBy: 'op_dad' })
    expect(noChange).toHaveLength(0)

    const changed = buildInitialBalanceEntries({ ledger: withSnapshot, targets: { [ACCOUNTS.FUTURE]: 0 }, approvedBy: 'op_dad' })
    expect(changed).toHaveLength(1)
    expect(changed[0].type).toBe(TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT)
    expect(changed[0].amount).toBe(0)
  })
})
