/**
 * Phase 5 behavioural equivalence test.
 *
 * Loads the pre-Phase-5 Game class from scratch/backup/game.js.phase5.bak and the
 * REAL js/config.js into a stubbed window, then runs every extracted method
 * against an identical stub and compares the observable result with the new
 * systems: return value, game/state mutation, DOM classList/textContent changes
 * and the ordered effect log.
 *
 * Run:  node scratch/verify_systems.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// ------------------------------------------------------------------ stub world
let log = [];
const rec = (type, args) => { log.push(`${type}(${args.map((a) => JSON.stringify(a)).join(', ')})`); };
let seed = 1;
const realRandom = Math.random;
const seedRandom = (s) => { seed = s; };
Math.random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };

class Particle { constructor(...a) { rec('Particle', a); } }
class FloatingText { constructor(...a) { rec('FloatingText', a); this.args = a; } }
class TsunamiWave { constructor(...a) { rec('TsunamiWave', a); } }
class Camera { constructor() { this.shake = (...a) => rec('shake', a); } }
class Player { constructor() { this.x = 600; this.y = 400; } }

const els = {};
function makeEl(id) {
  const el = { id, textContent: '', _classes: new Set(['hidden']) };
  el.classList = {
    add: (...c) => { c.forEach((x) => { el._classes.add(x); rec('classList.add', [`${id}:${x}`]); }); },
    remove: (...c) => { c.forEach((x) => { el._classes.delete(x); rec('classList.remove', [`${id}:${x}`]); }); },
    contains: (x) => el._classes.has(x)
  };
  return el;
}
globalThis.document = {
  documentElement: { setAttribute() {} },
  querySelectorAll: () => [],
  getElementById: (id) => (els[id] = els[id] || makeEl(id))
};

const win = {
  Killstreak: {
    Entities: { Camera, Player, NPC: class {}, Tree: class {}, Rock: class {}, SwordStand: class {}, Portal: class {}, Particle, FloatingText, TsunamiWave, Tsunami: TsunamiWave },
    Storage: { save: (...a) => rec('Storage.save', []), load: () => ({}) },
    I18n: null
  }
};
globalThis.window = win;

// real Config (ACHIEVEMENTS, GAME_CONFIG.bloodmoon, ...)
new Function('window', 'console', fs.readFileSync(path.join(root, 'js/config.js'), 'utf8'))(win, console);
if (!win.Killstreak.Config?.ACHIEVEMENTS?.length) throw new Error('Config.ACHIEVEMENTS did not load');

const backup = fs.readFileSync(path.join(root, 'scratch/backup/game.js.phase5.bak'), 'utf8');
// the backup carries ESM imports added by Phases 3-4; `new Function` cannot
// parse those, and none of the Phase 5 methods use them at call time.
new Function('window', 'console', backup.replace(/^import .*$/gm, ''))(win, console);
const Game = win.Killstreak.Game;
if (typeof Game !== 'function') throw new Error('could not load Game class from backup');

const AchievementSystem = await import('../src/systems/AchievementSystem.js');
const BloodmoonEventSystem = await import('../src/systems/BloodmoonEventSystem.js');

// ------------------------------------------------------------------- stub game
function makeGame(overrides = {}) {
  return Object.assign({
    killstreak: 0,
    currentArea: 'COMBAT',
    isGameOver: false,
    saveData: {
      achievements: [], badges: [], swordPhase: 1, highestKillstreak: 0,
      kills: 0, totalKills: 0,
      aquaticPhase: 1, soilPhase: 1, metallicPhase: 1, floraPhase: 1, hellfirePhase: 1,
      overdrivePhase: 1,
      phase17CutsceneSeen: false, aquaticPhase13CutsceneSeen: false,
      soilPhase10CutsceneSeen: false, metallicPhase10CutsceneSeen: false,
      floraPhase10CutsceneSeen: false, hellfirePhase10CutsceneSeen: false
    },
    player: Object.assign(new Player(), { swordId: 'devourer', phase: { phase: 1 }, isSwordEquipped: true }),
    bloodmoon: { isActive: false, activeTimer: 0, checkTimer: 0, npcStatsApplied: false, bannerPhase: 'hidden', bannerTimer: 0 },
    npcs: [],
    floatingTexts: [],
    callbacks: {
      onToast: (...a) => rec('onToast', [a[0], a[1]]),
      onBadgesUpdated: (b) => rec('onBadgesUpdated', [[...b]])
    },
    unlockAchievement: Game.prototype.unlockAchievement,
    // the original bloodmoon methods self-call these on the host object
    startBloodmoon: Game.prototype.startBloodmoon,
    endBloodmoon: Game.prototype.endBloodmoon,
    applyBloodmoonNpcBoosts: Game.prototype.applyBloodmoonNpcBoosts,
    restoreBloodmoonNpcStats: Game.prototype.restoreBloodmoonNpcStats,
    showBloodmoonBanner: Game.prototype.showBloodmoonBanner
  }, overrides);
}

const snap = (g) => JSON.stringify({
  saveData: g.saveData,
  bloodmoon: g.bloodmoon,
  npcs: g.npcs,
  floatingTexts: g.floatingTexts.length,
  els: Object.fromEntries(Object.entries(els).map(([k, v]) => [k, { t: v.textContent, c: [...v._classes].sort() }]))
});

function resetEls() { for (const k of Object.keys(els)) delete els[k]; }

/** run the same scenario against the original method and the new system, compare */
function compare(label, originalFn, newFn, setup = () => {}) {
  const run = (fn, useOriginal) => {
    log = []; seedRandom(4242); resetEls();
    const g = makeGame();
    setup(g);
    const ret = fn(g, useOriginal);
    return { ret: ret === undefined ? null : ret, state: snap(g), log: [...log] };
  };
  const a = run(originalFn, true);
  const b = run(newFn, false);
  const same = JSON.stringify(a) === JSON.stringify(b);
  let detail = '';
  if (!same) {
    if (JSON.stringify(a.ret) !== JSON.stringify(b.ret)) detail = `return: old=${JSON.stringify(a.ret)} new=${JSON.stringify(b.ret)}`;
    else if (a.state !== b.state) {
      const A = JSON.parse(a.state); const B = JSON.parse(b.state);
      const key = Object.keys(A).find((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
      detail = `state.${key}:\n        old=${JSON.stringify(A[key]).slice(0, 260)}\n        new=${JSON.stringify(B[key]).slice(0, 260)}`;
    } else {
      const i = a.log.findIndex((x, k) => x !== b.log[k]);
      detail = `log #${i}:\n        old=${a.log.slice(Math.max(0, i - 1), i + 2).join(' | ')}\n        new=${b.log.slice(Math.max(0, i - 1), i + 2).join(' | ')}`;
    }
  }
  check(label, same, detail);
}

// -------------------------------------------------------------- achievements
console.log('=== achievements ===');
compare('checkFirstSessionAchievement: fresh player grants getting_started',
  (g) => Game.prototype.checkFirstSessionAchievement.call(g),
  (g) => AchievementSystem.checkFirstSessionAchievement(g));

compare('checkFirstSessionAchievement: already earned is a no-op',
  (g) => Game.prototype.checkFirstSessionAchievement.call(g),
  (g) => AchievementSystem.checkFirstSessionAchievement(g),
  (g) => { g.saveData.achievements.push('getting_started'); g.saveData.badges.push('getting_started'); });

compare('unlockAchievement: valid id unlocks achievement + badge',
  (g) => Game.prototype.unlockAchievement.call(g, 'aquatic_ascended'),
  (g) => AchievementSystem.unlockAchievement(g, 'aquatic_ascended'));

compare('unlockAchievement: unknown id returns false',
  (g) => Game.prototype.unlockAchievement.call(g, 'no_such_achievement'),
  (g) => AchievementSystem.unlockAchievement(g, 'no_such_achievement'));

compare('unlockAchievement: repeat unlock is idempotent',
  (g) => Game.prototype.unlockAchievement.call(g, 'soil_ascended'),
  (g) => AchievementSystem.unlockAchievement(g, 'soil_ascended'),
  (g) => { g.saveData.achievements.push('soil_ascended'); g.saveData.badges.push('soil_ascended'); });

compare('checkAchievements: fresh player',
  (g) => Game.prototype.checkAchievements.call(g),
  (g) => AchievementSystem.checkAchievements(g));

compare('checkAchievements: maxed devourer at 75k killstreak',
  (g) => Game.prototype.checkAchievements.call(g),
  (g) => AchievementSystem.checkAchievements(g),
  (g) => { g.player.swordId = 'devourer'; g.player.phase = { phase: 17 }; g.killstreak = 75000; g.saveData.highestKillstreak = 75000; g.saveData.totalKills = 90000; });

compare('checkAchievements: high lifetime kills unlocks kill-gated badges',
  (g) => Game.prototype.checkAchievements.call(g),
  (g) => AchievementSystem.checkAchievements(g),
  (g) => { g.saveData.totalKills = 500000; g.saveData.highestKillstreak = 250000; });

// ---------------------------------------------------------------- bloodmoon
console.log('\n=== bloodmoon ===');
const npc = (hp, dmg, spd) => ({ isDead: false, hp, maxHp: hp, damage: dmg, speed: spd, configObj: { maxHp: hp, damage: dmg, speed: spd } });
const withNpcs = (g) => { g.npcs = [npc(100, 10, 50), npc(200, 20, 60)]; };

compare('updateBloodmoon: idle countdown below check interval',
  (g) => Game.prototype.updateBloodmoon.call(g, 0.5),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 0.5));

compare('updateBloodmoon: roll succeeds and starts the event',
  (g) => Game.prototype.updateBloodmoon.call(g, 1),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 1),
  (g) => { g.bloodmoon.checkTimer = 60; seed = 1; });

compare('updateBloodmoon: active event applies boosts',
  (g) => Game.prototype.updateBloodmoon.call(g, 0.1),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 0.1),
  (g) => { g.bloodmoon.isActive = true; withNpcs(g); });

compare('updateBloodmoon: active event expiring ends it and restores stats',
  (g) => Game.prototype.updateBloodmoon.call(g, 1),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 1),
  (g) => {
    g.bloodmoon.isActive = true; g.bloodmoon.activeTimer = 299.5;
    withNpcs(g);
    Game.prototype.applyBloodmoonNpcBoosts.call(g);
  });

compare('updateBloodmoon: banner entering -> visible transition',
  (g) => Game.prototype.updateBloodmoon.call(g, 0.6),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 0.6),
  (g) => { g.bloodmoon.bannerPhase = 'entering'; g.bloodmoon.bannerTimer = 0.3; });

compare('updateBloodmoon: banner visible -> exiting transition',
  (g) => Game.prototype.updateBloodmoon.call(g, 4),
  (g) => BloodmoonEventSystem.updateBloodmoon(g, 4),
  (g) => { g.bloodmoon.bannerPhase = 'visible'; g.bloodmoon.bannerTimer = 1; });

compare('startBloodmoon: from idle applies boosts and shows banner',
  (g) => Game.prototype.startBloodmoon.call(g),
  (g) => BloodmoonEventSystem.startBloodmoon(g),
  (g) => withNpcs(g));

compare('endBloodmoon: restores boosted NPCs',
  (g) => Game.prototype.endBloodmoon.call(g),
  (g) => BloodmoonEventSystem.endBloodmoon(g),
  (g) => { g.bloodmoon.isActive = true; withNpcs(g); Game.prototype.applyBloodmoonNpcBoosts.call(g); });

compare('summonEvent: inactive -> activates',
  (g) => Game.prototype.summonEvent.call(g, 'bloodmoon'),
  (g) => BloodmoonEventSystem.summonEvent(g, 'bloodmoon'));

compare('summonEvent: active -> deactivates',
  (g) => Game.prototype.summonEvent.call(g, 'bloodmoon'),
  (g) => BloodmoonEventSystem.summonEvent(g, 'bloodmoon'),
  (g) => { g.bloodmoon.isActive = true; });

compare('summonEvent: unknown event name returns false',
  (g) => Game.prototype.summonEvent.call(g, 'eclipse'),
  (g) => BloodmoonEventSystem.summonEvent(g, 'eclipse'));

compare('showBloodmoonBanner: sets text and enter animation',
  (g) => Game.prototype.showBloodmoonBanner.call(g),
  (g) => BloodmoonEventSystem.showBloodmoonBanner(g));

compare('applyBloodmoonNpcBoosts: only boosts living, unboosted NPCs',
  (g) => Game.prototype.applyBloodmoonNpcBoosts.call(g),
  (g) => BloodmoonEventSystem.applyBloodmoonNpcBoosts(g),
  (g) => { g.npcs = [npc(100, 10, 50), Object.assign(npc(200, 20, 60), { isDead: true }), Object.assign(npc(80, 8, 40), { _bloodmoonBoosted: true, _baseMaxHp: 80, _baseDamage: 8, _baseSpeed: 40 })]; });

compare('applyBloodmoonNpcBoosts: preserves current-HP ratio',
  (g) => Game.prototype.applyBloodmoonNpcBoosts.call(g),
  (g) => BloodmoonEventSystem.applyBloodmoonNpcBoosts(g),
  (g) => { const n = npc(200, 20, 60); n.hp = 50; g.npcs = [n]; });

compare('restoreBloodmoonNpcStats: reverts and clears bookkeeping',
  (g) => Game.prototype.restoreBloodmoonNpcStats.call(g),
  (g) => BloodmoonEventSystem.restoreBloodmoonNpcStats(g),
  (g) => { withNpcs(g); Game.prototype.applyBloodmoonNpcBoosts.call(g); });

Math.random = realRandom;
console.log('');
console.log(failures === 0 ? 'BLOODMOON + ACHIEVEMENT SYSTEMS ARE BEHAVIOURALLY IDENTICAL' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
