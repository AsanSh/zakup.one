import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import LoginPage from '../pages/LoginPage'
import HomePage from '../pages/HomePage'
import CustomerDashboard from '../pages/CustomerDashboard'
import ProductsPage from '../pages/ProductsPage'
import CartPage from '../pages/CartPage'
import OrdersPage from '../pages/OrdersPage'
import AdminDashboard from '../pages/AdminDashboard'
import apiClient from '../api/client'

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'CLIENT' }) {
  const { user, token, initialized, initFromStorage } = useUserStore()
  
  useEffect(() => {
    if (!initialized) {
      initFromStorage()
    }
  }, [initialized, initFromStorage])

  // Пока инициализируемся, показываем загрузку
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }
  
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/customer'} replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/customer" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <HomePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customer/products" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <ProductsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <CartPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <OrdersPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App


