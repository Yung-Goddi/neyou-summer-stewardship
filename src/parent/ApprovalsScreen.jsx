import { useState } from 'react'
import { formatCents, transferBetweenAccounts, TRANSACTION_TYPES, ACCOUNTS } from '../engine/index.js'
import { createApprovalEvent, getApprovalStatus, APPROVAL_KINDS, APPROVAL_STATUSES } from '../engine/approvals.js'
import { Card, buttonClass, secondaryButtonClass, inputClass, todayISO } from './ui.jsx'

// Phase 2 has no child UI yet, so every approval here is a parent
// self-serve action during the evening review: pick the day, mark what was
// actually done, and for achievements the reward is posted to Spend as
// part of approving it. Once the child UI exists (Phase 3), the exact same
// approvals log will also hold 'pending' events the child submitted - this
// screen's Approve/Reject buttons are what will act on those too.
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

  return (
    <div className="space-y-6">
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
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl p-3"
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs">{item.frequency}</div>
                </div>
                {status === 'approved' ? (
                  <button className={secondaryButtonClass} onClick={() => undoResponsibility(item)}>
                    Approved ✓ (undo)
                  </button>
                ) : (
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
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl p-3"
              >
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs">Reward: {formatCents(item.rewardCents)}</div>
                </div>
                {status === 'approved' ? (
                  <span className="text-emerald-400 font-semibold text-sm">Approved ✓</span>
                ) : (
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
