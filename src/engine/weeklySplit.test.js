import { describe, it, expect } from 'vitest'
import { runWeeklySplit } from './weeklySplit.js'
import { calculateBalance } from './balance.js'
import { ACCOUNTS } from './accounts.js'
import { appendToLedger } from './ledger.js'

describe('runWeeklySplit', () => {
  it('sums exactly to the total on an evenly divisible split', () => {
    const entries = runWeeklySplit({
      ledger: [],
      totalAmount: 1000,
      splitPercentages: { spend: 60, save: 30, give: 10 },
    })
    const ledger = appendToLedger([], entries)

    const total =
      calculateBalance(ledger, ACCOUNTS.SPEND) +
      calculateBalance(ledger, ACCOUNTS.SAVE) +
      calculateBalance(ledger, ACCOUNTS.GIVE)
    expect(total).toBe(1000)
    expect(calculateBalance(ledger, ACCOUNTS.SPEND)).toBe(600)
    expect(calculateBalance(ledger, ACCOUNTS.SAVE)).toBe(300)
    expect(calculateBalance(ledger, ACCOUNTS.GIVE)).toBe(100)
  })

  it('sums exactly to the total even when the split does not divide evenly', () => {
    const entries = runWeeklySplit({
      ledger: [],
      totalAmount: 333, // $3.33 split three ways
      splitPercentages: { spend: 1, save: 1, give: 1 },
    })
    const ledger = appendToLedger([], entries)

    const total =
      calculateBalance(ledger, ACCOUNTS.SPEND) +
      calculateBalance(ledger, ACCOUNTS.SAVE) +
      calculateBalance(ledger, ACCOUNTS.GIVE)
    expect(total).toBe(333)
  })

  it('tags every leg of the split with the same batchId', () => {
    const entries = runWeeklySplit({
      ledger: [],
      totalAmount: 1000,
      splitPercentages: { spend: 60, save: 30, give: 10 },
    })
    const batchIds = new Set(entries.map((e) => e.batchId))
    expect(batchIds.size).toBe(1)
    expect(entries).toHaveLength(6) // 3 destinations x (out + in) leg each
  })

  it('posts no entry for a 0% share', () => {
    const entries = runWeeklySplit({
      ledger: [],
      totalAmount: 1000,
      splitPercentages: { spend: 100, save: 0, give: 0 },
    })
    expect(entries.every((e) => e.account !== ACCOUNTS.SAVE && e.account !== ACCOUNTS.GIVE)).toBe(true)
  })
})
