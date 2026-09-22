/**
 * Phase 6, slice 2 gate — are the utilities still duplicated in js/main.js
 * identical to the ones already extracted into src/?
 *
 * Phase 1/6 had already created src/utils/format.js, src/utils/dom.js and
 * src/ui/toast.js, but js/main.js kept its own copies, so those modules were
 * dead code. Before swapping them in, prove each pair is the same logic.
 *
 * Compares code with comments stripped, whitespace collapsed and blank lines
 * dropped, so formatting differences do not create false negatives.
 *
 * Run:  node scratch/compare_ui_utils.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const strip = (s) => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  // trailing line comments too — the NUMBER_UNITS rows carry annotations like
  // `{ threshold: 1e99, suffix: "Dtg" }, // Duotrigintillion`
  .replace(/\/\/.*$/gm, '');

// Token-level: collapse ALL whitespace, newlines included, so a ternary that is
// wrapped differently across lines (or an early-return rewrite) is compared on
// its actual tokens rather than its formatting.
const norm = (s) => strip(s).replace(/\s+/g, ' ').trim();

/** body of `function NAME(...) {` / `export function NAME(...) {` by brace match */
function bodyOf(text, name, exported) {
  const re = new RegExp(`^ {0,2}(?:export )?function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  let i = text.indexOf('{', m.index);
  let depth = 0;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (c === '{') depth++;
    else if (c === '}') { if (--depth === 0) return text.slice(i + 1, j); }
  }
  return null;
}

/** top-level `const NAME = [` ... `];` */
function constArrayOf(text, name) {
  // main.js declares these inside its IIFE, so allow leading indentation
  const re = new RegExp(`^ {0,2}(?:export )?const ${name} = \\[`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  let i = text.indexOf('[', m.index);
  let depth = 0;
  for (let j = i; j < text.length; j++) {
    if (text[j] === '[') depth++;
    else if (text[j] === ']') { if (--depth === 0) return text.slice(i + 1, j); }
  }
  return null;
}

const main = read('js/main.js');
const fmt = read('src/utils/format.js');
const dom = read('src/utils/dom.js');
const toast = read('src/ui/toast.js');

const CASES = [
  { kind: 'fn', name: 'formatNumber', src: fmt },
  { kind: 'fn', name: 'parseNumberInput', src: fmt },
  { kind: 'fn', name: 'formatPlaytime', src: dom },
  { kind: 'fn', name: 'setNumContent', src: dom },
  { kind: 'fn', name: 'showToast', src: toast },
  { kind: 'arr', name: 'NUMBER_UNITS', src: fmt }
];

let identical = 0;
let differ = 0;
let missing = 0;

for (const c of CASES) {
  const a = c.kind === 'fn' ? bodyOf(main, c.name) : constArrayOf(main, c.name);
  const b = c.kind === 'fn' ? bodyOf(c.src, c.name) : constArrayOf(c.src, c.name);

  if (a === null || b === null) {
    missing++;
    console.log(`MISSING  ${c.name.padEnd(18)} main=${a === null ? 'absent' : 'ok'} src=${b === null ? 'absent' : 'ok'}`);
    continue;
  }

  const na = norm(a);
  const nb = norm(b);
  if (na === nb) {
    identical++;
    console.log(`SAME     ${c.name.padEnd(18)} (${na.length} chars normalised)`);
  } else {
    differ++;
    // report the first differing token index
    const ta = na.split(' ');
    const tb = nb.split(' ');
    const i = ta.findIndex((t, k) => t !== tb[k]);
    console.log(`DIFFER   ${c.name.padEnd(18)} first differing token #${i}`);
    console.log(`           main: ...${ta.slice(Math.max(0, i - 4), i + 4).join(' ')}`);
    console.log(`           src : ...${tb.slice(Math.max(0, i - 4), i + 4).join(' ')}`);
    console.log(`           token counts: main=${ta.length} src=${tb.length}`);
  }
}

console.log('');
console.log(`identical: ${identical} | differing: ${differ} | missing: ${missing}`);
console.log(differ === 0 && missing === 0
  ? 'SAFE TO SWAP — every duplicate is byte-equivalent modulo formatting'
  : 'DO NOT SWAP — investigate the differences first');
process.exit(differ === 0 && missing === 0 ? 0 : 1);
