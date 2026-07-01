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
