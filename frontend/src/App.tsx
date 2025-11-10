import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderCreate from './pages/OrderCreate'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminPriceLists from './pages/admin/AdminPriceLists'
import AdminPriceListUpdates from './pages/admin/AdminPriceListUpdates'
import AdminPriceManagement from './pages/admin/AdminPriceManagement'
import AdminCounterparties from './pages/admin/AdminCounterparties'
import AdminSuppliersManagement from './pages/admin/AdminSuppliersManagement'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<Search />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/create" element={<OrderCreate />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Outlet />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="price-lists" element={<AdminPriceLists />} />
            <Route path="price-lists/management/updates" element={<AdminPriceListUpdates />} />
            <Route path="price-lists/management/prices" element={<AdminPriceManagement />} />
            <Route path="price-lists/management/counterparties" element={<AdminCounterparties />} />
            <Route path="price-lists/management/suppliers" element={<AdminSuppliersManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App

