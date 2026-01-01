import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import VerifyEmailPage from '../pages/VerifyEmailPage'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import CartPage from '../pages/CartPage'
import OrdersPage from '../pages/OrdersPage'
import OrderSuccessPage from '../pages/OrderSuccessPage'
import AdminDashboard from '../pages/AdminDashboard'
import AboutPage from '../pages/AboutPage'
import SubscriptionPage from '../pages/SubscriptionPage'
import TrackingPage from '../pages/TrackingPage'
import ProfilePage from '../pages/ProfilePage'
import ChatPage from '../pages/ChatPage'
import NotificationsPage from '../pages/NotificationsPage'
import InstructionsPage from '../pages/InstructionsPage'
import FAQPage from '../pages/FAQPage'
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
    return <Navigate to={user.role === 'ADMIN' ? '/kojoyun' : '/customer'} replace />
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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/about" element={<AboutPage />} />
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
            path="/orders/:id/success" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <OrderSuccessPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/subscription" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <SubscriptionPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tracking" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <TrackingPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tracking/:orderId" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <TrackingPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <ChatPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/notifications" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <NotificationsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/instructions" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <InstructionsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/faq" 
            element={
              <PrivateRoute requiredRole="CLIENT">
                <FAQPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/kojoyun" 
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Navigate to="/kojoyun" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App


