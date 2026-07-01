// All money in this app is an integer number of cents. Never a float.
// Floats cannot represent currency exactly (0.1 + 0.2 !== 0.3), so every
// function here works on whole cents in, whole cents out.

export function assertCents(amount, label = 'amount') {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`${label} must be an integer number of cents, got ${amount}`)
  }
}

// Parses a decimal dollar string/number ("19.99", 19.9) into integer cents
// without ever routing the value through floating-point division.
export function dollarsToCents(dollars) {
  const text = String(dollars).trim()
  const negative = text.startsWith('-')
  const unsigned = negative ? text.slice(1) : text
  const [whole = '0', fraction = ''] = unsigned.split('.')
  const paddedFraction = (fraction + '00').slice(0, 2)
  const wholeCents = (parseInt(whole || '0', 10) || 0) * 100
  const fractionCents = parseInt(paddedFraction, 10) || 0
  const total = wholeCents + fractionCents
  return negative ? -total : total
}

export function centsToDollars(cents) {
  assertCents(cents)
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const remainder = String(abs % 100).padStart(2, '0')
  return `${sign}${whole}.${remainder}`
}

export function formatCents(cents) {
  assertCents(cents)
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const remainder = String(abs % 100).padStart(2, '0')
  return `${sign}$${whole.toLocaleString('en-US')}.${remainder}`
}

export function addCents(...values) {
  values.forEach((v) => assertCents(v))
  return values.reduce((sum, v) => sum + v, 0)
}

export function subtractCents(a, b) {
  assertCents(a)
  assertCents(b)
  return a - b
}

// Splits totalCents across the given integer weights so the parts always
// sum back to totalCents exactly. Uses the largest-remainder method so no
// cent is lost or invented to floating-point rounding.
export function splitCents(totalCents, weights) {
  assertCents(totalCents, 'totalCents')
  if (totalCents < 0) {
    throw new RangeError('splitCents requires a non-negative total')
  }
  const weightSum = weights.reduce((sum, w) => sum + w, 0)
  if (weightSum <= 0) {
    throw new RangeError('splitCents requires weights that sum to more than zero')
  }

  const rawShares = weights.map((w) => (totalCents * w) / weightSum)
  const flooredShares = rawShares.map(Math.floor)
  let centsRemaining = totalCents - flooredShares.reduce((sum, v) => sum + v, 0)

  const byLargestRemainder = rawShares
    .map((raw, index) => ({ index, remainder: raw - Math.floor(raw) }))
    .sort((a, b) => b.remainder - a.remainder)

  const shares = [...flooredShares]
  for (let i = 0; i < byLargestRemainder.length && centsRemaining > 0; i++) {
    shares[byLargestRemainder[i].index] += 1
    centsRemaining -= 1
  }

  return shares
}
