import { describe, it, expect } from 'vitest'
import { setBadgeAward, getBadgeAward, hasEarnedBadge, isValidBadgeLevel, BADGE_LEVELS } from './badges.js'

describe('isValidBadgeLevel', () => {
  it('accepts bronze/silver/gold and rejects anything else', () => {
    expect(isValidBadgeLevel(BADGE_LEVELS.BRONZE)).toBe(true)
    expect(isValidBadgeLevel(BADGE_LEVELS.SILVER)).toBe(true)
    expect(isValidBadgeLevel(BADGE_LEVELS.GOLD)).toBe(true)
    expect(isValidBadgeLevel('platinum')).toBe(false)
    expect(isValidBadgeLevel(undefined)).toBe(false)
  })
})

describe('setBadgeAward', () => {
  it('requires a badgeId', () => {
    expect(() => setBadgeAward([], { level: BADGE_LEVELS.GOLD })).toThrow(RangeError)
  })

  it('rejects an unknown level', () => {
    expect(() => setBadgeAward([], { badgeId: 'badge_x', level: 'platinum' })).toThrow(RangeError)
  })

  it('adds a new award when none exists for that badge', () => {
    const awards = setBadgeAward([], { badgeId: 'badge_x', level: BADGE_LEVELS.BRONZE, awardedBy: 'op_dad' })
    expect(awards).toHaveLength(1)
    expect(awards[0]).toMatchObject({ badgeId: 'badge_x', level: BADGE_LEVELS.BRONZE, awardedBy: 'op_dad' })
  })

  it('replaces (upserts) an existing award for the same badge rather than duplicating it', () => {
    const first = setBadgeAward([], { badgeId: 'badge_x', level: BADGE_LEVELS.BRONZE })
    const second = setBadgeAward(first, { badgeId: 'badge_x', level: BADGE_LEVELS.GOLD })
    expect(second).toHaveLength(1)
    expect(second[0].level).toBe(BADGE_LEVELS.GOLD)
  })

  it('leaves other badges untouched when upserting one', () => {
    const withTwo = [
      ...setBadgeAward([], { badgeId: 'badge_a', level: BADGE_LEVELS.SILVER }),
      ...setBadgeAward([], { badgeId: 'badge_b', level: BADGE_LEVELS.GOLD }),
    ]
    const updated = setBadgeAward(withTwo, { badgeId: 'badge_a', level: BADGE_LEVELS.GOLD })
    expect(updated).toHaveLength(2)
    expect(getBadgeAward(updated, 'badge_a').level).toBe(BADGE_LEVELS.GOLD)
    expect(getBadgeAward(updated, 'badge_b').level).toBe(BADGE_LEVELS.GOLD)
  })

  it('removes the award when level is falsy (un-award)', () => {
    const awarded = setBadgeAward([], { badgeId: 'badge_x', level: BADGE_LEVELS.SILVER })
    const cleared = setBadgeAward(awarded, { badgeId: 'badge_x', level: null })
    expect(cleared).toHaveLength(0)
  })
})

describe('getBadgeAward / hasEarnedBadge', () => {
  it('returns null/false on an empty awards array', () => {
    expect(getBadgeAward([], 'badge_x')).toBeNull()
    expect(hasEarnedBadge([], 'badge_x')).toBe(false)
  })

  it('finds the award for a populated array', () => {
    const awards = setBadgeAward([], { badgeId: 'badge_x', level: BADGE_LEVELS.GOLD })
    expect(hasEarnedBadge(awards, 'badge_x')).toBe(true)
    expect(hasEarnedBadge(awards, 'badge_y')).toBe(false)
    expect(getBadgeAward(awards, 'badge_x')?.level).toBe(BADGE_LEVELS.GOLD)
  })
})
