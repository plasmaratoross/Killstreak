/**
 * Line-circle collision detection utility.
 * Extracted verbatim from Game.checkLineCircleCollision in js/game.js.
 */

/**
 * Returns true if the line segment (x1,y1)→(x2,y2) intersects
 * a circle centered at (cx,cy) with radius r.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @returns {boolean}
 */
export function checkLineCircleCollision(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(cx - x1, cy - y1) <= r;

  let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;
  return Math.hypot(cx - nearestX, cy - nearestY) <= r;
}
