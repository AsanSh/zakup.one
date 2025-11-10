/**
 * Универсальный компонент таблицы для админ-панели
 * Поддерживает пагинацию, сортировку, выбор строк
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    pageSize: number
    currentPage: number
    total: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    column: string | null
    direction: 'asc' | 'desc' | null
    onSort: (column: string, direction: 'asc' | 'desc') => void
  }
  selection?: {
    selected: Set<string | number>
    onSelect: (id: string | number) => void
    onSelectAll: () => void
    getRowId: (item: T) => string | number
  }
  actions?: (item: T) => React.ReactNode
  emptyMessage?: string
  className?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  actions,
  emptyMessage = 'Нет данных',
  className = '',
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null)

  const handleSort = (column: string) => {
    if (!sorting) return
    
    if (sorting.column === column) {
      if (sorting.direction === 'asc') {
        sorting.onSort(column, 'desc')
      } else if (sorting.direction === 'desc') {
        sorting.onSort(column, 'asc')
      } else {
        sorting.onSort(column, 'asc')
      }
    } else {
      sorting.onSort(column, 'asc')
    }
  }

  const getSortIcon = (column: string) => {
    if (!sorting || sorting.column !== column) {
      return null
    }
    if (sorting.direction === 'asc') {
      return <ChevronUp className="h-4 w-4 inline-block ml-1" />
    }
    if (sorting.direction === 'desc') {
      return <ChevronDown className="h-4 w-4 inline-block ml-1" />
    }
    return null
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1
  const startIndex = pagination ? (pagination.currentPage - 1) * pagination.pageSize : 0
  const endIndex = pagination ? startIndex + pagination.pageSize : data.length

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.every(item => selection.selected.has(selection.getRowId(item)))}
                    onChange={selection.onSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const rowId = selection ? selection.getRowId(item) : index
              const isSelected = selection ? selection.selected.has(rowId) : false
              const isHovered = hoveredRow === rowId

              return (
                <tr
                  key={rowId}
                  className={`${isSelected ? 'bg-primary-50' : ''} ${isHovered ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`}
                  onMouseEnter={() => setHoveredRow(rowId)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {selection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => selection.onSelect(rowId)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">{startIndex + 1}</span> -{' '}
                <span className="font-medium">{Math.min(endIndex, pagination.total)}</span> из{' '}
                <span className="font-medium">{pagination.total}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1
                  } else if (pagination.currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = pagination.currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === pageNum
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

