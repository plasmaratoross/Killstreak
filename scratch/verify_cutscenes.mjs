/**
 * Phase 3 behavioural equivalence test.
 *
 * Loads the pre-splice Game class from scratch/backup/game.js.bak in a stubbed
 * window, then runs each original cutscene method against an identical stub and
 * compares the observable result with the new CutsceneSystem.
 *
 * What is compared per cutscene:
 *   start()  -> isCutsceneActive, cutsceneIndex, cutsceneTimer, cutsceneType,
 *               cutsceneDialogue, and the ordered effect log
 *               (camera.shake, unlockAchievement, callbacks)
 *   finish() -> the full saveData mutation plus the ordered effect log
 *               (Storage.save, camera.shake, Particle/FloatingText construction
 *               with their exact arguments, callbacks)
 *   advance()-> state transition, particle log, onCutsceneStep callback
 *
 * Math.random is replaced with a deterministic sequence that is reset before
 * every run, otherwise particle angles would differ between the two paths.
 *
 * Run:  node scratch/verify_cutscenes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// ------------------------------------------------------------ deterministic rng
let seed = 1;
const realRandom = Math.random;
function seedRandom(s) { seed = s; }
Math.random = () => {
  // xorshift32 -> [0,1)
  seed ^= seed << 13; seed >>>= 0;
  seed ^= seed >>> 17;
  seed ^= seed << 5; seed >>>= 0;
  return seed / 4294967296;
};

// ------------------------------------------------------------------- stub world
let log = [];
const rec = (type, args) => { log.push(`${type}(${args.map((a) => JSON.stringify(a)).join(', ')})`); };

class Particle { constructor(...a) { rec('Particle', a); } }
class FloatingText { constructor(...a) { rec('FloatingText', a); } }
class TsunamiWave { constructor(...a) { rec('TsunamiWave', a); } }
class Camera { constructor() { this.shake = (...a) => rec('shake', a); } }
class Player { constructor() { this.x = 600; this.y = 400; } }

const Storage = { save: (...a) => rec('Storage.save', a), load: () => ({}) };

const win = {
  Killstreak: {
    Storage,
    Entities: { Camera, Player, NPC: class {}, Tree: class {}, Rock: class {}, SwordStand: class {},
      Portal: class {}, Particle, FloatingText, TsunamiWave, Tsunami: TsunamiWave },
    I18n: null
  }
};
globalThis.window = win;
globalThis.document = { documentElement: { setAttribute() {} }, querySelectorAll: () => [] };

// Real Config — CutsceneSystem grants *_ascended achievements through
// AchievementSystem, which reads Config.ACHIEVEMENTS.
new Function('window', 'console', fs.readFileSync(path.join(root, 'js/config.js'), 'utf8'))(win, console);
if (!win.Killstreak.Config?.ACHIEVEMENTS?.length) throw new Error('Config.ACHIEVEMENTS did not load');

// load the ORIGINAL Game class out of the backup
const backup = fs.readFileSync(path.join(root, 'scratch/backup/game.js.bak'), 'utf8');
new Function('window', 'console', backup)(win, console);
const Game = win.Killstreak.Game;
if (typeof Game !== 'function') throw new Error('could not load Game class from backup');

// load the NEW system
const CutsceneSystem = await import('../src/systems/CutsceneSystem.js');

// ------------------------------------------------------------------ fresh stub
function makeGame() {
  return {
    isCutsceneActive: false,
    cutsceneIndex: 0,
    cutsceneTimer: 0,
    cutsceneType: "devourer_p17",
    cutsceneDialogue: [],
    saveData: {
      achievements: [], badges: [],
      aquaticUnlockCutsceneSeen: false, aquaticPhase13CutsceneSeen: false,
      soilUnlockCutsceneSeen: false, soilPhase10CutsceneSeen: false,
      metallicUnlockCutsceneSeen: false, metallicPhase10CutsceneSeen: false,
      floraUnlockCutsceneSeen: false, floraPhase10CutsceneSeen: false,
      hellfireUnlockCutsceneSeen: false, hellfirePhase10CutsceneSeen: false,
      phase17CutsceneSeen: false
    },
    camera: new Camera(),
    player: new Player(),
    particles: [], floatingTexts: [],
    callbacks: {
      onCutsceneStart: (s) => rec('onCutsceneStart', [s]),
      onCutsceneStep: (s) => rec('onCutsceneStep', [s]),
      onCutsceneEnd: () => rec('onCutsceneEnd', []),
      onToast: (...a) => rec('onToast', a),
      onBadgesUpdated: (b) => rec('onBadgesUpdated', [b])
    },
    // Use the REAL implementation so the original path (this.unlockAchievement)
    // and the new path (AchievementSystem.unlockAchievement) run identical logic.
    unlockAchievement: Game.prototype.unlockAchievement,
    // startPhase17Cutscene() calls this on the host object
    getCutsceneDialogue: Game.prototype.getCutsceneDialogue,
    // advanceCutscene() calls this on the host object
    finishCutscene: Game.prototype.finishCutscene
  };
}

const snapshot = (g) => ({
  isCutsceneActive: g.isCutsceneActive,
  cutsceneIndex: g.cutsceneIndex,
  cutsceneTimer: g.cutsceneTimer,
  cutsceneType: g.cutsceneType,
  cutsceneDialogue: g.cutsceneDialogue,
  saveData: g.saveData
});

const CUTSCENES = [
  { id: 'aquatic_unlock', method: 'startAquaticUnlockCutscene' },
  { id: 'aquatic_p13', method: 'startAquaticPhase13Cutscene' },
  { id: 'soil_unlock', method: 'startSoilUnlockCutscene' },
  { id: 'soil_p10', method: 'startSoilPhase10Cutscene' },
  { id: 'metallic_unlock', method: 'startMetallicUnlockCutscene' },
  { id: 'metallic_p10', method: 'startMetallicPhase10Cutscene' },
  { id: 'flora_unlock', method: 'startFloraUnlockCutscene' },
  { id: 'flora_p10', method: 'startFloraPhase10Cutscene' },
  { id: 'hellfire_unlock', method: 'startHellfireUnlockCutscene' },
  { id: 'hellfire_p10', method: 'startHellfirePhase10Cutscene' },
  { id: 'devourer_p17', method: 'startPhase17Cutscene' }
];

console.log('=== start() equivalence ===');
for (const c of CUTSCENES) {
  log = []; seedRandom(12345);
  const g1 = makeGame();
  Game.prototype[c.method].call(g1);
  const s1 = snapshot(g1); const l1 = [...log];

  log = []; seedRandom(12345);
  const g2 = makeGame();
  CutsceneSystem.start(g2, c.id);
  const s2 = snapshot(g2); const l2 = [...log];

  const same = JSON.stringify(s1) === JSON.stringify(s2) && JSON.stringify(l1) === JSON.stringify(l2);
  let detail = '';
  if (JSON.stringify(s1) !== JSON.stringify(s2)) {
    detail = `state differs:\n        old: ${JSON.stringify(s1).slice(0, 300)}\n        new: ${JSON.stringify(s2).slice(0, 300)}`;
  } else if (JSON.stringify(l1) !== JSON.stringify(l2)) {
    detail = `effect log differs:\n        old: ${l1.join(' | ')}\n        new: ${l2.join(' | ')}`;
  }
  check(`${c.id.padEnd(16)} start(): state + ${l1.length} effects match`, same, detail);
}

console.log('\n=== finish() equivalence ===');
for (const c of CUTSCENES) {
  log = []; seedRandom(999);
  const g1 = makeGame();
  g1.cutsceneType = c.id;
  g1.isCutsceneActive = true;
  Game.prototype.finishCutscene.call(g1);
  const s1 = snapshot(g1); const l1 = [...log];

  log = []; seedRandom(999);
  const g2 = makeGame();
  g2.cutsceneType = c.id;
  g2.isCutsceneActive = true;
  CutsceneSystem.finish(g2);
  const s2 = snapshot(g2); const l2 = [...log];

  const same = JSON.stringify(s1) === JSON.stringify(s2) && JSON.stringify(l1) === JSON.stringify(l2);
  let detail = '';
  if (JSON.stringify(s1) !== JSON.stringify(s2)) {
    detail = `state differs:\n        old: ${JSON.stringify(s1.saveData)}\n        new: ${JSON.stringify(s2.saveData)}`;
  } else if (JSON.stringify(l1) !== JSON.stringify(l2)) {
    const i = l1.findIndex((x, k) => x !== l2[k]);
    detail = `effect log differs at #${i}:\n        old: ${l1.slice(Math.max(0, i - 1), i + 3).join(' | ')}\n        new: ${l2.slice(Math.max(0, i - 1), i + 3).join(' | ')}`;
  }
  check(`${c.id.padEnd(16)} finish(): saveData + ${l1.length} effects match`, same, detail);
}

console.log('\n=== advance() / skip() equivalence ===');
{
  const run = (fn) => {
    log = []; seedRandom(777);
    const g = makeGame();
    g.isCutsceneActive = true;
    g.cutsceneType = 'soil_p10';
    g.cutsceneDialogue = [{ speaker: 'A', text: '1' }, { speaker: 'B', text: '2' }, { speaker: 'C', text: '3' }];
    g.cutsceneIndex = 0;
    fn(g);
    return { snap: snapshot(g), log: [...log] };
  };
  const oldAdv = run((g) => Game.prototype.advanceCutscene.call(g));
  const newAdv = run((g) => CutsceneSystem.advance(g));
  check('advance(): mid-cutscene state + effects match',
    JSON.stringify(oldAdv) === JSON.stringify(newAdv),
    `\n      old: ${JSON.stringify(oldAdv).slice(0, 400)}\n      new: ${JSON.stringify(newAdv).slice(0, 400)}`);

  // advancing past the last line must run finish()
  const runLast = (fn) => {
    log = []; seedRandom(555);
    const g = makeGame();
    g.isCutsceneActive = true;
    g.cutsceneType = 'hellfire_unlock';
    g.cutsceneDialogue = [{ speaker: 'A', text: '1' }];
    g.cutsceneIndex = 0;
    fn(g);
    return { snap: snapshot(g), log: [...log] };
  };
  const oldLast = runLast((g) => Game.prototype.advanceCutscene.call(g));
  const newLast = runLast((g) => CutsceneSystem.advance(g));
  check('advance() past last line triggers the same finish() effects',
    JSON.stringify(oldLast) === JSON.stringify(newLast),
    `\n      old: ${JSON.stringify(oldLast).slice(0, 400)}\n      new: ${JSON.stringify(newLast).slice(0, 400)}`);

  const oldSkip = run((g) => Game.prototype.skipCutscene.call(g));
  const newSkip = run((g) => CutsceneSystem.skip(g));
  check('skip(): identical finish() effects', JSON.stringify(oldSkip) === JSON.stringify(newSkip));
}

console.log('\n=== dialogue helper ===');
for (const c of CUTSCENES) {
  const g = makeGame();
  const oldLines = c.id === 'devourer_p17' ? Game.prototype.getCutsceneDialogue.call(g) : null;
  if (!oldLines) continue;
  const newLines = CutsceneSystem.getLines(c.id);
  check('getLines("devourer_p17") matches Game.getCutsceneDialogue()',
    JSON.stringify(oldLines) === JSON.stringify(newLines),
    `\n      old: ${JSON.stringify(oldLines).slice(0, 200)}\n      new: ${JSON.stringify(newLines).slice(0, 200)}`);
}

Math.random = realRandom;
console.log('');
console.log(failures === 0 ? 'CUTSCENE SYSTEM IS BEHAVIOURALLY IDENTICAL' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
