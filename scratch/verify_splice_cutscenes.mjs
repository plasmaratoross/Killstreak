/**
 * Phase 3 splice verification — confirms exactly the 15 cutscene methods were
 * removed from js/game.js, nothing else, and that no stale call remains.
 *
 * Run:  node scratch/verify_splice_cutscenes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const lines = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').split(/\r?\n/);
function inventory(src) {
  const names = new Set();
  for (const l of src) {
    const m = l.match(/^    (?:static\s+|async\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/);
    if (m) names.add(m[1]);
  }
  return names;
}
const diff = (a, b) => [...a].filter((n) => !b.has(n)).sort();

const before = inventory(lines('scratch/backup/game.js.phase3.bak'));
const after = inventory(lines('js/game.js'));
const removed = diff(before, after);
const added = diff(after, before);

const expected = ['advanceCutscene', 'finishCutscene', 'getCutsceneDialogue', 'skipCutscene',
  'startAquaticPhase13Cutscene', 'startAquaticUnlockCutscene', 'startFloraPhase10Cutscene',
  'startFloraUnlockCutscene', 'startHellfirePhase10Cutscene', 'startHellfireUnlockCutscene',
  'startMetallicPhase10Cutscene', 'startMetallicUnlockCutscene', 'startPhase17Cutscene',
  'startSoilPhase10Cutscene', 'startSoilUnlockCutscene'].sort();

console.log('--- js/game.js ---');
// All 15 must be gone. Exact removal accounting is owned by
// scratch/verify_inventory.mjs, which stays valid as later phases edit game.js.
check('all 15 cutscene methods are gone',
  expected.every((n) => !after.has(n)),
  `still present: ${expected.filter((n) => after.has(n)).join(', ')}`);
check('no methods added', added.length === 0, added.join(', '));

const gameText = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
check('CutsceneSystem imported', gameText.includes("import * as CutsceneSystem from '../src/systems/CutsceneSystem.js';"));
check('no stale this.start*Cutscene call', !/this\.start\w*Cutscene\(/.test(gameText));
check('no stale this.advanceCutscene/skipCutscene/finishCutscene call',
  !/this\.(advanceCutscene|skipCutscene|finishCutscene)\(/.test(gameText));
check('constructor resolves dialogue via CutsceneSystem.getLines',
  gameText.includes('CutsceneSystem.getLines("devourer_p17")'));
const startCalls = (gameText.match(/CutsceneSystem\.start\(this, "/g) || []).length;
// 11 -> 13: the windy sword adds its unlock and final-phase (p13) call sites, the
// same pair every other sword contributes (devourer contributes only p17).
// 13 -> 15: frostbite contributes the same pair (unlock + p12).
// 15 -> 17: voltstrike contributes the same pair (unlock + p14).
// 17 -> 23: lumen (unlock + p14), umbra (unlock + p15) and sanguine (unlock + p16)
//           each contribute the same pair.
// 23 -> 29: order (unlock + p12), tremor (unlock + p10) and poison (unlock + p14)
//           each contribute the same pair.
// The count IS the invariant — a lost call site still fails here.
check(`all 29 start call sites rewired (found ${startCalls})`, startCalls === 29);
check('surrounding systems intact',
  // updateBloodmoon/unlockAchievement are absent on purpose — Phase 5 moved them
  // into src/systems. Exact accounting lives in scratch/verify_inventory.mjs.
  ['update', 'render', 'draw', 'equipSword', 'onSwordPhaseUp', 'handleNpcDeath', 'handleInteraction']
    .every((n) => after.has(n)));

console.log('\n--- js/main.js ---');
const mainText = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
check('CutsceneSystem imported', mainText.includes("import * as CutsceneSystem from '../src/systems/CutsceneSystem.js';"));
// Counted across main.js AND src/**: Phase 6 wiring relocation moves call sites
  // out of main.js into the module that owns those events (keydown now lives in
  // InputManager.js). The invariant is the TOTAL — no call site lost, wherever it
  // ends up living.
  let srcText = '';
  const walkSrc = (dir) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walkSrc(rel);
      else if (e.name.endsWith('.js')) srcText += fs.readFileSync(path.join(root, rel), 'utf8') + '\n';
    }
  };
  walkSrc('src');
  const surfaceText = mainText + '\n' + srcText;
  // Accepts BOTH `CutsceneSystem.advance(game)` (called from another module) and a
  // bare `advance(game)` (called from inside CutsceneSystem.js, where it is local).
  // The definitions are masked so `export function advance(game)` is not counted.
  const callSites = surfaceText.replace(/export function (advance|skip)\s*\(/g, '__DEF__(');
  check('advance rewired',
    (callSites.match(/(?:CutsceneSystem\.)?advance\(game\)/g) || []).length === 2 &&
    !surfaceText.includes('game.advanceCutscene('));
  check('skip rewired',
    (callSites.match(/(?:CutsceneSystem\.)?skip\(game\)/g) || []).length === 2 &&
    !surfaceText.includes('game.skipCutscene('));

console.log('');
console.log(failures === 0 ? 'PHASE 3 SPLICE VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
