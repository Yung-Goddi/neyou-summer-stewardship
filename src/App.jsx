import DevTestingPage from './dev/DevTestingPage.jsx'

// Phase 1 stops here: this renders only the developer testing page so the
// engine can be proven out before any real UI (Parent Dashboard, child
// experience, navigation, etc.) is built.
function App() {
  return <DevTestingPage />
}

export default App
