import { formatCents } from '../../engine/index.js'
import { createApprovalEvent, getApprovalStatus, hasEverBeenApproved, APPROVAL_KINDS, APPROVAL_STATUSES } from '../../engine/approvals.js'
import { BigCard, bigButtonClass, MascotBubble, BackButton, todayISO } from '../childUi.jsx'
import { MODULES_BY_ID } from './modules.js'

// Practice never pays anything - this screen is the only place a mastery
// achievement can be claimed as ready, and only a parent's real-cash check
// (over in the Approvals screen) can actually award it. "I Think I'm
// Ready!" just appends a pending approval event, exactly like a
// responsibility check-off - it does not touch the ledger.
export default function MasteryScreen({ state, childOperator, commitApprovals, onError, onBack, onPracticeModule }) {
  const masteryAchievements = state.achievements.filter((item) => item.category === 'mastery')
  const today = todayISO()

  function claimReady(item) {
    try {
      const event = createApprovalEvent({
        kind: APPROVAL_KINDS.ACHIEVEMENT,
        itemId: item.id,
        status: APPROVAL_STATUSES.PENDING,
        date: today,
        approvedBy: childOperator?.id ?? null,
        notes: item.title,
      })
      commitApprovals(event, `Told Mom or Dad you're ready for ${item.title}!`)
    } catch (error) {
      onError(error)
    }
  }

  function undoClaim(item) {
    const event = createApprovalEvent({
      kind: APPROVAL_KINDS.ACHIEVEMENT,
      itemId: item.id,
      status: APPROVAL_STATUSES.WITHDRAWN,
      date: today,
      approvedBy: childOperator?.id ?? null,
      notes: 'Undone by child',
    })
    commitApprovals(event, `Okay, ${item.title} undone for now.`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-purple/20 via-neyou-cream to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onBack} />
      <MascotBubble>
        Practicing doesn't earn money - once you're really good at something, tell Mom or Dad you're ready, and
        they'll test you for real!
      </MascotBubble>

      <div className="space-y-3">
        {masteryAchievements.map((item) => {
          const earned = hasEverBeenApproved(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id)
          const status = getApprovalStatus(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id, today)
          const module = MODULES_BY_ID[item.moduleId]

          return (
            <BigCard key={item.id}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-neyou-brownDark text-lg">{item.title}</div>
                  <div className="text-neyou-brown text-sm">{item.description}</div>
                  <div className="text-neyou-teal font-bold text-sm">Reward: {formatCents(item.rewardCents)}</div>
                </div>
              </div>

              {earned && <div className="text-emerald-600 font-extrabold text-center text-lg">🏅 Mastered!</div>}

              {!earned && status === 'pending' && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-neyou-brown">⏳ Waiting for Mom or Dad</span>
                  <button onClick={() => undoClaim(item)} className="min-h-[44px] px-4 rounded-xl bg-white text-neyou-brown font-bold text-sm shadow border-2 border-neyou-tan/40">
                    Undo
                  </button>
                </div>
              )}

              {!earned && status !== 'pending' && (
                <div className="space-y-2">
                  {module && (
                    <button
                      onClick={() => onPracticeModule(module.id)}
                      className="w-full min-h-[48px] rounded-xl bg-white text-neyou-brown font-bold border-2 border-neyou-tan/40"
                    >
                      Practice: {module.title} →
                    </button>
                  )}
                  <button onClick={() => claimReady(item)} className={`${bigButtonClass} w-full bg-neyou-gold text-neyou-brownDark`}>
                    I Think I'm Ready!
                  </button>
                </div>
              )}
            </BigCard>
          )
        })}
      </div>
    </div>
  )
}
