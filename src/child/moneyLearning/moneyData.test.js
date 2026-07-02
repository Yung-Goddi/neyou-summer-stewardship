import { describe, it, expect } from 'vitest'
import {
  COINS,
  BILLS,
  generateCoinPile,
  generateBillPile,
  generateAmountChoices,
  randomMakeAmountTarget,
  generateAffordScenario,
  generateChangeScenario,
  randomScenario,
  SAVE_SPEND_GIVE_SCENARIOS,
} from './moneyData.js'

describe('generateCoinPile', () => {
  it('returns a total equal to the sum of its pieces, every time', () => {
    for (let i = 0; i < 50; i++) {
      const { pieces, total } = generateCoinPile()
      expect(total).toBe(pieces.reduce((sum, coin) => sum + coin.value, 0))
      expect(total).toBeGreaterThan(0)
    }
  })

  it('only uses real coin denominations', () => {
    const { pieces } = generateCoinPile(20)
    pieces.forEach((coin) => expect(COINS).toContain(coin))
  })

  it('respects a requested piece count', () => {
    expect(generateCoinPile(5).pieces).toHaveLength(5)
  })
})

describe('generateBillPile', () => {
  it('returns a total equal to the sum of its pieces, every time', () => {
    for (let i = 0; i < 50; i++) {
      const { pieces, total } = generateBillPile()
      expect(total).toBe(pieces.reduce((sum, bill) => sum + bill.value, 0))
    }
  })

  it('only uses real bill denominations', () => {
    const { pieces } = generateBillPile(20)
    pieces.forEach((bill) => expect(BILLS).toContain(bill))
  })
})

describe('generateAmountChoices', () => {
  it('always includes the correct answer', () => {
    for (let i = 0; i < 50; i++) {
      const choices = generateAmountChoices(275)
      expect(choices).toContain(275)
    }
  })

  it('never produces a negative or zero choice', () => {
    for (let i = 0; i < 50; i++) {
      const choices = generateAmountChoices(10, 3, 25)
      choices.forEach((c) => expect(c).toBeGreaterThan(0))
    }
  })

  it('produces unique choices', () => {
    const choices = generateAmountChoices(500, 4, 50)
    expect(new Set(choices).size).toBe(choices.length)
  })
})

describe('randomMakeAmountTarget', () => {
  it('always returns a positive integer number of cents', () => {
    for (let i = 0; i < 20; i++) {
      const target = randomMakeAmountTarget()
      expect(Number.isInteger(target)).toBe(true)
      expect(target).toBeGreaterThan(0)
    }
  })
})

describe('generateAffordScenario', () => {
  it('agrees with itself about whether the item is affordable', () => {
    for (let i = 0; i < 50; i++) {
      const { item, haveCents, canAfford } = generateAffordScenario()
      expect(canAfford).toBe(haveCents >= item.priceCents)
    }
  })
})

describe('generateChangeScenario', () => {
  it('always pays with more than the price, so change is always positive', () => {
    for (let i = 0; i < 50; i++) {
      const { priceCents, paidCents, changeCents } = generateChangeScenario()
      expect(paidCents).toBeGreaterThan(priceCents)
      expect(changeCents).toBe(paidCents - priceCents)
      expect(changeCents).toBeGreaterThan(0)
    }
  })

  it('includes the correct change amount among the choices', () => {
    const { changeCents, choices } = generateChangeScenario()
    expect(choices).toContain(changeCents)
  })
})

describe('randomScenario', () => {
  it('always returns one of the curated Save/Spend/Give scenarios', () => {
    for (let i = 0; i < 20; i++) {
      expect(SAVE_SPEND_GIVE_SCENARIOS).toContain(randomScenario())
    }
  })

  it('every scenario has a valid answer bucket', () => {
    SAVE_SPEND_GIVE_SCENARIOS.forEach((scenario) => {
      expect(['save', 'spend', 'give']).toContain(scenario.answer)
      expect(scenario.text.length).toBeGreaterThan(0)
      expect(scenario.explanation.length).toBeGreaterThan(0)
    })
  })
})
