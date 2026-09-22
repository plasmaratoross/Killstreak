/**
 * Phase 1 data correction.
 *
 * FINDING: every `src/swords/<id>/<id>.data.json` and
 * `src/npcs/<id>/<id>.data.json` is byte-identical to the *stale sibling*
 * JSON file sitting next to each legacy script, which has drifted from the
 * live legacy scripts that the running game actually loads (via src/main.js).
 *
 * The refactor guide says to copy the sibling `.json` files, but per the
 * project agent rules the source code is the authority for current behaviour.
 * Copying the siblings would silently change ~117 values once these JSONs
 * become live in Phase 2 (rounded `arcAngle` floats, rewritten NPC
 * descriptions, a changed `glowColor`).
 *
 * This script re-extracts each file from the LIVE legacy script instead.
 *
 * Usage:
 *   node scratch/fix_extracted_data.mjs          # dry run, prints the repair plan
 *   node scratch/fix_extracted_data.mjs --write  # apply
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const WRITE = process.argv.includes('--write');

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
    if (JSON.stringify(la.get(k)) !== JSON.stringify(lb.get(k))) out.push(k);
  }
  return out;
}

// Values that cannot survive a JSON round-trip. If present, the data must be
// emitted as a JS module instead of JSON.
function findLossy(value, pathStr = '', out = []) {
  if (typeof value === 'function') out.push(`${pathStr} (function)`);
  else if (value === undefined) out.push(`${pathStr} (undefined)`);
  else if (typeof value === 'number' && !Number.isFinite(value)) out.push(`${pathStr} (${value})`);
  else if (Array.isArray(value)) value.forEach((v, i) => findLossy(v, `${pathStr}[${i}]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) findLossy(v, pathStr ? `${pathStr}.${k}` : k, out);
  }
  return out;
}

const SWORDS = ['devourer', 'overdrive', 'aquatic', 'soil', 'metallic', 'flora', 'hellfire'];
const NPCS = fs
  .readdirSync(path.join(root, 'src', 'npcs'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const jobs = [
  ...SWORDS.map((id) => ({ id, kind: 'swords', ns: 'Swords', legacy: `data/swords/${id}/${id}.js`, out: `src/swords/${id}/${id}.data.json` })),
  ...NPCS.map((id) => ({ id, kind: 'npcs', ns: 'NPCs', legacy: `data/npcs/${id}/${id}.js`, out: `src/npcs/${id}/${id}.data.json` }))
];

let repaired = 0;
let blocked = 0;
const lossyReport = [];

for (const job of jobs) {
  const ns = loadLegacy(job.legacy, job.ns);
  const candidate =
    ns[job.id] ?? ns[job.id.toUpperCase()] ??
    Object.entries(ns).find(([k]) => k.toLowerCase() === job.id)?.[1];
  if (!candidate) {
    console.log(`!! ${job.out}: could not resolve entry in ${job.legacy} (keys: ${Object.keys(ns)})`);
    blocked++;
    continue;
  }

  const lossy = findLossy(candidate, job.id);
  if (lossy.length) {
    lossyReport.push(`${job.legacy}: ${lossy.length} non-JSON value(s) -> ${lossy.slice(0, 5).join(', ')}`);
    blocked++;
    continue;
  }

  const outPath = path.join(root, job.out);
  const current = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : null;
  const diffs = current ? diffLeaves(candidate, current) : [];

  if (current && diffs.length === 0) continue; // already correct

  console.log(`${current ? 'repair' : 'create'} ${job.out}  (${diffs.length} stale value(s) corrected)`);
  if (diffs.length) console.log(`        ${diffs.slice(0, 4).join(', ')}${diffs.length > 4 ? `, +${diffs.length - 4} more` : ''}`);

  if (WRITE) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(candidate, null, 2) + '\n', 'utf8');
  }
  repaired++;
}

console.log('');
if (lossyReport.length) {
  console.log('BLOCKED — legacy data contains values JSON cannot represent:');
  lossyReport.forEach((r) => console.log(`  ${r}`));
  console.log('');
}
console.log(`${WRITE ? 'REPAIRED' : 'WOULD REPAIR'}: ${repaired} file(s); blocked: ${blocked}`);
if (!WRITE) console.log('(dry run — re-run with --write to apply)');
process.exit(blocked === 0 || WRITE ? 0 : 1);
