/**
 * Sword renderer-contract + NPC identity verifier.
 *
 * Why this exists: a sword's render module is reached ONLY through
 * `getSwordRenderer(id).drawBlade(ctx, geom, player)` and `.drawAura(ctx, player)`
 * (js/entities.js:550/555). A module that exports anything else does not merely
 * look wrong — the call is `undefined(...)`, the player's whole draw throws, and
 * the player vanishes from the screen with no i18n/console hint. That is exactly
 * what `poison.render.js` shipped (`renderSword(ctx, player, phase, scale)`).
 *
 * Section 1 therefore asserts the contract for every id in SwordRegistry's
 * SWORD_IDS, and actually calls both methods once per phase of that sword's data
 * JSON, so a throw or an unbalanced ctx.save()/restore() fails here, not in-game.
 *
 * Section 2 is a SOURCE check (js/entities.js cannot be imported under plain Node
 * because src/swords/SwordRegistry.js imports .json without import attributes).
 * It pins NPC identity: Order's Judgment marks targets and Tremor's Seismic Wave
 * dedupes hits via `npc.id`. With no id on NPC, `ids.includes(undefined)` is true
 * for every NPC, so the first touch marked — and the verdict then executed —
 * the entire zone.
 *
 * Run:  node scratch/verify_sword_render_contract.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// ---- chainable canvas stub -------------------------------------------------
// Unknown properties read as `anyValue`: callable, returning itself, and coercing
// to 0 so `ctx.globalAlpha * 2` style arithmetic stays numeric. That lets real
// render code run without a browser canvas.
const anyValue = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : anyValue),
  apply: () => anyValue,
  set: () => true
});

function makeCtx() {
  const target = {};
  const state = { depth: 0, minDepth: 0 };
  const ctx = new Proxy(target, {
    get(t, k) {
      if (k === 'save') return () => { state.depth++; };
      if (k === 'restore') return () => {
        state.depth--;
        if (state.depth < state.minDepth) state.minDepth = state.depth;
      };
      if (k in t) return Reflect.get(t, k);
      return anyValue;
    },
    set(t, k, v) { Reflect.set(t, k, v); return true; }
  });
  return { ctx, state };
}

// ---- resolve the sword list from the registry itself -----------------------
const registrySrc = fs.readFileSync(path.join(root, 'src/swords/SwordRegistry.js'), 'utf8');
const idsMatch = registrySrc.match(/export const SWORD_IDS = \[([^\]]*)\]/);
const swordIds = idsMatch
  ? idsMatch[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean)
  : [];
check('SwordRegistry exports a non-empty SWORD_IDS', swordIds.length > 0, `got ${swordIds.length}`);

console.log('\n--- renderer contract (all registered swords, all phases) ---');
for (const id of swordIds) {
  const rel = `src/swords/${id}/${id}.render.js`;
  if (!fs.existsSync(path.join(root, rel))) {
    check(`${id}: ${rel} exists`, false, 'file not found');
    continue;
  }

  let renderer;
  try {
    renderer = (await import(new URL(`../${rel}`, import.meta.url).href)).default;
  } catch (err) {
    check(`${id}: imports cleanly`, false, String(err && err.message));
    continue;
  }

  check(`${id}: exports drawBlade`, typeof renderer?.drawBlade === 'function', `typeof = ${typeof renderer?.drawBlade}`);
  check(`${id}: exports drawAura`, typeof renderer?.drawAura === 'function', `typeof = ${typeof renderer?.drawAura}`);
  if (typeof renderer?.drawBlade !== 'function' || typeof renderer?.drawAura !== 'function') continue;

  const data = JSON.parse(fs.readFileSync(path.join(root, `src/swords/${id}/${id}.data.json`), 'utf8'));
  const phases = data.phases || [];
  if (phases.length === 0) { check(`${id}: data has phases`, false); continue; }

  const problems = [];
  for (const phase of phases) {
    const player = {
      x: 100, y: 100, radius: phase.radius || 16, animTimer: 1.23,
      swordId: id, isSwordEquipped: true, phase
    };
    const geom = {
      baseX: 100, baseY: 100,
      tipX: 100 + (phase.bladeLength || 50), tipY: 100,
      angle: 0.5, length: phase.bladeLength || 50
    };
    for (const name of ['drawBlade', 'drawAura']) {
      const { ctx, state } = makeCtx();
      try {
        if (name === 'drawBlade') renderer.drawBlade(ctx, geom, player);
        else renderer.drawAura(ctx, player);
      } catch (err) {
        problems.push(`phase ${phase.phase} ${name} threw: ${err && err.message}`);
        continue;
      }
      if (state.depth !== 0) problems.push(`phase ${phase.phase} ${name} left save/restore depth ${state.depth}`);
      if (state.minDepth < 0) problems.push(`phase ${phase.phase} ${name} restored without saving (min ${state.minDepth})`);
    }
  }
  check(`${id}: drawBlade/drawAura run clean for all ${phases.length} phases`, problems.length === 0, problems.slice(0, 4).join('\n      '));
}

console.log('\n--- NPC identity (source check; see header) ---');
const entitiesSrc = fs.readFileSync(path.join(root, 'js/entities.js'), 'utf8');
check('NPC constructor assigns a unique id', /this\.id = \(NPC\.nextId = \(NPC\.nextId \|\| 0\) \+ 1\);/.test(entitiesSrc));

const gameSrc = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');
check('Judgment marks targets by npc.id', gameSrc.includes('this.judgmentMarkedNpcIds.push(npc.id)'));
check('Seismic Wave dedupes hits by npc.id', gameSrc.includes('wave.hitNpcIds.push(npc.id)'));

console.log('');
console.log(failures === 0
  ? 'ALL SWORD RENDERERS SATISFY THE CONTRACT; NPC IDENTITY IS ASSIGNED'
  : `${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
