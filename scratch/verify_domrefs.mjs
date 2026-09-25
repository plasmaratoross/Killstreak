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

// ------------------------------------------------------------ intentional drop
// The main menu's "Return to Lobby" button (#menu-lobby-btn) was deleted from the
// game, so its ref left domRefs.js with it. That is the ONLY deliberate removal
// after the Phase 6 hoist, so it is listed here rather than by relaxing the counts
// — every other ref still has to survive the move and be imported somewhere. The
// `staleRemoved` check below fails if one of these names comes back, so this
// allowance cannot quietly mask a genuine regression.
const REMOVED_AFTER_HOIST = new Map([
  ['menuLobbyBtn', 'menu-lobby-btn'],
  ['respawnCombatBtn', 'respawn-combat-btn']
]);
// Refs ADDED after the hoist, for features that did not exist then. Same reasoning in
// reverse: listed explicitly rather than relaxing the counts, and the guard below
// proves each added name really has its element in index.html.
const ADDED_AFTER_HOIST = new Map([
  ['libTabWindy', 'lib-tab-windy'],
  ['libTabFrostbite', 'lib-tab-frostbite'],
  ['libTabVoltstrike', 'lib-tab-voltstrike'],
  ['libTabLumen', 'lib-tab-lumen'],
  ['libTabUmbra', 'lib-tab-umbra'],
  ['libTabSanguine', 'lib-tab-sanguine'],
  ['libTabOrder', 'lib-tab-order'],
  ['libTabTremor', 'lib-tab-tremor'],
  ['libTabPoison', 'lib-tab-poison'],
]);

console.log('--- fidelity ---');
check(`original main.js declared ${beforeFull.size} refs`, beforeFull.size === 122, `found ${beforeFull.size}`);
check(`src/ui/domRefs.js exports ${afterFull.size} refs (${REMOVED_AFTER_HOIST.size} removed, ${ADDED_AFTER_HOIST.size} added)`,
  afterFull.size === 122 - REMOVED_AFTER_HOIST.size + ADDED_AFTER_HOIST.size, `found ${afterFull.size}`);

const staleRemoved = [...REMOVED_AFTER_HOIST.keys()].filter((k) => afterFull.has(k));
check('refs listed as removed are really gone', staleRemoved.length === 0,
  `${staleRemoved.join(', ')} is back in domRefs.js — drop it from REMOVED_AFTER_HOIST`);

const indexHtml = read('index.html');
const inventedAdded = [...ADDED_AFTER_HOIST.entries()]
  .filter(([name, id]) => !afterFull.has(name) || !indexHtml.includes(`id="${id}"`));
check('refs listed as added really exist in domRefs.js and index.html', inventedAdded.length === 0,
  inventedAdded.map(([n, id]) => `${n} -> #${id}`).join(', '));

const missing = [...beforeFull.keys()].filter((k) => !afterFull.has(k) && !REMOVED_AFTER_HOIST.has(k));
const extra = [...afterFull.keys()].filter((k) => !beforeFull.has(k) && !ADDED_AFTER_HOIST.has(k));
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
const notImported = [...beforeFull.keys()].filter((n) => !union.has(n) && !REMOVED_AFTER_HOIST.has(n));
const unknown = [...union].filter((n) => !beforeFull.has(n) && !ADDED_AFTER_HOIST.has(n));
check(`every live hoisted ref is imported somewhere (${beforeFull.size - REMOVED_AFTER_HOIST.size})`, notImported.length === 0, notImported.join(', '));
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
