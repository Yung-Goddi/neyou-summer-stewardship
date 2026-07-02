import { useState } from 'react'
import PinGate from './PinGate.jsx'
import OperatorPicker from './OperatorPicker.jsx'
import ParentDashboard from './ParentDashboard.jsx'
import ApprovalsScreen from './ApprovalsScreen.jsx'
import MoneyActionsScreen from './MoneyActionsScreen.jsx'
import FutureSnapshotScreen from './FutureSnapshotScreen.jsx'
import BadgesManageScreen from './BadgesManageScreen.jsx'
import ManageConfigScreen from './ManageConfigScreen.jsx'
import { Toast } from './ui.jsx'

const NAV_ITEMS = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'approvals', label: 'Approvals' },
  { view: 'money', label: 'Money' },
  { view: 'future', label: 'Future' },
  { view: 'badges', label: 'Badges' },
  { view: 'manage', label: 'Manage' },
]

// PIN gate, operator picker, and the tabbed dashboard itself. All of the
// actual state lives in AppShell - this component only owns UI state
// (unlocked, currentOperator, which tab is showing).
export default function ParentApp({ state, onExitToChild, ...shared }) {
  const [unlocked, setUnlocked] = useState(false)
  const [currentOperator, setCurrentOperator] = useState(null)
  const [view, setView] = useState('dashboard')

  function lock() {
    setUnlocked(false)
    setCurrentOperator(null)
    setView('dashboard')
    onExitToChild()
  }

  if (!unlocked) {
    return <PinGate pinHash={state.settings.parentPinHash} onUnlock={() => setUnlocked(true)} />
  }

  if (!currentOperator) {
    return <OperatorPicker operators={state.operators} onSelect={setCurrentOperator} />
  }

  const screenProps = { state, currentOperator, onNavigate: setView, ...shared }

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
        {shared.message && <Toast message={shared.message} />}

        {view === 'dashboard' && <ParentDashboard {...screenProps} />}
        {view === 'approvals' && <ApprovalsScreen {...screenProps} />}
        {view === 'money' && <MoneyActionsScreen {...screenProps} />}
        {view === 'future' && <FutureSnapshotScreen {...screenProps} />}
        {view === 'badges' && <BadgesManageScreen {...screenProps} />}
        {view === 'manage' && <ManageConfigScreen {...screenProps} />}
      </main>
    </div>
  )
}
