import { describe, it, expect } from 'vitest'
import { dollarsToCents, centsToDollars, formatCents, splitCents, assertCents } from './money.js'

describe('integer cents math', () => {
  it('converts dollar strings to whole cents without float drift', () => {
    expect(dollarsToCents('19.99')).toBe(1999)
    expect(dollarsToCents('0.1')).toBe(10)
    expect(dollarsToCents('0.2')).toBe(20)
    expect(dollarsToCents('0.1') + dollarsToCents('0.2')).toBe(30) // the classic float trap, avoided
    expect(dollarsToCents('10')).toBe(1000)
    expect(dollarsToCents('-5.50')).toBe(-550)
  })

  it('round-trips cents back to a dollar string', () => {
    expect(centsToDollars(1999)).toBe('19.99')
    expect(centsToDollars(5)).toBe('0.05')
    expect(centsToDollars(-550)).toBe('-5.50')
  })

  it('formats cents as a currency string', () => {
    expect(formatCents(150000)).toBe('$1,500.00')
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(-25)).toBe('-$0.25')
  })

  it('rejects non-integer amounts everywhere', () => {
    expect(() => assertCents(19.99)).toThrow(TypeError)
    expect(() => centsToDollars(19.99)).toThrow(TypeError)
    expect(() => formatCents(1.5)).toThrow(TypeError)
  })
})

describe('splitCents', () => {
  it('splits evenly divisible totals exactly', () => {
    expect(splitCents(1000, [60, 30, 10])).toEqual([600, 300, 100])
  })

  it('never loses or invents a cent on totals that do not divide evenly', () => {
    const shares = splitCents(1000, [1, 1, 1]) // $10.00 / 3
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000)
    expect(shares).toEqual([334, 333, 333]) // largest-remainder method
  })

  it('handles a zero-weight share by giving it nothing', () => {
    expect(splitCents(1000, [100, 0])).toEqual([1000, 0])
  })

  it('rejects a negative total', () => {
    expect(() => splitCents(-100, [1, 1])).toThrow(RangeError)
  })
})
