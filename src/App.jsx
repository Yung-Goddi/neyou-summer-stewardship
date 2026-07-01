import ParentApp from './parent/ParentApp.jsx'

// Phase 2: the Parent Dashboard (PIN gate, operator picker, approvals,
// money actions, Future snapshot, manage/config). No child-facing UI yet -
// see src/dev/DevTestingPage.jsx for the raw engine testing screen this
// replaced as the default view.
function App() {
  return <ParentApp />
}

export default App
