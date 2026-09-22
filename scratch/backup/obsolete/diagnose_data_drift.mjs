/**
 * Diagnostic: WHY do the extracted src/ data files differ from the live legacy data?
 *
 * Hypothesis under test: the extracted files were copied from the *sibling*
 * JSON files next to each legacy script (e.g. `devourer.json` beside
 * `devourer.js`) rather than from the live legacy scripts themselves.
 * If those siblings are stale (rounded numbers, older wording) then the
 * extraction silently captured the wrong source.
 *
 * Run:  node scratch/diagnose_data_drift.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function loadLegacy(relPath, key) {
  const win = {};
  new Function('window', 'console', fs.readFileSync(path.join(root, relPath), 'utf8'))(win, console);
  return win.Killstreak?.Data?.[key] ?? {};
}

const leafPaths = (obj, prefix = '') =>
  obj !== null && typeof obj === 'object'
    ? Object.entries(obj).flatMap(([k, v]) => leafPaths(v, prefix ? `${prefix}.${k}` : k))
    : [[prefix, obj]];

function diffLeaves(a, b) {
  const la = new Map(leafPaths(a));
  const lb = new Map(leafPaths(b));
  const keys = new Set([...la.keys(), ...lb.keys()]);
  const out = [];
  for (const k of keys) {
    const va = la.get(k);
    const vb = lb.get(k);
    if (JSON.stringify(va) !== JSON.stringify(vb)) out.push({ key: k, legacyJs: va, candidate: vb });
  }
  return out;
}

const report = (title, diffs, limit = 8) => {
  console.log(`\n=== ${title} — ${diffs.length} differing leaf value(s) ===`);
  for (const d of diffs.slice(0, limit)) {
    console.log(`  ${d.key}`);
    console.log(`      legacy .js : ${JSON.stringify(d.legacyJs)}`);
    console.log(`      candidate  : ${JSON.stringify(d.candidate)}`);
  }
  if (diffs.length > limit) console.log(`  ... and ${diffs.length - limit} more`);
};

// ---------------------------------------------------------------- SWORDS
const SWORDS = ['devourer', 'overdrive', 'aquatic', 'soil', 'metallic', 'flora', 'hellfire'];
for (const id of SWORDS) {
  const legacyJs = loadLegacy(`data/swords/${id}/${id}.js`, 'Swords');
  const liveData = legacyJs[id.toUpperCase()] ?? legacyJs[id];
  const extracted = JSON.parse(fs.readFileSync(path.join(root, 'src/swords', id, `${id}.data.json`), 'utf8'));

  const jsonSiblingPath = path.join(root, 'data/swords', id, `${id}.json`);
  const jsonSibling = fs.existsSync(jsonSiblingPath)
    ? JSON.parse(fs.readFileSync(jsonSiblingPath, 'utf8'))
    : null;

  const vsLive = diffLeaves(liveData, extracted);
  const siblingVsLive = jsonSibling ? diffLeaves(liveData, jsonSibling) : null;
  const matchesSibling = jsonSibling ? JSON.stringify(jsonSibling) === JSON.stringify(extracted) : null;

  console.log(`\n########## SWORD ${id} ##########`);
  console.log(`  src JSON == data/swords/${id}/${id}.json sibling ? ${matchesSibling}`);
  if (siblingVsLive) console.log(`  data/swords/${id}/${id}.json vs live .js : ${siblingVsLive.length} diff(s)`);
  report(`src/swords/${id}/${id}.data.json  vs  live data/swords/${id}/${id}.js`, vsLive);
}

// ------------------------------------------------------------------ NPCS
const NPC_IDS = fs
  .readdirSync(path.join(root, 'src/npcs'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const id of NPC_IDS) {
  const liveAll = loadLegacy(`data/npcs/${id}/${id}.js`, 'NPCs');
  const liveData = liveAll[id] ?? liveAll[id.toUpperCase()] ?? Object.values(liveAll)[0];
  const extracted = JSON.parse(fs.readFileSync(path.join(root, 'src/npcs', id, `${id}.data.json`), 'utf8'));

  const jsonSiblingPath = path.join(root, 'data/npcs', id, `${id}.json`);
  const jsonSibling = fs.existsSync(jsonSiblingPath)
    ? JSON.parse(fs.readFileSync(jsonSiblingPath, 'utf8'))
    : null;
  const matchesSibling = jsonSibling ? JSON.stringify(jsonSibling) === JSON.stringify(extracted) : null;

  const vsLive = diffLeaves(liveData, extracted);
  if (vsLive.length === 0 && matchesSibling === true) continue; // identical everywhere

  console.log(`\n########## NPC ${id} ##########`);
  console.log(`  legacy .js key(s): ${Object.keys(liveAll).join(', ')}`);
  console.log(`  src JSON == data/npcs/${id}/${id}.json sibling ? ${matchesSibling}`);
  report(`src/npcs/${id}/${id}.data.json  vs  live data/npcs/${id}/${id}.js`, vsLive);
}
