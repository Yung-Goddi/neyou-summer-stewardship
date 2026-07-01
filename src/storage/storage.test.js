import { describe, it, expect, beforeEach } from 'vitest'
import { saveState, loadState, resetState, exportStateToJSON, importStateFromJSON } from './storage.js'
import { buildSeedState } from '../data/seed.js'

// Node's test environment has no localStorage global - this is a minimal
// in-memory stand-in, just enough for saveState/loadState/resetState.
function installFakeLocalStorage() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
}

beforeEach(() => {
  installFakeLocalStorage()
})

describe('export/import round-trip', () => {
  it('restores an identical ledger and settings after export then import', () => {
    const original = buildSeedState()
    const json = exportStateToJSON(original)
    const restored = importStateFromJSON(json)

    expect(restored.ledger).toEqual(original.ledger)
    expect(restored.settings).toEqual(original.settings)
    expect(restored.operators).toEqual(original.operators)
    expect(restored.version).toBe(original.version)
  })

  it('rejects a data version it does not recognize', () => {
    expect(() => importStateFromJSON(JSON.stringify({ version: 999, ledger: [] }))).toThrow(RangeError)
  })
})

describe('localStorage persistence', () => {
  it('saves and loads the same state back', () => {
    const original = buildSeedState()
    saveState(original)
    const loaded = loadState()
    expect(loaded.ledger).toEqual(original.ledger)
  })

  it('returns null when nothing has been saved', () => {
    expect(loadState()).toBeNull()
  })

  it('clears saved state on reset', () => {
    saveState(buildSeedState())
    resetState()
    expect(loadState()).toBeNull()
  })
})

// A device's localStorage is whatever it was last saved as - it never
// updates itself just because the schema grew. These tests simulate a
// save made before a new top-level field existed (exactly what happened
// with givingCategories/savingsGoal in Phase 3.1, and crashed two screens
// in production) and confirm loadState/importStateFromJSON heal it.
describe('schema migration (healing state saved before a field existed)', () => {
  it('backfills missing fields without losing the already-saved ledger/approvals/settings', () => {
    const legacyState = buildSeedState()
    delete legacyState.givingCategories
    delete legacyState.savingsGoal
    // Distinct real data, not just a copy of the seed - proves the old
    // device's own data survives, not merely that some ledger exists.
    legacyState.settings = { ...legacyState.settings, weeklyIncomeAmount: 12345 }
    legacyState.approvals = []
    saveState(legacyState)

    const defaults = buildSeedState()
    const healed = loadState(defaults)

    expect(healed.givingCategories).toEqual(defaults.givingCategories)
    expect(healed.savingsGoal).toEqual(defaults.savingsGoal)
    expect(healed.ledger).toEqual(legacyState.ledger)
    expect(healed.approvals).toEqual([])
    expect(healed.settings.weeklyIncomeAmount).toBe(12345)
  })

  it('leaves state exactly as saved when no defaults are supplied', () => {
    const legacyState = buildSeedState()
    delete legacyState.givingCategories
    saveState(legacyState)

    expect(loadState().givingCategories).toBeUndefined()
  })

  it('heals the same way on import as on load', () => {
    const legacyState = buildSeedState()
    delete legacyState.savingsGoal
    const json = JSON.stringify(legacyState)

    const defaults = buildSeedState()
    const healed = importStateFromJSON(json, defaults)

    expect(healed.savingsGoal).toEqual(defaults.savingsGoal)
    expect(healed.ledger).toEqual(legacyState.ledger)
  })
})
