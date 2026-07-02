import { setBadgeAward, getBadgeAward, BADGE_LEVELS } from '../engine/index.js'
import { Card, inputClass } from './ui.jsx'

const LEVEL_OPTIONS = [
  { value: '', label: 'Not earned' },
  { value: BADGE_LEVELS.BRONZE, label: '🥉 Bronze' },
  { value: BADGE_LEVELS.SILVER, label: '🥈 Silver' },
  { value: BADGE_LEVELS.GOLD, label: '🥇 Gold' },
]

// Awarding is fully parent-controlled and deliberately simple: pick a
// level per badge (or "Not earned" to clear it) and it's saved immediately -
// no submission/approval workflow the way Responsibilities/Achievements
// have, since these aren't tied to money. The catalog itself (add/edit/
// delete badges) lives in Manage/Config alongside the other catalogs; this
// screen is just for day-to-day awarding.
export default function BadgesManageScreen({ state, currentOperator, updateBadgeAwards, onError }) {
  function setLevel(badgeId, level) {
    try {
      const awards = setBadgeAward(state.badgeAwards, {
        badgeId,
        level: level || null,
        awardedBy: currentOperator.id,
      })
      updateBadgeAwards(awards, level ? 'Badge awarded.' : 'Badge award cleared.')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        Award a level per badge. To add, edit, or delete badges themselves, use Manage / Config.
      </p>
      {state.badgeCategories.map((category) => (
        <Card
          key={category.id}
          title={category.secret ? `🔒 ${category.label} (hidden from Neyou until earned)` : category.label}
        >
          <ul className="space-y-2">
            {state.badges
              .filter((badge) => badge.categoryId === category.id)
              .map((badge) => {
                const award = getBadgeAward(state.badgeAwards, badge.id)
                return (
                  <li key={badge.id} className="flex items-center justify-between gap-3 bg-slate-800 rounded-xl p-3">
                    <div>
                      <div className="font-medium">
                        {badge.icon} {badge.title}
                      </div>
                      <div className="text-slate-400 text-xs">{badge.description}</div>
                    </div>
                    <select
                      className={`${inputClass} max-w-[160px]`}
                      value={award?.level ?? ''}
                      onChange={(e) => setLevel(badge.id, e.target.value)}
                    >
                      {LEVEL_OPTIONS.map((option) => (
                        <option key={option.value || 'none'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </li>
                )
              })}
          </ul>
        </Card>
      ))}
    </div>
  )
}
