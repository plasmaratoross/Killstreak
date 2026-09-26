/**
 * Vietnamese name translation policy.
 *
 * Two rules, in opposite directions.
 *
 * TRANSLATED (the bug this originally guarded): every `phases.<sword>.<n>.shortName`
 * in src/i18n/vi.json was copied verbatim from en.json, and the name portion of
 * `phases.<sword>.<n>.name` was left in English too ("Giai đoạn 1: Hunger"). The
 * `effects` text WAS translated, which is what made it look done. The HUD renders the
 * phase name from getPhaseInfo(), so a Vietnamese player saw "GIAI ĐOẠN: SPROUT".
 *
 * NOT TRANSLATED: a sword's NAME is a proper noun and stays English in both
 * dictionaries — `swords.<id>.name` feeds getSwordInfo(), which the Library tabs, the
 * HUD, the sword-stand labels and the cutscene speakers all render. Order and Poison
 * had been translated to "Trật Tự" and "Độc Tố", so those two swords showed a
 * different name from every other sword in the game.
 *
 * The phase-name check is "vi must differ from en", a real defect detector that would
 * false-positive on values legitimately the same in both languages. Those go in
 * ALLOW_IDENTICAL, so each exception is a recorded decision rather than silence. The
 * sword-name checks run the other way (vi must match en) and need no exceptions.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/en.json'), 'utf8'));
const vi = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/vi.json'), 'utf8'));

/**
 * Keys where vi === en is correct, with the reason. Kept empty unless a case is
 * genuinely a proper noun that should not be translated.
 */
const ALLOW_IDENTICAL = new Set([
  // (populated only where a phase name is a proper noun; see the report below)
]);

const enPhases = en.phases || {};
const viPhases = vi.phases || {};

const fields = ['shortName', 'name'];
const identical = [];
let compared = 0;

for (const sword of Object.keys(enPhases)) {
  for (const num of Object.keys(enPhases[sword])) {
    for (const field of fields) {
      const a = enPhases[sword]?.[num]?.[field];
      const b = viPhases[sword]?.[num]?.[field];
      if (a === undefined) continue;
      compared++;
      const key = `phases.${sword}.${num}.${field}`;
      if (b === undefined) { identical.push(`${key} (MISSING in vi)`); continue; }
      if (b === a && !ALLOW_IDENTICAL.has(key)) identical.push(`${key} = ${JSON.stringify(a)}`);
    }
  }
}

check(`every vi phase name differs from en (${compared} fields across ${Object.keys(enPhases).length} swords)`,
  identical.length === 0,
  identical.length ? `${identical.length} still English:\n      ${identical.join('\n      ')}` : '');

// The translate-the-prefix-only pattern: "Giai đoạn 1: Hunger" looks translated but
// is half English. Report those separately so the count is honest.
const halfTranslated = [];
for (const sword of Object.keys(enPhases)) {
  for (const num of Object.keys(enPhases[sword])) {
    const enShort = enPhases[sword]?.[num]?.shortName;
    const viName = viPhases[sword]?.[num]?.name;
    if (!enShort || !viName) continue;
    if (viName.endsWith(`: ${enShort}`)) halfTranslated.push(`phases.${sword}.${num}.name`);
  }
}
check('no vi phase name keeps the English phase name after a translated prefix',
  halfTranslated.length === 0,
  halfTranslated.length ? `${halfTranslated.length}: ${halfTranslated.slice(0, 8).join(', ')}${halfTranslated.length > 8 ? ', …' : ''}` : '');

// ---------------------------------------------------------------- sword names
// A sword's name is a proper noun: identical in both dictionaries, and the name a
// cutscene speaker line leads with stays the English one while the epithet after the
// dash is translated ("TREMOR — CƠN ĐỊA CHẤN").
const enSwords = en.swords || {};
const renamed = [];
const speakerMissingName = [];
let speakerKeys = 0;

for (const id of Object.keys(enSwords)) {
  const name = enSwords[id].name;
  const viName = vi.swords?.[id]?.name;
  if (viName !== name) renamed.push(`swords.${id}.name: en=${JSON.stringify(name)} vi=${JSON.stringify(viName)}`);

  const upper = String(name).toUpperCase();
  for (const key of Object.keys(en.cutscene || {})) {
    if (key !== `speaker_${id}` && !key.startsWith(`speaker_${id}_`)) continue;
    speakerKeys++;
    const value = vi.cutscene?.[key];
    if (value === undefined) speakerMissingName.push(`${key} (MISSING in vi)`);
    else if (!value.toUpperCase().includes(upper)) speakerMissingName.push(`${key} -> ${value}`);
  }
}

check(`every vi sword name is the en proper noun (${Object.keys(enSwords).length} swords)`,
  renamed.length === 0,
  renamed.length ? `${renamed.length} translated:
      ${renamed.join('\n      ')}` : '');
check(`every vi cutscene speaker keeps the sword name (${speakerKeys} keys)`,
  speakerMissingName.length === 0,
  speakerMissingName.length ? `${speakerMissingName.length} lost it:
      ${speakerMissingName.join('\n      ')}` : '');

console.log(failures === 0 ? '\nPHASE AND SWORD NAMES OK' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
