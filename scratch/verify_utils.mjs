/**
 * Phase 6 slice 2 verification — prove the swapped utilities behave identically.
 *
 * Lifts the original implementations out of the pre-swap backup and compares them
 * against the src/ modules across a wide input range, including the boundaries of
 * every suffix tier in NUMBER_UNITS.
 *
 * Run:  node scratch/verify_utils.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const backup = fs.readFileSync(path.join(root, 'scratch/backup/main.js.phase6-utils.bak'), 'utf8');

function sliceConstArray(text, name) {
  const re = new RegExp(`^ {2}const ${name} = \\[`, 'm');
  const m = re.exec(text);
  let depth = 0;
  let started = false;
  for (let j = text.indexOf('[', m.index); j < text.length; j++) {
    if (text[j] === '[') { depth++; started = true; }
    else if (text[j] === ']') { if (started && --depth === 0) return text.slice(m.index, j + 1); }
  }
  throw new Error(`${name} not found`);
}
function sliceFn(text, name) {
  const re = new RegExp(`^ {2}function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  let depth = 0;
  let started = false;
  for (let j = text.indexOf('{', m.index); j < text.length; j++) {
    if (text[j] === '{') { depth++; started = true; }
    else if (text[j] === '}') { if (started && --depth === 0) return text.slice(m.index, j + 1); }
  }
  throw new Error(`${name} not found`);
}

const original = new Function(`
  ${sliceConstArray(backup, 'NUMBER_UNITS')};
  ${sliceFn(backup, 'formatNumber')}
  ${sliceFn(backup, 'parseNumberInput')}
  ${sliceFn(backup, 'setNumContent')}
  return { formatNumber, parseNumberInput, setNumContent, NUMBER_UNITS };
`)();

const fmt = await import('../src/utils/format.js');
const dom = await import('../src/utils/dom.js');

// ------------------------------------------------------------------ inputs
const NUMBERS = [
  0, 1, -1, 7, 99, 999, 1000, 1500, 9999, 10000, 10499, 12345, 999999, 1e6, 1.5e6,
  1e9, 1.23e9, 1e12, 5e14, 1e15, 9.99e15, 1e18, 1e21, 1e24, 1e30, 1e60, 1e99, 1e100, 1e103,
  -1500, -1e9, 0.5, 12.34, 1e-7, NaN
];

// `formatNumber(±Infinity)` used to overflow the stack in BOTH copies: the Googol
// branch recursed without a finite guard, forever, because Infinity passes the
// 1e100 threshold test and stays Infinity when divided by it. That was fixed on
// purpose, so ±Infinity are excluded from the parity list and asserted as an
// INTENTIONAL divergence below. NaN stays in the list: it never matched any
// threshold and its output is unchanged.
const attempt = (fn) => {
  try { return { ok: true, v: fn() }; }
  catch (e) { return { ok: false, e: e.constructor.name }; }
};

console.log('--- formatNumber ---');
let bad = 0;
for (const n of NUMBERS) {
  const a = JSON.stringify(attempt(() => original.formatNumber(n)));
  const b = JSON.stringify(attempt(() => fmt.formatNumber(n)));
  if (a !== b) { bad++; if (bad <= 4) console.log(`      ${n}: old=${a} new=${b}`); }
}
check(`formatNumber identical across ${NUMBERS.length} inputs`, bad === 0, `${bad} mismatches`);

// ---------------------------------------------------- INTENTIONAL DIVERGENCE
// The legacy copy still crashes here; the fixed copy returns a finite string.
// Asserted explicitly so that "they differ" is a recorded decision rather than a
// quietly skipped input.
console.log('--- formatNumber non-finite (intentional divergence) ---');
{
  const o = attempt(() => original.formatNumber(Infinity));
  const nw = attempt(() => fmt.formatNumber(Infinity));
  check('legacy formatNumber(Infinity) crashes — the bug being fixed',
    o.ok === false, `old=${JSON.stringify(o)}`);
  check('fixed formatNumber(Infinity) returns a finite string',
    nw.ok === true && nw.v.short === '∞' && nw.v.full === '∞', `new=${JSON.stringify(nw)}`);

  // -Infinity did NOT crash in the legacy copy. The Googol guard is `val >= 1000`,
  // and -Infinity fails it, so it fell through to a garbage suffix instead:
  // "-Infinity Googol". Only +Infinity recursed. Both endings are recorded here so
  // the divergence is explicit rather than a silently dropped input.
  const oNeg = attempt(() => original.formatNumber(-Infinity));
  const nwNeg = attempt(() => fmt.formatNumber(-Infinity));
  check('legacy formatNumber(-Infinity) produced a garbage suffix, not a crash',
    oNeg.ok === true && oNeg.v.short === '-Infinity Googol', `old=${JSON.stringify(oNeg)}`);
  check('fixed formatNumber(-Infinity) returns -∞',
    nwNeg.ok === true && nwNeg.v.short === '-∞' && nwNeg.v.full === '-∞', `new=${JSON.stringify(nwNeg)}`);

  const oNaN = attempt(() => original.formatNumber(NaN));
  const nwNaN = attempt(() => fmt.formatNumber(NaN));
  check('formatNumber(NaN) unchanged by the guard',
    JSON.stringify(oNaN) === JSON.stringify(nwNaN), `old=${JSON.stringify(oNaN)} new=${JSON.stringify(nwNaN)}`);
}

// string / nullish coercion paths
console.log('--- formatNumber coercion ---');
let bad2 = 0;
for (const v of ['1500', 'abc', '', null, undefined, {}, [], true]) {
  const a = JSON.stringify(original.formatNumber(v));
  const b = JSON.stringify(fmt.formatNumber(v));
  if (a !== b) { bad2++; console.log(`      ${JSON.stringify(v)}: old=${a} new=${b}`); }
}
check('formatNumber identical for non-number inputs', bad2 === 0, `${bad2} mismatches`);

// ---------------------------------------------------------- parseNumberInput
console.log('--- parseNumberInput ---');
const INPUTS = ['0', '5', '1.5', '1K', '1k', '2M', '3.5B', '1T', '1Qa', '1Qi', '1Sx', '1Sp', '1Oc',
  '1No', '1Dc', '1Ud', '1Dd', '1Td', '1Qad', '1Qid', '1Sxd', '1Spd', '1Ocd', '1Nod', '1Vg',
  '1Uvg', '1Dvg', '1Tvg', '1Qavg', '1Qivg', '1Sxvg', '1Spvg', '1Ocvg', '1Novg', '1Tg', '1Utg',
  '1Dtg', '1Googol', '', 'abc', 'K', '1.5.5', '  7  ', '-3K', '1e5'];
let bad3 = 0;
for (const v of INPUTS) {
  const a = JSON.stringify(original.parseNumberInput(v));
  const b = JSON.stringify(fmt.parseNumberInput(v));
  if (a !== b) { bad3++; if (bad3 <= 4) console.log(`      ${JSON.stringify(v)}: old=${a} new=${b}`); }
}
check(`parseNumberInput identical across ${INPUTS.length} inputs`, bad3 === 0, `${bad3} mismatches`);

// --------------------------------------------------------------- setNumContent
console.log('--- setNumContent ---');
let bad4 = 0;
const mkEl = () => ({ textContent: null, title: null });
for (const n of NUMBERS) {
  // setNumContent delegates to formatNumber. ±Infinity are excluded from NUMBERS
  // because they are now an intentional divergence, asserted separately below.
  const ea = mkEl(); const eb = mkEl();
  const a = JSON.stringify(attempt(() => original.setNumContent(ea, n))) + JSON.stringify(ea);
  const b = JSON.stringify(attempt(() => dom.setNumContent(eb, n))) + JSON.stringify(eb);
  if (a !== b) {
    bad4++;
    if (bad4 <= 4) console.log(`      ${n}: old=${a} new=${b}`);
  }
}
// null element must be a no-op, not a throw
let threw = null;
try { dom.setNumContent(null, 1000); } catch (e) { threw = e.message; }
check('setNumContent identical across inputs', bad4 === 0, `${bad4} mismatches`);
check('setNumContent(null) is a no-op', threw === null, `threw: ${threw}`);
// The formatNumber guard means setNumContent now survives ±Infinity as well.
check('setNumContent(Infinity) writes a string instead of overflowing',
  (() => { const e = mkEl(); dom.setNumContent(e, Infinity); return e.textContent === '∞' && e.title === '∞'; })());
// NB: the suffix tiers start at 10,000, not 1,000 — 1500 formats as "1,500".
check('setNumContent writes short + full title',
  (() => { const e = mkEl(); dom.setNumContent(e, 15000); return e.textContent === '15K' && e.title === '15,000'; })());
check('setNumContent below 10,000 keeps the comma form',
  (() => { const e = mkEl(); dom.setNumContent(e, 1500); return e.textContent === '1,500' && e.title === '1,500'; })());

// --------------------------------------------------------------- formatPlaytime
// Deferred in slice 2 because main.js wrapped its early return in braces. The
// token diff said "2 braces apart"; verify that behaviourally before swapping.
console.log('--- formatPlaytime ---');
const originalPlaytime = new Function(`
  ${sliceFn(backup, 'formatPlaytime')}
  return formatPlaytime;
`)();
const SECONDS = [0, 1, 59, 60, 61, 119, 120, 599, 3599, 3600, 3601, 3661, 7199, 7200, 35999,
  86399, 86400, 90061, 360000, 8640000, 0.5, 1.9, 59.9, 60.5, -1, -3600, -0.5,
  NaN, Infinity, -Infinity, undefined, null, 0, '120', 'abc', '', {}, []];
let badP = 0;
for (const s of SECONDS) {
  const a = JSON.stringify(attempt(() => originalPlaytime(s)));
  const b = JSON.stringify(attempt(() => dom.formatPlaytime(s)));
  if (a !== b) { badP++; if (badP <= 4) console.log(`      ${String(s)}: old=${a} new=${b}`); }
}
check(`formatPlaytime identical across ${SECONDS.length} inputs`, badP === 0, `${badP} mismatches`);
check('formatPlaytime samples look right',
  dom.formatPlaytime(0) === '0m 0s' && dom.formatPlaytime(3661) === '1h 1m 1s' && dom.formatPlaytime(90) === '1m 30s');

// ------------------------------------------------------------------- exports
console.log('--- module surface ---');
check('NUMBER_UNITS exported from src/utils/format.js',
  Array.isArray(fmt.NUMBER_UNITS) && fmt.NUMBER_UNITS.length === JSON.parse(JSON.stringify(original.NUMBER_UNITS)).length);

console.log('');
console.log(failures === 0 ? 'UTILITY SWAP VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
