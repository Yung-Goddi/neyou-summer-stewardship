import { ACCOUNTS, formatCents, TRANSACTION_TYPES } from '../engine/index.js'
import {
  createApprovalEvent,
  getLatestEventsForKind,
  getApprovalStatus,
  APPROVAL_KINDS,
  APPROVAL_STATUSES,
} from '../engine/approvals.js'
import { BigCard, bigButtonClass, ProgressBar, MascotBubble, Toast, todayISO } from './childUi.jsx'

const REQUEST_TILES = [
  { type: TRANSACTION_TYPES.SPEND, emoji: '🛍️', label: 'I Want to Spend', color: 'bg-neyou-gold text-neyou-brownDark' },
  { type: TRANSACTION_TYPES.SAVE_TRANSFER, emoji: '🐷', label: 'Move to Save', color: 'bg-neyou-teal text-white' },
  { type: TRANSACTION_TYPES.GIVING, emoji: '💝', label: 'I Want to Give', color: 'bg-neyou-pink text-white' },
]

export default function ChildHome({
  state,
  balances,
  childOperator,
  message,
  commitApprovals,
  onRequestMoney,
  onOpenTasks,
  onOpenBadges,
  onSwitchToParent,
}) {
  const today = todayISO()

  const pendingMoney = getLatestEventsForKind(state.approvals, APPROVAL_KINDS.MONEY_REQUEST)
    .filter((e) => e.status === APPROVAL_STATUSES.PENDING)
    .map((e) => ({ id: e.id, kind: e.kind, itemId: e.itemId, date: e.date, payload: e.payload, notes: e.notes }))

  const pendingTasks = [
    ...state.responsibilities.map((item) => ({ kind: APPROVAL_KINDS.RESPONSIBILITY, item })),
    ...state.achievements.map((item) => ({ kind: APPROVAL_KINDS.ACHIEVEMENT, item })),
  ]
    .filter(({ kind, item }) => getApprovalStatus(state.approvals, kind, item.id, today) === APPROVAL_STATUSES.PENDING)
    .map(({ kind, item }) => ({ id: `${kind}-${item.id}-${today}`, kind, itemId: item.id, date: today, notes: item.title }))

  const waiting = [...pendingMoney, ...pendingTasks]

  function withdraw(item) {
    const event = createApprovalEvent({
      kind: item.kind,
      itemId: item.itemId,
      status: APPROVAL_STATUSES.WITHDRAWN,
      date: item.date,
      approvedBy: childOperator?.id ?? null,
      payload: item.payload ?? null,
      notes: 'Undone by child',
    })
    commitApprovals(event, 'No problem - undone!')
  }

  const goal = state.savingsGoal
  const saveBalance = balances[ACCOUNTS.SAVE]
  const goalPercent = goal ? (saveBalance / goal.targetCents) * 100 : 0
  const goalRemaining = goal ? Math.max(0, goal.targetCents - saveBalance) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-neyou-cream to-white p-4 sm:p-6 space-y-6">
      <MascotBubble>Hi {childOperator?.name ?? 'there'}! Ready for today? Let's do this together!</MascotBubble>

      {message && <Toast message={message} />}

      <BigCard>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: ACCOUNTS.SPEND, label: 'Spend', emoji: '🛍️' },
            { key: ACCOUNTS.SAVE, label: 'Save', emoji: '🐷' },
            { key: ACCOUNTS.GIVE, label: 'Give', emoji: '💝' },
          ].map((row) => (
            <div key={row.key} className="bg-neyou-cream rounded-2xl p-4 text-center">
              <div className="text-3xl">{row.emoji}</div>
              <div className="text-neyou-brown font-semibold">{row.label}</div>
              <div className="text-2xl font-extrabold text-neyou-brownDark">{formatCents(balances[row.key])}</div>
            </div>
          ))}
        </div>
        <div className="bg-neyou-cream rounded-2xl p-3 text-center">
          <span className="text-neyou-brown font-semibold">🌱 Future money growing: </span>
          <span className="text-lg font-extrabold text-neyou-brownDark">{formatCents(balances[ACCOUNTS.FUTURE])}</span>
        </div>
      </BigCard>

      {goal && (
        <BigCard title={`🎯 Goal: ${goal.title}`}>
          <ProgressBar percent={goalPercent} />
          <div className="flex justify-between text-sm font-semibold text-neyou-brown">
            <span>{formatCents(saveBalance)} saved</span>
            <span>Target: {formatCents(goal.targetCents)}</span>
          </div>
          <p className="text-center text-neyou-brownDark font-bold">
            {goalRemaining > 0 ? `${formatCents(goalRemaining)} to go!` : "You reached your goal! 🎉"}
          </p>
        </BigCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REQUEST_TILES.map((tile) => (
          <button
            key={tile.type}
            onClick={() => onRequestMoney(tile.type)}
            className={`${bigButtonClass} ${tile.color} flex flex-col items-center gap-1`}
          >
            <span className="text-3xl">{tile.emoji}</span>
            {tile.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onOpenTasks}
          className={`${bigButtonClass} bg-emerald-300 text-emerald-950 flex items-center justify-center gap-2`}
        >
          <span className="text-3xl">✅</span> I Did My Jobs Today!
        </button>
        <button
          onClick={onOpenBadges}
          className={`${bigButtonClass} bg-neyou-purple text-white flex items-center justify-center gap-2`}
        >
          <span className="text-3xl">🏆</span> My Badges
        </button>
      </div>

      {waiting.length > 0 && (
        <BigCard title="Waiting for Mom or Dad to say yes">
          <ul className="space-y-2">
            {waiting.map((item) => (
              <li
                key={item.id}
                className="bg-amber-50 rounded-xl p-3 text-neyou-brownDark font-semibold flex items-center justify-between gap-3"
              >
                <span>{describeWaiting(item)}</span>
                <button
                  onClick={() => withdraw(item)}
                  className="min-h-[44px] px-4 rounded-xl bg-white text-neyou-brown font-bold text-sm shadow shrink-0"
                >
                  Undo
                </button>
              </li>
            ))}
          </ul>
        </BigCard>
      )}

      <div className="text-center pt-4">
        <button onClick={onSwitchToParent} className="text-neyou-brown/70 text-sm underline">
          Parent Dashboard
        </button>
      </div>
    </div>
  )
}

function describeWaiting(item) {
  if (item.kind === APPROVAL_KINDS.MONEY_REQUEST) {
    return `${formatCents(item.payload.amount)} - ${item.notes || 'no note'}`
  }
  return item.notes
}
