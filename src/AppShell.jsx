import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateAllBalances, appendToLedger } from './engine/index.js'
import { appendToApprovals } from './engine/approvals.js'
import {
  loadState,
  saveState,
  resetState,
  exportStateToJSON,
  importStateFromJSON,
  autosave,
} from './storage/storage.js'
import { buildSeedState } from './data/seed.js'
import ParentApp from './parent/ParentApp.jsx'
import ChildApp from './child/ChildApp.jsx'

// Owns the one root state object and everything that touches it, so
// switching between the child screens and the (PIN-gated) parent
// dashboard never risks seeing stale data - both read from and write to
// the same in-memory state, autosaved to localStorage from one place.
export default function AppShell() {
  const [state, setState] = useState(null)
  const [mode, setMode] = useState('child')
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const seedDefaults = buildSeedState()
    setState(loadState(seedDefaults) ?? seedDefaults)
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

  function updateBadgeCategories(badgeCategories, successMessage) {
    setState((prev) => ({ ...prev, badgeCategories }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateBadges(badges, successMessage) {
    setState((prev) => ({ ...prev, badges }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateBadgeAwards(badgeAwards, successMessage) {
    setState((prev) => ({ ...prev, badgeAwards }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateInitialBalances(initialBalances, successMessage) {
    setState((prev) => ({ ...prev, initialBalances }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateGivingCategories(givingCategories, successMessage) {
    setState((prev) => ({ ...prev, givingCategories }))
    if (successMessage) setMessage({ tone: 'success', text: successMessage })
  }

  function updateSavingsGoal(savingsGoal, successMessage) {
    setState((prev) => ({ ...prev, savingsGoal }))
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
        const imported = importStateFromJSON(reader.result, buildSeedState())
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

  function switchToParent() {
    setMessage(null)
    setMode('parent')
  }

  function switchToChild() {
    setMessage(null)
    setMode('child')
  }

  if (!state) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 p-6 text-lg">Loading...</div>
  }

  const shared = {
    state,
    balances,
    message,
    commitLedger,
    commitApprovals,
    commitLedgerAndApprovals,
    updateSettings,
    updateOperators,
    updateResponsibilities,
    updateAchievements,
    updateBadgeCategories,
    updateBadges,
    updateBadgeAwards,
    updateInitialBalances,
    updateGivingCategories,
    updateSavingsGoal,
    onError: fail,
  }

  if (mode === 'parent') {
    return (
      <ParentApp
        {...shared}
        onExitToChild={switchToChild}
        onExport={handleExport}
        onImportClick={() => fileInputRef.current?.click()}
        onReset={handleReset}
        fileInputRef={fileInputRef}
        onImportFile={handleImportFile}
      />
    )
  }

  return <ChildApp {...shared} onSwitchToParent={switchToParent} />
}
