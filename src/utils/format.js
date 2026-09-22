/**
 * Number formatting utilities.
 * Extracted verbatim from js/config.js — no logic changed.
 */

/** Extended unit table up to Googol (10^100) */
export const NUMBER_UNITS = [
  { threshold: 1e100, suffix: " Googol" },
  { threshold: 1e99,  suffix: "Dtg" },
  { threshold: 1e96,  suffix: "Utg" },
  { threshold: 1e93,  suffix: "Tg" },
  { threshold: 1e90,  suffix: "Novg" },
  { threshold: 1e87,  suffix: "Ocvg" },
  { threshold: 1e84,  suffix: "Spvg" },
  { threshold: 1e81,  suffix: "Sxvg" },
  { threshold: 1e78,  suffix: "Qivg" },
  { threshold: 1e75,  suffix: "Qavg" },
  { threshold: 1e72,  suffix: "Tvg" },
  { threshold: 1e69,  suffix: "Dvg" },
  { threshold: 1e66,  suffix: "Uvg" },
  { threshold: 1e63,  suffix: "Vg" },
  { threshold: 1e60,  suffix: "Nod" },
  { threshold: 1e57,  suffix: "Ocd" },
  { threshold: 1e54,  suffix: "Spd" },
  { threshold: 1e51,  suffix: "Sxd" },
  { threshold: 1e48,  suffix: "Qid" },
  { threshold: 1e45,  suffix: "Qad" },
  { threshold: 1e42,  suffix: "Td" },
  { threshold: 1e39,  suffix: "Dd" },
  { threshold: 1e36,  suffix: "Ud" },
  { threshold: 1e33,  suffix: "Dc" },
  { threshold: 1e30,  suffix: "No" },
  { threshold: 1e27,  suffix: "Oc" },
  { threshold: 1e24,  suffix: "Sp" },
  { threshold: 1e21,  suffix: "Sx" },
  { threshold: 1e18,  suffix: "Qi" },
  { threshold: 1e15,  suffix: "Qa" },
  { threshold: 1e12,  suffix: "T" },
  { threshold: 1e9,   suffix: "B" },
  { threshold: 1e6,   suffix: "M" },
  { threshold: 1e3,   suffix: "K" }
];

/**
 * Format a number into a short readable string (e.g. 1500 → "1.5K").
 * Returns { short, full } where `full` is the comma-formatted integer.
 */
export function formatNumber(num) {
  const n = typeof num === "number" ? num : (parseFloat(num) || 0);
  // Non-finite values were a stack overflow: ±Infinity satisfies `abs >= threshold
  // * 0.9995` at the very first (1e100 / Googol) entry, where the Googol branch
  // calls formatNumber(val) with val still Infinity — recursing forever. It is not
  // reachable in normal play, but a HUD formatter that blows the stack gives no
  // clue which value was bad. NaN is unaffected in output: it never matched any
  // threshold and already produced the literal "NaN".
  if (!Number.isFinite(n)) {
    const s = Number.isNaN(n) ? "NaN" : (n > 0 ? "∞" : "-∞");
    return { short: s, full: s };
  }
  const abs = Math.abs(n);
  const full = abs < 1e15
    ? Math.round(n).toLocaleString()
    : (abs <= 1e21 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : n.toExponential(2));

  if (abs < 10000) return { short: full, full };

  for (let i = 0; i < NUMBER_UNITS.length; i++) {
    const { threshold, suffix } = NUMBER_UNITS[i];
    if (abs >= threshold * 0.9995) {
      const val = n / threshold;
      if (threshold === 1e100 && val >= 1000) {
        const gShort = formatNumber(val).short;
        return { short: `${gShort} Googol`, full };
      }
      const display = val < 100
        ? val.toFixed(1).replace(/\.0$/, "")
        : (val < 1000 ? Math.round(val).toString() : val.toFixed(0));
      return { short: display + suffix, full };
    }
  }
  return { short: full, full };
}

/**
 * Parse a human-readable number string (e.g. "1.5K", "3B") back to a number.
 */
export function parseNumberInput(val) {
  if (typeof val === "number") return val;
  if (!val && val !== 0) return 0;
  const raw = String(val).trim();
  if (raw === "") return 0;

  const lower = raw.toLowerCase().replace(/,/g, "");

  if (lower.includes("googol")) {
    const numPart = parseFloat(lower.replace(/googol/g, "").trim());
    return (isNaN(numPart) || numPart === 0 ? 1 : numPart) * 1e100;
  }

  for (const { threshold, suffix } of NUMBER_UNITS) {
    const s = suffix.trim().toLowerCase();
    if (s && lower.endsWith(s)) {
      const numPart = parseFloat(lower.slice(0, -s.length).trim());
      return (isNaN(numPart) || numPart === 0 ? 1 : numPart) * threshold;
    }
  }

  const n = Number(lower);
  if (!isNaN(n)) return n;
  const f = parseFloat(lower);
  return isNaN(f) ? 0 : f;
}
