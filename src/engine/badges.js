// Badges are a non-monetary recognition board, separate from the
// cash-reward Achievements pipeline (see approvals.js/transfer.js) - no
// ledger entries, no approvals log. Awards are simply "the current state of
// what's been given," so unlike the append-only ledger/approvals logs, this
// is a full-replace array: one record per badgeId, upserted or removed in
// place. That keeps it easy for a parent to change their mind (bump a level
// up, or clear an award entirely) without needing an undo mechanism.

export const BADGE_LEVELS = Object.freeze({
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
})

export const BADGE_LEVEL_ORDER = Object.freeze([BADGE_LEVELS.BRONZE, BADGE_LEVELS.SILVER, BADGE_LEVELS.GOLD])

export function isValidBadgeLevel(level) {
  return Object.values(BADGE_LEVELS).includes(level)
}

// Upserts (or removes) the one award record for a given badge.
//   - Passing a valid level replaces any existing record for that badgeId.
//   - Passing a falsy level (null/''/undefined) removes the record - this
//     is how a parent un-awards a badge.
export function setBadgeAward(awards, { badgeId, level, awardedBy = null, notes = '', timestamp = new Date().toISOString() }) {
  if (!badgeId) {
    throw new RangeError('Badge awards require a badgeId.')
  }

  const withoutExisting = awards.filter((award) => award.badgeId !== badgeId)

  if (!level) return withoutExisting

  if (!isValidBadgeLevel(level)) {
    throw new RangeError(`Unknown badge level: ${level}`)
  }

  return [...withoutExisting, Object.freeze({ badgeId, level, awardedBy, notes, timestamp })]
}

export function getBadgeAward(awards, badgeId) {
  return awards.find((award) => award.badgeId === badgeId) ?? null
}

export function hasEarnedBadge(awards, badgeId) {
  return getBadgeAward(awards, badgeId) !== null
}
