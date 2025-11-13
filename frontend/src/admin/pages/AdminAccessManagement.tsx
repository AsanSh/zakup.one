import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminAccessManagement() {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление доступом</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          <p>Функция управления доступом для контрагентов будет реализована в ближайшее время</p>
        </div>
      </div>
    </div>
  )
}

