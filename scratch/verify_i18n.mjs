/**
 * Phase 1 verification — prove `src/i18n/*` is behaviourally identical to the
 * legacy `js/i18n.js`.
 *
 * Loads BOTH implementations into stubbed environments and compares:
 *   1. the dictionary data (deep equality)
 *   2. t() output for every leaf key, in both languages, with and without params
 *   3. the helper methods (getSwordInfo, getPhaseInfo, getAchievementInfo,
 *      getZoneLabel, getNpcInfo, getMapName)
 *
 * Run:  node scratch/verify_i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// ---------------------------------------------------------------- data check
// js/i18n.js was retired to scratch/backup/obsolete/ in the final cleanup. It has
// been dead since Phase 1, when src/main.js switched to src/i18n/I18n.js. The
// parity check is kept and re-pointed at the preserved copy, because it is still
// the only thing that proves the extracted dictionaries were not altered.
// CRLF-tolerant: core.autocrlf=true means this file is CRLF in a Windows working
// tree, but the slice below anchors on LF markers ('\n  };\n'). Without this the
// slice comes back EMPTY and the sandbox throws "translations is not defined" — a
// platform-dependent failure that has nothing to do with the dictionary data.
const legacyText = read('scratch/backup/obsolete/js-i18n.js').replace(/\r\n/g, '\n');
const START = 'const translations = {';
const startIdx = legacyText.indexOf(START);
const END = '\n  };\n';
const legacyTranslations = new Function(
  `${legacyText.slice(startIdx, legacyText.indexOf(END, startIdx) + END.length)}\nreturn translations;`
)();

const enJson = JSON.parse(read('src/i18n/en.json'));
const viJson = JSON.parse(read('src/i18n/vi.json'));

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  ${detail}`}`);
};

// -------------------------------------- INTENTIONAL DIVERGENCE: dialogue resync
// ============ INTENTIONAL DIVERGENCES FROM THE LEGACY DICTIONARY ==============
// Four deliberate, scoped changes were made after extraction. Each is asserted to be
// the ONLY kind of difference, so any genuine drift anywhere else still fails.
//
// 1. CUTSCENE RESYNC (both languages). The flora/metallic/hellfire unlock + p10
//    cutscenes had their dialogue revised in code without the dictionaries being
//    updated, so players saw text from an older draft and, on the newly added
//    lines, the raw key itself ("cutscene.flora_unlock_4"). Covers the dialogue
//    keys, the speaker keys of those six scenes (speaker_flora_p10's title gained a
//    "THE"), and the three speakers that had no key at all.
//    Guarded by scratch/verify_cutscene_keys.mjs.
//
// 2. PHASE NAME TRANSLATION (vi only). Every phases.*.shortName in vi.json had been
//    copied verbatim from en.json and the name portion of phases.*.name was left in
//    English, so a Vietnamese player saw "GIAI ĐOẠN: SPROUT". en.json is untouched
//    by that fix, hence the vi-only scope.
//    Guarded by scratch/verify_phase_names_translated.mjs.
const CUTSCENE_RESYNC = /^cutscene\.(?:speaker_(grove|anvil|abyss)|(?:speaker_)?(metallic_unlock|metallic_p10|flora_unlock|flora_p10|hellfire_unlock|hellfire_p10)(?:_\d+)?)$/;
const PHASE_NAME_TRANSLATION = /^phases\.[a-z]+\.\d+\.(shortName|name)$/;

// 3. MAIN-MENU BUTTON REMOVAL (both languages). The main menu's "Return to Lobby"
//    button was deleted from the game, so `menu.return_lobby` lost its only
//    consumer (that button's data-i18n attribute) and is dropped from both
//    dictionaries. The same removal is recorded in verify_domrefs.mjs
//    (REMOVED_AFTER_HOIST) and verify_slice.mjs (POST_EXTRACTION_BODY_EDITS).
//    The pattern is anchored to this one exact key, so any OTHER removal still fails.
const MAIN_MENU_BUTTON_REMOVAL = /^menu\.return_lobby$/;

// 4. WINDY SWORD ADDITION (both languages). A new sword's cutscene speakers and
//    dialogue exist only in the current dictionaries — the retained legacy copy
//    predates the sword, so these keys have nothing to match. Anchored to the windy
//    cutscene keys only, so an accidental drift elsewhere still fails.
const WINDY_ADDITION = new RegExp(
  '^(?:'
  + 'cutscene\\.(?:speaker_windy(?:_p13)?|windy_(?:unlock|p13)_\\d+)'
  + '|swords\\.windy\\.(?:name|tag|description)'
  + '|phases\\.windy\\.\\d+\\.(?:name|shortName|effects|notification)'
  + '|skills\\.cyclone_(?:label|title)'
  + '|floating\\.windy_(?:unlocked|p13)'
  + '|toasts\\.windy_[a-z0-9_]+'
  + '|achievements\\.items\\.windy_ascended\\.(?:title|description)'
  + ')$'
);

// 5. FROSTBITE SWORD ADDITION (both languages). Same reasoning as the windy
//    allowance above — the legacy copy predates the sword, so its keys have
//    nothing to match. Scoped to frostbite's own keys only.
const FROSTBITE_ADDITION = new RegExp(
  '^(?:'
  + 'cutscene\\.(?:speaker_frostbite(?:_p12)?|frostbite_(?:unlock|p12)_\\d+)'
  + '|swords\\.frostbite\\.(?:name|tag|description)'
  + '|phases\\.frostbite\\.\\d+\\.(?:name|shortName|effects|notification)'
  + '|skills\\.(?:freeze_(?:label|title)|blizzard_(?:label|title)|locked_p(?:7|11))'
  + '|floating\\.frostbite_(?:unlocked|p12)'
  + '|toasts\\.frostbite_[a-z0-9_]+'
  + '|achievements\\.items\\.frostbite_ascended\\.(?:title|description)'
  + ')$'
);

const allowedToDiffer = (key, lang) =>
  CUTSCENE_RESYNC.test(key)
  || MAIN_MENU_BUTTON_REMOVAL.test(key)
  || WINDY_ADDITION.test(key)
  || FROSTBITE_ADDITION.test(key)
  || (lang === 'vi' && PHASE_NAME_TRANSLATION.test(key));

/** Flatten to { 'a.b.c': value } so differences can be located precisely. */
const flattenLeaves = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? flattenLeaves(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

/** Leaf paths whose value differs between two dictionaries. */
const differingLeaves = (before, after) => {
  const a = new Map(flattenLeaves(before));
  const b = new Map(flattenLeaves(after));
  return [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));
};

for (const [lang, current] of [['en', enJson], ['vi', viJson]]) {
  const diff = differingLeaves(legacyTranslations[lang], current);
  const unexpected = diff.filter((k) => !allowedToDiffer(k, lang));
  check(
    `${lang}.json: the only differences from the legacy dictionary are the documented ones (${diff.length} known)`,
    unexpected.length === 0,
    unexpected.length ? `${unexpected.length} unexpected: ${unexpected.slice(0, 10).join(', ')}` : ''
  );
}
check(
  'legacy translation file had no other locales',
  Object.keys(legacyTranslations).join(',') === 'en,vi'
);

// ------------------------------------------------------- build sandboxed impl
function sandbox(code, { stripModuleSyntax }) {
  let src = code;
  if (stripModuleSyntax) {
    src = src.replace(/^\s*(?:import|export)\s.*$/gm, '');
  }
  const win = {};
  const documentStub = {
    documentElement: { setAttribute() {} },
    querySelectorAll: () => []
  };
  const factory = new Function('window', 'document', 'en', 'vi', `${src}\nreturn window.Killstreak.I18n;`);
  return factory(win, documentStub, enJson, viJson);
}

const legacyI18n = sandbox(legacyText, { stripModuleSyntax: false });
const newI18n = sandbox(read('src/i18n/I18n.js'), { stripModuleSyntax: true });

// ------------------------------------------------------------- api surface
const legacyMethods = Object.keys(legacyI18n).sort();
const newMethods = Object.keys(newI18n).sort();
check(
  'I18n public API surface unchanged',
  legacyMethods.join(',') === newMethods.join(','),
  `\n   legacy: ${legacyMethods.join(', ')}\n   new   : ${newMethods.join(', ')}`
);
check(
  'I18n.translations identity preserved',
  Object.keys(newI18n.translations).join(',') === 'en,vi'
);

// ---------------------------------------------------------- t() equivalence
const leafPaths = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? leafPaths(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

const allKeys = leafPaths(legacyTranslations.en);
const paramKeys = allKeys.filter((k) => /\{[a-zA-Z0-9_]+\}/.test(
  (() => { let c = legacyTranslations.en; for (const p of k.split('.')) c = c[p]; return String(c); })()
));

let tMismatch = 0;
let unresolved = 0;
let resyncedDiffs = 0;

for (const lang of ['en', 'vi']) {
  legacyI18n.setLanguage(lang, false);
  newI18n.setLanguage(lang, false);
  for (const key of allKeys) {
    const a = legacyI18n.t(key);
    const b = newI18n.t(key);
    if (a !== b) {
      // Keys in the resynced cutscene scope are EXPECTED to differ; anything else
      // is a real regression.
      if (allowedToDiffer(key, lang)) { resyncedDiffs++; continue; }
      tMismatch++;
      if (tMismatch <= 5) console.log(`   mismatch [${lang}] ${key}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    }
    if (b === key) unresolved++;
  }
}

check(`t() identical across ${allKeys.length} legacy keys x 2 languages, excluding the ${resyncedDiffs} deliberately resynced cutscene value(s)`,
  tMismatch === 0, `${tMismatch} unexpected mismatches`);
check('the resynced cutscene keys actually changed (the exclusion is not vacuous)',
  resyncedDiffs > 0, `expected some, found ${resyncedDiffs}`);
check('no key falls back to itself (all keys resolved)', unresolved === 0, `${unresolved} unresolved`);

// -------------------------------------------------------- interpolation check
let interpMismatch = 0;
for (const key of paramKeys) {
  const params = { name: 'TEST', damage: '123', hp: '456', streak: '7', phase: '3', kills: '9', pct: '50', speed: '5', reach: '42', sword: 'Devourer', bonus: '' };
  for (const lang of ['en', 'vi']) {
    legacyI18n.setLanguage(lang, false);
    newI18n.setLanguage(lang, false);
    if (legacyI18n.t(key, params) !== newI18n.t(key, params)) interpMismatch++;
  }
}
check(`interpolation identical across ${paramKeys.length} parameterised keys`, interpMismatch === 0, `${interpMismatch} mismatches`);

// ------------------------------------------ INTENTIONAL DIVERGENCE: defaultValue
// The legacy copy returned the key for a missing lookup and ignored
// params.defaultValue completely, so the 21 call sites that pass one were dead
// arguments. The new copy honours it. Asserted here because it is a deliberate
// difference from the legacy implementation, not an oversight.
console.log('--- t() defaultValue (intentional divergence) ---');
{
  const missing = 'zones.unit_definitely_not_a_key';
  check('legacy t() ignored defaultValue and returned the key',
    legacyI18n.t(missing, { defaultValue: 'FALLBACK' }) === missing,
    `legacy=${JSON.stringify(legacyI18n.t(missing, { defaultValue: 'FALLBACK' }))}`);
  check('new t() honours defaultValue for a missing key',
    newI18n.t(missing, { defaultValue: 'FALLBACK' }) === 'FALLBACK',
    `new=${JSON.stringify(newI18n.t(missing, { defaultValue: 'FALLBACK' }))}`);
  check('new t() still returns the key when no defaultValue is given',
    newI18n.t(missing) === missing, `new=${JSON.stringify(newI18n.t(missing))}`);
  check('defaultValue does not override a key that resolves',
    newI18n.t('zones.unit_fairy', { defaultValue: 'NOPE' }) === newI18n.t('zones.unit_fairy'),
    'a resolved key was overridden');
}

// ------------------------------------------------------------- helper parity
const helperCases = [
  ['getSwordInfo', ['devourer']],
  ['getSwordInfo', ['hellfire']],
  ['getSwordInfo', ['unknown_sword']],
  ['getZoneLabel', ['GRASSLAND']],
  ['getZoneLabel', ['LOBBY']],
  ['getZoneLabel', ['unknown_zone']],
  ['getMapName', ['GRASSLAND']],
  ['getMapName', ['LOBBY']],
  ['getMapName', ['COMBAT']],
  ['getMapName', ['unknown_map']],
  ['getNpcInfo', ['normal']],
  ['getNpcInfo', ['nonexistent']],
  ['getNpcInfo', [null]],
  ['getAchievementInfo', ['first_blood']],
  ['getAchievementInfo', ['nope']]
];

let helperMismatch = 0;
for (const [method, args] of helperCases) {
  if (typeof legacyI18n[method] !== 'function') continue;
  for (const lang of ['en', 'vi']) {
    legacyI18n.setLanguage(lang, false);
    newI18n.setLanguage(lang, false);
    const a = JSON.stringify(legacyI18n[method](...args));
    const b = JSON.stringify(newI18n[method](...args));
    if (a !== b) {
      helperMismatch++;
      console.log(`   mismatch ${method}(${args.join(',')}) [${lang}]: ${a} vs ${b}`);
    }
  }
}
check(`helper methods identical (${helperCases.length} cases × 2 languages)`, helperMismatch === 0, `${helperMismatch} mismatches`);

// ------------------------------------------------------- language switching
legacyI18n.setLanguage('vi', false);
newI18n.setLanguage('vi', false);
check('getLanguage() agrees after switch to vi', legacyI18n.getLanguage() === newI18n.getLanguage());
check('currentLang agrees after switch to vi', legacyI18n.currentLang === newI18n.currentLang);
legacyI18n.setLanguage('klingon', false);
newI18n.setLanguage('klingon', false);
check('invalid language falls back to en in both', legacyI18n.getLanguage() === 'en' && newI18n.getLanguage() === 'en');

console.log('');
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
