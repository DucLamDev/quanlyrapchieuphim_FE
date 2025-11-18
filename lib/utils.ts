import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function getDayOfWeek(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Invalid Date'
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dateObj.getDay()]
  } catch (error) {
    return 'Invalid Date'
  }
}

export function getMovieDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getCrowdLevelColor(level: string): string {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getCrowdLevelText(level: string): string {
  switch (level) {
    case 'low':
      return 'Vắng'
    case 'medium':
      return 'Trung bình'
    case 'high':
      return 'Đông'
    default:
      return 'Không xác định'
  }
}

export function getAgeRatingColor(rating: string): string {
  switch (rating) {
    case 'P':
      return 'bg-green-500'
    case 'K':
      return 'bg-blue-500'
    case 'T13':
      return 'bg-yellow-500'
    case 'T16':
      return 'bg-orange-500'
    case 'T18':
      return 'bg-red-500'
    case 'C':
      return 'bg-red-700'
    default:
      return 'bg-gray-500'
  }
}

export function getLoyaltyTierColor(tier: string): string {
  switch (tier) {
    case 'bronze':
      return 'bg-orange-700 text-white'
    case 'silver':
      return 'bg-gray-400 text-white'
    case 'gold':
      return 'bg-yellow-500 text-white'
    case 'platinum':
      return 'bg-purple-600 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function generateSeatLayout(rows: number, cols: number) {
  const layout = []
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 1; j <= cols; j++) {
      row.push({
        row: rowLabels[i],
        number: j,
        type: 'standard',
        status: 'available'
      })
    }
    layout.push(row)
  }
  
  return layout
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function isToday(date: string | Date): boolean {
  const today = new Date()
  const checkDate = new Date(date)
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

export function isTomorrow(date: string | Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const checkDate = new Date(date)
  
  return (
    checkDate.getDate() === tomorrow.getDate() &&
    checkDate.getMonth() === tomorrow.getMonth() &&
    checkDate.getFullYear() === tomorrow.getFullYear()
  )
}
