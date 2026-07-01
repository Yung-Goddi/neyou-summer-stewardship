// Complete persistence layer. Everything the app knows lives in one root
// object under one localStorage key - there is no scattering of related
// data across multiple keys to keep in sync.

const STORAGE_KEY = 'neyou-stewardship:v1'
export const CURRENT_VERSION = 1

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return migrateState(JSON.parse(raw))
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

export function importStateFromJSON(json) {
  const parsed = JSON.parse(json)
  return migrateState(parsed)
}

// No schema changes have shipped yet, so migration is currently just
// version-stamping. Future versions add branches here rather than mutating
// old data in place.
function migrateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new TypeError('Stewardship data must be a single root object.')
  }
  if (state.version === undefined || state.version === CURRENT_VERSION) {
    return { ...state, version: CURRENT_VERSION }
  }
  throw new RangeError(`Unsupported stewardship data version: ${state.version}`)
}

// Debounced write so rapid UI changes (e.g. typing) don't hammer
// localStorage on every keystroke.
let autosaveTimer = null
export function autosave(state, delayMs = 400) {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => saveState(state), delayMs)
}
