import { useState } from 'react'
import { formatCents, transferBetweenAccounts, TRANSACTION_TYPES, ACCOUNTS } from '../engine/index.js'
import {
  createApprovalEvent,
  getApprovalStatus,
  getLatestEventsForKind,
  APPROVAL_KINDS,
  APPROVAL_STATUSES,
} from '../engine/approvals.js'
import { Card, buttonClass, secondaryButtonClass, dangerButtonClass, inputClass, todayISO, labelize } from './ui.jsx'

function operatorName(state, id) {
  return state.operators.find((op) => op.id === id)?.name ?? 'someone'
}

// A parent can act on these two ways, and both post the exact same kind of
// event: self-serve (no child submission - jump straight to 'approved'
// during the evening review) or reviewing what the child already marked
// 'pending' from their own screen. Approving an achievement or a money
// request is the only place that touches the ledger - everything else
// here only ever appends to the approvals log.
export default function ApprovalsScreen({ state, currentOperator, commitApprovals, commitLedgerAndApprovals, onError }) {
  const [date, setDate] = useState(todayISO())

  function approveResponsibility(item) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: item.id,
      status: APPROVAL_STATUSES.APPROVED,
      date,
      approvedBy: currentOperator.id,
    })
    commitApprovals(event, `${item.title} approved for ${date}.`)
  }

  function rejectResponsibility(item) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: item.id,
      status: APPROVAL_STATUSES.REJECTED,
      date,
      approvedBy: currentOperator.id,
      notes: 'Not done yet',
    })
    commitApprovals(event, `${item.title} marked not done for ${date}.`)
  }

  function undoResponsibility(item) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.RESPONSIBILITY,
      itemId: item.id,
      status: APPROVAL_STATUSES.PENDING,
      date,
      approvedBy: currentOperator.id,
      notes: 'Un-marked by parent',
    })
    commitApprovals(event, `${item.title} un-marked for ${date}.`)
  }

  function approveAchievement(item) {
    try {
      let ledgerEntries = []
      let transferId = null

      if (item.rewardCents > 0) {
        ledgerEntries = transferBetweenAccounts({
          ledger: state.ledger,
          type: TRANSACTION_TYPES.ACHIEVEMENT_REWARD,
          fromAccount: ACCOUNTS.EXTERNAL,
          toAccount: ACCOUNTS.SPEND,
          amount: item.rewardCents,
          approvedBy: currentOperator.id,
          notes: `Achievement: ${item.title}`,
        })
        transferId = ledgerEntries[0].transferId
      }

      const event = createApprovalEvent({
        kind: APPROVAL_KINDS.ACHIEVEMENT,
        itemId: item.id,
        status: APPROVAL_STATUSES.APPROVED,
        date,
        approvedBy: currentOperator.id,
        transferId,
      })

      const message =
        item.rewardCents > 0
          ? `${item.title} approved - ${formatCents(item.rewardCents)} reward posted to Spend.`
          : `${item.title} approved.`
      commitLedgerAndApprovals(ledgerEntries, event, message)
    } catch (error) {
      onError(error)
    }
  }

  function rejectAchievement(item) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.ACHIEVEMENT,
      itemId: item.id,
      status: APPROVAL_STATUSES.REJECTED,
      date,
      approvedBy: currentOperator.id,
      notes: 'Not earned yet',
    })
    commitApprovals(event, `${item.title} not approved for ${date}.`)
  }

  function approveMoneyRequest(request) {
    try {
      const { type, amount, fromAccount, toAccount } = request.payload
      const pair = transferBetweenAccounts({
        ledger: state.ledger,
        type,
        fromAccount,
        toAccount,
        amount,
        approvedBy: currentOperator.id,
        notes: request.notes,
      })
      const event = createApprovalEvent({
        kind: APPROVAL_KINDS.MONEY_REQUEST,
        itemId: request.itemId,
        status: APPROVAL_STATUSES.APPROVED,
        date: request.date,
        approvedBy: currentOperator.id,
        transferId: pair[0].transferId,
        payload: request.payload,
      })
      commitLedgerAndApprovals(pair, event, `Approved: ${formatCents(amount)} ${labelize(type)}.`)
    } catch (error) {
      onError(error)
    }
  }

  function rejectMoneyRequest(request) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.MONEY_REQUEST,
      itemId: request.itemId,
      status: APPROVAL_STATUSES.REJECTED,
      date: request.date,
      approvedBy: currentOperator.id,
      notes: 'Not approved',
      payload: request.payload,
    })
    commitApprovals(event, 'Request declined.')
  }

  const pendingMoneyRequests = getLatestEventsForKind(state.approvals, APPROVAL_KINDS.MONEY_REQUEST).filter(
    (e) => e.status === APPROVAL_STATUSES.PENDING
  )

  return (
    <div className="space-y-6">
      {pendingMoneyRequests.length > 0 && (
        <Card title={`Money Requests (${pendingMoneyRequests.length} waiting)`}>
          <ul className="space-y-2">
            {pendingMoneyRequests.map((request) => (
              <li key={request.id} className="bg-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {labelize(request.payload.type)} - {formatCents(request.payload.amount)}
                      {request.payload.category && ` (${request.payload.category})`}
                    </div>
                    <div className="text-slate-400 text-xs">
                      {operatorName(state, request.approvedBy)} · {request.notes || 'no note'} ·{' '}
                      {request.timestamp.slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className={buttonClass} onClick={() => approveMoneyRequest(request)}>
                    Approve
                  </button>
                  <button className={dangerButtonClass} onClick={() => rejectMoneyRequest(request)}>
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Approvals">
        <label className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Date</span>
          <input
            type="date"
            className={`${inputClass} max-w-[200px]`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </Card>

      <Card title="Responsibilities">
        <ul className="space-y-2">
          {state.responsibilities.map((item) => {
            const status = getApprovalStatus(state.approvals, APPROVAL_KINDS.RESPONSIBILITY, item.id, date)
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs">
                    {item.frequency}
                    {status === 'pending' && ' · marked done, waiting on you'}
                  </div>
                </div>
                {status === 'approved' && (
                  <button className={secondaryButtonClass} onClick={() => undoResponsibility(item)}>
                    Approved ✓ (undo)
                  </button>
                )}
                {status === 'pending' && (
                  <div className="flex gap-2">
                    <button className={buttonClass} onClick={() => approveResponsibility(item)}>
                      Approve
                    </button>
                    <button className={dangerButtonClass} onClick={() => rejectResponsibility(item)}>
                      Reject
                    </button>
                  </div>
                )}
                {['none', 'rejected', 'withdrawn'].includes(status) && (
                  <button className={buttonClass} onClick={() => approveResponsibility(item)}>
                    Mark Done & Approve
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card title="Achievements">
        <ul className="space-y-2">
          {state.achievements.map((item) => {
            const status = getApprovalStatus(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id, date)
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs">
                    Reward: {formatCents(item.rewardCents)}
                    {status === 'pending' && ' · claimed, waiting on you'}
                  </div>
                </div>
                {status === 'approved' && <span className="text-emerald-400 font-semibold text-sm">Approved ✓</span>}
                {status === 'pending' && (
                  <div className="flex gap-2">
                    <button className={buttonClass} onClick={() => approveAchievement(item)}>
                      Approve{item.rewardCents > 0 ? ' & Pay' : ''}
                    </button>
                    <button className={dangerButtonClass} onClick={() => rejectAchievement(item)}>
                      Reject
                    </button>
                  </div>
                )}
                {['none', 'rejected', 'withdrawn'].includes(status) && (
                  <button className={buttonClass} onClick={() => approveAchievement(item)}>
                    Approve{item.rewardCents > 0 ? ' & Pay Reward' : ''}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
