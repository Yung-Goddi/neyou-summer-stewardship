import { useState } from 'react'
import { dollarsToCents, formatCents } from '../engine/index.js'
import { createMoneyRequest, getRequestRoute } from '../engine/moneyRequests.js'
import { BigCard, Field, inputClass, bigButtonClass, BackButton } from './childUi.jsx'

const COPY = {
  spend: { title: 'I Want to Spend', emoji: '🛍️', verb: 'spend' },
  save_transfer: { title: 'Move to Save', emoji: '🐷', verb: 'move to Save' },
  giving: { title: 'I Want to Give', emoji: '💝', verb: 'give' },
}

// Submitting here never touches the ledger - it only appends a 'pending'
// approval event. A parent has to approve it from the Approvals screen
// before any money actually moves (see moneyRequests.js).
export default function MoneyRequestScreen({ requestType, balances, childOperator, commitApprovals, onError, onHome }) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const copy = COPY[requestType]
  const { fromAccount } = getRequestRoute(requestType)

  function submit(e) {
    e.preventDefault()
    try {
      const request = createMoneyRequest({
        type: requestType,
        amount: dollarsToCents(amount || '0'),
        notes,
        requestedBy: childOperator?.id ?? null,
      })
      commitApprovals(request, `Sent! Waiting for approval to ${copy.verb} ${formatCents(request.payload.amount)}.`)
      onHome()
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-sky-50 to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      <BigCard title={`${copy.emoji} ${copy.title}`}>
        <p className="text-slate-500 text-lg">
          You have {formatCents(balances[fromAccount])} to {copy.verb === 'move to Save' ? 'move' : copy.verb}.
        </p>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="How much? ($)">
            <input
              className={inputClass}
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field label="What for?">
            <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <button className={`${bigButtonClass} w-full bg-amber-400 text-amber-950`} type="submit">
            Ask Mom or Dad
          </button>
        </form>
      </BigCard>
    </div>
  )
}
