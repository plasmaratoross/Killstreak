/**
 * Cumulative method-inventory verification.
 *
 * Phase-specific splice verifiers compare against their own backup, so they go
 * stale as soon as a later phase edits the same file again. This harness instead
 * compares the CURRENT files against the ORIGINAL pre-Phase-2 backups and asserts
 * the removed set equals the union of everything every phase removed.
 *
 * That single check stays valid as phases accumulate, and still catches the two
 * things that matter: a method silently lost, or one silently added.
 *
 * Run:  node scratch/verify_inventory.mjs
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

/** the union of what every phase removed, per file */
const REMOVALS = {
  'js/game.js': {
    bak: 'scratch/backup/game.js.bak',
    // Phase 2 (activate*), Phase 3 (cutscene*), Phase 4 (renderers)
    methods: [
      'activateGluttony', 'activateEngulf', 'activateTsunami', 'activateFortitude',
      'activateIronWill', 'activateWorldroot', 'activateCataclysm',
      'getCutsceneDialogue',
      'startAquaticUnlockCutscene', 'startAquaticPhase13Cutscene',
      'startSoilUnlockCutscene', 'startSoilPhase10Cutscene',
      'startMetallicUnlockCutscene', 'startMetallicPhase10Cutscene',
      'startFloraUnlockCutscene', 'startFloraPhase10Cutscene',
      'startHellfireUnlockCutscene', 'startHellfirePhase10Cutscene',
      'startPhase17Cutscene',
      'advanceCutscene', 'skipCutscene', 'finishCutscene',
      'drawMapWorld', 'drawVillageStructures', 'drawSafeRoundRect',
      'drawLobbyFloor', 'drawLobbyFurnitureAndProps', 'drawLobbyDecorations',
      'drawAmbientMenuBg', 'drawGluttonyBeam',
      // Phase 5 (achievements + bloodmoon)
      'checkFirstSessionAchievement', 'unlockAchievement', 'checkAchievements',
      'updateBloodmoon', 'startBloodmoon', 'endBloodmoon', 'summonEvent',
      'showBloodmoonBanner', 'applyBloodmoonNpcBoosts', 'restoreBloodmoonNpcStats'
    ]
  },
  'js/entities.js': {
    bak: 'scratch/backup/entities.js.bak',
    // Phase 2 (blade + aura renderers)
    methods: [
      'drawBlade', 'drawOverdriveBlade', 'drawAquaticBlade',
      'drawPhaseAura', 'drawOverdriveAura', 'drawAquaticAura',
      'drawSoilBlade', 'drawSoilAura', 'drawMetallicBlade', 'drawMetallicAura',
      'drawFloraBlade', 'drawFloraAura', 'drawHellfireBlade', 'drawHellfireAura'
    ]
  }
};

for (const [file, spec] of Object.entries(REMOVALS)) {
  const before = inventory(lines(spec.bak));
  const after = inventory(lines(file));
  const removed = [...before].filter((n) => !after.has(n)).sort();
  const expected = [...spec.methods].sort();
  const added = [...after].filter((n) => !before.has(n)).sort();

  console.log(`--- ${file} (baseline ${spec.bak}) ---`);
  check(`exactly ${expected.length} methods removed across all phases`,
    JSON.stringify(removed) === JSON.stringify(expected),
    removed.length === expected.length
      ? `\n      only order differs (harmless)\n      removed : ${removed.join(', ')}\n      expected: ${expected.join(', ')}`
      : `\n      missing from removal set: ${expected.filter((n) => !removed.includes(n))}\n      unexpectedly removed    : ${removed.filter((n) => !expected.includes(n))}`);
  check(`no methods silently lost beyond the removal set (${before.size} -> ${after.size})`,
    removed.every((n) => expected.includes(n)));
  check('no methods added', added.length === 0, added.join(', '));
  console.log('');
}

// ------------------------------------------- dangling host-method references
// Extracted modules call back into the Game instance (game.handleNpcDeath(...),
// game.unlockAchievement(...)). Once a method is removed from Game, such a call
// becomes a runtime TypeError that neither `npm run build` nor a stubbed unit
// harness catches — the stub keeps supplying the method. This check closes that
// gap statically.
console.log('--- cross-module: game.*() call targets ---');
{
  const gameMethods = inventory(lines('js/game.js'));
  const dirs = ['src/systems', 'src/render', 'src/swords', 'src/i18n', 'src/core', 'src/ui', 'src/utils'];
  const files = [];
  const walk = (d) => {
    const abs = path.join(root, d);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else if (e.name.endsWith('.js')) files.push(path.join(d, e.name));
    }
  };
  dirs.forEach(walk);

  const dangling = [];
  // strip comments first — headers contain prose like "js/game.js (Game.x)"
  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const f of files) {
    const src = stripComments(fs.readFileSync(f, 'utf8'));
    for (const m of src.matchAll(/\bgame\.([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (!gameMethods.has(m[1])) {
        dangling.push(`${path.relative(root, f).replace(/\\/g, '/')}: game.${m[1]}()`);
      }
    }
  }
  check(`every game.*() call in src/ resolves to a live Game method (${files.length} files scanned)`,
    dangling.length === 0,
    `dangling:\n      ${dangling.join('\n      ')}`);
  console.log('');
}

console.log(failures === 0 ? 'CUMULATIVE INVENTORY VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
