export const TRANSACTION_TYPES = Object.freeze({
  WEEKLY_INCOME: 'weekly_income',
  ACHIEVEMENT_REWARD: 'achievement_reward',
  PARENT_BONUS: 'parent_bonus',
  SPEND: 'spend',
  SAVE_TRANSFER: 'save_transfer',
  GIVING: 'giving',
  PARENT_DEPOSIT: 'parent_deposit',
  PARENT_WITHDRAWAL: 'parent_withdrawal',
  CORRECTION: 'correction',
  FUTURE_ACCOUNT_SNAPSHOT: 'future_account_snapshot',
})

export const DIRECTIONS = Object.freeze({ IN: 'in', OUT: 'out' })

// Ordinary money movements: their OUT leg must never push a Spend/Save/Give
// balance below zero (see validation.js).
export const BALANCE_ENFORCED_TYPES = Object.freeze([
  TRANSACTION_TYPES.WEEKLY_INCOME,
  TRANSACTION_TYPES.ACHIEVEMENT_REWARD,
  TRANSACTION_TYPES.PARENT_BONUS,
  TRANSACTION_TYPES.SPEND,
  TRANSACTION_TYPES.SAVE_TRANSFER,
  TRANSACTION_TYPES.GIVING,
])

// Administrative/override types exempt from the negative-balance check:
// a parent correcting a mistake or withdrawing funds is trusted to do so
// even if it draws an account down further, and a Future snapshot doesn't
// touch Spend/Save/Give at all.
export const VALIDATION_EXEMPT_TYPES = Object.freeze([
  TRANSACTION_TYPES.CORRECTION,
  TRANSACTION_TYPES.PARENT_DEPOSIT,
  TRANSACTION_TYPES.PARENT_WITHDRAWAL,
  TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT,
])
