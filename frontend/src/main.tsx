import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { useUserStore } from './store/userStore'
import './index.css'

// Инициализируем store при загрузке
useUserStore.getState().initFromStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


