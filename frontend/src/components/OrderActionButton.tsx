import { ReactNode } from 'react'
import Tooltip from './Tooltip'

interface OrderActionButtonProps {
  icon: ReactNode
  label: string
  description: string
  tooltip: string
  onClick: () => void
  fileInputId?: string
  accept?: string
  capture?: 'environment' | 'user'
  onFileChange?: (file: File) => void
}

export default function OrderActionButton({
  icon,
  label,
  description,
  tooltip,
  onClick,
  fileInputId,
  accept,
  capture,
  onFileChange,
}: OrderActionButtonProps) {
  const handleClick = () => {
    if (fileInputId) {
      document.getElementById(fileInputId)?.click()
    } else {
      onClick()
    }
  }

  return (
    <Tooltip content={tooltip}>
      <div className="w-full min-w-0">
        <button
          type="button"
          onClick={handleClick}
          className="group w-full p-4 sm:p-5 bg-white border border-gray-200 rounded-lg hover:border-[#4A6CF7] hover:shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] focus:ring-offset-2 cursor-pointer"
          aria-label={label}
        >
          <div className="flex flex-col items-center text-center space-y-3 w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-[#EEF2F7] group-hover:bg-[#4A6CF7]/10 transition-colors duration-200 flex-shrink-0">
              <div className="text-[#4A6CF7] group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
            </div>
            <div className="space-y-1 min-w-0 w-full max-w-full">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 group-hover:text-[#4A6CF7] transition-colors duration-200 break-words whitespace-normal">
                {label}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words whitespace-normal">
                {description}
              </p>
            </div>
          </div>
        </button>
        {fileInputId && (
          <input
            id={fileInputId}
            type="file"
            accept={accept}
            capture={capture}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && onFileChange) {
                onFileChange(file)
              }
            }}
          />
        )}
      </div>
    </Tooltip>
  )
}

