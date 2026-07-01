import { generateId } from './id.js'

// Approvals track whether a responsibility or achievement has been marked
// done for a given day. Like the ledger, this is an append-only log, not a
// row you edit in place: "approving" something means appending a new event,
// and the current status is whichever event for that (kind, itemId, date)
// is most recent. That's what lets the same mechanism serve two workflows
// without changing shape:
//   - Phase 2 (no child UI yet): a parent appends a 'approved' event
//     directly during the evening review - there's no 'pending' step.
//   - Phase 3 (once the child UI exists): the child appends a 'pending'
//     event when they say they've done something, and a parent later
//     appends an 'approved' or 'rejected' event for that same item/date.
// getApprovalStatus always reports the latest event, whichever workflow
// produced it.

export const APPROVAL_KINDS = Object.freeze({
  RESPONSIBILITY: 'responsibility',
  ACHIEVEMENT: 'achievement',
})

export const APPROVAL_STATUSES = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

// Builds one immutable approval event.
//   - kind/itemId identify what this is about (a responsibility or
//     achievement from the catalog in state.responsibilities/achievements).
//   - date is the calendar day this pertains to ("2026-07-01"), separate
//     from timestamp (when this event was recorded) so a parent can log a
//     same-day approval a few minutes or a few hours after the fact.
//   - transferId links an achievement approval to the reward transfer it
//     triggered in the ledger, if any (see calling code in the UI layer -
//     approvals.js itself never touches the ledger, keeping the two logs
//     independent and each easy to reason about on its own).
export function createApprovalEvent({
  kind,
  itemId,
  status,
  date,
  notes = '',
  approvedBy = null,
  transferId = null,
  timestamp = new Date().toISOString(),
}) {
  if (!Object.values(APPROVAL_KINDS).includes(kind)) {
    throw new RangeError(`Unknown approval kind: ${kind}`)
  }
  if (!Object.values(APPROVAL_STATUSES).includes(status)) {
    throw new RangeError(`Unknown approval status: ${status}`)
  }
  if (!itemId) {
    throw new RangeError('Approval events require an itemId')
  }
  if (!date) {
    throw new RangeError('Approval events require a date')
  }

  return Object.freeze({
    id: generateId('appr'),
    kind,
    itemId,
    status,
    date,
    notes,
    approvedBy,
    transferId,
    timestamp,
  })
}

export function appendToApprovals(approvals, eventOrEvents) {
  const toAdd = Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents]
  return [...approvals, ...toAdd.map((event) => Object.freeze(event))]
}

export function getApprovalsForDate(approvals, date) {
  return approvals.filter((event) => event.date === date)
}

export function getLatestApprovalEvent(approvals, kind, itemId, date) {
  const matching = approvals
    .filter((event) => event.kind === kind && event.itemId === itemId && event.date === date)
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  return matching.length === 0 ? null : matching[matching.length - 1]
}

export function getApprovalStatus(approvals, kind, itemId, date) {
  return getLatestApprovalEvent(approvals, kind, itemId, date)?.status ?? 'none'
}
