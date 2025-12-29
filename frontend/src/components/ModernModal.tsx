import React from 'react'

interface ModernModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function ModernModal({ isOpen, onClose, title, message, type }: ModernModalProps) {
  if (!isOpen) return null

  const icon = type === 'success' ? (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : type === 'error' ? (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const iconBgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100'
  const iconColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600'
  const buttonColor = type === 'success' ? 'bg-green-600 hover:bg-green-700' : type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mb-4">
          <div className={`rounded-full p-3 ${iconBgColor} ${iconColor}`}>
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{title}</h3>
        <p className="text-sm text-gray-600 text-center whitespace-pre-line mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 ${buttonColor} text-white font-semibold rounded-lg transition-colors shadow-md w-full sm:w-auto`}
          >
            OK
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

