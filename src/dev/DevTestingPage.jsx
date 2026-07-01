import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ACCOUNTS,
  TRANSACTION_TYPES,
  DIRECTIONS,
  dollarsToCents,
  formatCents,
  calculateAllBalances,
  createTransaction,
  validateTransaction,
  transferBetweenAccounts,
  runWeeklySplit,
  createCorrection,
  createFutureSnapshot,
  appendToLedger,
  sortLedgerByTimestamp,
} from '../engine/index.js'
import { loadState, saveState, resetState, exportStateToJSON, importStateFromJSON, autosave } from '../storage/storage.js'
import { buildSeedState } from '../data/seed.js'

const ACCOUNT_OPTIONS = Object.values(ACCOUNTS)
const TRANSACTION_TYPE_OPTIONS = Object.values(TRANSACTION_TYPES)
const TRANSFER_TYPE_OPTIONS = [
  TRANSACTION_TYPES.WEEKLY_INCOME,
  TRANSACTION_TYPES.ACHIEVEMENT_REWARD,
  TRANSACTION_TYPES.PARENT_BONUS,
  TRANSACTION_TYPES.SPEND,
  TRANSACTION_TYPES.SAVE_TRANSFER,
  TRANSACTION_TYPES.GIVING,
  TRANSACTION_TYPES.PARENT_DEPOSIT,
  TRANSACTION_TYPES.PARENT_WITHDRAWAL,
]

function labelize(value) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function DevTestingPage() {
  const [state, setState] = useState(null)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setState(loadState() ?? buildSeedState())
  }, [])

  useEffect(() => {
    if (state) autosave(state)
  }, [state])

  const balances = useMemo(() => (state ? calculateAllBalances(state.ledger) : null), [state])
  const sortedLedger = useMemo(
    () => (state ? sortLedgerByTimestamp(state.ledger, 'desc') : []),
    [state]
  )

  function commit(newEntries, successMessage) {
    setState((prev) => ({ ...prev, ledger: appendToLedger(prev.ledger, newEntries) }))
    setMessage({ tone: 'success', text: successMessage })
  }

  function fail(error) {
    setMessage({ tone: 'error', text: error.message || String(error) })
  }

  function handleExport() {
    const json = exportStateToJSON(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neyou-stewardship-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'success', text: 'Exported current state to a JSON file.' })
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importStateFromJSON(reader.result)
        setState(imported)
        saveState(imported)
        setMessage({ tone: 'success', text: 'Imported state and saved it.' })
      } catch (error) {
        fail(error)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function handleReset() {
    if (!window.confirm('Reset all stewardship data back to the seed data? This clears localStorage.')) {
      return
    }
    resetState()
    setState(buildSeedState())
    setMessage({ tone: 'success', text: 'Reset to seed data.' })
  }

  if (!state) {
    return <div className="p-6 text-lg">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Stewardship Engine — Developer Testing Page</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Temporary screen for exercising the ledger engine directly. Not the final interface.
        </p>
      </header>

      {message && (
        <div
          className={`rounded-xl p-4 text-base ${
            message.tone === 'error' ? 'bg-red-950 text-red-200 border border-red-800' : 'bg-emerald-950 text-emerald-200 border border-emerald-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <BalancesPanel balances={balances} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RawTransactionForm
          operators={state.operators}
          onSubmit={(entry) => {
            const check = validateTransaction(state.ledger, entry)
            if (!check.valid) {
              fail(new Error(check.errors.join(' ')))
              return
            }
            commit(entry, `Added ${labelize(entry.type)} entry to ${entry.account}.`)
          }}
          onError={fail}
        />

        <TransferForm
          ledger={state.ledger}
          operators={state.operators}
          onSubmit={(params) => {
            const pair = transferBetweenAccounts({ ledger: state.ledger, ...params })
            commit(pair, `Transferred ${formatCents(params.amount)} from ${params.fromAccount} to ${params.toAccount}.`)
          }}
          onError={fail}
        />

        <WeeklySplitForm
          settings={state.settings}
          operators={state.operators}
          onSubmit={(params) => {
            const entries = runWeeklySplit({ ledger: state.ledger, ...params })
            commit(entries, `Ran weekly split of ${formatCents(params.totalAmount)}.`)
          }}
          onError={fail}
        />

        <CorrectionForm
          operators={state.operators}
          onSubmit={(params) => {
            const entry = createCorrection(params)
            commit(entry, `Correction posted to ${params.account}.`)
          }}
          onError={fail}
        />

        <FutureSnapshotForm
          operators={state.operators}
          onSubmit={(params) => {
            const entry = createFutureSnapshot(params)
            commit(entry, `Future account snapshot recorded: ${formatCents(params.amount)}.`)
          }}
          onError={fail}
        />

        <PersistencePanel
          onExport={handleExport}
          onImportClick={() => fileInputRef.current?.click()}
          onReset={handleReset}
          fileInputRef={fileInputRef}
          onImportFile={handleImportFile}
        />
      </div>

      <LedgerTable entries={sortedLedger} />
    </div>
  )
}

function Card({ title, children }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-slate-400">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full min-h-[44px] rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400'
const buttonClass =
  'w-full min-h-[48px] rounded-lg bg-amber-400 text-slate-950 font-semibold text-base px-4 py-2 hover:bg-amber-300 active:bg-amber-500'

function BalancesPanel({ balances }) {
  const rows = [
    { key: ACCOUNTS.SPEND, label: 'Spend' },
    { key: ACCOUNTS.SAVE, label: 'Save' },
    { key: ACCOUNTS.GIVE, label: 'Give' },
    { key: ACCOUNTS.FUTURE, label: 'Future (latest snapshot)' },
    { key: ACCOUNTS.EXTERNAL, label: 'External (outside world)' },
  ]
  return (
    <Card title="Balances (calculated from the ledger, never stored)">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rows.map((row) => (
          <div key={row.key} className="bg-slate-800 rounded-xl p-3 text-center">
            <div className="text-xs text-slate-400">{row.label}</div>
            <div className="text-xl font-bold">{formatCents(balances[row.key])}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function OperatorSelect({ operators, value, onChange }) {
  return (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">(none)</option>
      {operators.map((op) => (
        <option key={op.id} value={op.id}>
          {op.name} ({op.role})
        </option>
      ))}
    </select>
  )
}

function RawTransactionForm({ operators, onSubmit, onError }) {
  const [type, setType] = useState(TRANSACTION_TYPES.SPEND)
  const [account, setAccount] = useState(ACCOUNTS.SPEND)
  const [direction, setDirection] = useState(DIRECTIONS.OUT)
  const [amount, setAmount] = useState('1.00')
  const [notes, setNotes] = useState('')
  const [approvedBy, setApprovedBy] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      const entry = createTransaction({
        type,
        account,
        direction,
        amount: dollarsToCents(amount),
        notes,
        approvedBy: approvedBy || null,
      })
      onSubmit(entry)
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Add Raw Ledger Entry (any type, single leg)">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Transaction type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {TRANSACTION_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {labelize(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Account">
          <select className={inputClass} value={account} onChange={(e) => setAccount(e.target.value)}>
            {ACCOUNT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {labelize(a)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Direction">
          <select className={inputClass} value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value={DIRECTIONS.IN}>In</option>
            <option value={DIRECTIONS.OUT}>Out</option>
          </select>
        </Field>
        <Field label="Amount (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notes (required for Correction)">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Field label="Approved by">
          <OperatorSelect operators={operators} value={approvedBy} onChange={setApprovedBy} />
        </Field>
        <button className={buttonClass} type="submit">
          Add Entry
        </button>
      </form>
    </Card>
  )
}

function TransferForm({ operators, onSubmit, onError }) {
  const [type, setType] = useState(TRANSACTION_TYPES.SPEND)
  const [fromAccount, setFromAccount] = useState(ACCOUNTS.SPEND)
  const [toAccount, setToAccount] = useState(ACCOUNTS.EXTERNAL)
  const [amount, setAmount] = useState('1.00')
  const [notes, setNotes] = useState('')
  const [approvedBy, setApprovedBy] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit({
        type,
        fromAccount,
        toAccount,
        amount: dollarsToCents(amount),
        notes,
        approvedBy: approvedBy || null,
      })
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Move Money Between Accounts">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Transaction type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {TRANSFER_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {labelize(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From account">
          <select className={inputClass} value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
            {ACCOUNT_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {labelize(a)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To account">
          <select className={inputClass} value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
            {ACCOUNT_OPTIONS.map((a) => (
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
        <Field label="Approved by">
          <OperatorSelect operators={operators} value={approvedBy} onChange={setApprovedBy} />
        </Field>
        <button className={buttonClass} type="submit">
          Transfer
        </button>
      </form>
    </Card>
  )
}

function WeeklySplitForm({ settings, operators, onSubmit, onError }) {
  const [totalAmount, setTotalAmount] = useState(String(settings.weeklyIncomeAmount / 100))
  const [spend, setSpend] = useState(String(settings.splitPercentages.spend))
  const [save, setSave] = useState(String(settings.splitPercentages.save))
  const [give, setGive] = useState(String(settings.splitPercentages.give))
  const [approvedBy, setApprovedBy] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit({
        totalAmount: dollarsToCents(totalAmount),
        splitPercentages: { spend: Number(spend), save: Number(save), give: Number(give) },
        approvedBy: approvedBy || null,
      })
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
        <Field label="Approved by">
          <OperatorSelect operators={operators} value={approvedBy} onChange={setApprovedBy} />
        </Field>
        <button className={buttonClass} type="submit">
          Run Split
        </button>
      </form>
    </Card>
  )
}

function CorrectionForm({ operators, onSubmit, onError }) {
  const [account, setAccount] = useState(ACCOUNTS.SPEND)
  const [direction, setDirection] = useState(DIRECTIONS.IN)
  const [amount, setAmount] = useState('1.00')
  const [reason, setReason] = useState('')
  const [approvedBy, setApprovedBy] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit({
        account,
        direction,
        amount: dollarsToCents(amount),
        reason,
        approvedBy: approvedBy || null,
      })
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Create Correction">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Account">
          <select className={inputClass} value={account} onChange={(e) => setAccount(e.target.value)}>
            {ACCOUNT_OPTIONS.map((a) => (
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
        <Field label="Approved by">
          <OperatorSelect operators={operators} value={approvedBy} onChange={setApprovedBy} />
        </Field>
        <button className={buttonClass} type="submit">
          Post Correction
        </button>
      </form>
    </Card>
  )
}

function FutureSnapshotForm({ operators, onSubmit, onError }) {
  const [amount, setAmount] = useState('5000.00')
  const [notes, setNotes] = useState('')
  const [approvedBy, setApprovedBy] = useState('')

  function submit(e) {
    e.preventDefault()
    try {
      onSubmit({
        amount: dollarsToCents(amount),
        notes,
        approvedBy: approvedBy || null,
      })
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Card title="Update Future Account (statement snapshot)">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Statement value (dollars)">
          <input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Notes">
          <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Field label="Approved by">
          <OperatorSelect operators={operators} value={approvedBy} onChange={setApprovedBy} />
        </Field>
        <button className={buttonClass} type="submit">
          Record Snapshot
        </button>
      </form>
    </Card>
  )
}

function PersistencePanel({ onExport, onImportClick, onReset, fileInputRef, onImportFile }) {
  return (
    <Card title="Storage">
      <div className="space-y-3">
        <button className={buttonClass} onClick={onExport} type="button">
          Export JSON
        </button>
        <button className={buttonClass} onClick={onImportClick} type="button">
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImportFile}
        />
        <button
          className="w-full min-h-[48px] rounded-lg bg-red-600 text-white font-semibold text-base px-4 py-2 hover:bg-red-500"
          onClick={onReset}
          type="button"
        >
          Reset to Seed Data
        </button>
      </div>
    </Card>
  )
}

function LedgerTable({ entries }) {
  return (
    <Card title={`Ledger (${entries.length} entries, newest first)`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Type</th>
              <th className="p-2">Account</th>
              <th className="p-2">Dir</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Approved By</th>
              <th className="p-2">Transfer Id</th>
              <th className="p-2">Batch Id</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-900">
                <td className="p-2 whitespace-nowrap">{entry.timestamp}</td>
                <td className="p-2 whitespace-nowrap">{labelize(entry.type)}</td>
                <td className="p-2">{labelize(entry.account)}</td>
                <td className="p-2">{entry.direction}</td>
                <td className="p-2 text-right whitespace-nowrap">{formatCents(entry.amount)}</td>
                <td className="p-2 max-w-xs truncate" title={entry.notes}>
                  {entry.notes}
                </td>
                <td className="p-2 whitespace-nowrap">{entry.approvedBy ?? ''}</td>
                <td className="p-2 whitespace-nowrap text-slate-500">{entry.transferId ?? ''}</td>
                <td className="p-2 whitespace-nowrap text-slate-500">{entry.batchId ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
