import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useShipStore } from './store/useShipStore'
import { useConfigStore } from './store/useConfigStore'
import { useGameStore } from './store/useGameStore'

function initializeApp() {
  useShipStore.getState().loadSavedData()
  useConfigStore.getState().loadSavedConfig()
  useGameStore.getState().loadHistory()
}

initializeApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
