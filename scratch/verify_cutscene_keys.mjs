/**
 * Every cutscene key referenced in code must exist in BOTH languages.
 *
 * The bug this guards: src/systems/cutscenes.data.js's flora_unlock cutscene has
 * four lines, but src/i18n/{en,vi}.json only define flora_unlock_1..3. The fourth
 * line therefore asked for a key that does not exist, and I18n.t() returns the key
 * it was given when a lookup misses — so the cutscene displayed the literal text
 * "cutscene.flora_unlock_4" to the player instead of dialogue.
 *
 * Unlike a missing UI label, a missing CUTSCENE key is unmissable on screen yet
 * invisible to every other check: the string is a perfectly valid translation as
 * far as the dictionaries are concerned, and the code's `: "fallback"` branch
 * never runs because I18n is available. Nothing throws.
 *
 * Two things are asserted separately because they fail differently:
 *   - MISSING  : code references a key neither dictionary defines.
 *   - ORPHANED : a dictionary defines a cutscene key no code references — dead
 *                weight that hides the fact the dialogue was rewritten.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const en = readJson('src/i18n/en.json');
const vi = readJson('src/i18n/vi.json');

const SRC = 'src/systems/cutscenes.data.js';

// Three places can reference a cutscene key, and all three must be counted or the
// orphan check produces false positives:
//   - `I18n.t("cutscene.x")`   in src/**/*.js
//   - `data-i18n="cutscene.x"` in index.html, applied by I18n.applyToDOM()
// Scanning only the data file reported btn_skip and hint as orphans; they are the
// cutscene overlay's own hint and skip button, wired from index.html.
const srcFiles = [];
(function walk(dir) {
  const abs = path.join(root, dir);
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.js')) srcFiles.push(rel);
  }
})('src');

// Comments are blanked first so a key named in prose cannot count as a reference.
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const referenced = new Set();
for (const rel of [...srcFiles, 'index.html']) {
  const text = blankComments(fs.readFileSync(path.join(root, rel), 'utf8'));
  for (const m of text.matchAll(/I18n\.t\(\s*"cutscene\.([A-Za-z0-9_]+)"/g)) referenced.add(m[1]);
  for (const m of text.matchAll(/data-i18n="cutscene\.([A-Za-z0-9_]+)"/g)) referenced.add(m[1]);
}

const enKeys = new Set(Object.keys(en.cutscene || {}));
const viKeys = new Set(Object.keys(vi.cutscene || {}));

console.log(`--- cutscene keys referenced in code: ${referenced.size} ---`);

// ------------------------------------------------------------------- missing
const missingEn = [...referenced].filter((k) => !enKeys.has(k)).sort();
const missingVi = [...referenced].filter((k) => !viKeys.has(k)).sort();

check(`every referenced cutscene key exists in en.json (${referenced.size} keys)`,
  missingEn.length === 0,
  missingEn.length ? `${missingEn.length} missing: ${missingEn.join(', ')}` : '');
check(`every referenced cutscene key exists in vi.json`,
  missingVi.length === 0,
  missingVi.length ? `${missingVi.length} missing: ${missingVi.join(', ')}` : '');

// ------------------------------------------------------------------ orphaned
const orphansEn = [...enKeys].filter((k) => !referenced.has(k)).sort();
check(`no orphaned cutscene key in en.json (${enKeys.size} defined)`,
  orphansEn.length === 0,
  orphansEn.length ? `${orphansEn.length} unreferenced: ${orphansEn.join(', ')}` : '');

// ------------------------------------------------------------- pair integrity
const viOnly = [...viKeys].filter((k) => !enKeys.has(k));
const enOnly = [...enKeys].filter((k) => !viKeys.has(k));
check('en and vi define the same cutscene keys', viOnly.length === 0 && enOnly.length === 0,
  `en-only: ${enOnly.join(', ') || '-'} | vi-only: ${viOnly.join(', ') || '-'}`);

// -------------------------------------------------------------------- speaker
// Line speakers matter too: a missing speaker key renders as "cutscene.speaker_x"
// in the cutscene header, which is what a player reads as the dialogue NAME.
const speakers = [...referenced].filter((k) => k.startsWith('speaker_'));
check(`all ${speakers.length} speaker keys present in both languages`,
  speakers.every((k) => enKeys.has(k) && viKeys.has(k)),
  speakers.filter((k) => !enKeys.has(k) || !viKeys.has(k)).join(', '));

console.log(failures === 0 ? '\nCUTSCENE KEYS OK' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
