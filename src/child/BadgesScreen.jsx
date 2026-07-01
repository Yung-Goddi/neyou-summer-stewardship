import { formatCents } from '../engine/index.js'
import { hasEverBeenApproved, APPROVAL_KINDS } from '../engine/approvals.js'
import { BigCard, BackButton } from './childUi.jsx'

// A visual achievement board, not a badge economy - earning a badge here
// is the same "approve an achievement" action from TasksScreen/
// ApprovalsScreen, this just shows the whole set at once so a child can
// see what's already earned and what's still locked.
export default function BadgesScreen({ state, onHome }) {
  const earned = state.achievements.filter((item) =>
    hasEverBeenApproved(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id)
  )
  const locked = state.achievements.filter(
    (item) => !hasEverBeenApproved(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-purple/20 via-neyou-cream to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      <BigCard title="🏆 Earned Badges">
        {earned.length === 0 ? (
          <p className="text-neyou-brown font-semibold">No badges yet - keep going!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map((item) => (
              <BadgeCard key={item.id} item={item} locked={false} />
            ))}
          </div>
        )}
      </BigCard>

      <BigCard title="🔒 Locked Badges">
        {locked.length === 0 ? (
          <p className="text-neyou-brown font-semibold">You earned every badge! 🎉</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locked.map((item) => (
              <BadgeCard key={item.id} item={item} locked />
            ))}
          </div>
        )}
      </BigCard>
    </div>
  )
}

function BadgeCard({ item, locked }) {
  return (
    <div
      className={`rounded-2xl p-4 text-center space-y-1 border-2 ${
        locked ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-neyou-gold shadow'
      }`}
    >
      <div className="text-4xl">{locked ? '🔒' : item.icon || '🏅'}</div>
      <div className="font-extrabold text-neyou-brownDark">{item.title}</div>
      <div className="text-xs text-neyou-brown">{item.description}</div>
      <div className="text-sm font-bold text-neyou-teal">{formatCents(item.rewardCents)}</div>
    </div>
  )
}
