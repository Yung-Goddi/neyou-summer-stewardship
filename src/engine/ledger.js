// The ledger is a plain array of frozen transaction entries. There is no
// "edit" or "delete" here on purpose - the only way to change history is
// to append a new entry (a Correction) that says so.

export function appendToLedger(ledger, entryOrEntries) {
  const toAdd = Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries]
  return [...ledger, ...toAdd.map((entry) => Object.freeze(entry))]
}

export function getEntriesForAccount(ledger, account) {
  return ledger.filter((entry) => entry.account === account)
}

export function getEntriesByTransferId(ledger, transferId) {
  return ledger.filter((entry) => entry.transferId === transferId)
}

export function getEntriesByBatchId(ledger, batchId) {
  return ledger.filter((entry) => entry.batchId === batchId)
}

export function sortLedgerByTimestamp(ledger, order = 'asc') {
  const sorted = [...ledger].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  return order === 'desc' ? sorted.reverse() : sorted
}
