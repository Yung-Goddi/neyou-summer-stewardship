import { describe, it, expect } from 'vitest'
import { transferBetweenAccounts } from './transfer.js'
import { ACCOUNTS } from './accounts.js'
import { TRANSACTION_TYPES, DIRECTIONS } from './transactionTypes.js'

describe('transferBetweenAccounts', () => {
  it('creates two linked entries sharing one transferId', () => {
    const [outEntry, inEntry] = transferBetweenAccounts({
      ledger: [],
      type: TRANSACTION_TYPES.PARENT_DEPOSIT,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SAVE,
      amount: 500,
      approvedBy: 'op_parent',
    })

    expect(outEntry.account).toBe(ACCOUNTS.EXTERNAL)
    expect(outEntry.direction).toBe(DIRECTIONS.OUT)
    expect(inEntry.account).toBe(ACCOUNTS.SAVE)
    expect(inEntry.direction).toBe(DIRECTIONS.IN)

    expect(outEntry.amount).toBe(500)
    expect(inEntry.amount).toBe(500)
    expect(outEntry.type).toBe(TRANSACTION_TYPES.PARENT_DEPOSIT)
    expect(inEntry.type).toBe(TRANSACTION_TYPES.PARENT_DEPOSIT)

    expect(outEntry.transferId).toBeTruthy()
    expect(outEntry.transferId).toBe(inEntry.transferId)
    expect(outEntry.id).not.toBe(inEntry.id)
  })

  it('gives each transfer its own transferId unless one is supplied', () => {
    const first = transferBetweenAccounts({
      ledger: [],
      type: TRANSACTION_TYPES.PARENT_BONUS,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SPEND,
      amount: 100,
    })
    const second = transferBetweenAccounts({
      ledger: [],
      type: TRANSACTION_TYPES.PARENT_BONUS,
      fromAccount: ACCOUNTS.EXTERNAL,
      toAccount: ACCOUNTS.SPEND,
      amount: 100,
    })
    expect(first[0].transferId).not.toBe(second[0].transferId)
  })
})
