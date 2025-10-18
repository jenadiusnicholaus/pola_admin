/**
 * Professional number and currency formatters for the application
 * Provides intelligent abbreviation for large values while maintaining precision
 */

/**
 * Format large numbers with intelligent abbreviation
 * @param value - The number to format
 * @returns Formatted string with K/M suffix for large numbers
 *
 * @example
 * formatNumber(7406400) // "7.4M"
 * formatNumber(45678) // "45.7K"
 * formatNumber(999) // "999"
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString('en-TZ')
}

/**
 * Format currency with Tanzanian Shilling (TSh) and intelligent abbreviation
 * @param value - The amount to format (string or number)
 * @returns Formatted currency string with TSh prefix
 *
 * @example
 * formatCurrency(7406400) // "TSh 7.41M"
 * formatCurrency("456789.50") // "TSh 456.79K"
 * formatCurrency(999) // "TSh 999.00"
 */
export const formatCurrency = (value: string | number): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value

  // For large amounts, use abbreviated format
  if (amount >= 1000000) {
    return `TSh ${(amount / 1000000).toFixed(2)}M`
  } else if (amount >= 1000) {
    return `TSh ${(amount / 1000).toFixed(2)}K`
  }

  return `TSh ${amount.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Get full currency value for tooltips (no abbreviation)
 * @param value - The amount to format (string or number)
 * @returns Full currency string with complete precision
 *
 * @example
 * getFullCurrencyValue(7406400) // "TSh 7,406,400.00"
 * getFullCurrencyValue("456789.50") // "TSh 456,789.50"
 */
export const getFullCurrencyValue = (value: string | number): string => {
  const amount = typeof value === 'string' ? parseFloat(value) : value
  return `TSh ${amount.toLocaleString('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Get full number value for tooltips (no abbreviation)
 * @param value - The number to format
 * @returns Full number string with locale formatting
 *
 * @example
 * getFullNumberValue(7406400) // "7,406,400"
 * getFullNumberValue(45678) // "45,678"
 */
export const getFullNumberValue = (value: number): string => {
  return value.toLocaleString('en-TZ')
}

/**
 * Format percentage with fixed decimal places
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(45.678) // "45.7%"
 * formatPercentage(45.678, 2) // "45.68%"
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date in a user-friendly format
 * @param date - Date string or Date object
 * @returns Formatted date string
 *
 * @example
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate(new Date()) // "Jan 15, 2024"
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format datetime in a user-friendly format
 * @param date - Date string or Date object
 * @returns Formatted datetime string
 *
 * @example
 * formatDateTime("2024-01-15T14:30:00") // "Jan 15, 2024 at 2:30 PM"
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format duration in human-readable format
 * @param hours - Duration in hours
 * @returns Human-readable duration string
 *
 * @example
 * formatDuration(1.5) // "1h 30m"
 * formatDuration(48) // "2d"
 * formatDuration(0.5) // "30m"
 */
export const formatDuration = (hours: number): string => {
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days}d`
  } else if (hours >= 1) {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  } else {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Human-readable size string
 *
 * @example
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1048576) // "1.0 MB"
 * formatFileSize(1073741824) // "1.0 GB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`
  } else if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes} B`
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis
 *
 * @example
 * truncateText("Hello World", 5) // "Hello..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber("255712345678") // "+255 71 234 5678"
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Tanzania phone format: +255 XX XXX XXXX
  if (cleaned.length === 12 && cleaned.startsWith('255')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }

  // If not standard format, return original
  return phone
}
