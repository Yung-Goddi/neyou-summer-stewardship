// Shared id generator for anything the engine creates (ledger entries,
// transfer/batch ids, approval events). Ids only need to be unique within
// this device's data, so a timestamp + incrementing counter + short random
// suffix is enough - no UUID dependency.

let sequence = 0

export function generateId(prefix) {
  sequence += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${sequence}_${random}`
}
