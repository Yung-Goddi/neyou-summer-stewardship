import { generateId } from './id.js'

// Approvals track whether something is done/allowed: a responsibility or
// achievement marked done for a given day, or a child's request to move
// money. Like the ledger, this is an append-only log, not a row you edit
// in place: "approving" something means appending a new event, and the
// current status is whichever event for that (kind, itemId, date) is most
// recent. That's what lets self-serve and submit-then-approve share one
// mechanism without changing shape:
//   - Parent self-serve (no child submission involved): a parent appends
//     an 'approved' event directly during the evening review - there's no
//     'pending' step.
//   - Child submission (Phase 3): the child appends a 'pending' event -
//     "I did this" for a responsibility/achievement, or "I want to spend
//     $X" for a money request - and a parent later appends an 'approved'
//     or 'rejected' event for that same item.
// getApprovalStatus always reports the latest event, whichever workflow
// produced it.

export const APPROVAL_KINDS = Object.freeze({
  RESPONSIBILITY: 'responsibility',
  ACHIEVEMENT: 'achievement',
  MONEY_REQUEST: 'money_request',
})

export const APPROVAL_STATUSES = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

// Builds one immutable approval event.
//   - kind/itemId identify what this is about. For RESPONSIBILITY/
//     ACHIEVEMENT, itemId is a catalog id from state.responsibilities/
//     achievements, shared across every day it's marked done. For
//     MONEY_REQUEST there's no catalog - itemId is a fresh id generated
//     once per request (see moneyRequests.js), and every event about that
//     same request (pending, then approved or rejected) reuses it.
//   - date is the calendar day this pertains to ("2026-07-01"), separate
//     from timestamp (when this event was recorded) so a parent can log a
//     same-day approval a few minutes or a few hours after the fact.
//   - approvedBy is whoever performed *this* event - the child when it's
//     a 'pending' submission, the parent when it's 'approved'/'rejected'.
//   - transferId links a money-moving approval (achievement reward, or an
//     approved money request) to the ledger transfer it triggered, if
//     any. approvals.js itself never touches the ledger, keeping the two
//     logs independent and each easy to reason about on its own.
//   - payload carries kind-specific data that doesn't belong on every
//     event type - currently just the money request's { type, amount,
//     fromAccount, toAccount } (see moneyRequests.js).
export function createApprovalEvent({
  kind,
  itemId,
  status,
  date,
  notes = '',
  approvedBy = null,
  transferId = null,
  payload = null,
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
    payload,
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

// Collapses every event of a given kind down to one entry per itemId (the
// latest one), regardless of date. Used for money requests, which - unlike
// a daily responsibility check-off - aren't scoped to "today": a request
// submitted yesterday and still pending should still show up.
export function getLatestEventsForKind(approvals, kind) {
  const latestByItem = new Map()
  approvals
    .filter((event) => event.kind === kind)
    .forEach((event) => {
      const existing = latestByItem.get(event.itemId)
      if (!existing || new Date(event.timestamp) > new Date(existing.timestamp)) {
        latestByItem.set(event.itemId, event)
      }
    })
  return [...latestByItem.values()]
}
