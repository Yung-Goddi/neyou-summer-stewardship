// Pure data + pure random-problem generators for the Money Learning
// practice modules. Nothing in this file touches React, the ledger, or
// approvals - practice is free and these functions never produce anything
// that gets saved anywhere. Amounts are always integer cents, matching the
// rest of the app's money convention even though nothing here is real
// money.

export const COINS = [
  { id: 'penny', type: 'coin', name: 'Penny', value: 1, color: '#B5651D', person: 'Abraham Lincoln' },
  { id: 'nickel', type: 'coin', name: 'Nickel', value: 5, color: '#B0B0B0', person: 'Thomas Jefferson' },
  { id: 'dime', type: 'coin', name: 'Dime', value: 10, color: '#C9C9C9', person: 'Franklin D. Roosevelt' },
  { id: 'quarter', type: 'coin', name: 'Quarter', value: 25, color: '#D9D9D9', person: 'George Washington' },
]

export const BILLS = [
  { id: 'one', type: 'bill', name: '$1 Bill', value: 100, color: '#2E7D4F', person: 'George Washington' },
  { id: 'five', type: 'bill', name: '$5 Bill', value: 500, color: '#3E8E5B', person: 'Abraham Lincoln' },
  { id: 'ten', type: 'bill', name: '$10 Bill', value: 1000, color: '#4C9E68', person: 'Alexander Hamilton' },
  { id: 'twenty', type: 'bill', name: '$20 Bill', value: 2000, color: '#5AAE75', person: 'Andrew Jackson' },
]

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRandom(array) {
  return array[randomInt(0, array.length - 1)]
}

export function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateCoinPile(pieceCount = randomInt(3, 6)) {
  const pieces = Array.from({ length: pieceCount }, () => pickRandom(COINS))
  const total = pieces.reduce((sum, coin) => sum + coin.value, 0)
  return { pieces, total }
}

export function generateBillPile(pieceCount = randomInt(2, 4)) {
  const pieces = Array.from({ length: pieceCount }, () => pickRandom(BILLS))
  const total = pieces.reduce((sum, bill) => sum + bill.value, 0)
  return { pieces, total }
}

// A shuffled list of amount choices (in cents) that always includes the
// correct answer plus plausible, distinct, never-negative distractors near
// it - for multiple-choice questions instead of free-text typing.
export function generateAmountChoices(correctCents, optionCount = 3, spreadCents = 25) {
  const options = new Set([correctCents])
  let guard = 0
  while (options.size < optionCount && guard < 100) {
    guard += 1
    const offset = randomInt(1, spreadCents) * (Math.random() < 0.5 ? -1 : 1)
    const candidate = correctCents + offset
    if (candidate > 0) options.add(candidate)
  }
  return shuffleArray([...options])
}

const MAKE_AMOUNT_TARGETS = [75, 125, 540, 35, 90, 160, 250, 1200, 375, 650]

export function randomMakeAmountTarget() {
  return pickRandom(MAKE_AMOUNT_TARGETS)
}

export const AFFORD_ITEMS = [
  { emoji: '🍦', name: 'Ice Cream', priceCents: 350 },
  { emoji: '📚', name: 'Book', priceCents: 899 },
  { emoji: '🧸', name: 'Stuffed Animal', priceCents: 1200 },
  { emoji: '🖍️', name: 'Crayons', priceCents: 250 },
  { emoji: '🚗', name: 'Toy Car', priceCents: 599 },
  { emoji: '🍬', name: 'Candy', priceCents: 150 },
  { emoji: '🎈', name: 'Balloon', priceCents: 200 },
  { emoji: '🧩', name: 'Puzzle', priceCents: 799 },
]

// Roughly half the time she has enough, half the time she's a bit short -
// both outcomes need practice.
export function generateAffordScenario() {
  const item = pickRandom(AFFORD_ITEMS)
  const haveCents =
    Math.random() < 0.5 ? item.priceCents + randomInt(0, 500) : Math.max(25, item.priceCents - randomInt(25, 300))
  return { item, haveCents, canAfford: haveCents >= item.priceCents }
}

const PAY_WITH_CENTS = [100, 500, 1000, 2000]

// Always pays with a real bill amount and always owes positive change -
// picks a price comfortably below what's paid.
export function generateChangeScenario() {
  const paidCents = pickRandom(PAY_WITH_CENTS)
  const priceCents = Math.round(randomInt(25, paidCents - 25) / 5) * 5
  const changeCents = paidCents - priceCents
  const choices = generateAmountChoices(changeCents, 3, 75)
  return { priceCents, paidCents, changeCents, choices }
}

// Hand-written, not templated - these need actual judgment, not just
// variable substitution. Each has one clearly-best answer plus a short,
// encouraging explanation shown either way (this is about thinking, not
// scoring).
export const SAVE_SPEND_GIVE_SCENARIOS = [
  {
    text: "You really want a video game that costs $40, and you only have $10 right now.",
    answer: 'save',
    explanation: 'Saving a little at a time helps you reach big goals like this one!',
  },
  {
    text: "Your friend's birthday is this weekend and you want to get them something nice.",
    answer: 'give',
    explanation: 'Giving to someone you care about is a great way to show love.',
  },
  {
    text: "You're at the store with money you already set aside for treats, and you see stickers you love.",
    answer: 'spend',
    explanation: "That's exactly what Spend money is for - enjoying it on things you want now!",
  },
  {
    text: 'You heard about a family who lost their home in a fire and has nothing.',
    answer: 'give',
    explanation: 'Helping people in hard situations is one of the best ways to give.',
  },
  {
    text: 'You want a $60 game system this summer, so every week you put a little money aside.',
    answer: 'save',
    explanation: "That's a savings goal in action - a little bit each week adds up!",
  },
  {
    text: "It's Sunday and you want to bring something to church to give.",
    answer: 'give',
    explanation: 'Giving regularly, even small amounts, is a wonderful habit.',
  },
  {
    text: "You're really hungry and want to buy a snack from the vending machine right now.",
    answer: 'spend',
    explanation: 'Small everyday wants like this are what Spend money is for.',
  },
  {
    text: 'You want to make sure you have money for something special next month, like a trip.',
    answer: 'save',
    explanation: 'Planning ahead and saving up is smart thinking!',
  },
]

export function randomScenario() {
  return pickRandom(SAVE_SPEND_GIVE_SCENARIOS)
}
