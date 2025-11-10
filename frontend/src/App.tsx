/**
 * Главный роутер приложения
 * Разделение на клиентскую и админскую части
 */
import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ClientLayout from './client/components/ClientLayout'
import AdminLayout from './admin/components/AdminLayout'
import Login from './shared/components/Login'
import Register from './shared/components/Register'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

// Client pages - lazy loading для оптимизации
const Catalog = lazy(() => import('./client/pages/Catalog'))
const Cart = lazy(() => import('./client/pages/Cart'))
const OrderHistory = lazy(() => import('./client/pages/OrderHistory'))
const OrderCreate = lazy(() => import('./client/pages/OrderCreate'))
const Profile = lazy(() => import('./client/pages/Profile'))

// Admin pages - lazy loading для оптимизации
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'))
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'))
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'))
const AdminPriceLists = lazy(() => import('./admin/pages/AdminPriceLists'))
const AdminPriceListUpdates = lazy(() => import('./admin/pages/AdminPriceListUpdates'))
const AdminPriceManagement = lazy(() => import('./admin/pages/AdminPriceManagement'))
const AdminCounterparties = lazy(() => import('./admin/pages/AdminCounterparties'))
const AdminSuppliersManagement = lazy(() => import('./admin/pages/AdminSuppliersManagement'))
const AdminUserFinance = lazy(() => import('./admin/pages/AdminUserFinance'))

/**
 * Защищенный роут - требует аутентификации
 * Администраторы перенаправляются в админ-панель
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  
  // Ждем инициализации перед проверкой
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Если пользователь - администратор, перенаправляем в админ-панель
  if (user?.is_admin) {
    return <Navigate to="/admin" replace />
  }
  
  return <>{children}</>
}

/**
 * Админский роут - требует аутентификации и прав администратора
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  
  // Ждем инициализации перед проверкой
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (!user?.is_admin) {
    return <Navigate to="/search" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Публичные роуты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Клиентские роуты */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/search" replace />} />
          <Route 
            path="search" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Catalog />
              </Suspense>
            } 
          />
          <Route 
            path="cart" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Cart />
              </Suspense>
            } 
          />
          <Route 
            path="orders" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OrderHistory />
              </Suspense>
            } 
          />
          <Route 
            path="orders/create" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OrderCreate />
              </Suspense>
            } 
          />
          <Route 
            path="profile" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            } 
          />
        </Route>

        {/* Админские роуты */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route 
            index 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="users" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminUsers />
              </Suspense>
            } 
          />
          <Route 
            path="users/:userId/finance" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminUserFinance />
              </Suspense>
            } 
          />
          <Route 
            path="orders" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminOrders />
              </Suspense>
            } 
          />
          <Route 
            path="products" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminProducts />
              </Suspense>
            } 
          />
          <Route 
            path="price-lists" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminPriceLists />
              </Suspense>
            } 
          />
          <Route 
            path="price-lists/management/updates" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminPriceListUpdates />
              </Suspense>
            } 
          />
          <Route 
            path="price-lists/management/prices" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminPriceManagement />
              </Suspense>
            } 
          />
          <Route 
            path="price-lists/management/counterparties" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminCounterparties />
              </Suspense>
            } 
          />
          <Route 
            path="price-lists/management/suppliers" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminSuppliersManagement />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
