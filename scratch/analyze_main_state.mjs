/**
 * Phase 6 reconnaissance — which function owns each module-level `let`.
 *
 * The remaining main.js functions share mutable state (`let` declarations). To
 * slice them out safely we need to know whether a variable belongs to one group
 * (so it can move into that module) or genuinely spans groups (so it needs a
 * shared home). This reports the enclosing top-level function of every reference.
 *
 * Run:  node scratch/analyze_main_state.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
const text = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');
const lines = text.split(/\r?\n/);

// Naive brace counting terminates early on `{` inside strings/template literals,
// which this file is full of (HTML templates, `${}` expressions). Blank those out
// first or the reported function sizes are nonsense.
function makeBlanker() {
  let inBlock = false;
  let inTemplate = false;
  return function blank(line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      const n = line[i + 1];
      if (inBlock) {
        if (c === '*' && n === '/') { inBlock = false; out += '  '; i += 2; continue; }
        out += ' '; i++; continue;
      }
      if (inTemplate) {
        if (c === '\\') { out += '  '; i += 2; continue; }
        if (c === '`') { inTemplate = false; out += ' '; i++; continue; }
        out += ' '; i++; continue;
      }
      if (c === '/' && n === '/') { out += ' '.repeat(line.length - i); break; }
      if (c === '/' && n === '*') { inBlock = true; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'") {
        out += ' '; i++;
        while (i < line.length) {
          if (line[i] === '\\') { out += '  '; i += 2; continue; }
          if (line[i] === c) { out += ' '; i++; break; }
          out += ' '; i++;
        }
        continue;
      }
      if (c === '`') { inTemplate = true; out += ' '; i++; continue; }
      out += c; i++;
    }
    return out;
  };
}

// top-level function ranges inside the IIFE
const fns = [];
lines.forEach((l, i) => {
  const m = l.match(/^ {2}(?:async )?function ([A-Za-z_$][\w$]*)\s*\(/);
  if (!m) return;
  if (fns.some((f) => f.start === i)) return;
  const blank = makeBlanker();
  let depth = 0;
  let started = false;
  for (let j = i; j < lines.length; j++) {
    for (const ch of blank(lines[j])) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) { fns.push({ name: m[1], start: i, end: j }); return; } }
    }
  }
});

const enclosing = (idx) => {
  const f = fns.find((f) => idx >= f.start && idx <= f.end);
  return f ? f.name : '<module scope>';
};

const LETS = ['inspectedSwordId', 'selectedLibrarySword', 'cogClickCount', 'cogClickTimeout',
  'isDebugUnlocked', 'toastTimeout', 'panelOrigin', 'lastTimestamp'];

// function size report, to spot the biggest remaining slices
console.log('=== remaining top-level functions by size ===');
fns.map((f) => ({ ...f, len: f.end - f.start + 1 }))
  .sort((a, b) => b.len - a.len)
  .forEach((f) => console.log(`  ${String(f.len).padStart(5)}  ${f.name}`));
console.log(`  total: ${fns.length} functions, ${fns.reduce((n, f) => n + (f.end - f.start + 1), 0)} lines inside functions`);

console.log('\n=== mutable state ownership ===');
for (const v of LETS) {
  const re = new RegExp(`(?<![\\w$.])${v}(?![\\w$])`, 'g');
  const hits = [];
  lines.forEach((l, i) => {
    if (re.test(l)) hits.push({ i, fn: enclosing(i) });
  });
  const byFn = new Map();
  for (const h of hits) byFn.set(h.fn, (byFn.get(h.fn) || 0) + 1);
  const owners = [...byFn.entries()].map(([f, c]) => `${f}(${c})`);
  const isolated = byFn.size === 1 ? '  [ISOLATED]' : (byFn.size === 2 ? '  [2 owners]' : `  [${byFn.size} owners]`);
  console.log(`  ${v.padEnd(22)} ${String(hits.length).padStart(2)} refs${isolated}`);
  console.log(`      ${owners.join(', ')}`);
}
