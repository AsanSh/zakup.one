/**
 * Упрощенная версия App.tsx для тестирования
 * Использует SimpleLogin и простую проверку авторизации
 */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import SimpleLogin from './shared/components/SimpleLogin'
import ClientLayout from './client/components/ClientLayout'
import AdminLayout from './admin/components/AdminLayout'

// Компонент для отображения тестовой информации
function TestContent() {
  const { user } = useAuthStore()
  const currentUser = user || (() => {
    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const data = JSON.parse(stored)
        return data.state?.user
      }
    } catch {}
    return null
  })()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        ✅ Успешный вход {currentUser?.is_admin ? 'как администратор' : ''}!
      </h1>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p><strong>Роль:</strong> {currentUser?.is_admin ? 'Администратор' : 'Пользователь'}</p>
        <p><strong>Email:</strong> {currentUser?.email || 'Не указано'}</p>
        <p><strong>Имя:</strong> {currentUser?.full_name || 'Не указано'}</p>
        <p><strong>Компания:</strong> {currentUser?.company || 'Не указано'}</p>
      </div>
      <div className="space-x-2">
        <button
          onClick={() => {
            console.log('📋 LocalStorage:', localStorage)
            console.log('📋 Auth Store:', useAuthStore.getState())
            console.log('📋 Current User:', currentUser)
            alert('Проверьте консоль браузера (F12)')
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔍 Проверить данные в консоли
        </button>
        <button
          onClick={() => {
            localStorage.clear()
            useAuthStore.setState({
              user: null,
              token: null,
              isAuthenticated: false,
            })
            window.location.href = '/login'
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, user, isInitialized } = useAuthStore()

  // Ждем инициализации
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Простая проверка авторизации
  const checkAuth = () => {
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        return data.state?.isAuthenticated && data.state?.user
      } catch {
        return false
      }
    }
    return isAuthenticated && user
  }

  const isAuth = checkAuth()
  const currentUser = user || (() => {
    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const data = JSON.parse(stored)
        return data.state?.user
      }
    } catch {}
    return null
  })()

  console.log('🔍 App render:', { isAuth, isInitialized, user: currentUser })

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Публичные роуты */}
        <Route path="/login" element={!isAuth ? <SimpleLogin /> : <Navigate to="/" replace />} />

        {/* Защищенные роуты */}
        {isAuth && currentUser?.is_admin ? (
          // Админ-панель
          <Route
            path="/*"
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            <Route index element={<TestContent />} />
            <Route path="*" element={<TestContent />} />
          </Route>
        ) : isAuth ? (
          // Клиентская часть
          <Route
            path="/*"
            element={
              <ClientLayout>
                <Outlet />
              </ClientLayout>
            }
          >
            <Route index element={<TestContent />} />
            <Route path="*" element={<TestContent />} />
          </Route>
        ) : (
          // Не авторизован - редирект на логин
          <Route path="/*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  )
}

export default App

