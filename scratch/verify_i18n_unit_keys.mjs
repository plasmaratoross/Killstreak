/**
 * Every NPC type must have a resolvable zone unit label.
 *
 * The bug this guards: js/map.js built its tooltip unit line with
 * `zones.unit_` + zone.npcType, so the "normal" NPC asked for `zones.unit_normal`
 * — a key that does not exist, because the Normal Sentry's label is stored as
 * `zones.unit_sentry`. I18n.t() returns the key it was given when a lookup
 * misses, so the tooltip rendered the literal text "zones.unit_normal" instead of
 * "Sentries [100 HP • 1 Streak]". Silent, and only visible by hovering a zone.
 *
 * The invariant is deliberately NOT "map.js computes the right key" — that would
 * just mirror whatever map.js does and could never fail. It is:
 *
 *   1. For every npcType in src/npcs/, there is a `zones.unit_<type>` key, OR the
 *      type is listed in ALIASES below with a target that exists. A new NPC type
 *      with neither therefore fails here rather than in a tooltip.
 *   2. en and vi define exactly the same `unit_*` keys, so a translation cannot be
 *      half-added.
 *
 * ALIASES mirrors how the rest of the codebase resolves the label: WorldRenderer
 * starts from `zones.unit_sentry` for the default/else branch, and map.js now maps
 * "normal" the same way. Keep the two in step.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

/** npcType -> the name its unit label is actually filed under. */
const ALIASES = { normal: 'sentry' };

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const en = readJson('src/i18n/en.json');
const vi = readJson('src/i18n/vi.json');

const enZones = en.zones || {};
const viZones = vi.zones || {};

/** All unit_* keys except the interpolation template, which is not per-type. */
const unitKeys = (zones) => new Set(Object.keys(zones).filter((k) => k.startsWith('unit_') && k !== 'unit_active_format'));

const enUnits = unitKeys(enZones);
const viUnits = unitKeys(viZones);

// ------------------------------------------------------------------ NPC types
const npcTypes = fs.readdirSync(path.join(root, 'src/npcs'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

console.log(`--- NPC types (${npcTypes.length}) ---`);

const unresolved = [];
const aliased = [];
for (const type of npcTypes) {
  const direct = `unit_${type}`;
  if (enUnits.has(direct)) continue;
  const target = ALIASES[type];
  if (target && enUnits.has(`unit_${target}`)) { aliased.push(`${type} -> ${target}`); continue; }
  unresolved.push(type);
}

check(`every npcType resolves to a unit label (${npcTypes.length - unresolved.length}/${npcTypes.length})`,
  unresolved.length === 0,
  unresolved.length ? `no unit label for: ${unresolved.join(', ')} — add zones.unit_<type> to en.json/vi.json, or an ALIASES entry` : '');

if (aliased.length) console.log(`      aliased: ${aliased.join(', ')}`);

// ------------------------------------------------------------ translation pair
const missingVi = [...enUnits].filter((k) => !viUnits.has(k));
const missingEn = [...viUnits].filter((k) => !enUnits.has(k));
check(`vi defines every en unit key (${enUnits.size} keys)`, missingVi.length === 0, missingVi.join(', '));
check('en defines every vi unit key', missingEn.length === 0, missingEn.join(', '));

// ------------------------------------------------------------------ the fix in place
// Guard the specific regression: the label must not be asked for under a key that
// has no entry. Verify the resolved key for each type is non-empty in both files.
const emptyLabels = [];
for (const type of npcTypes) {
  const key = enUnits.has(`unit_${type}`) ? `unit_${type}` : `unit_${ALIASES[type]}`;
  if (!String(enZones[key] || '').trim() || !String(viZones[key] || '').trim()) {
    emptyLabels.push(`${type} (${key})`);
  }
}
check('no unit label is empty in either language', emptyLabels.length === 0, emptyLabels.join(', '));

// map.js must apply the alias, or "normal" zones ask for a key that cannot exist.
const mapSrc = fs.readFileSync(path.join(root, 'js/map.js'), 'utf8');
check('js/map.js applies the normal -> sentry alias when building the unit key',
  /zones\.unit_\$\{[^}]*npcType\s*===\s*"normal"[^}]*"sentry"/.test(mapSrc),
  'map.js no longer maps "normal" to "sentry" — zones.unit_normal does not exist');

console.log(failures === 0 ? '\nUNIT LABEL KEYS OK' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
