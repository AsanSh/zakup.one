/**
 * Главный роутер приложения
 * Разделение на клиентскую и админскую части
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ClientLayout from './client/components/ClientLayout'
import AdminLayout from './admin/components/AdminLayout'
import Login from './shared/components/Login'
import Register from './shared/components/Register'

// Client pages
import Catalog from './client/pages/Catalog'
import Cart from './client/pages/Cart'
import OrderHistory from './client/pages/OrderHistory'
import OrderCreate from './client/pages/OrderCreate'
import Profile from './client/pages/Profile'

// Admin pages
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminUsers from './admin/pages/AdminUsers'
import AdminOrders from './admin/pages/AdminOrders'
import AdminProducts from './admin/pages/AdminProducts'
import AdminPriceLists from './admin/pages/AdminPriceLists'
import AdminPriceListUpdates from './admin/pages/AdminPriceListUpdates'
import AdminPriceManagement from './admin/pages/AdminPriceManagement'
import AdminCounterparties from './admin/pages/AdminCounterparties'
import AdminSuppliersManagement from './admin/pages/AdminSuppliersManagement'
import AdminUserFinance from './admin/pages/AdminUserFinance'

/**
 * Защищенный роут - требует аутентификации
 * Администраторы перенаправляются в админ-панель
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
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
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  if (!user?.is_admin) {
    return <Navigate to="/search" />
  }
  return <>{children}</>
}

function App() {
  return (
    <Router>
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
          <Route path="search" element={<Catalog />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/create" element={<OrderCreate />} />
          <Route path="profile" element={<Profile />} />
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
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId/finance" element={<AdminUserFinance />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="price-lists" element={<AdminPriceLists />} />
          <Route path="price-lists/management/updates" element={<AdminPriceListUpdates />} />
          <Route path="price-lists/management/prices" element={<AdminPriceManagement />} />
          <Route path="price-lists/management/counterparties" element={<AdminCounterparties />} />
          <Route path="price-lists/management/suppliers" element={<AdminSuppliersManagement />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
