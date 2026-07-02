import { formatCents, getBadgeAward, hasEarnedBadge, BADGE_LEVELS } from '../engine/index.js'
import { hasEverBeenApproved, APPROVAL_KINDS } from '../engine/approvals.js'
import { BigCard, BackButton } from './childUi.jsx'

const LEVEL_MEDAL = {
  [BADGE_LEVELS.BRONZE]: '🥉',
  [BADGE_LEVELS.SILVER]: '🥈',
  [BADGE_LEVELS.GOLD]: '🥇',
}

const LEVEL_BORDER = {
  [BADGE_LEVELS.BRONZE]: 'border-amber-700',
  [BADGE_LEVELS.SILVER]: 'border-slate-400',
  [BADGE_LEVELS.GOLD]: 'border-neyou-gold',
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Two independent galleries on one screen: the new category/level Badges
// board (state.badges + state.badgeAwards), and the pre-existing cash-reward
// Achievements gallery (state.achievements) - kept exactly as it worked
// before, just relabeled, so nothing a child could already see disappears.
export default function BadgesScreen({ state, onHome }) {
  const earnedAchievements = state.achievements.filter((item) =>
    hasEverBeenApproved(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id)
  )
  const lockedAchievements = state.achievements.filter(
    (item) => !hasEverBeenApproved(state.approvals, APPROVAL_KINDS.ACHIEVEMENT, item.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-purple/20 via-neyou-cream to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      {state.badgeCategories.map((category) => (
        <BadgeCategorySection key={category.id} category={category} state={state} />
      ))}

      <BigCard title="🏆 Achievement Rewards">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-neyou-brownDark mb-2">Earned</h3>
            {earnedAchievements.length === 0 ? (
              <p className="text-neyou-brown font-semibold">No badges yet - keep going!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {earnedAchievements.map((item) => (
                  <AchievementCard key={item.id} item={item} locked={false} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-neyou-brownDark mb-2">Locked</h3>
            {lockedAchievements.length === 0 ? (
              <p className="text-neyou-brown font-semibold">You earned every badge! 🎉</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lockedAchievements.map((item) => (
                  <AchievementCard key={item.id} item={item} locked />
                ))}
              </div>
            )}
          </div>
        </div>
      </BigCard>
    </div>
  )
}

// Secret categories only render once at least one of their badges has been
// earned - and even then, only the earned ones show. An unearned secret
// badge leaves no trace on this screen at all.
function BadgeCategorySection({ category, state }) {
  const categoryBadges = state.badges.filter((badge) => badge.categoryId === category.id)
  const earned = categoryBadges.filter((badge) => hasEarnedBadge(state.badgeAwards, badge.id))
  const locked = categoryBadges.filter((badge) => !hasEarnedBadge(state.badgeAwards, badge.id))

  if (category.secret && earned.length === 0) return null

  return (
    <BigCard title={`🎖️ ${category.label}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {earned.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} award={getBadgeAward(state.badgeAwards, badge.id)} locked={false} />
        ))}
        {!category.secret && locked.map((badge) => <BadgeCard key={badge.id} badge={badge} locked />)}
      </div>
    </BigCard>
  )
}

function BadgeCard({ badge, award, locked }) {
  const level = award?.level

  return (
    <div
      className={`rounded-2xl p-4 text-center space-y-1 border-2 ${
        locked ? 'bg-slate-100 border-slate-200 opacity-60' : `bg-white shadow ${LEVEL_BORDER[level] ?? 'border-neyou-gold'}`
      }`}
    >
      <div className="text-4xl">{locked ? '🔒' : badge.icon || '🏅'}</div>
      <div className="font-extrabold text-neyou-brownDark">{badge.title}</div>
      <div className="text-xs text-neyou-brown">{badge.description}</div>
      {!locked && level && (
        <div className="text-sm font-bold text-neyou-teal">
          {LEVEL_MEDAL[level]} {capitalize(level)}
        </div>
      )}
    </div>
  )
}

function AchievementCard({ item, locked }) {
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
