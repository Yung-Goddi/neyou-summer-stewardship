export const ACCOUNTS = Object.freeze({
  SPEND: 'spend',
  SAVE: 'save',
  GIVE: 'give',
  FUTURE: 'future',
  EXTERNAL: 'external',
})

// The three accounts a child actively manages day to day.
// Future is tracked separately (see balance.js); External is the outside
// world (stores, charities, parents' wallets) money moves to and from.
export const HOME_ACCOUNTS = Object.freeze([ACCOUNTS.SPEND, ACCOUNTS.SAVE, ACCOUNTS.GIVE])

export function isValidAccount(account) {
  return Object.values(ACCOUNTS).includes(account)
}
