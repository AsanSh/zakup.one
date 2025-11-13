import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

export default function AdminDrivers() {
  const [loading] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление водителями</h1>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить водителя</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          <p>Функция управления водителями будет реализована в ближайшее время</p>
        </div>
      </div>
    </div>
  )
}

