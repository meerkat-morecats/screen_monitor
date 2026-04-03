import './App.css'
import { AppShell } from './app/AppShell'
import { BreakOverlayWindow } from './features/overlay/components/BreakOverlayWindow'
import { createTauriBridge } from './services/tauri/client'

const tauriBridge = createTauriBridge()

function App() {
  if (tauriBridge.currentWindowLabel === 'break-overlay') {
    return <BreakOverlayWindow />
  }

  return <AppShell />
}

export default App
