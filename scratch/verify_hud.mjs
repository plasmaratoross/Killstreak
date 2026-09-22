/**
 * Phase 6 slice 3 verification — the HUD group.
 *
 * Asserts the extracted bodies are the originals modulo exactly two documented
 * changes:
 *   - `game` became a parameter (no line inside needed editing, because the
 *     bodies already referenced a module-level `game`)
 *   - updateStatsUI's internal updateHudCounters() self-call threads the param
 *
 * Everything else must be token-identical. Also proves main.js has no leftover
 * zero-arg call, that every ref the module imports is a real domRefs export, and
 * that formatPlaytime left main.js entirely (its only caller moved with it).
 *
 * Run:  node scratch/verify_hud.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const norm = (s) => strip(s).replace(/\s+/g, ' ').trim();

function fnBody(text, name, indent) {
  const re = new RegExp(`^${' '.repeat(indent)}function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  let depth = 0;
  let started = false;
  for (let j = text.indexOf('{', m.index); j < text.length; j++) {
    if (text[j] === '{') { depth++; started = true; }
    else if (text[j] === '}') { if (started && --depth === 0) return text.slice(text.indexOf('{', m.index) + 1, j); }
  }
  return null;
}
/** exported form: `export function NAME(` at column 0 */
function exportedBody(text, name) {
  const re = new RegExp(`^export function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  let depth = 0;
  let started = false;
  for (let j = text.indexOf('{', m.index); j < text.length; j++) {
    if (text[j] === '{') { depth++; started = true; }
    else if (text[j] === '}') { if (started && --depth === 0) return text.slice(text.indexOf('{', m.index) + 1, j); }
  }
  return null;
}

const backup = read('scratch/backup/main.js.phase6-hud.bak');
const hud = read('src/ui/hud.js');
const main = read('js/main.js');

const FNS = ['updateHudCounters', 'updateStatsUI', 'updateHudPhaseTracking'];

console.log('--- body fidelity ---');
for (const n of FNS) {
  const before = fnBody(backup, n, 2);
  const after = exportedBody(hud, n);
  if (before === null || after === null) {
    check(`${n}: present in both`, false, `backup=${before === null ? 'absent' : 'ok'} hud=${after === null ? 'absent' : 'ok'}`);
    continue;
  }
  // the ONE documented in-body change
  const expected = norm(before).replace(/updateHudCounters\(\)/g, 'updateHudCounters(game)');
  const actual = norm(after);
  const same = expected === actual;
  let detail = '';
  if (!same) {
    const a = expected.split(' '); const b = actual.split(' ');
    const i = a.findIndex((t, k) => t !== b[k]);
    detail = `first differing token #${i}\n        expected: ...${a.slice(Math.max(0, i - 3), i + 3).join(' ')}\n        actual  : ...${b.slice(Math.max(0, i - 3), i + 3).join(' ')}`;
  }
  check(`${n}: body verbatim apart from the documented change`, same, detail);
}

console.log('\n--- module hygiene ---');
const domRefs = read('src/ui/domRefs.js');
const refExports = new Set([...domRefs.matchAll(/^export const ([A-Za-z_$][\w$]*) =/gm)].map((m) => m[1]));
const importBlock = hud.match(/import \{([^}]*)\} from '\.\/domRefs\.js';/);
check('hud.js imports refs from domRefs.js', !!importBlock);
if (importBlock) {
  const imported = importBlock[1].split(',').map((s) => s.trim()).filter(Boolean);
  const bogus = imported.filter((r) => !refExports.has(r));
  check(`all ${imported.length} imported refs are real domRefs exports`, bogus.length === 0, bogus.join(', '));

  // and nothing the body uses is left unimported
  const bodyText = FNS.map((n) => exportedBody(hud, n)).join('\n');
  const usedRefs = [...refExports].filter((r) => new RegExp(`(?<![\\w$.])${r}(?![\\w$])`).test(bodyText));
  const unimported = usedRefs.filter((r) => !imported.includes(r));
  check('no ref used by the bodies is missing from the import', unimported.length === 0, unimported.join(', '));
  check('no ref imported but unused', imported.filter((r) => !usedRefs.includes(r)).length === 0,
    imported.filter((r) => !usedRefs.includes(r)).join(', '));
}
check('hud.js takes I18n from window.Killstreak once', /const I18n = .*window\.Killstreak.*\.I18n/.test(hud));
check('hud.js pulls formatPlaytime/setNumContent from utils', /from '\.\.\/utils\/dom\.js'/.test(hud));

console.log('\n--- main.js ---');
for (const n of FNS) {
  check(`${n}: definition removed`, !new RegExp(`^ {2}function ${n}\\s*\\(`, 'm').test(main));
  check(`${n}: no zero-arg call remains`, !new RegExp(`(?<![\\w$])${n}\\(\\)`).test(main));
  const withArg = (main.match(new RegExp(`${n}\\(game\\)`, 'g')) || []).length;
  check(`${n}: call sites pass game (${withArg})`, withArg > 0);
}
check('hud.js imported by main.js',
  /import \{ updateHudCounters, updateStatsUI, updateHudPhaseTracking \} from '\.\.\/src\/ui\/hud\.js';/.test(main));
check('formatPlaytime no longer referenced in main.js', !/\bformatPlaytime\b/.test(main));

// HUD call sites keep migrating OUT of main.js as Phase 6 progresses (slice 10
  // moved handleApplyDebugKillstreak, which called all three HUD functions, into
  // debugPanel.js). Counting main.js alone therefore goes stale on every slice.
  // The invariant that actually matters is the TOTAL across the live surface:
  // no call site may be lost, wherever it ends up living.
  const srcFiles = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.js') && rel !== 'src/ui/hud.js') srcFiles.push(rel);
    }
  })('src');
  const surface = [main, ...srcFiles.map(read)].join('\n');
  const countOf = (re) => (surface.match(re) || []).length;
  const refTotal = countOf(/updateHudCounters\(game\)/g) +
    countOf(/updateStatsUI\(game\)/g) +
    countOf(/updateHudPhaseTracking\(game\)/g);
  check(`33 call sites rewired in total across main.js + src (${refTotal})`, refTotal === 33);

console.log('');
console.log(failures === 0 ? 'HUD EXTRACTION VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
