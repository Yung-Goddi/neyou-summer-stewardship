import AppShell from './AppShell.jsx'

// Phase 3: the child-facing screens are now the default view, with a
// small link over to the PIN-gated Parent Dashboard (see AppShell.jsx for
// how state is shared between the two). No badges/gamification or
// money-practice screens yet - see src/dev/DevTestingPage.jsx for the raw
// engine testing screen this replaced as the very first default view.
function App() {
  return <AppShell />
}

export default App
