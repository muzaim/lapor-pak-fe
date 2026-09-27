/**
 * Formats a date string or timestamp into Indonesian long date format with 24-hour time.
 * Example: '2026-09-27T19:18:00' -> '27 September 2026 Jam 19:18 WIB'
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const cleanInput = typeof dateInput === 'string' ? dateInput.replace(' ', 'T') : dateInput;
  const date = new Date(cleanInput);
  if (isNaN(date.getTime())) return '-';

  const datePart = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${datePart} Jam ${hours}:${minutes} WIB`;
}
