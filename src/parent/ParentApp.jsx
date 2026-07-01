import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateAllBalances, appendToLedger } from '../engine/index.js'
import { appendToApprovals } from '../engine/approvals.js'
import {
  loadState,
  saveState,
  resetState,
  exportStateToJSON,
  importStateFromJSON,
  autosave,
} from '../storage/storage.js'
import { buildSeedState } from '../data/seed.js'
import PinGate from './PinGate.jsx'
import OperatorPicker from './OperatorPicker.jsx'
import ParentDashboard from './ParentDashboard.jsx'
import ApprovalsScreen from './ApprovalsScreen.jsx'
import MoneyActionsScreen from './MoneyActionsScreen.jsx'
import FutureSnapshotScreen from './FutureSnapshotScreen.jsx'
import ManageConfigScreen from './ManageConfigScreen.jsx'
import { Toast } from './ui.jsx'

const NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'approvals', label: 'Approvals' },
  { view: 'money', label: 'Money' },
  { view: 'future', label: 'Future' },
  { view: 'manage', label: 'Manage' },
]

export default function ParentApp() {
  const [state, setState] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [currentOperator, setCurrentOperator] = useState(null)
  const [view, setView] = useState('dashboard')
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setState(loadState() ?? buildSeedState())
  }, [])

  useEffect(() => {
    if (state) autosave(state)
  }, [state])

  const balances = useMemo(() => (state ? calculateAllBalances(state.ledger) : null), [state])

  function fail(error) {
    setMessage({ tone: 'error', text: error.message || String(error) })
  }

  function commitLedger(newEntries, successMessage) {
    setState((prev) => ({ ...prev, ledger: appendToLedger(prev.ledger, newEntries) }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function commitApprovals(newEvents, successMessage) {
    setState((prev) => ({ ...prev, approvals: appendToApprovals(prev.approvals, newEvents) }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function commitLedgerAndApprovals(newLedgerEntries, newApprovalEvents, successMessage) {
    setState((prev) => ({
      ...prev,
      ledger: newLedgerEntries.length ? appendToLedger(prev.ledger, newLedgerEntries) : prev.ledger,
      approvals: appendToApprovals(prev.approvals, newApprovalEvents),
    }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateSettings(patch, successMessage) {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateOperators(operators, successMessage) {
    setState((prev) => ({ ...prev, operators }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateResponsibilities(responsibilities, successMessage) {
    setState((prev) => ({ ...prev, responsibilities }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateAchievements(achievements, successMessage) {
    setState((prev) => ({ ...prev, achievements }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
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

  function lock() {
    setUnlocked(false)
    setCurrentOperator(null)
    setView('dashboard')
    setMessage(null)
  }

  if (!state) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 p-6 text-lg">Loading...</div>
  }

  if (!unlocked) {
    return <PinGate pinHash={state.settings.parentPinHash} onUnlock={() => setUnlocked(true)} />
  }

  if (!currentOperator) {
    return <OperatorPicker operators={state.operators} onSelect={setCurrentOperator} />
  }

  const screenProps = {
    state,
    balances,
    currentOperator,
    commitLedger,
    commitApprovals,
    commitLedgerAndApprovals,
    updateSettings,
    updateOperators,
    updateResponsibilities,
    updateAchievements,
    onError: fail,
    onNavigate: setView,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Neyou Summer Stewardship — Parent Dashboard</h1>
          <p className="text-slate-400 text-sm">Signed in as {currentOperator.name}</p>
        </div>
        <button
          onClick={lock}
          className="min-h-[44px] rounded-lg bg-slate-800 border border-slate-700 px-4 text-sm font-semibold hover:bg-slate-700"
        >
          Lock
        </button>
      </header>

      <nav className="border-b border-slate-800 px-4 sm:px-5 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`min-h-[48px] px-4 text-sm font-semibold border-b-2 whitespace-nowrap ${
              view === item.view
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
        {message && <Toast message={message} />}

        {view === 'dashboard' && <ParentDashboard {...screenProps} />}
        {view === 'approvals' && <ApprovalsScreen {...screenProps} />}
        {view === 'money' && <MoneyActionsScreen {...screenProps} />}
        {view === 'future' && <FutureSnapshotScreen {...screenProps} />}
        {view === 'manage' && (
          <ManageConfigScreen
            {...screenProps}
            onExport={handleExport}
            onImportClick={() => fileInputRef.current?.click()}
            onReset={handleReset}
            fileInputRef={fileInputRef}
            onImportFile={handleImportFile}
          />
        )}
      </main>
    </div>
  )
}
