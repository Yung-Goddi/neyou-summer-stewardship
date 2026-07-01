import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from './pin.js'

describe('pin hashing', () => {
  it('produces a 64-character hex SHA-256 digest', async () => {
    const hash = await hashPin('1234')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('verifies a matching PIN and rejects a wrong one', async () => {
    const hash = await hashPin('1234')
    expect(await verifyPin('1234', hash)).toBe(true)
    expect(await verifyPin('9999', hash)).toBe(false)
  })
})
