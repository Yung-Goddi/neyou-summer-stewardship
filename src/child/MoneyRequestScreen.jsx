import { useState } from 'react'
import { dollarsToCents, formatCents, TRANSACTION_TYPES } from '../engine/index.js'
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
export default function MoneyRequestScreen({ state, requestType, balances, childOperator, commitApprovals, onError, onHome }) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState(null)
  const copy = COPY[requestType]
  const { fromAccount } = getRequestRoute(requestType)
  const isGiving = requestType === TRANSACTION_TYPES.GIVING

  function submit(e) {
    e.preventDefault()
    try {
      const request = createMoneyRequest({
        type: requestType,
        amount: dollarsToCents(amount || '0'),
        notes,
        category: isGiving ? category : null,
        requestedBy: childOperator?.id ?? null,
      })
      commitApprovals(request, `Sent! Waiting for approval to ${copy.verb} ${formatCents(request.payload.amount)}.`)
      onHome()
    } catch (error) {
      onError(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neyou-cream via-white to-white p-4 sm:p-6 space-y-6">
      <BackButton onClick={onHome} />

      <BigCard title={`${copy.emoji} ${copy.title}`}>
        <p className="text-neyou-brown text-lg">
          You have {formatCents(balances[fromAccount])} to {copy.verb === 'move to Save' ? 'move' : copy.verb}.
        </p>
        <form className="space-y-4" onSubmit={submit}>
          {isGiving && (
            <Field label="Who is this for?">
              <div className="grid grid-cols-2 gap-2">
                {state.givingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`min-h-[56px] rounded-2xl font-bold text-base border-2 ${
                      category === cat.label
                        ? 'bg-neyou-pink text-white border-neyou-pink'
                        : 'bg-white text-neyou-brownDark border-neyou-tan/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="How much? ($)">
            <input
              className={inputClass}
              inputMode="decimal"
              autoFocus={!isGiving}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </Field>
          <Field label="What for?">
            <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <button className={`${bigButtonClass} w-full bg-neyou-gold text-neyou-brownDark`} type="submit">
            Ask Mom or Dad
          </button>
        </form>
      </BigCard>
    </div>
  )
}
