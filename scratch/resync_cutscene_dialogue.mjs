/**
 * Re-sync the cutscene dictionaries to the dialogue in src/systems/cutscenes.data.js.
 *
 * WHY: six cutscenes drifted. Their dialogue was revised in code but the i18n
 * dictionaries were only partly updated, so some lines resolved to text from an
 * older draft and others had no key at all — the player saw the raw key
 * ("cutscene.flora_unlock_4") on screen. For every OTHER cutscene the dictionary
 * text matches the code's fallback exactly, which is what proves the fallbacks are
 * the canonical script and the dictionaries are the stale side.
 *
 * The six: flora_unlock, flora_p10, metallic_unlock, metallic_p10, hellfire_unlock,
 * hellfire_p10 — the three latest swords.
 *
 * This is a one-shot content sync. `en` values come straight from the code's string
 * literals, so they cannot be mistyped. `vi` values come from TRANSLATIONS below and
 * are a first pass, flagged for review by a Vietnamese speaker.
 *
 *   node scratch/resync_cutscene_dialogue.mjs          # report only
 *   node scratch/resync_cutscene_dialogue.mjs --write  # apply
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const WRITE = process.argv.includes('--write');

const SRC = 'src/systems/cutscenes.data.js';
const CUTSCENES = ['metallic_unlock', 'metallic_p10', 'flora_unlock', 'flora_p10', 'hellfire_unlock', 'hellfire_p10'];

/**
 * Vietnamese first pass for every key this sync writes. Keys not listed keep their
 * existing translation.
 *
 * Written as template literals with real blank lines rather than "\n" escapes, so a
 * paragraph break is visible in the source instead of being a counting exercise.
 * Each value is trimmed on use, so the source indentation cannot leak into the text.
 *
 * REVIEW NEEDED: this is machine-authored Vietnamese, translated to match the
 * revised English. A native speaker should read it aloud before shipping.
 */
const TRANSLATIONS = {
  // ---- speakers -------------------------------------------------------------
  'speaker_grove': `RỪNG CỔ THỤ`,
  'speaker_anvil': `ĐE SẮT Ý CHÍ`,
  'speaker_abyss': `VỰC THẲM HỎA NGỤC`,

  // ---- metallic_unlock ------------------------------------------------------
  'metallic_unlock_1': `Từ sắt thô và lửa chảy, một ý chí bất khuất thành hình.`,
  'metallic_unlock_2': `Năm nghìn kẻ thù đã gục ngã trước ý chí của ngươi. Thép đã nhận ra chủ nhân của nó.`,
  'metallic_unlock_3': `Ta từng bị vứt bỏ. Giờ đây, ta có một mục đích khác.`,
  'metallic_unlock_4': `Hãy nắm ta thật chặt. Chúng ta sẽ không cúi mình trước gian khổ hay cái chết.`,

  // ---- metallic_p10 ---------------------------------------------------------
  'metallic_p10_1': `[Thanh kiếm ngừng mọi rung động. Không khí quanh nó nặng nề một cách bất thường.]

Không còn gì để tôi luyện nữa.`,
  'metallic_p10_2': `[Những vết xước trên lưỡi kiếm bắt đầu phát sáng thứ ánh trắng lạnh.]

Mỗi đòn đánh vào ta...
Mỗi cú giáng định đập tan ta...`,
  'metallic_p10_3': `[Những vết nứt và vết móp được lấp đầy, không phải bằng cách hàn gắn, mà bằng cách gấp lại thành thép đặc hơn.]

...chỉ đơn thuần là một nhát búa nữa.`,
  'metallic_p10_4': `[Một tiếng vang ngân lên—như tiếng đe bị đập giữa thánh đường trống không.]

Ta từng là phế liệu.
Ta đã trở thành vũ khí.`,
  'metallic_p10_5': `[Lưỡi kiếm biến thành thép bạc sẫm, được đánh bóng hoàn hảo. Không một bóng phản chiếu nào hiện lên trên bề mặt.]

Giờ thì...`,
  'metallic_p10_6': `[Ánh sáng trắng lắng sâu vào tận lõi của lưỡi kiếm.]

Ta là chuẩn mực để mọi sức mạnh được đo lường.`,
  'metallic_p10_7': `[Thanh kiếm phát ra tiếng ngân trầm ổn, không hề tắt đi.]

Hãy mang đến điều tồi tệ nhất.
Mang đến tất cả.`,
  'metallic_p10_8': `[Màn hình lóe trắng trong tích tắc.]

Ta sẽ không cúi.
Ta sẽ không gãy.`,
  'metallic_p10_9': `Ta là Thép Vĩnh Hằng.`,
  'metallic_p10_10': `Và ta sẽ tồn tại lâu hơn tất cả các ngươi.`,

  // ---- flora_unlock ---------------------------------------------------------
  'flora_unlock_1': `Lá xào xạc khi những rễ cây cổ xưa cựa mình bên dưới đồng cỏ ngọc bích.`,
  'flora_unlock_2': `Bảy nghìn cuộc tàn sát đã bồi đắp cho khu rừng vượt thời gian. Rừng xanh đang thức giấc.`,
  'flora_unlock_3': `Một mầm non giữa bão tố... nhưng sự kiên nhẫn sống lâu hơn mọi cuồng phong.`,
  'flora_unlock_4': `Hãy bén rễ cùng ta. Cùng nhau, chúng ta sẽ trường tồn lâu hơn cả núi non.`,

  // ---- flora_p10 ------------------------------------------------------------
  'flora_p10_1': `[Những rễ cây chậm rãi rút về lòng đất. Thế giới chìm vào tĩnh lặng hoàn toàn.]

Ngươi đã chiến đấu rất cố gắng.`,
  'flora_p10_2': `[Ánh sáng xanh nhịp nhàng lan tỏa qua mặt đất, tỏa ra mọi hướng.]

Ngươi đã chinh phục các đế chế.
Ngươi đã dựng nên những tượng đài.
Ngươi đã vung vũ khí với cơn thịnh nộ tột cùng.`,
  'flora_p10_3': `[Dây leo bắt đầu phủ kín mọi thứ—đấu trường, vũ khí, những kẻ đã ngã xuống.]

Vậy mà...`,
  'flora_p10_4': `[Hoa nở trong những vết nứt của bộ giáp vỡ.]

...cỏ vẫn luôn quay trở lại.`,
  'flora_p10_5': `[Những rễ cổ thụ khổng lồ trồi lên khỏi mặt đất, đan cài thành một thanh kiếm sống vĩ đại.]

Ta không cần đánh bại ngươi.
Ta chỉ cần tồn tại.`,
  'flora_p10_6': `[Những chiếc lá lìa cành, phát sáng thứ ánh xanh nhạt, tĩnh tại.]

Sức mạnh của ngươi sẽ phai tàn.
Sắt của ngươi sẽ han gỉ.
Lửa của ngươi sẽ tắt.`,
  'flora_p10_7': `[Thanh kiếm sống nhịp nhàng tỏa hơi ấm chậm rãi, như nhịp tim.]

Và khi mọi thứ ngươi gây dựng đã hóa thành tro bụi...`,
  'flora_p10_8': `[Một mầm non duy nhất hé nở nơi đầu lưỡi kiếm.]

...ta vẫn sẽ đang sinh trưởng.`,
  'flora_p10_9': `Ta là Vạn Vật Tái Sinh.`,
  'flora_p10_10': `Sự sống không kết thúc.`,
  'flora_p10_11': `Nó chỉ lấy lại những gì vốn dĩ luôn thuộc về nó.`,

  // ---- hellfire_unlock ------------------------------------------------------
  'hellfire_unlock_1': `Không khí bỏng rát vì sức nóng ngạt thở khi những vết nứt hắc diện thạch xé toạc.`,
  'hellfire_unlock_2': `Mười nghìn linh hồn đã cháy rụi trong lò tàn sát của ngươi. Con quỷ bên trong đòi được giải phóng.`,
  'hellfire_unlock_3': `Một tia lửa... thế là đủ để đốt cháy cả thế giới.`,
  'hellfire_unlock_4': `Hãy giải phóng ta! Hãy nuôi ta! Để chẳng còn lại gì ngoài tro tàn!`,

  // ---- hellfire_p10 ---------------------------------------------------------
  'hellfire_p10_1': `[Ngọn lửa biến mất hoàn toàn. Màn hình tối đen như mực.]

...`,
  'hellfire_p10_2': `[Một đường kẻ đỏ duy nhất hiện ra giữa màn hình, chẻ đôi bóng tối.]

Ngươi tưởng đây là ngọn lửa ngươi có thể dập tắt sao?`,
  'hellfire_p10_3': `[Đường kẻ đỏ xé toạc thành một đại dương lửa đen và đỏ thẫm.]

LỬA KHÔNG THƯƠNG LƯỢNG.`,
  'hellfire_p10_4': `[Thanh kiếm hiện ra trở lại—bao quanh bởi những chiếc sừng hắc diện thạch lởm chởm và ngọn lửa đen cuộn xoáy.]

Nó không dừng lại.
Nó không thương xót.`,
  'hellfire_p10_5': `[Mặt đất quanh thanh kiếm tan chảy tức thì thành dung nham sủi bọt.]

Nó chỉ nuốt chửng.`,
  'hellfire_p10_6': `[Lưỡi kiếm bùng nổ với âm thanh như một vụ phun trào núi lửa.]

Ngươi đã mang đến cho ta kẻ thù.
Ngươi đã mang đến cho ta linh hồn.
Ngươi đã cho ta mọi thứ ta cần để thiêu rụi chiếc lồng.`,
  'hellfire_p10_7': `[Những cột lửa đen phụt thẳng lên trời, nhuộm bầu trời thành đỏ sẫm.]

Giờ thì...`,
  'hellfire_p10_8': `[Thanh kiếm cháy bằng ngọn lửa đen đến mức nuốt cả ánh sáng quanh nó.]

KHÔNG CÒN GÌ CÓ THỂ NGĂN TA LẠI NỮA.`,
  'hellfire_p10_9': `[Những rung chấn dữ dội làm rung chuyển toàn màn hình. Ngọn lửa gầm lên với cường độ kinh hoàng.]

CHÁY ĐI!`,
  'hellfire_p10_10': `Ta là Chúa Tể Hỏa Ngục.`,
  'hellfire_p10_11': `Và mọi thứ kết thúc trong tro tàn.`,
};

/** Normalise a table value: template literals carry source indentation. */
const viTable = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([k, v]) => [k, String(v).trim()])
);

const source = fs.readFileSync(path.join(root, SRC), 'utf8');

// --- split into top-level cutscene blocks -----------------------------------
const blockRe = /^ {2}([A-Za-z0-9_]+): \{/gm;
const blocks = [];
let m;
while ((m = blockRe.exec(source))) blocks.push({ name: m[1], start: m.index });
for (let i = 0; i < blocks.length; i++) {
  blocks[i].end = i + 1 < blocks.length ? blocks[i + 1].start : source.length;
}

// --- pull `I18n.t("cutscene.KEY") : "FALLBACK"` pairs, in order --------------
const pairRe = /I18n\.t\(\s*"cutscene\.([A-Za-z0-9_]+)"\s*\)\s*:\s*("(?:[^"\\]|\\.)*")/g;

const extracted = {}; // cutscene -> [{ key, en }]
for (const b of blocks) {
  if (!CUTSCENES.includes(b.name)) continue;
  const body = source.slice(b.start, b.end);
  const pairs = [];
  let p;
  pairRe.lastIndex = 0;
  while ((p = pairRe.exec(body))) {
    pairs.push({ key: p[1], en: JSON.parse(p[2]) });
  }
  extracted[b.name] = pairs;
}

// --- report ------------------------------------------------------------------
let total = 0;
for (const name of CUTSCENES) {
  const pairs = extracted[name] || [];
  console.log(`\n=== ${name} — ${pairs.length} literal(s) ===`);
  for (const { key, en } of pairs) {
    total++;
    console.log(`  ${key}`);
    console.log(`    ${JSON.stringify(en)}`);
  }
}
console.log(`\n${total} key/value pairs across ${CUTSCENES.length} cutscenes`);

const missingTranslation = [];
for (const name of CUTSCENES) {
  for (const { key } of extracted[name] || []) {
    if (!(key in TRANSLATIONS)) missingTranslation.push(key);
  }
}
console.log(`\nvi translations supplied: ${total - missingTranslation.length}/${total}`);
if (missingTranslation.length) {
  console.log('NOT supplied (would be left as-is):');
  for (const k of missingTranslation) console.log(`  ${k}`);
}

if (!WRITE) {
  console.log('\n(dry run — re-run with --write to apply)');
  process.exit(0);
}

// Every DIALOGUE key needs a translation, or vi would keep text describing the
// line it used to be while en shows the new one. Speakers are exempt: an existing
// speaker name is a shared title whose Vietnamese is already correct.
const dialogueKeys = new Set();
for (const name of CUTSCENES) {
  for (const { key } of extracted[name] || []) {
    if (!key.startsWith('speaker_')) dialogueKeys.add(key);
  }
}
const untranslated = [...dialogueKeys].filter((k) => !(k in viTable));
if (untranslated.length) {
  console.error(`ABORT: no Vietnamese supplied for ${untranslated.length} dialogue key(s):`);
  for (const k of untranslated) console.error(`  ${k}`);
  process.exit(1);
}

// --- round-trip safety ------------------------------------------------------
// Re-stringifying must reproduce each file byte-for-byte. Otherwise this script
// would reformat the ENTIRE dictionary while intending to change ~47 keys, and the
// diff would be unreviewable.
for (const rel of ['src/i18n/en.json', 'src/i18n/vi.json']) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf8');
  if (JSON.stringify(JSON.parse(raw), null, 2) + '\n' !== raw) {
    console.error(`ABORT: re-stringifying ${rel} would change its formatting.`);
    process.exit(1);
  }
}
console.log('round-trip check passed: both dictionaries reproduce byte-for-byte\n');

// --- new keys go next to their siblings, not at the end of the object -------
const INSERT_AFTER = {
  'speaker_hellfire_p10': ['speaker_grove', 'speaker_anvil', 'speaker_abyss'],
  'metallic_unlock_3': ['metallic_unlock_4'],
  'metallic_p10_9': ['metallic_p10_10'],
  'flora_unlock_3': ['flora_unlock_4'],
  'flora_p10_10': ['flora_p10_11'],
  'hellfire_unlock_3': ['hellfire_unlock_4'],
  'hellfire_p10_9': ['hellfire_p10_10', 'hellfire_p10_11'],
};

function resync(rel, isVi) {
  const abs = path.join(root, rel);
  const doc = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const cx = doc.cutscene;
  // Captured BEFORE the rebuild: counting additions later than this reported 0,
  // because INSERT_AFTER had already placed the new keys.
  const originalKeys = new Set(Object.keys(cx));

  // Which keys does this file want, and with what value?
  const wanted = new Map();
  for (const name of CUTSCENES) {
    for (const { key, en } of extracted[name] || []) {
      if (isVi) { if (key in viTable) wanted.set(key, viTable[key]); }
      else wanted.set(key, en);
    }
  }

  let changed = 0;
  for (const [key, val] of wanted) {
    if (key in cx && cx[key] !== val) { cx[key] = val; changed++; }
  }

  const rebuilt = {};
  for (const key of Object.keys(cx)) {
    rebuilt[key] = cx[key];
    for (const nk of INSERT_AFTER[key] || []) {
      if (wanted.has(nk)) rebuilt[nk] = wanted.get(nk);
    }
  }
  const inserted = Object.keys(rebuilt).filter((k) => !originalKeys.has(k)).length;
  if (inserted !== wanted.size - [...wanted.keys()].filter((k) => originalKeys.has(k)).length) {
    console.error('FAIL: insertion count does not add up');
    process.exit(1);
  }

  doc.cutscene = rebuilt;
  fs.writeFileSync(abs, JSON.stringify(doc, null, 2) + '\n');

  // Post-conditions: every referenced key resolves, and nothing else moved.
  const after = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const stillMissing = [...wanted.keys()].filter((k) => !(k in after.cutscene));
  if (stillMissing.length) { console.error(`FAIL: ${rel} still missing ${stillMissing.join(', ')}`); process.exit(1); }
  if (Object.keys(after.cutscene).length !== Object.keys(rebuilt).length) { console.error(`FAIL: ${rel} key count changed unexpectedly`); process.exit(1); }

  return { changed, inserted, total: Object.keys(after.cutscene).length };
}

const enRes = resync('src/i18n/en.json', false);
const viRes = resync('src/i18n/vi.json', true);

console.log(`en.json  ${enRes.changed} value(s) updated, ${enRes.inserted} key(s) added -> ${enRes.total} cutscene keys`);
console.log(`vi.json  ${viRes.changed} value(s) updated, ${viRes.inserted} key(s) added -> ${viRes.total} cutscene keys`);
console.log('\nApplied. Run: node scratch/verify_cutscene_keys.mjs');
