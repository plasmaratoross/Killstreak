/**
 * Phase 2 scope-safety analysis.
 *
 * The extracted bodies were moved out of their original IIFE, where they could
 * see module-scope bindings (Config, Particle, TsunamiWave, ...). If a moved
 * body still references one of those names, it would now throw ReferenceError
 * at runtime.
 *
 * This script enumerates every top-level binding declared in the source file's
 * IIFE, then reports which of them are still referenced (as code, not comments
 * or strings, and not as a property name) inside each generated module.
 *
 * Run:  node scratch/analyze_free_vars.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

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

/** Top-level bindings declared directly inside the file's IIFE (2-space indent). */
function iifeBindings(relPath) {
  const lines = fs.readFileSync(path.join(root, relPath), 'utf8').split(/\r?\n/);
  const names = new Set();
  for (const line of lines) {
    // const/let/var at 2-space indent
    let m = line.match(/^ {2}(?:const|let|var)\s+([A-Za-z_$][\w$]*)/);
    if (m) names.add(m[1]);
    // destructuring: const { A, B } = ...
    m = line.match(/^ {2}(?:const|let|var)\s*\{([^}]*)\}/);
    if (m) m[1].split(',').forEach((p) => { const t = p.trim().split(/[:\s]/)[0]; if (t) names.add(t); });
    // class / function declarations
    m = line.match(/^ {2}(?:class|function)\s+([A-Za-z_$][\w$]*)/);
    if (m) names.add(m[1]);
  }
  return names;
}

const SOURCES = {
  'js/entities.js': iifeBindings('js/entities.js'),
  'js/game.js': iifeBindings('js/game.js')
};

console.log('IIFE top-level bindings');
for (const [f, names] of Object.entries(SOURCES)) {
  console.log(`  ${f}: ${[...names].join(', ')}`);
}

const allNames = new Set([...SOURCES['js/entities.js'], ...SOURCES['js/game.js'], 'window']);

const modules = [];
for (const dir of fs.readdirSync(path.join(root, 'src/swords'), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(root, 'src/swords', dir.name))) {
    if (f.endsWith('.render.js') || f.endsWith('.ability.js')) modules.push(`src/swords/${dir.name}/${f}`);
  }
}

// `window` is a real browser global in an ES module, so it never needs binding.
const GLOBALS = new Set(['window']);

console.log('\nScope-safety of generated modules:');
let problems = 0;
for (const rel of modules.sort()) {
  const blank = makeBlanker();
  const raw = fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);

  // names supplied by the injected call-time preamble
  const provided = new Set();
  const preambleIdx = raw.findIndex((l) => /^const \{.*\} = \(window\.Killstreak/.test(l.trim()));
  if (preambleIdx !== -1) {
    const m = raw[preambleIdx].trim().match(/^const \{([^}]*)\}/);
    if (m) m[1].split(',').forEach((n) => provided.add(n.trim()));
  }

  // names used by the moved logic itself
  const used = new Map();
  raw.forEach((line, i) => {
    if (i === preambleIdx) return;
    const t = line.trim();
    if (t.startsWith('// Re-resolve entity classes')) return;
    if (t.startsWith('*') || t.startsWith('/*') || t.startsWith('//')) return;
    const code = blank(line);
    for (const name of allNames) {
      if (re_test(name, code)) used.set(name, (used.get(name) || 0) + 1);
    }
  });

  const missing = [...used.keys()].filter((n) => !provided.has(n) && !GLOBALS.has(n));
  if (missing.length) {
    problems++;
    console.log(`  FAIL ${rel}`);
    console.log(`       unbound: ${missing.map((n) => `${n} x${used.get(n)}`).join(', ')}`);
  } else if (provided.size) {
    console.log(`  PASS ${rel}  (preamble binds: ${[...provided].join(', ')})`);
  }
}

function re_test(name, code) {
  return new RegExp(`(?<![\\w$.])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(code);
}

console.log('');
console.log(problems === 0 ? 'PASS  no unbound IIFE-scope references remain' : `FAIL  ${problems} module(s) have unbound references`);
