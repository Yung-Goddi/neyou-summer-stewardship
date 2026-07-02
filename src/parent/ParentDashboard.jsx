import { ACCOUNTS, formatCents, sortLedgerByTimestamp } from '../engine/index.js'
import { getApprovalStatus } from '../engine/approvals.js'
import { Card, labelize, todayISO } from './ui.jsx'

const NAV_TILES = [
  { view: 'approvals', label: 'Approvals', hint: "Today's responsibilities & achievements" },
  { view: 'money', label: 'Money Actions', hint: 'Split, bonus, deposit, withdrawal, correction' },
  { view: 'future', label: 'Future Account', hint: 'Record a statement snapshot' },
  { view: 'badges', label: 'Badges', hint: 'Award Bronze/Silver/Gold levels' },
  { view: 'manage', label: 'Manage / Config', hint: 'Settings, operators, catalog, PIN' },
]

export default function ParentDashboard({ state, balances, onNavigate }) {
  const today = todayISO()
  const todosLeft = countOpenItems(state, today)
  const recent = sortLedgerByTimestamp(state.ledger, 'desc').slice(0, 8)

  return (
    <div className="space-y-6">
      <Card title="Balances">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: ACCOUNTS.SPEND, label: 'Spend' },
            { key: ACCOUNTS.SAVE, label: 'Save' },
            { key: ACCOUNTS.GIVE, label: 'Give' },
            { key: ACCOUNTS.FUTURE, label: 'Future' },
            { key: ACCOUNTS.EXTERNAL, label: 'External' },
          ].map((row) => (
            <div key={row.key} className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400">{row.label}</div>
              <div
                className={`text-xl font-bold ${balances[row.key] < 0 ? 'text-red-400' : ''}`}
              >
                {formatCents(balances[row.key])}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NAV_TILES.map((tile) => (
          <button
            key={tile.view}
            onClick={() => onNavigate(tile.view)}
            className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-400 transition-colors"
          >
            <div className="text-lg font-semibold">{tile.label}</div>
            <div className="text-slate-400 text-sm mt-1">{tile.hint}</div>
            {tile.view === 'approvals' && todosLeft > 0 && (
              <div className="mt-3 inline-block bg-amber-400 text-slate-950 text-xs font-bold px-2 py-1 rounded-full">
                {todosLeft} open today
              </div>
            )}
          </button>
        ))}
      </div>

      <Card title="Recent activity">
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recent.map((entry) => (
              <li key={entry.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{labelize(entry.type)}</div>
                  <div className="text-slate-400">
                    {labelize(entry.account)} · {entry.direction} · {entry.notes || 'no notes'}
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-semibold">{formatCents(entry.amount)}</div>
                  <div className="text-slate-500 text-xs">{entry.timestamp.slice(0, 10)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function countOpenItems(state, date) {
  const respOpen = state.responsibilities.filter(
    (r) => getApprovalStatus(state.approvals, 'responsibility', r.id, date) !== 'approved'
  ).length
  const achOpen = state.achievements.filter(
    (a) => getApprovalStatus(state.approvals, 'achievement', a.id, date) !== 'approved'
  ).length
  return respOpen + achOpen
}
