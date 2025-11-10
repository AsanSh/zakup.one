import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { Loader2, DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react'

export default function AdminPriceManagement() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkAction, setBulkAction] = useState({
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    category: '',
    supplier_id: '',
  })
  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const data = await api.admin.getSuppliers()
      setSuppliers(data)
    } catch (err: any) {
      console.error('Ошибка загрузки поставщиков:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await api.admin.getProducts(0, 500)
      setProducts(data)
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkAction.value) {
      alert('Введите значение для изменения цен')
      return
    }

    try {
      const result = await api.admin.bulkUpdatePrices({
        type: bulkAction.type,
        value: parseFloat(bulkAction.value),
        category: bulkAction.category || undefined,
        supplier_id: bulkAction.supplier_id ? parseInt(bulkAction.supplier_id) : undefined,
      })
      alert(`Успешно обновлено цен: ${result.updated_count}`)
      setBulkAction({ type: 'percent', value: '', category: '', supplier_id: '' })
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления цен')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление ценами</h1>

      {/* Массовое изменение цен */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
          Массовое изменение цен
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип изменения</label>
            <select
              value={bulkAction.type}
              onChange={(e) => setBulkAction({ ...bulkAction, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="percent">Процент (%)</option>
              <option value="fixed">Фиксированная сумма (сом)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {bulkAction.type === 'percent' ? 'Процент изменения' : 'Сумма изменения'}
            </label>
            <input
              type="number"
              value={bulkAction.value}
              onChange={(e) => setBulkAction({ ...bulkAction, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder={bulkAction.type === 'percent' ? '10' : '100'}
              step={bulkAction.type === 'percent' ? '0.1' : '0.01'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория (опционально)</label>
            <input
              type="text"
              value={bulkAction.category}
              onChange={(e) => setBulkAction({ ...bulkAction, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Все категории"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поставщик (опционально)</label>
            <select
              value={bulkAction.supplier_id}
              onChange={(e) => setBulkAction({ ...bulkAction, supplier_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Все поставщики</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBulkUpdate}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Применить
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Примеры:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Увеличить все цены на 10%: Тип "Процент", Значение "10"</li>
            <li>Уменьшить все цены на 5%: Тип "Процент", Значение "-5"</li>
            <li>Добавить 100 сом ко всем ценам: Тип "Фиксированная сумма", Значение "100"</li>
          </ul>
        </div>
      </div>

      {/* Статистика по ценам */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средняя цена</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {products.length > 0
                  ? new Intl.NumberFormat('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(
                      products.reduce((sum, p) => sum + p.price, 0) / products.length
                    ) + ' сом'
                  : '-'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Минимальная цена</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {products.length > 0
                  ? new Intl.NumberFormat('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.min(...products.map((p) => p.price))) + ' сом'
                  : '-'}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Максимальная цена</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {products.length > 0
                  ? new Intl.NumberFormat('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.max(...products.map((p) => p.price))) + ' сом'
                  : '-'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

