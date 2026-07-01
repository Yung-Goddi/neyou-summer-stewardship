import { useState } from 'react'
import { ACCOUNTS, TRANSACTION_TYPES, dollarsToCents, formatCents, createFutureSnapshot, sortLedgerByTimestamp } from '../engine/index.js'
import { Card, Field, inputClass, buttonClass } from './ui.jsx'

export default function FutureSnapshotScreen({ state, balances, currentOperator, commitLedger, onError }) {
  const [amount, setAmount] = useState(String(balances[ACCOUNTS.FUTURE] / 100))
  const [notes, setNotes] = useState('')

  const history = sortLedgerByTimestamp(
    state.ledger.filter((e) => e.type === TRANSACTION_TYPES.FUTURE_ACCOUNT_SNAPSHOT),
    'desc'
  )

  function submit(e) {
    e.preventDefault()
    try {
      const entry = createFutureSnapshot({
        amount: dollarsToCents(amount),
        notes,
        approvedBy: currentOperator.id,
      })
      commitLedger(entry, `Future account snapshot recorded: ${formatCents(dollarsToCents(amount))}.`)
      setNotes('')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Future Account">
        <div className="bg-slate-800 rounded-xl p-4 text-center">
          <div className="text-xs text-slate-400">Current value (latest snapshot)</div>
          <div className="text-3xl font-bold">{formatCents(balances[ACCOUNTS.FUTURE])}</div>
        </div>
        <p className="text-slate-400 text-sm">
          The Future account isn't moved through this app - it's a real 529 or custodial account
          tracked separately. Record its statement value here whenever you check it; the most recent
          snapshot is always what shows as the balance.
        </p>
      </Card>

      <Card title="Record a New Snapshot">
        <form className="space-y-3" onSubmit={submit}>
          <Field label="Statement value (dollars)">
            <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Notes">
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 529 statement, July 2026"
            />
          </Field>
          <button className={buttonClass} type="submit">
            Record Snapshot
          </button>
        </form>
      </Card>

      <Card title="Snapshot History">
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">No snapshots recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {history.map((entry) => (
              <li key={entry.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="text-slate-400">{entry.timestamp.slice(0, 10)}</div>
                  <div className="text-slate-500 text-xs">{entry.notes || 'no notes'}</div>
                </div>
                <div className="font-semibold">{formatCents(entry.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
