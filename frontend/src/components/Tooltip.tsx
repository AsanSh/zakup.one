import { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('top')
  const [style, setStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      // Небольшая задержка для правильного измерения после рендера
      const timeoutId = setTimeout(() => {
        if (!tooltipRef.current || !triggerRef.current) return
        
        const tooltip = tooltipRef.current
        const trigger = triggerRef.current
        const triggerRect = trigger.getBoundingClientRect()
        
        // Принудительно измеряем tooltip
        const originalDisplay = tooltip.style.display
        const originalVisibility = tooltip.style.visibility
        const originalPosition = tooltip.style.position
        tooltip.style.display = 'block'
        tooltip.style.visibility = 'hidden'
        tooltip.style.position = 'fixed'
        const tooltipRect = tooltip.getBoundingClientRect()
        tooltip.style.display = originalDisplay
        tooltip.style.visibility = originalVisibility
        tooltip.style.position = originalPosition
        
        // Находим модальное окно
        const modal = trigger.closest('[role="dialog"]')
        const modalContent = modal?.querySelector('.relative') as HTMLElement
        const modalRect = modalContent?.getBoundingClientRect() || modal?.getBoundingClientRect()
        
        if (!modalRect) return
        
        // Вычисляем доступное пространство
        const spaceAbove = triggerRect.top - modalRect.top
        const spaceBelow = modalRect.bottom - triggerRect.bottom
        const tooltipHeight = tooltipRect.height + 12
        
        // Определяем позицию
        let newPosition: 'top' | 'bottom' = 'top'
        
        if (spaceAbove >= tooltipHeight) {
          newPosition = 'top'
        } else if (spaceBelow >= tooltipHeight) {
          newPosition = 'bottom'
        } else {
          newPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
        }
        
        // Вычисляем позицию tooltip
        const triggerCenterX = triggerRect.left + triggerRect.width / 2
        const tooltipWidth = tooltipRect.width
        let tooltipLeft = triggerCenterX - tooltipWidth / 2
        
        // Проверяем границы модального окна
        const modalLeft = modalRect.left
        const modalRight = modalRect.right
        const padding = 20
        
        if (tooltipLeft < modalLeft + padding) {
          tooltipLeft = modalLeft + padding
        } else if (tooltipLeft + tooltipWidth > modalRight - padding) {
          tooltipLeft = modalRight - padding - tooltipWidth
        }
        
        // Вычисляем top/bottom позицию
        let tooltipTop = 0
        let finalPosition = newPosition
        
        if (newPosition === 'top') {
          tooltipTop = triggerRect.top - tooltipRect.height - 8
        } else {
          tooltipTop = triggerRect.bottom + 8
        }
        
        // Убеждаемся, что tooltip не выходит за границы viewport
        const viewportPadding = 8
        if (tooltipTop < viewportPadding) {
          // Если не помещается сверху, пробуем снизу
          if (newPosition === 'top' && spaceBelow >= tooltipRect.height + 12) {
            tooltipTop = triggerRect.bottom + 8
            finalPosition = 'bottom'
          } else {
            tooltipTop = viewportPadding
          }
        } else if (tooltipTop + tooltipRect.height > window.innerHeight - viewportPadding) {
          // Если не помещается снизу, пробуем сверху
          if (newPosition === 'bottom' && spaceAbove >= tooltipRect.height + 12) {
            tooltipTop = triggerRect.top - tooltipRect.height - 8
            finalPosition = 'top'
          } else {
            tooltipTop = window.innerHeight - tooltipRect.height - viewportPadding
          }
        }
        
        setPosition(finalPosition)
        setStyle({
          left: `${tooltipLeft}px`,
          top: `${tooltipTop}px`,
          transform: 'none',
        })
      }, 10)
      
      return () => clearTimeout(timeoutId)
    } else {
      setStyle({})
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={style}
          className="fixed z-[60] px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-normal max-w-[220px] text-center pointer-events-none"
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 ${
              position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'
            }`}
          />
        </div>
      )}
    </>
  )
}

