/**
 * Translate the Vietnamese phase names.
 *
 * WHY: every `phases.<sword>.<n>.shortName` in src/i18n/vi.json was copied verbatim
 * from en.json, and the name portion of `phases.<sword>.<n>.name` was left English
 * too — "Giai đoạn 1: Hunger". The `effects` prose WAS translated, which is exactly
 * what made it look finished. The HUD renders the phase name via getPhaseInfo(), so
 * a Vietnamese player saw "GIAI ĐOẠN: SPROUT".
 *
 * Names are supplied as ordered arrays rather than a 77-key table so that a
 * misalignment is impossible: the array length is asserted against the real phase
 * count per sword before anything is written.
 *
 * Translations are aligned with the ability names already used in `skills`, so the
 * phase and its ability do not disagree:
 *   Worldroot  -> "Thế Giới Căn"      (skills.worldroot_label)
 *   Cataclysm  -> "Đại Họa Diệt Thế"  (skills.cataclysm_label, hellfire)
 *   Evergrowth -> "Vạn Vật Tái Sinh"  (speaker_flora_p10)
 *   The Infernal -> "Chúa Tể Hỏa Ngục" (speaker_hellfire_p10)
 *   Eternal Steel -> "Thép Vĩnh Hằng"  (speaker_metallic_p10)
 *
 * REVIEW NEEDED: machine-authored Vietnamese, kept short and evocative to match the
 * register of the English. A native speaker should read the list through.
 *
 *   node scratch/resync_phase_names.mjs          # report only
 *   node scratch/resync_phase_names.mjs --write  # apply
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const WRITE = process.argv.includes('--write');

const PHASE_NAMES = {
  devourer: [
    'Đói Khát', 'Bữa Tiệc', 'Kẻ Nuốt Chửng', 'Tham Thực', 'Hàm Răng Tối Thượng',
    'Kẻ Ăn Thế Giới', 'Tai Ương Vũ Trụ', 'Kỳ Dị Hư Không', 'Vỏ Rỗng Đói Khát',
    'Cự Thú Thăng Hoa', 'Kẻ Nuốt Chửng Vũ Trụ', 'Chúa Tể Vực Thẳm', 'Lõi Kỳ Dị',
    'Nhật Thực Kinh Dị', 'Hư Vô Vũ Trụ', 'Tro Tàn Ngủ Yên', 'Kẻ Nuốt Chửng Vạn Vật'
  ],
  overdrive: [
    'Thủy Ngân', 'Đâm Xuyên Tốc Độ', 'Xuyên Phá Âm Thanh', 'Lưỡi Tachyon',
    'Katana Chớp Nhoáng', 'Lưỡi Thần Tốc', 'Thần Tốc Tối Thượng'
  ],
  aquatic: [
    'Giọt Nước', 'Gợn Sóng', 'Dòng Suối', 'Dòng Chảy', 'Sóng Ngầm', 'Xoáy Nước',
    'Vực Sâu', 'Hạn Hán', 'Lũ Lụt', 'Gió Mùa', 'Đại Tai Họa', 'Thủy Quái',
    'Thủy Triều Vô Tận'
  ],
  soil: [
    'Lưỡi Đất', 'Đất Nén', 'Mảnh Sét', 'Lưỡi Đất Mùn', 'Tim Đá', 'Pháo Đài Đất',
    'Phá Nham Đao', 'Ý Chí Núi Non', 'Vỏ Rỗng Rã', 'Pháo Đài Bất Diệt'
  ],
  metallic: [
    'Phế Liệu', 'Rèn Thành', 'Tôi Luyện', 'Ràng Thép', 'Gia Cố', 'Cứng Cáp',
    'Bậc Thầy Lò Rèn', 'Pháo Đài Sắt', 'Bất Khuất', 'Thép Vĩnh Hằng'
  ],
  flora: [
    'Mầm Non', 'Bén Rễ', 'Sinh Trưởng', 'Gai Góc', 'Hoang Dại', 'Cổ Thụ',
    'Phủ Kín', 'Khổng Lồ', 'Thế Giới Căn', 'Vạn Vật Tái Sinh'
  ],
  hellfire: [
    'Tàn Lửa', 'Ngọn Lửa', 'Rực Cháy', 'Hỏa Ngục', 'Sinh Từ Địa Ngục', 'Dung Nham',
    'Tàn Phá', 'Đại Họa Diệt Thế', 'Khải Huyền', 'Chúa Tể Hỏa Ngục'
  ]
};

/**
 * Two phases give their full title differently from their shortName, so the suffix
 * replace below cannot derive them. `en` is the English portion to strip from the vi
 * name; `vi` is what replaces it. Values mirror the achievement title and the sword
 * name already used elsewhere, not fresh inventions.
 */
const NAME_PART_OVERRIDES = {
  // "Phase 10: Indestructible Soil Fortress" vs shortName "Soil Fortress" —
  // matches achievements.soil_ascended.title in vi.json.
  'soil.10': { en: 'Indestructible Soil Fortress', vi: 'Pháo Đài Thổ Nhưỡng Bất Diệt' },
  // "Phase 10: Hellfire" vs shortName "The Infernal" — the full title keeps the
  // sword name, which is a proper noun and stays as-is in both languages.
  'hellfire.10': { en: 'Hellfire', vi: 'Hellfire' }
};

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const en = readJson('src/i18n/en.json');
const vi = readJson('src/i18n/vi.json');

// ---------------------------------------------------------------- plan
const plan = [];   // { sword, num, from, to, nameFrom, nameTo }
const problems = [];

for (const [sword, names] of Object.entries(PHASE_NAMES)) {
  const enSword = en.phases?.[sword];
  const viSword = vi.phases?.[sword];
  if (!enSword || !viSword) { problems.push(`${sword}: missing in a dictionary`); continue; }

  const nums = Object.keys(enSword).map(Number).sort((a, b) => a - b);
  if (nums.length !== names.length) {
    problems.push(`${sword}: table has ${names.length} names but the dictionary has ${nums.length} phases`);
    continue;
  }
  if (nums.some((n, i) => n !== i + 1)) {
    problems.push(`${sword}: phase numbers are not contiguous 1..${nums.length} (${nums.join(',')})`);
    continue;
  }

  nums.forEach((num, i) => {
    const enShort = enSword[num].shortName;
    const viShort = viSword[num].shortName;
    const viName = viSword[num].name;
    const to = names[i];

    // Only touch the name portion, never the "Giai đoạn N: " prefix.
    let nameTo = viName;
    const ov = NAME_PART_OVERRIDES[`${sword}.${num}`];
    if (enShort && typeof viName === 'string' && viName.endsWith(`: ${enShort}`)) {
      nameTo = viName.slice(0, viName.length - enShort.length) + to;
    } else if (ov && typeof viName === 'string' && viName.endsWith(`: ${ov.en}`)) {
      nameTo = viName.slice(0, viName.length - ov.en.length) + ov.vi;
    } else if (viName !== undefined) {
      problems.push(`phases.${sword}.${num}.name: cannot locate "${enShort}" in ${JSON.stringify(viName)}`);
    }
    plan.push({ sword, num, from: viShort, to, nameFrom: viName, nameTo });
  });
}

console.log(`--- ${plan.length} phase(s) planned across ${Object.keys(PHASE_NAMES).length} swords ---`);
let unchanged = 0;
for (const p of plan) {
  const same = p.from === p.to && p.nameFrom === p.nameTo;
  if (same) unchanged++;
  else console.log(`  ${p.sword}.${p.num}: ${JSON.stringify(p.from)} -> ${JSON.stringify(p.to)}   | name -> ${JSON.stringify(p.nameTo)}`);
}
console.log(`\nalready correct: ${unchanged} | to change: ${plan.length - unchanged}`);
if (problems.length) {
  console.error(`\nPROBLEMS (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

if (!WRITE) {
  console.log('\n(dry run — re-run with --write to apply)');
  process.exit(0);
}

// ------------------------------------------------- round-trip safety
for (const rel of ['src/i18n/en.json', 'src/i18n/vi.json']) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf8');
  if (JSON.stringify(JSON.parse(raw), null, 2) + '\n' !== raw) {
    console.error(`ABORT: re-stringifying ${rel} would change its formatting.`);
    process.exit(1);
  }
}

for (const p of plan) {
  vi.phases[p.sword][p.num].shortName = p.to;
  vi.phases[p.sword][p.num].name = p.nameTo;
}
fs.writeFileSync(path.join(root, 'src/i18n/vi.json'), JSON.stringify(vi, null, 2) + '\n');

// ------------------------------------------------------ post-conditions
const after = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/vi.json'), 'utf8'));
const bad = plan.filter((p) => after.phases[p.sword][p.num].shortName !== p.to);
if (bad.length) { console.error(`FAIL: ${bad.length} value(s) did not stick`); process.exit(1); }
if (JSON.stringify(after.phases) === JSON.stringify(vi.phases)) {
  console.log('\nvi.json phases updated.');
}
console.log('Applied. Run: node scratch/verify_phase_names_translated.mjs');
