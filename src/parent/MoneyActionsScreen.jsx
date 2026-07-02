import { useState } from 'react'
import {
  ACCOUNTS,
  TRANSACTION_TYPES,
  DIRECTIONS,
  dollarsToCents,
  formatCents,
  calculateBalance,
  transferBetweenAccounts,
  runWeeklySplit,
  createCorrection,
  createResetToZeroCorrection,
  createSetBalanceCorrection,
  validateTransaction,
  previewNegativeImpact,
} from '../engine/index.js'
import { Card, Field, inputClass, buttonClass, secondaryButtonClass, dangerButtonClass, labelize, confirmWarnings } from './ui.jsx'

const HOME_ACCOUNT_OPTIONS = [ACCOUNTS.SPEND, ACCOUNTS.SAVE, ACCOUNTS.GIVE]
const RECORD_TYPE_OPTIONS = [
  { type: TRANSACTION_TYPES.SPEND, from: ACCOUNTS.SPEND, to: ACCOUNTS.EXTERNAL },
  { type: TRANSACTION_TYPES.SAVE_TRANSFER, from: ACCOUNTS.SPEND, to: ACCOUNTS.SAVE },
  { type: TRANSACTION_TYPES.GIVING, from: ACCOUNTS.GIVE, to: ACCOUNTS.EXTERNAL },
]

export default function MoneyActionsScreen({ state, currentOperator, commitLedger, onError }) {
  return (
    <div className="space-y-6">
      <WeeklySplitCard state={state} currentOperator={currentOperator} commitLedger={commitLedger} onError={onError} />
      <ParentBonusOrDepositCard
        title="Parent Bonus"
        type={TRANSACTION_TYPES.PARENT_BONUS}
        state={state}
        currentOperator={currentOperator}
        commitLedger={commitLedger}
        onError={onError}
      />
      <ParentBonusOrDepositCard
        title="Parent Deposit"
        type={TRANSACTION_TYPES.PARENT_DEPOSIT}
        state={state}
        currentOperator={currentOperator}
        commitLedger={commitLedger}
        onError={onError}
      />
      <ParentWithdrawalCard state={state} currentOperator={currentOperator} commitLedger={commitLedger} onError={onError} />
      <BalanceControlsCard state={state} currentOperator={currentOperator} commitLedger={commitLedger} onError={onError} />
      <RecordTransactionCard state={state} currentOperator={currentOperator} commitLedger={commitLedger} onError={onError} />
      <CorrectionCard state={state} currentOperator={currentOperator} commitLedger={commitLedger} onError={onError} />
    </div>
  )
}

function WeeklySplitCard({ state, currentOperator, commitLedger, onError }) {
  const { settings } = state
  const [totalAmount, setTotalAmount] = useState(String(settings.weeklyIncomeAmount / 100))
  const [spend, setSpend] = useState(String(settings.splitPercentages.spend))
  const [save, setSave] = useState(String(settings.splitPercentages.save))
  const [give, setGive] = useState(String(settings.splitPercentages.give))

  function submit(e) {
    e.preventDefault()
    try {
      const entries = runWeeklySplit({
        ledger: state.ledger,
        totalAmount: dollarsToCents(totalAmount),
        splitPercentages: { spend: Number(spend), save: Number(save), give: Number(give) },
        approvedBy: currentOperator.id,
        notes: 'Weekly income split',
      })
      commitLedger(entries, `Weekly split of ${formatCents(dollarsToCents(totalAmount))} posted.`)
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Run Weekly Split">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Total weekly income (dollars)">
          <input className={inputClass} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Spend %">
            <input className={inputClass} value={spend} onChange={(e) => setSpend(e.target.value)} />
          </Field>
          <Field label="Save %">
            <input className={inputClass} value={save} onChange={(e) => setSave(e.target.value)} />
          </Field>
          <Field label="Give %">
            <input className={inputClass} value={give} onChange={(e) => setGive(e.target.value)} />
          </Field>
        </div>
        <button className={buttonClass} type="submit">
          Run Split
        </button>
      </form>
    </Card>
  )
}

function ParentBonusOrDepositCard({ title, type, state, currentOperator, commitLedger, onError }) {
  const [toAccount, setToAccount] = useState(ACCOUNTS.SPEND)
  const [amount, setAmount] = useState('1.00')
  const [notes, setNotes] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      const pair = transferBetweenAccounts({
        ledger: state.ledger,
        type,
        fromAccount: ACCOUNTS.EXTERNAL,
        toAccount,
        amount: dollarsToCents(amount),
        approvedBy: currentOperator.id,
        notes,
      })
      commitLedger(pair, `${title} of ${formatCents(dollarsToCents(amount))} posted to ${labelize(toAccount)}.`)
      setAmount('1.00')
      setNotes('')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title={title}>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="To account">
          <select className={inputClass} value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
            {HOME_ACCOUNT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {labelize(a)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notes">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button className={buttonClass} type="submit">
          Post {title}
        </button>
      </form>
    </Card>
  )
}

function ParentWithdrawalCard({ state, currentOperator, commitLedger, onError }) {
  const [fromAccount, setFromAccount] = useState(ACCOUNTS.SPEND)
  const [amount, setAmount] = useState('1.00')
  const [notes, setNotes] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      const amountCents = dollarsToCents(amount)
      const impact = previewNegativeImpact(state.ledger, {
        account: fromAccount,
        direction: DIRECTIONS.OUT,
        amount: amountCents,
      })
      if (impact) {
        const warned = confirmWarnings([
          `This takes ${labelize(impact.account)} from ${formatCents(impact.currentBalance)} to ` +
            `${formatCents(impact.resultingBalance)}. Confirm this is an intentional admin override.`,
        ])
        if (!warned) return
      }
      const pair = transferBetweenAccounts({
        ledger: state.ledger,
        type: TRANSACTION_TYPES.PARENT_WITHDRAWAL,
        fromAccount,
        toAccount: ACCOUNTS.EXTERNAL,
        amount: amountCents,
        approvedBy: currentOperator.id,
        notes,
      })
      commitLedger(pair, `Withdrew ${formatCents(amountCents)} from ${labelize(fromAccount)}.`)
      setAmount('1.00')
      setNotes('')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Parent Withdrawal">
      <p className="text-slate-400 text-sm">
        Allowed even if it takes an account below zero - you'll be asked to confirm first.
      </p>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="From account">
          <select className={inputClass} value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
            {HOME_ACCOUNT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {labelize(a)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notes">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button className={buttonClass} type="submit">
          Withdraw
        </button>
      </form>
    </Card>
  )
}

function BalanceControlsCard({ state, currentOperator, commitLedger, onError }) {
  const [targetAccount, setTargetAccount] = useState(ACCOUNTS.SPEND)
  const [targetAmount, setTargetAmount] = useState('0.00')
  const [note, setNote] = useState('')

  function setBalance(e) {
    e.preventDefault()
    try {
      const targetCents = dollarsToCents(targetAmount)
      const entry = createSetBalanceCorrection({
        ledger: state.ledger,
        account: targetAccount,
        targetAmount: targetCents,
        approvedBy: currentOperator.id,
        reason: note.trim() || undefined,
      })
      if (!entry) {
        onError(new Error(`${labelize(targetAccount)} is already ${formatCents(targetCents)}.`))
        return
      }
      const check = validateTransaction(state.ledger, entry)
      if (!confirmWarnings(check.warnings)) return
      commitLedger(entry, `${labelize(targetAccount)} set to ${formatCents(targetCents)}.`)
      setNote('')
    } catch (error) {
      onError(error)
    }
  }

  function resetToZero(account) {
    const current = calculateBalance(state.ledger, account)
    if (current === 0) {
      onError(new Error(`${labelize(account)} is already $0.00.`))
      return
    }
    const warned = confirmWarnings([
      `This resets ${labelize(account)} from ${formatCents(current)} to $0.00 with a correction. Completed chores and badges are not affected.`,
    ])
    if (!warned) return
    const entry = createResetToZeroCorrection({ ledger: state.ledger, account, approvedBy: currentOperator.id })
    commitLedger(entry, `${labelize(account)} reset to $0.00.`)
  }

  function resetAllToZero() {
    const nonZero = HOME_ACCOUNT_OPTIONS.filter((a) => calculateBalance(state.ledger, a) !== 0)
    if (nonZero.length === 0) {
      onError(new Error('Spend, Save, and Give are already $0.00.'))
      return
    }
    const warned = confirmWarnings([
      'This resets Spend, Save, and Give to $0.00 with corrections. Completed chores and badges are not affected.',
    ])
    if (!warned) return
    const entries = nonZero
      .map((account) => createResetToZeroCorrection({ ledger: state.ledger, account, approvedBy: currentOperator.id }))
      .filter(Boolean)
    commitLedger(entries, 'Spend, Save, and Give reset to $0.00.')
  }

  return (
    <Card title="Balance Controls">
      <p className="text-slate-400 text-sm">
        Set an account to an exact balance, or reset it to zero. Both post a Correction to the ledger - completed
        chores, achievements, and badges are never touched.
      </p>
      <form className="space-y-3" onSubmit={setBalance}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Account">
            <select className={inputClass} value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)}>
              {HOME_ACCOUNT_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {labelize(a)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Set balance to (dollars)">
            <input className={inputClass} value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          </Field>
        </div>
        <Field label="Note (optional)">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <button className={buttonClass} type="submit">
          Set Balance
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {HOME_ACCOUNT_OPTIONS.map((a) => (
          <button key={a} type="button" className={secondaryButtonClass} onClick={() => resetToZero(a)}>
            Reset {labelize(a)} to $0
          </button>
        ))}
        <button type="button" className={dangerButtonClass} onClick={resetAllToZero}>
          Reset All to $0
        </button>
      </div>
    </Card>
  )
}

function RecordTransactionCard({ state, currentOperator, commitLedger, onError }) {
  const [choice, setChoice] = useState(RECORD_TYPE_OPTIONS[0])
  const [amount, setAmount] = useState('1.00')
  const [notes, setNotes] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      const pair = transferBetweenAccounts({
        ledger: state.ledger,
        type: choice.type,
        fromAccount: choice.from,
        toAccount: choice.to,
        amount: dollarsToCents(amount),
        approvedBy: currentOperator.id,
        notes,
      })
      commitLedger(pair, `Recorded ${labelize(choice.type)} of ${formatCents(dollarsToCents(amount))}.`)
      setAmount('1.00')
      setNotes('')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Record a Real-World Transaction">
      <p className="text-slate-400 text-sm">
        For a Spend, Save Transfer, or Giving that already happened - e.g. Neyou paid cash at a store.
      </p>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="What happened">
          <select
            className={inputClass}
            value={choice.type}
            onChange={(e) => setChoice(RECORD_TYPE_OPTIONS.find((o) => o.type === e.target.value))}
          >
            {RECORD_TYPE_OPTIONS.map((option) => (
              <option key={option.type} value={option.type}>
                {labelize(option.type)} ({labelize(option.from)} → {labelize(option.to)})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notes">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button className={buttonClass} type="submit">
          Record It
        </button>
      </form>
    </Card>
  )
}

function CorrectionCard({ state, currentOperator, commitLedger, onError }) {
  const [account, setAccount] = useState(ACCOUNTS.SPEND)
  const [direction, setDirection] = useState(DIRECTIONS.IN)
  const [amount, setAmount] = useState('1.00')
  const [reason, setReason] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      const entry = createCorrection({
        account,
        direction,
        amount: dollarsToCents(amount),
        reason,
        approvedBy: currentOperator.id,
      })
      const check = validateTransaction(state.ledger, entry)
      if (!confirmWarnings(check.warnings)) return
      commitLedger(entry, `Correction posted to ${labelize(account)}.`)
      setAmount('1.00')
      setReason('')
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Create Correction">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Account">
          <select className={inputClass} value={account} onChange={(e) => setAccount(e.target.value)}>
            {HOME_ACCOUNT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {labelize(a)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Direction">
          <select className={inputClass} value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value={DIRECTIONS.IN}>In (adds funds)</option>
            <option value={DIRECTIONS.OUT}>Out (removes funds)</option>
          </select>
        </Field>
        <Field label="Amount (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Reason (required)">
          <input className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <button className={buttonClass} type="submit">
          Post Correction
        </button>
      </form>
    </Card>
  )
}
