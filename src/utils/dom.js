/**
 * DOM utility helpers.
 * Small shared utilities extracted from js/main.js.
 */
import { formatNumber } from './format.js';

/**
 * Set an element's textContent to a shortened number,
 * and put the full comma-formatted value in the title tooltip.
 * @param {HTMLElement|null} el
 * @param {number} num
 */
export function setNumContent(el, num) {
  if (!el) return;
  const f = formatNumber(num);
  el.textContent = f.short;
  el.title = f.full;
}

/**
 * Format a total-seconds value into a human-readable duration string.
 * @param {number} totalSeconds
 * @returns {string}  e.g. "2h 14m 7s" or "14m 7s"
 */
export function formatPlaytime(totalSeconds) {
  const totalSec = Math.floor(totalSeconds || 0);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Query an element by ID, logging a warning if not found.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function qs(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[DOM] Element #${id} not found`);
  return el;
}
