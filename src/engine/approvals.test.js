import { describe, it, expect } from 'vitest'
import {
  createApprovalEvent,
  appendToApprovals,
  getApprovalStatus,
  getApprovalsForDate,
  getLatestEventsForKind,
  hasEverBeenApproved,
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

  it('carries an arbitrary payload for kind-specific data (money requests)', () => {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.MONEY_REQUEST,
      itemId: 'req_1',
      status: APPROVAL_STATUSES.PENDING,
      date: '2026-07-01',
      payload: { type: 'spend', amount: 350, fromAccount: 'spend', toAccount: 'external' },
    })
    expect(event.payload).toEqual({ type: 'spend', amount: 350, fromAccount: 'spend', toAccount: 'external' })
  })

  describe('getLatestEventsForKind', () => {
    it('collapses to one latest event per itemId, regardless of date', () => {
      const pending = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.PENDING,
        date: '2026-07-01',
        timestamp: '2026-07-01T10:00:00.000Z',
      })
      const approved = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.APPROVED,
        date: '2026-07-01',
        timestamp: '2026-07-02T09:00:00.000Z',
      })
      const other = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_2',
        status: APPROVAL_STATUSES.PENDING,
        date: '2026-07-03',
      })
      const approvals = appendToApprovals(appendToApprovals(appendToApprovals([], pending), approved), other)
      const latest = getLatestEventsForKind(approvals, APPROVAL_KINDS.MONEY_REQUEST)
      expect(latest).toHaveLength(2)
      expect(latest.find((e) => e.itemId === 'req_1').status).toBe('approved')
      expect(latest.find((e) => e.itemId === 'req_2').status).toBe('pending')
    })

    it('ignores events of a different kind', () => {
      const responsibility = createApprovalEvent({
        kind: APPROVAL_KINDS.RESPONSIBILITY,
        itemId: 'resp_dishes',
        status: APPROVAL_STATUSES.APPROVED,
        date: '2026-07-01',
      })
      const approvals = appendToApprovals([], responsibility)
      expect(getLatestEventsForKind(approvals, APPROVAL_KINDS.MONEY_REQUEST)).toEqual([])
    })
  })

  describe('withdrawal (child undo before a parent acts)', () => {
    it('lets a pending event be superseded by a withdrawn one', () => {
      const pending = createApprovalEvent({
        kind: APPROVAL_KINDS.RESPONSIBILITY,
        itemId: 'resp_feed_dog',
        status: APPROVAL_STATUSES.PENDING,
        date: '2026-07-01',
        timestamp: '2026-07-01T08:00:00.000Z',
      })
      const withdrawn = createApprovalEvent({
        kind: APPROVAL_KINDS.RESPONSIBILITY,
        itemId: 'resp_feed_dog',
        status: APPROVAL_STATUSES.WITHDRAWN,
        date: '2026-07-01',
        timestamp: '2026-07-01T08:01:00.000Z',
      })
      const approvals = appendToApprovals(appendToApprovals([], pending), withdrawn)
      expect(getApprovalStatus(approvals, APPROVAL_KINDS.RESPONSIBILITY, 'resp_feed_dog', '2026-07-01')).toBe(
        'withdrawn'
      )
    })

    it('does not erase the original pending event - both stay in the log', () => {
      const pending = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.PENDING,
        date: '2026-07-01',
      })
      const withdrawn = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.WITHDRAWN,
        date: '2026-07-01',
      })
      const approvals = appendToApprovals(appendToApprovals([], pending), withdrawn)
      expect(approvals).toHaveLength(2)
    })

    it('excludes withdrawn requests from the pending list a parent would act on', () => {
      const pending = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.PENDING,
        date: '2026-07-01',
        timestamp: '2026-07-01T08:00:00.000Z',
      })
      const withdrawn = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: 'req_1',
        status: APPROVAL_STATUSES.WITHDRAWN,
        date: '2026-07-01',
        timestamp: '2026-07-01T08:01:00.000Z',
      })
      const approvals = appendToApprovals(appendToApprovals([], pending), withdrawn)
      const stillPending = getLatestEventsForKind(approvals, APPROVAL_KINDS.MONEY_REQUEST).filter(
        (e) => e.status === APPROVAL_STATUSES.PENDING
      )
      expect(stillPending).toHaveLength(0)
    })
  })

  describe('hasEverBeenApproved', () => {
    it('is true once approved on any day, unlike the date-scoped status', () => {
      const approved = createApprovalEvent({
        kind: APPROVAL_KINDS.ACHIEVEMENT,
        itemId: 'ach_reader',
        status: APPROVAL_STATUSES.APPROVED,
        date: '2026-06-15',
      })
      const approvals = appendToApprovals([], approved)
      expect(hasEverBeenApproved(approvals, APPROVAL_KINDS.ACHIEVEMENT, 'ach_reader')).toBe(true)
      // A badge earned in June stays earned in August, unlike the daily
      // per-date status a responsibility check-off would use.
      expect(getApprovalStatus(approvals, APPROVAL_KINDS.ACHIEVEMENT, 'ach_reader', '2026-08-01')).toBe('none')
    })

    it('is false when nothing has ever been approved', () => {
      expect(hasEverBeenApproved([], APPROVAL_KINDS.ACHIEVEMENT, 'ach_reader')).toBe(false)
    })
  })
})
