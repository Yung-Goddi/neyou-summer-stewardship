import { describe, it, expect } from 'vitest'
import { createFutureSnapshot } from './futureSnapshot.js'
import { calculateBalance } from './balance.js'
import { ACCOUNTS } from './accounts.js'

describe('Future account balance', () => {
  it('is zero with no snapshots', () => {
    expect(calculateBalance([], ACCOUNTS.FUTURE)).toBe(0)
  })

  it('reports the most recent snapshot by timestamp, not the last one appended', () => {
    const older = createFutureSnapshot({ amount: 400000, timestamp: '2026-06-01T00:00:00.000Z' })
    const newer = createFutureSnapshot({ amount: 500000, timestamp: '2026-06-15T00:00:00.000Z' })

    // Appended out of chronological order on purpose - the ledger is just a
    // bag of entries, order in the array must not matter.
    const ledger = [newer, older]
    expect(calculateBalance(ledger, ACCOUNTS.FUTURE)).toBe(500000)
  })

  it('does not sum snapshots together', () => {
    const first = createFutureSnapshot({ amount: 100000, timestamp: '2026-06-01T00:00:00.000Z' })
    const second = createFutureSnapshot({ amount: 150000, timestamp: '2026-07-01T00:00:00.000Z' })
    const ledger = [first, second]
    expect(calculateBalance(ledger, ACCOUNTS.FUTURE)).toBe(150000) // not 250000
  })
})
