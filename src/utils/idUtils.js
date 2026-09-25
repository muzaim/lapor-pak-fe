/**
 * Utility functions for URL ID handling and normalization.
 * Returns clean database IDs for URL routing and API requests.
 */

export function encodeId(id) {
  if (id === null || id === undefined || id === '') return '';
  return id;
}

export function decodeId(encoded) {
  if (encoded === null || encoded === undefined || encoded === '') return '';
  const str = String(encoded).trim();

  // Strategy 1: Direct numeric ID (e.g. 21, "21", 20, "20")
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Strategy 2: Ticket code format (e.g. "LP000021" -> 21, "RP000020" -> 20)
  const ticketMatch = str.match(/^(?:LP|RP)?0*(\d+)$/i);
  if (ticketMatch && ticketMatch[1]) {
    return parseInt(ticketMatch[1], 10);
  }

  return str;
}
