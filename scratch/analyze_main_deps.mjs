/**
 * Phase 6 dependency graph for the remaining main.js functions.
 *
 * For each top-level function reports:
 *   - which of the module-level `let`s it touches (mutable-state coupling)
 *   - whether it reads the `game` instance
 *   - which other top-level functions it calls (intra-file coupling)
 *
 * Functions with no `let` coupling and no calls to other un-extracted functions
 * are "leaves" and can be sliced out first; `loop` is a consumer of everything
 * and must go last.
 *
 * Run:  node scratch/analyze_main_deps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
const lines = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8').split(/\r?\n/);

function makeBlanker() {
  let inBlock = false;
  let inTemplate = false;
  return function blank(line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      const n = line[i + 1];
      if (inBlock) { if (c === '*' && n === '/') { inBlock = false; out += '  '; i += 2; continue; } out += ' '; i++; continue; }
      if (inTemplate) { if (c === '\\') { out += '  '; i += 2; continue; } if (c === '`') { inTemplate = false; out += ' '; i++; continue; } out += ' '; i++; continue; }
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

const fns = [];
lines.forEach((l, i) => {
  const m = l.match(/^ {2}(?:async )?function ([A-Za-z_$][\w$]*)\s*\(/);
  if (!m) return;
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

const NAMES = new Set(fns.map((f) => f.name));
const LETS = ['inspectedSwordId', 'selectedLibrarySword', 'cogClickCount', 'cogClickTimeout',
  'isDebugUnlocked', 'toastTimeout', 'panelOrigin', 'lastTimestamp'];

const rows = fns.map((f) => {
  const blank = makeBlanker();
  const code = lines.slice(f.start, f.end + 1).map((l) => blank(l)).join('\n');
  const lets = LETS.filter((v) => new RegExp(`(?<![\\w$.])${v}(?![\\w$])`).test(code));
  const usesGame = /(?<![\w$.])game(?![\w$])/.test(code);
  const calls = [...NAMES].filter((n) => n !== f.name && new RegExp(`(?<![\\w$.])${n}\\s*\\(`).test(code));
  return { ...f, len: f.end - f.start + 1, lets, usesGame, calls };
});

console.log('=== dependency graph (remaining functions) ===\n');
for (const r of rows.sort((a, b) => a.len - b.len)) {
  const tags = [];
  if (r.lets.length === 0) tags.push('state-free'); else tags.push(`lets: ${r.lets.join(',')}`);
  if (r.usesGame) tags.push('uses game');
  if (r.calls.length === 0) tags.push('LEAF');
  console.log(`${r.name.padEnd(26)} ${String(r.len).padStart(4)}L  ${tags.join(' | ')}`);
  if (r.calls.length) console.log(`${''.padEnd(26)}      calls: ${r.calls.join(', ')}`);
}
