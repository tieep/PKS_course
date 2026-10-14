/**
 * Utility functions for formatting and common display logic
 */

/**
 * Format currency to Vietnamese Dong (VND)
 * @param {number|string} fee
 * @returns {string} e.g. "2.200.000 ₫"
 */
export function formatFee(fee) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(fee || 0))
}

/**
 * Format date string to YYYY-MM-DD according to Asia/Ho_Chi_Minh timezone
 * @param {string|Date} value
 * @returns {string} e.g. "2026-10-14"
 */
export function formatDate(value) {
  if (!value) return '—'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const valueFor = (type) => parts.find((part) => part.type === type)?.value
  return `${valueFor('year')}-${valueFor('month')}-${valueFor('day')}`
}

/**
 * Extract 1-2 letter uppercase initials from a name string
 * @param {string} name
 * @param {string} fallback
 * @returns {string} e.g. "Nguyen Van An" -> "VA", "Le Minh" -> "LM"
 */
export function getInitials(name, fallback = 'U') {
  if (!name || typeof name !== 'string') return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Return Material Symbols icon name based on course category
 * @param {string} category
 * @returns {string} icon name
 */
export function getCategoryIcon(category) {
  const icons = {
    Frontend: 'code',
    Backend: 'dns',
    Fullstack: 'layers',
    Database: 'database',
  }
  return icons[category] || 'terminal'
}

/**
 * Calculate capacity metrics and enrollment availability state
 * @param {number} enrolledCount
 * @param {number} capacityLimit
 * @param {string} enrollmentStatus
 */
export function getCapacityMetrics(enrolledCount, capacityLimit, enrollmentStatus) {
  const count = Number(enrolledCount || 0)
  const capacity = Number(capacityLimit || 20)
  const isFull = enrollmentStatus === 'FULL' || count >= capacity
  const percentage = capacity > 0 ? Math.min(100, Math.round((count / capacity) * 100)) : 0
  const spotsLeft = Math.max(0, capacity - count)
  const isLimited = !isFull && (spotsLeft <= 3 || percentage >= 80)

  return {
    count,
    capacity,
    percentage,
    spotsLeft,
    isFull,
    isLimited,
  }
}
