import { createApprovalEvent, getApprovalStatus, APPROVAL_KINDS, APPROVAL_STATUSES } from '../engine/approvals.js'
import { BigCard, bigButtonClass, BackButton, todayISO } from './childUi.jsx'

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

  // Undo is only ever valid while still 'pending' - once a parent has
  // appended 'approved' or 'rejected', that status is what shows here
  // instead and this button never renders.
  function undo(kind, item) {
    const event = createApprovalEvent({
      kind,
      itemId: item.id,
      status: APPROVAL_STATUSES.WITHDRAWN,
      date: today,
      approvedBy: childOperator?.id ?? null,
      notes: 'Undone by child',
    })
    commitApprovals(event, `"${item.title}" undone.`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-neyou-cream to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      <BigCard title="✅ Responsibilities">
        <ul className="space-y-2">
          {state.responsibilities.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              status={getApprovalStatus(state.approvals, APPROVAL_KINDS.RESPONSIBILITY, item.id, today)}
              onMarkDone={() => markDone(APPROVAL_KINDS.RESPONSIBILITY, item)}
              onUndo={() => undo(APPROVAL_KINDS.RESPONSIBILITY, item)}
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
              onUndo={() => undo(APPROVAL_KINDS.ACHIEVEMENT, item)}
            />
          ))}
        </ul>
      </BigCard>
    </div>
  )
}

function TaskRow({ item, status, onMarkDone, onUndo }) {
  return (
    <li className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl p-4">
      <span className="text-lg font-bold text-slate-700">{item.title}</span>
      {status === 'approved' && <span className="text-base font-bold text-slate-600">✅ Approved!</span>}
      {status === 'pending' && (
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-600">⏳ Waiting for approval</span>
          <button onClick={onUndo} className="min-h-[44px] px-3 rounded-xl bg-white text-slate-600 font-bold text-sm shadow">
            Undo
          </button>
        </div>
      )}
      {(status === 'none' || status === 'rejected' || status === 'withdrawn') && (
        <button onClick={onMarkDone} className={`${bigButtonClass} min-h-[56px] bg-emerald-300 text-emerald-950`}>
          I Did This!
        </button>
      )}
    </li>
  )
}
