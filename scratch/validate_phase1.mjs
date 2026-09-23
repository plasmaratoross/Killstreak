/**
 * Phase 1 validation harness.
 *
 * Proves the extracted `src/` data matches the live legacy data byte-for-byte,
 * and that the registries reference real files.
 *
 * Why this exists: `src/swords/SwordRegistry.js` and `src/npcs/NpcRegistry.js`
 * are not imported by the bundle entry point yet (they become live in Phase 2),
 * so Vite never parses them. That means a typo in a registry import path, or a
 * corrupted JSON copy, would go completely unnoticed by `npm run build`.
 * This harness closes that gap.
 *
 * Run:  node scratch/validate_phase1.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// Load a legacy IIFE data file in a stubbed window and return the namespace.
function loadLegacy(relPath) {
  const win = {};
  const code = fs.readFileSync(path.join(root, relPath), 'utf8');
  new Function('window', 'console', code)(win, console);
  return win.Killstreak?.Data ?? {};
}

// Detect values that cannot survive a JSON round-trip (silent data loss).
function findLossy(value, pathStr = '', out = []) {
  if (typeof value === 'function') out.push(`${pathStr} is a function`);
  else if (value === undefined) out.push(`${pathStr} is undefined`);
  else if (typeof value === 'number' && !Number.isFinite(value)) out.push(`${pathStr} is ${value}`);
  else if (Array.isArray(value)) value.forEach((v, i) => findLossy(v, `${pathStr}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) findLossy(v, pathStr ? `${pathStr}.${k}` : k, out);
  }
  return out;
}

// ------------------------------------------------------------------ SWORDS
// Report the first structural difference between two values, for diagnostics.
function firstDiff(a, b, pathStr = '') {
  if (a === b) return null;
  if (typeof a !== typeof b) return `${pathStr}: type ${typeof a} vs ${typeof b}`;
  if (a === null || b === null || typeof a !== 'object') return `${pathStr}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${pathStr}: array vs object`;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  const onlyA = ka.filter((k) => !kb.includes(k));
  const onlyB = kb.filter((k) => !ka.includes(k));
  if (onlyA.length) return `${pathStr}: only in legacy -> ${onlyA.join(', ')}`;
  if (onlyB.length) return `${pathStr}: only in extracted -> ${onlyB.join(', ')}`;
  if (ka.join(',') !== kb.join(',')) return `${pathStr}: key order differs`;
  for (const k of ka) {
    const d = firstDiff(a[k], b[k], pathStr ? `${pathStr}.${k}` : k);
    if (d) return d;
  }
  return null;
}

const SWORDS = ['devourer', 'overdrive', 'aquatic', 'soil', 'metallic', 'flora', 'hellfire'];
const legacySwordData = {};
for (const id of SWORDS) {
  Object.assign(legacySwordData, loadLegacy(`data/swords/${id}/${id}.js`).Swords ?? {});
}

console.log('--- Swords ---');
check(
  `legacy registers all 7 swords (got ${Object.keys(legacySwordData).length}: ${Object.keys(legacySwordData)})`,
  Object.keys(legacySwordData).length === 7
);

for (const id of SWORDS) {
  const jsonPath = path.join(root, 'src', 'swords', id, `${id}.data.json`);
  if (!fs.existsSync(jsonPath)) {
    check(`src/swords/${id}/${id}.data.json exists`, false, 'file missing');
    continue;
  }
  const extracted = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const match = Object.entries(legacySwordData).find(
    ([, v]) => JSON.stringify(v) === JSON.stringify(extracted)
  );
  const lossy = findLossy(extracted, id);
  check(`src/swords/${id}/${id}.data.json deep-equals legacy`, !!match,
    match ? '' : `same-named legacy entry differs -> ${firstDiff(legacySwordData[id.toUpperCase()] ?? legacySwordData[id], extracted) ?? 'legacy entry not found'}`);
  check(`src/swords/${id}/${id}.data.json is JSON-representable`, lossy.length === 0, lossy.join('; '));
}

// -------------------------------------------------------------------- NPCS
const NPC_IDS = fs
  .readdirSync(path.join(root, 'src', 'npcs'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const legacyNpcData = {};
for (const id of NPC_IDS) {
  Object.assign(legacyNpcData, loadLegacy(`data/npcs/${id}/${id}.js`).NPCs ?? {});
}

console.log('\n--- NPCs ---');
console.log(`src/npcs directories: ${NPC_IDS.length}`);
console.log(`legacy NPC entries  : ${Object.keys(legacyNpcData).length}`);

const usedLegacyNpcKeys = new Set();
for (const id of NPC_IDS) {
  const jsonPath = path.join(root, 'src', 'npcs', id, `${id}.data.json`);
  if (!fs.existsSync(jsonPath)) {
    check(`src/npcs/${id}/${id}.data.json exists`, false, 'file missing');
    continue;
  }
  const extracted = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const legacyForId = legacyNpcData[id];
  const hit = Object.entries(legacyNpcData).find(
    ([, v]) => JSON.stringify(v) === JSON.stringify(extracted)
  );
  if (hit) usedLegacyNpcKeys.add(hit[0]);
  const lossy = findLossy(extracted, id);
  check(
    `src/npcs/${id}/${id}.data.json matches a legacy NPC entry`,
    !!hit,
    legacyForId
      ? `same-named legacy entry differs -> ${firstDiff(legacyForId, extracted) ?? 'invisible difference'}`
      : `legacy has no entry named "${id}" (legacy keys: ${Object.keys(legacyNpcData).join(',')})`
  );
  check(`src/npcs/${id}/${id}.data.json is JSON-representable`, lossy.length === 0, lossy.join('; '));
}
check(
  `every legacy NPC entry is represented (${usedLegacyNpcKeys.size}/${Object.keys(legacyNpcData).length})`,
  usedLegacyNpcKeys.size === Object.keys(legacyNpcData).length,
  `unmatched legacy keys: ${Object.keys(legacyNpcData).filter((k) => !usedLegacyNpcKeys.has(k))}`
);

// -------------------------------------------------------------------- MAPS
console.log('\n--- Maps ---');
const legacyMaps = {
  ...loadLegacy('data/maps/lobby.js').Maps,
  ...loadLegacy('data/maps/grassland.js').Maps
};
const MAP_PAIRS = [['LOBBY', 'src/maps/lobby.data.js'], ['COMBAT', 'src/maps/grassland.data.js']];
for (const [key, modPath] of MAP_PAIRS) {
  const mod = await import(`../${modPath.replace('src/', 'src/')}`);
  const exported = mod.default;
  const legacy = legacyMaps[key];
  check(`legacy map "${key}" loads`, !!legacy);
  check(`${modPath} default export deep-equals legacy "${key}"`,
    JSON.stringify(exported) === JSON.stringify(legacy),
    `module keys: ${Object.keys(exported ?? {}).slice(0, 12)}...`);
}

// --------------------------------------------------- REGISTRY SOURCE INTEGRITY
// Parse the registry modules statically: Node cannot import them because they
// use `import ... from './x.json'` without import attributes (Vite-only syntax).
console.log('\n--- Registries (static import-path check) ---');
for (const regPath of ['src/swords/SwordRegistry.js', 'src/npcs/NpcRegistry.js']) {
  const src = fs.readFileSync(path.join(root, regPath), 'utf8');
  const importPaths = [...src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  check(`${rel(path.join(root, regPath))} declares imports`, importPaths.length > 0);
  const broken = importPaths.filter(
    (p) => !fs.existsSync(path.resolve(path.dirname(path.join(root, regPath)), p))
  );
  check(`${rel(path.join(root, regPath))}: all ${importPaths.length} import paths resolve`,
    broken.length === 0, `broken: ${broken.join(', ')}`);
}

// -------------------------------------------------------------- i18n parity
console.log('\n--- i18n ---');
// NOTE: reads the retired copy — see the header of scratch/verify_i18n.mjs.
const legacyText = fs.readFileSync(path.join(root, 'scratch/backup/obsolete/js-i18n.js'), 'utf8');
const startIdx = legacyText.indexOf('const translations = {');
const END = '\n  };\n';
const legacyTranslations = new Function(
  `${legacyText.slice(startIdx, legacyText.indexOf(END, startIdx) + END.length)}\nreturn translations;`
)();
// Three deliberate dictionary changes were made after extraction, each scoped and
// asserted to be the only kind of difference. See the matching note in
// verify_i18n.mjs for the full reasoning — the two allowlists must be kept in step.
//   1. cutscene resync (both languages) — the flora/metallic/hellfire dialogue
//   2. phase name translation (vi only) — vi's phase names were still English
//   3. main-menu "Return to Lobby" button removal (both languages) — the key's only
//      consumer was the deleted button
const CUTSCENE_RESYNC = /^cutscene\.(?:speaker_(grove|anvil|abyss)|(?:speaker_)?(metallic_unlock|metallic_p10|flora_unlock|flora_p10|hellfire_unlock|hellfire_p10)(?:_\d+)?)$/;
const PHASE_NAME_TRANSLATION = /^phases\.[a-z]+\.\d+\.(shortName|name)$/;
const MAIN_MENU_BUTTON_REMOVAL = /^menu\.return_lobby$/;
const allowedToDiffer = (key, lang) =>
  CUTSCENE_RESYNC.test(key)
  || MAIN_MENU_BUTTON_REMOVAL.test(key)
  || (lang === 'vi' && PHASE_NAME_TRANSLATION.test(key));

const flattenLeaves = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? flattenLeaves(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

for (const lang of ['en', 'vi']) {
  const json = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n', `${lang}.json`), 'utf8'));
  const a = new Map(flattenLeaves(legacyTranslations[lang]));
  const b = new Map(flattenLeaves(json));
  const diff = [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
  const unexpected = diff.filter((k) => !allowedToDiffer(k, lang));
  check(`src/i18n/${lang}.json matches legacy except for the documented changes (${diff.length} known)`,
    unexpected.length === 0,
    unexpected.length ? `${unexpected.length} unexpected: ${unexpected.slice(0, 10).join(', ')}` : '');
  check(`src/i18n/${lang}.json is JSON-representable`, findLossy(json, lang).length === 0);
}

console.log('');
console.log(failures === 0 ? 'ALL PHASE 1 ARTIFACTS VALIDATED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
