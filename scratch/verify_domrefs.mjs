/**
 * Phase 6 slice 1 verification — proves the DOM-ref hoist was faithful.
 *
 * Checks that src/ui/domRefs.js exports exactly the same name -> element-id pairs
 * that js/main.js declared inline before the move, that main.js imports precisely
 * those names, and that no ref declaration was left behind.
 *
 * Run:  node scratch/verify_domrefs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function collectRefs(text, re) {
  const map = new Map();
  for (const m of text.matchAll(re)) map.set(m[1], m[2]);
  return map;
}

const before = collectRefs(read('scratch/backup/main.js.phase6-domrefs.bak'),
  /^ {2}const ([A-Za-z_$][\w$]*) = document\.getElementById\((['"])([^'"]+)\2\);/gm);
// the regex above only captures 2 groups; rebuild with the id
const beforeFull = new Map();
for (const m of read('scratch/backup/main.js.phase6-domrefs.bak')
  .matchAll(/^ {2}const ([A-Za-z_$][\w$]*) = document\.getElementById\((['"])([^'"]+)\2\);/gm)) {
  beforeFull.set(m[1], m[3]);
}

const after = collectRefs(read('src/ui/domRefs.js'),
  /^export const ([A-Za-z_$][\w$]*) = document\.getElementById\((['"])([^'"]+)\2\);/gm);
const afterFull = new Map();
for (const m of read('src/ui/domRefs.js')
  .matchAll(/^export const ([A-Za-z_$][\w$]*) = document\.getElementById\((['"])([^'"]+)\2\);/gm)) {
  afterFull.set(m[1], m[3]);
}

console.log('--- fidelity ---');
check(`original main.js declared ${beforeFull.size} refs`, beforeFull.size === 122, `found ${beforeFull.size}`);
check(`src/ui/domRefs.js exports ${afterFull.size} refs`, afterFull.size === 122, `found ${afterFull.size}`);

const missing = [...beforeFull.keys()].filter((k) => !afterFull.has(k));
const extra = [...afterFull.keys()].filter((k) => !beforeFull.has(k));
check('no ref lost in the move', missing.length === 0, missing.join(', '));
check('no ref invented', extra.length === 0, extra.join(', '));

const wrongId = [...beforeFull.entries()].filter(([n, id]) => afterFull.has(n) && afterFull.get(n) !== id);
check('every ref keeps its original element id', wrongId.length === 0,
  wrongId.map(([n, id]) => `${n}: ${id} -> ${afterFull.get(n)}`).join('; '));

console.log('\n--- main.js ---');
const main = read('js/main.js');
const leftover = [...main.matchAll(/^ {2}const [A-Za-z_$][\w$]* = document\.getElementById\(/gm)];
check('no inline ref declarations left behind', leftover.length === 0, `${leftover.length} remaining`);

// `[^}]*` rather than `[\s\S]*?`: a lazy wildcard would walk backwards into the
// earlier `import { activatePrimary, ... }` statement.
// The invariant worth protecting is that no hoisted ref was LOST, and that every
// name imported from domRefs really is an export. WHICH module imports a given ref
// is deliberately not asserted: wiring relocation (the option-2 rule) keeps moving
// refs out of main.js and into the module that owns those events. Asserting
// "main.js imports all 122" made this verifier fail on the very first such move.
const collectImports = (text) => {
  const names = [];
  for (const m of text.matchAll(/import \{([^}]*)\} from '[^']*domRefs\.js';/g)) {
    names.push(...m[1].split(',').map((s) => s.trim()).filter(Boolean));
  }
  return names;
};
const consumers = [['js/main.js', main]];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.js')) consumers.push([rel, read(rel)]);
  }
})('src');

const union = new Set(consumers.flatMap(([, text]) => collectImports(text)));
const notImported = [...beforeFull.keys()].filter((n) => !union.has(n));
const unknown = [...union].filter((n) => !beforeFull.has(n));
check(`every one of the ${beforeFull.size} hoisted refs is imported somewhere`, notImported.length === 0, notImported.join(', '));
check('no unknown name imported anywhere', unknown.length === 0, unknown.join(', '));
check('no ref imported twice by one module',
  consumers.every(([, text]) => { const n = collectImports(text); return new Set(n).size === n.length; }),
  consumers.filter(([, text]) => { const n = collectImports(text); return new Set(n).size !== n.length; }).map(([f]) => f).join(', '));

// and main.js must not be hoarding refs it no longer uses
const mainBody = main.replace(/^import[\s\S]*?;$/gm, '');
const unusedInMain = collectImports(main).filter((n) => !new RegExp(`(?<![\\w$.])${n}(?![\\w$])`).test(mainBody));
check('main.js imports nothing it does not use', unusedInMain.length === 0, unusedInMain.join(', '));

check('main.js still parses as a module graph member',
  !/^ {2}const [A-Za-z_$][\w$]* = document\.getElementById\(/m.test(main));

console.log('');
console.log(failures === 0 ? 'DOM REFS HOIST VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
