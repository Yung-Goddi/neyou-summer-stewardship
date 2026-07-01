// Complete persistence layer. Everything the app knows lives in one root
// object under one localStorage key - there is no scattering of related
// data across multiple keys to keep in sync.

const STORAGE_KEY = 'neyou-stewardship:v1'
export const CURRENT_VERSION = 1

// loadState/importStateFromJSON both accept an optional `defaults` object -
// the caller's idea of what a brand-new install's state looks like (see
// AppShell.jsx, which passes buildSeedState()). This is deliberately
// dependency-injected rather than storage.js importing the seed itself:
// storage.js stays a generic "read/write one JSON blob" layer with no
// opinion on what the app's fields actually are, and there's no import
// cycle to worry about (seed.js already imports CURRENT_VERSION from here).
export function loadState(defaults) {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return migrateState(JSON.parse(raw), defaults)
  } catch (error) {
    console.error('Failed to load stewardship data from localStorage.', error)
    return null
  }
}

export function saveState(state) {
  const withVersion = { ...state, version: CURRENT_VERSION }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(withVersion))
  return withVersion
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportStateToJSON(state) {
  return JSON.stringify({ ...state, version: CURRENT_VERSION }, null, 2)
}

export function importStateFromJSON(json, defaults) {
  const parsed = JSON.parse(json)
  return migrateState(parsed, defaults)
}

// The state/version migration pattern: every saved (or imported) blob
// funnels through here before the rest of the app ever sees it. It exists
// because the schema keeps growing (Phase 3.1 added givingCategories and
// savingsGoal; there will be more) and a device's localStorage is whatever
// it was last saved as - it does not update itself just because a new
// deploy shipped. Without this, a screen that reads a field added after a
// device's last save gets `undefined` and crashes (this happened in
// production once already). Backfilling missing top-level keys from
// `defaults` here means new fields are safe to add without a coordinated
// "bump the version and write a migration" step for the common case - only
// a genuine breaking change (renaming/removing/reshaping a field) needs a
// real version bump and an explicit branch below.
//
// The device's own data always wins for any key it actually has - this
// only fills in keys that are missing entirely, it never overwrites real
// ledger/approvals/settings/etc. with seed data.
function migrateState(state, defaults) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new TypeError('Stewardship data must be a single root object.')
  }
  if (state.version !== undefined && state.version !== CURRENT_VERSION) {
    throw new RangeError(`Unsupported stewardship data version: ${state.version}`)
  }

  const healed = defaults ? { ...defaults, ...state } : state
  return { ...healed, version: CURRENT_VERSION }
}

// Debounced write so rapid UI changes (e.g. typing) don't hammer
// localStorage on every keystroke.
let autosaveTimer = null
export function autosave(state, delayMs = 400) {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => saveState(state), delayMs)
}
