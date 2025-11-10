import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { useAuthStore } from './store/authStore'
import './index.css'

// Инициализация auth store - вызываем только один раз
if (!useAuthStore.getState().isInitialized) {
  useAuthStore.getState().init()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

