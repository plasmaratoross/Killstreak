import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// 1. Check index.html contains #hud-settings-btn
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
check('index.html contains hud-settings-btn', indexHtml.includes('id="hud-settings-btn"'));

// 2. Check src/ui/modals.js wires hud-settings-btn and pauses on GAME origin
const modalsJs = fs.readFileSync(path.join(root, 'src/ui/modals.js'), 'utf8');
check('modals.js wires hud-settings-btn', modalsJs.includes('hud-settings-btn'));
check('modals.js pauses game on SETTINGS from GAME', modalsJs.includes('if (game && origin === "GAME") game.setPaused(true);'));

// 3. Check js/game.js enables combat and npcs in ATLANTIS
const gameJs = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
check('game.js defines isCombatArea including ATLANTIS', gameJs.includes('const isCombatArea = this.currentArea === "COMBAT" || this.currentArea === "ATLANTIS";'));
check('game.js passes npcs to player.update when isCombatArea', gameJs.includes('this.player.update(dt, this.input, activeMap, worldMouse, isCombatArea ? this.npcs : []);'));
check('game.js runs combat block when isCombatArea', gameJs.includes('if (isCombatArea) {'));

// 4. Check AtlantisNpcRenderer has all 25 NPC types implemented
const { AtlantisNpcRenderer } = await import('../src/render/AtlantisNpcRenderer.js');
const atlantisNpcTypes = [
  "reefmaw", "coralback", "tidescale", "seafang", "abyssfin", "deepclaw", "reefstalker",
  "dreadscale", "tideborn", "leviathan", "abysswalker", "trenchmaw", "depthclaw",
  "gloomray", "abyssal", "sirenborn", "stormscale", "dreadtide", "trenchborn",
  "deepwarden", "abysslord", "tidebreaker", "depthforged", "oceanbane", "abyssforged"
];

check('AtlantisNpcRenderer defines all 25 NPC types', atlantisNpcTypes.every(t => typeof AtlantisNpcRenderer.renderers[t] === 'function'),
  `missing: ${atlantisNpcTypes.filter(t => typeof AtlantisNpcRenderer.renderers[t] !== 'function').join(', ')}`);

// Mock canvas 2D context to verify drawing routines don't crash
const mockCtx = new Proxy({}, {
  get: (target, prop) => {
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
      return () => ({ addColorStop: () => {} });
    }
    return () => {};
  }
});

let drawErrors = 0;
for (const type of atlantisNpcTypes) {
  try {
    const dummyNpc = {
      x: 100, y: 100, radius: 20, isHostile: false, aimAngle: 0, wingTimer: 1.2,
      hitFlashTimer: 0, type, color: "#06b6d4", neutralColor: "#0e3a4e", glowColor: "rgba(6,182,212,0.4)"
    };
    const handledNeutral = AtlantisNpcRenderer.draw(mockCtx, dummyNpc, false);
    dummyNpc.isHostile = true;
    dummyNpc.hitFlashTimer = 0.1;
    const handledHostile = AtlantisNpcRenderer.draw(mockCtx, dummyNpc, true);
    if (!handledNeutral || !handledHostile) drawErrors++;
  } catch (err) {
    console.error(`Error drawing ${type}:`, err);
    drawErrors++;
  }
}
check('all 25 Atlantis NPC draw routines execute cleanly in neutral and hostile/hit states', drawErrors === 0);

console.log(failures === 0 ? '\nALL ATLANTIS AND SETTINGS TESTS PASSED!' : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
