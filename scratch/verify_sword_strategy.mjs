/**
 * Phase 2 fidelity verifier.
 *
 * Independently reconstructs what each strategy module *should* contain from the
 * pre-splice legacy source, then compares it to what was actually emitted.
 *
 * The baseline is `scratch/backup/*.bak` rather than `js/*.js`, because the
 * splice removed the original methods from the live files. This keeps the
 * harness re-runnable: it still proves the modules carry the legacy logic
 * verbatim, independent of anything the live files now contain.
 *
 * Comparison normalises the host binding (`this.` / `player.` / `game.`) to a
 * single token and collapses whitespace, so the check catches dropped, added,
 * reordered or altered statements without being confused by the rebinding.
 *
 * Run:  node scratch/verify_sword_strategy.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

// ---- locate a method body by brace matching from its 4-space-indent signature
function methodBody(lines, name) {
  const re = new RegExp(`^    ${name}\\s*\\(`);
  const sig = lines.findIndex((l) => re.test(l));
  if (sig === -1) throw new Error(`${name} not found`);
  let depth = 0;
  let started = false;
  for (let i = sig; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) return lines.slice(sig + 1, i); }
    }
  }
  throw new Error(`${name} unterminated`);
}

// ---- pull a body out of a generated module file
function moduleBody(text, fnName, params) {
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes(`${fnName}(${params})`));
  if (idx === -1) throw new Error(`${fnName} not found in module`);
  let depth = 0;
  let started = false;
  for (let i = idx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) return lines.slice(idx + 1, i); }
    }
  }
  throw new Error(`${fnName} unterminated in module`);
}

// Lines the extractor injects to re-resolve file-scope entity bindings. These
// are infrastructure, not moved logic, so they are excluded from the diff.
const INJECTED = [
  /^\/\/ Re-resolve entity classes/,
  /^const \{.*\} = \(window\.Killstreak/
];

const normalise = (lines) =>
  lines
    .filter((l) => !INJECTED.some((re) => re.test(l.trim())))
    .map((l) => l.replace(/\b(?:this|player|game)\./g, 'SELF.').replace(/\s+/g, ' ').trim())
    .filter((l) => l !== '');

const entityLines = fs.readFileSync(path.join(root, 'scratch/backup/entities.js.bak'), 'utf8').split(/\r?\n/);
const gameLines = fs.readFileSync(path.join(root, 'scratch/backup/game.js.bak'), 'utf8').split(/\r?\n/);

const SWORD_MAP = [
  { id: 'devourer', blade: 'drawBlade', aura: 'drawPhaseAura' },
  { id: 'overdrive', blade: 'drawOverdriveBlade', aura: 'drawOverdriveAura' },
  { id: 'aquatic', blade: 'drawAquaticBlade', aura: 'drawAquaticAura' },
  { id: 'soil', blade: 'drawSoilBlade', aura: 'drawSoilAura' },
  { id: 'metallic', blade: 'drawMetallicBlade', aura: 'drawMetallicAura' },
  { id: 'flora', blade: 'drawFloraBlade', aura: 'drawFloraAura' },
  { id: 'hellfire', blade: 'drawHellfireBlade', aura: 'drawHellfireAura' }
];
/**
 * Ability mapping mirrors the extractor. Derived from the guards inside each
 * body — `activateEngulf` guards on swordId "devourer" + phase 17, so it is
 * Devourer's secondary ability despite the guide calling it Overdrive's.
 */
const ABILITY_MAP = [
  { out: 'src/swords/devourer/devourer.ability.js', method: 'activateGluttony' },
  { out: 'src/swords/devourer/devourer.engulf.ability.js', method: 'activateEngulf' },
  { out: 'src/swords/aquatic/aquatic.ability.js', method: 'activateTsunami' },
  { out: 'src/swords/soil/soil.ability.js', method: 'activateFortitude' },
  { out: 'src/swords/metallic/metallic.ability.js', method: 'activateIronWill' },
  { out: 'src/swords/flora/flora.ability.js', method: 'activateWorldroot' },
  { out: 'src/swords/hellfire/hellfire.ability.js', method: 'activateCataclysm' }
];

for (const { id, blade, aura } of SWORD_MAP) {
  const modPath = `src/swords/${id}/${id}.render.js`;
  const text = fs.readFileSync(path.join(root, modPath), 'utf8');

  for (const [srcName, fnName, params] of [[blade, 'drawBlade', 'ctx, geom, player'], [aura, 'drawAura', 'ctx, player']]) {
    const expected = normalise(methodBody(entityLines, srcName));
    const actual = normalise(moduleBody(text, fnName, params));
    const same = expected.length === actual.length && expected.every((l, i) => l === actual[i]);
    let detail = '';
    if (!same) {
      const i = expected.findIndex((l, k) => l !== actual[k]);
      detail = `first divergence at normalised line ${i}\n      src: ${expected[i]}\n      mod: ${actual[i]}`;
    }
    check(`${modPath} ${fnName} == Player.${srcName} (${expected.length} stmts)`, same, detail);
  }
}

for (const { out: modPath, method } of ABILITY_MAP) {
  const text = fs.readFileSync(path.join(root, modPath), 'utf8');
  const expected = normalise(methodBody(gameLines, method));
  const actual = normalise(moduleBody(text, 'activate', 'game'));
  const same = expected.length === actual.length && expected.every((l, i) => l === actual[i]);
  let detail = '';
  if (!same) {
    const i = expected.findIndex((l, k) => l !== actual[k]);
    detail = `first divergence at normalised line ${i}\n      src: ${expected[i]}\n      mod: ${actual[i]}`;
  }
  check(`${modPath} activate == Game.${method} (${expected.length} stmts)`, same, detail);
}

console.log('');
console.log(failures === 0 ? 'ALL 21 STRATEGY MODULES MATCH THE LEGACY SOURCE' : `${failures} MODULE(S) DIVERGED`);
process.exit(failures === 0 ? 0 : 1);
