import { useState } from 'react'

export interface OrderFilters {
  dateRange: 'today' | 'week' | 'month' | 'year' | 'custom' | 'all'
  startDate?: string
  endDate?: string
  status?: string
  category?: string
  deliveryAddress?: string
}

interface OrderFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  availableStatuses: string[]
  availableCategories: string[]
  availableAddresses: string[]
}

export default function OrderFilters({
  filters,
  onFiltersChange,
  availableStatuses,
  availableCategories,
  availableAddresses,
}: OrderFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleDateRangeChange = (range: OrderFilters['dateRange']) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
      startDate: range === 'custom' ? filters.startDate : undefined,
      endDate: range === 'custom' ? filters.endDate : undefined,
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Фильтр по времени */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Период
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { value: 'all', label: 'Все' },
                { value: 'today', label: 'Сегодня' },
                { value: 'week', label: 'Неделя' },
                { value: 'month', label: 'Месяц' },
                { value: 'year', label: 'Год' },
                { value: 'custom', label: 'Период' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDateRangeChange(option.value as OrderFilters['dateRange'])}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    filters.dateRange === option.value
                      ? 'bg-[#4A6CF7] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
                />
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
                />
              </div>
            )}
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
            >
              <option value="">Все статусы</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по категории */}
          {availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория товаров
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => onFiltersChange({ ...filters, category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
              >
                <option value="">Все категории</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Фильтр по адресу */}
          {availableAddresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес доставки
              </label>
              <select
                value={filters.deliveryAddress || ''}
                onChange={(e) => onFiltersChange({ ...filters, deliveryAddress: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
              >
                <option value="">Все адреса</option>
                {availableAddresses.map((address) => (
                  <option key={address} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Кнопка сброса фильтров */}
          <div className="flex justify-end">
            <button
              onClick={() => onFiltersChange({ dateRange: 'all' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
