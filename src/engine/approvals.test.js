import { describe, it, expect } from 'vitest'
import {
  createApprovalEvent,
  appendToApprovals,
  getApprovalStatus,
  getApprovalsForDate,
  APPROVAL_KINDS,
  APPROVAL_STATUSES,
} from './approvals.js'

describe('approvals', () => {
  it('reports "none" when nothing has been logged for an item/date', () => {
    expect(getApprovalStatus([], APPROVAL_KINDS.RESPONSIBILITY, 'resp_dishes', '2026-07-01')).toBe('none')
  })

  it('lets a parent self-serve straight to approved (Phase 2 workflow)', () => {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_dishes',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-01',
      approvedBy: 'op_dad',
    })
    const approvals = appendToApprovals([], event)
    expect(getApprovalStatus(approvals, APPROVAL_KINDS.RESPONSIBILITY, 'resp_dishes', '2026-07-01')).toBe(
      'approved'
    )
  })

  it('supports a pending-then-approved workflow (future child-submission shape) via the same mechanism', () => {
    const pending = createApprovalEvent({
      kind: APPROVAL_KINDS.ACHIEVEMENT,
      itemId: 'ach_first_save',
      status: APPROVAL_STATUSES.PENDING,
      date: '2026-07-01',
      timestamp: '2026-07-01T10:00:00.000Z',
    })
    let approvals = appendToApprovals([], pending)
    expect(getApprovalStatus(approvals, APPROVAL_KINDS.ACHIEVEMENT, 'ach_first_save', '2026-07-01')).toBe(
      'pending'
    )

    const approved = createApprovalEvent({
      kind: APPROVAL_KINDS.ACHIEVEMENT,
      itemId: 'ach_first_save',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-01',
      approvedBy: 'op_mom',
      timestamp: '2026-07-01T19:00:00.000Z',
    })
    approvals = appendToApprovals(approvals, approved)
    expect(getApprovalStatus(approvals, APPROVAL_KINDS.ACHIEVEMENT, 'ach_first_save', '2026-07-01')).toBe(
      'approved'
    )
  })

  it('never mutates or removes prior events - both remain in the log', () => {
    const first = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_room',
      status: APPROVAL_STATUSES.PENDING,
      date: '2026-07-01',
    })
    const second = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_room',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-01',
    })
    const approvals = appendToApprovals(appendToApprovals([], first), second)
    expect(approvals).toHaveLength(2)
    expect(approvals[0].status).toBe('pending')
  })

  it('scopes status lookups to kind + itemId + date, not just itemId', () => {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_trash',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-01',
    })
    const approvals = appendToApprovals([], event)
    expect(getApprovalStatus(approvals, APPROVAL_KINDS.RESPONSIBILITY, 'resp_trash', '2026-07-02')).toBe(
      'none'
    )
  })

  it('filters approvals by date', () => {
    const a = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_dishes',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-01',
    })
    const b = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: 'resp_dishes',
      status: APPROVAL_STATUSES.APPROVED,
      date: '2026-07-02',
    })
    const approvals = appendToApprovals(appendToApprovals([], a), b)
    expect(getApprovalsForDate(approvals, '2026-07-01')).toEqual([a])
  })
})
