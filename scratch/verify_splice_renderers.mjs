/**
 * Phase 4 splice verification — confirms exactly the 8 renderer methods were
 * removed from js/game.js and every call site was rewired.
 *
 * Rendering equivalence itself is proven separately and much more strongly by
 * the canvas pixel-hash comparison (see refactor-progress.json phase_4 notes):
 * MENU / LOBBY / COMBAT / BEAM scenes hash identically before and after.
 *
 * Run:  node scratch/verify_splice_renderers.mjs
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

const before = inventory(lines('scratch/backup/game.js.phase4.bak'));
const after = inventory(lines('js/game.js'));
const removed = diff(before, after);
const added = diff(after, before);

const expected = ['drawAmbientMenuBg', 'drawGluttonyBeam', 'drawLobbyDecorations', 'drawLobbyFloor',
  'drawLobbyFurnitureAndProps', 'drawMapWorld', 'drawSafeRoundRect', 'drawVillageStructures'].sort();

console.log('--- js/game.js ---');
// All 8 must be gone. Exact removal accounting is owned by
// scratch/verify_inventory.mjs, which stays valid as later phases edit game.js.
check('all 8 renderer methods are gone',
  expected.every((n) => !after.has(n)),
  `still present: ${expected.filter((n) => after.has(n)).join(', ')}`);
check('no methods added', added.length === 0, added.join(', '));

const text = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
check('WorldRenderer imported', text.includes("import * as WorldRenderer from '../src/render/WorldRenderer.js';"));
check('LobbyRenderer imported', text.includes("import * as LobbyRenderer from '../src/render/LobbyRenderer.js';"));
check('getSwordRenderer imported', text.includes("import { getSwordRenderer } from '../src/swords/SwordRegistry.js';"));

for (const n of expected) {
  check(`no stale this.${n}() call`, !new RegExp(`this\\.${n}\\(`).test(text));
}

console.log('\n--- call sites ---');
check('drawAmbientMenuBg rewired', text.includes('LobbyRenderer.drawAmbientMenuBg(this)'));
check('drawMapWorld rewired', text.includes('WorldRenderer.drawMapWorld(this, activeMap)'));
check('drawLobbyFloor rewired', text.includes('LobbyRenderer.drawLobbyFloor(this, activeMap)'));
check('drawVillageStructures rewired', text.includes('WorldRenderer.drawVillageStructures(this, activeMap)'));
check('drawLobbyFurnitureAndProps rewired', text.includes('LobbyRenderer.drawLobbyFurnitureAndProps(this, activeMap)'));
check('drawGluttonyBeam rewired', text.includes('getSwordRenderer("devourer").drawBeam(this.ctx, this)'));
check('render()/draw() survived', after.has('render') && after.has('draw'));

console.log('\n--- extracted modules ---');
const world = fs.readFileSync(path.join(root, 'src/render/WorldRenderer.js'), 'utf8');
const lobby = fs.readFileSync(path.join(root, 'src/render/LobbyRenderer.js'), 'utf8');
const devourer = fs.readFileSync(path.join(root, 'src/swords/devourer/devourer.render.js'), 'utf8');
check('WorldRenderer exports the 3 world functions',
  ['drawMapWorld', 'drawVillageStructures', 'drawSafeRoundRect'].every((n) => world.includes(`export function ${n}(`)));
check('LobbyRenderer exports the 4 lobby functions',
  ['drawAmbientMenuBg', 'drawLobbyFloor', 'drawLobbyFurnitureAndProps', 'drawLobbyDecorations'].every((n) => lobby.includes(`export function ${n}(`)));
check('LobbyRenderer imports the shared round-rect helper', lobby.includes("import { drawSafeRoundRect } from './WorldRenderer.js';"));
check('drawLobbyDecorations preserved although unused', lobby.includes('export function drawLobbyDecorations('));
check('devourer.render.js gained drawBeam', /^\s{2}drawBeam\(ctx, game\)\s*\{/m.test(devourer));
check('devourer.render.js still has drawBlade + drawAura',
  /^\s{2}drawBlade\(/m.test(devourer) && /^\s{2}drawAura\(/m.test(devourer));

console.log('');
console.log(failures === 0 ? 'PHASE 4 SPLICE VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
