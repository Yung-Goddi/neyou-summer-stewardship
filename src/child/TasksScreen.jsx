import { createApprovalEvent, getApprovalStatus, APPROVAL_KINDS, APPROVAL_STATUSES } from '../engine/approvals.js'
import { BigCard, bigButtonClass, BackButton, todayISO } from './childUi.jsx'

const STATUS_LABEL = {
  approved: '✅ Approved!',
  pending: '⏳ Waiting for approval',
  none: null,
}

export default function TasksScreen({ state, childOperator, commitApprovals, onError, onHome }) {
  const today = todayISO()

  function markDone(kind, item) {
    try {
      const event = createApprovalEvent({
        kind,
        itemId: item.id,
        status: APPROVAL_STATUSES.PENDING,
        date: today,
        approvedBy: childOperator?.id ?? null,
        notes: item.title,
      })
      commitApprovals(event, `Nice work! "${item.title}" is waiting for approval.`)
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-sky-50 to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      <BigCard title="✅ Responsibilities">
        <ul className="space-y-2">
          {state.responsibilities.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              status={getApprovalStatus(state.approvals, APPROVAL_KINDS.RESPONSIBILITY, item.id, today)}
              onMarkDone={() => markDone(APPROVAL_KINDS.RESPONSIBILITY, item)}
            />
          ))}
        </ul>
      </BigCard>

      <BigCard title="🏆 Achievements">
        <ul className="space-y-2">
          {state.achievements.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              status={getApprovalStatus(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id, today)}
              onMarkDone={() => markDone(APPROVAL_KINDS.ACHIEVEMENT, item)}
            />
          ))}
        </ul>
      </BigCard>
    </div>
  )
}

function TaskRow({ item, status, onMarkDone }) {
  const label = STATUS_LABEL[status]
  return (
    <li className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl p-4">
      <span className="text-lg font-bold text-slate-700">{item.title}</span>
      {label ? (
        <span className="text-base font-bold text-slate-600">{label}</span>
      ) : (
        <button onClick={onMarkDone} className={`${bigButtonClass} min-h-[56px] bg-emerald-300 text-emerald-950`}>
          I Did This!
        </button>
      )}
    </li>
  )
}
