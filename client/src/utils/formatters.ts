/**
 * Format currency amount in Indian Rupees (INR)
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format standard date
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Truncate long strings with ellipsis
 */
export function truncate(text: string, length = 30): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

