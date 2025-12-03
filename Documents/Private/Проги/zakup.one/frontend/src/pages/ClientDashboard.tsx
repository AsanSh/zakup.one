import { useEffect } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductsPage from './ProductsPage'

export default function ClientDashboard() {
  const navigate = useNavigate()
  
  // Редирект на главную страницу клиента
  useEffect(() => {
    navigate('/customer', { replace: true })
  }, [navigate])

  return <ProductsPage />
}


