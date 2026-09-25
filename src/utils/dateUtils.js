/**
 * Formats a date string or timestamp into Indonesian long date format.
 * Example: '2026-09-24' -> '24 September 2026'
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
