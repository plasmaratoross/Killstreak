/**
 * Phase 2 splice verification.
 *
 * Proves the splice removed exactly the intended methods and nothing else, by
 * diffing the full method inventory of the backups against the spliced files.
 *
 * Run:  node scratch/verify_splice.mjs
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

// The two dispatch chains as they appeared before the splice, used to rebuild
// the expected post-splice file exactly.
const BLADE_CHAIN_SRC = `        if (this.swordId === "overdrive") {
          this.drawOverdriveBlade(ctx, geom);
        } else if (this.swordId === "aquatic") {
          this.drawAquaticBlade(ctx, geom);
        } else if (this.swordId === "soil") {
          this.drawSoilBlade(ctx, geom);
        } else if (this.swordId === "metallic") {
          this.drawMetallicBlade(ctx, geom);
        } else if (this.swordId === "flora") {
          this.drawFloraBlade(ctx, geom);
        } else if (this.swordId === "hellfire") {
          this.drawHellfireBlade(ctx, geom);
        } else {
          this.drawBlade(ctx, geom);
        }`;

const AURA_CHAIN_SRC = `        if (this.swordId === "overdrive") {
          this.drawOverdriveAura(ctx);
        } else if (this.swordId === "aquatic") {
          this.drawAquaticAura(ctx);
        } else if (this.swordId === "soil") {
          this.drawSoilAura(ctx);
        } else if (this.swordId === "metallic") {
          this.drawMetallicAura(ctx);
        } else if (this.swordId === "flora") {
          this.drawFloraAura(ctx);
        } else if (this.swordId === "hellfire") {
          this.drawHellfireAura(ctx);
        } else {
          this.drawPhaseAura(ctx);
        }`;

/** Every method/property declared at class-member indent (4 spaces). */
function inventory(src) {
  const names = new Set();
  for (const l of src) {
    const m = l.match(/^    (?:static\s+|async\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/);
    if (m) names.add(m[1]);
  }
  return names;
}

const diff = (before, after) => [...before].filter((n) => !after.has(n)).sort();

// ------------------------------------------------------------------ entities
{
  const before = inventory(lines('scratch/backup/entities.js.bak'));
  const after = inventory(lines('js/entities.js'));
  const removed = diff(before, after);
  const added = diff(after, before);

  const expected = ['drawAquaticAura', 'drawAquaticBlade', 'drawBlade', 'drawFloraAura', 'drawFloraBlade',
    'drawHellfireAura', 'drawHellfireBlade', 'drawMetallicAura', 'drawMetallicBlade', 'drawOverdriveAura',
    'drawOverdriveBlade', 'drawPhaseAura', 'drawSoilAura', 'drawSoilBlade'].sort();

  console.log('--- js/entities.js ---');
  check(`exactly the 14 render methods were removed (${removed.length} removed)`,
    JSON.stringify(removed) === JSON.stringify(expected),
    `\n      removed : ${removed.join(', ')}\n      expected: ${expected.join(', ')}`);
  check('no methods were added', added.length === 0, added.join(', '));

  const text = fs.readFileSync(path.join(root, 'js/entities.js'), 'utf8');
  check('blade dispatch collapsed to registry call',
    text.includes('getSwordRenderer(this.swordId).drawBlade(ctx, geom, this);'));
  check('aura dispatch collapsed to registry call',
    text.includes('getSwordRenderer(this.swordId).drawAura(ctx, this);'));
  check('registry import injected',
    text.includes("import { getSwordRenderer } from '../src/swords/SwordRegistry.js';"));
  check('no stale swordId draw chain remains', !/this\.draw\w*Blade\(/.test(text) && !/this\.draw\w*Aura\(/.test(text));
  check('Player.draw() survived', after.has('draw'));
  check('getSwordGeometry() survived', after.has('getSwordGeometry'));
  check('NPC / other classes survived',
    after.has('takeDamage') && after.has('update') && after.has('render'));
}

// ---------------------------------------------------------------------- game
// js/game.js was refactored again in Phase 3 (15 cutscene methods removed), so
// its Phase 2 inventory check no longer holds. Current state is verified by
// scratch/verify_splice_cutscenes.mjs against scratch/backup/game.js.phase3.bak.
console.log('\n--- js/game.js ---');
console.log('  (skipped: superseded by Phase 3 — see scratch/verify_splice_cutscenes.mjs)');

// ------------------------------------------------------------------ integrity
// Exact test: rebuild the spliced file from the backup by applying precisely the
// documented transform, then require a byte-identical result. That proves
// nothing outside the removed methods was touched.
console.log('\n--- integrity (exact reconstruction) ---');

function makeBlanker() {
  let inBlock = false;
  let inTemplate = false;
  return function blank(line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      const n = line[i + 1];
      if (inBlock) {
        if (c === '*' && n === '/') { inBlock = false; out += '  '; i += 2; continue; }
        out += ' '; i++; continue;
      }
      if (inTemplate) {
        if (c === '\\') { out += '  '; i += 2; continue; }
        if (c === '`') { inTemplate = false; out += ' '; i++; continue; }
        out += ' '; i++; continue;
      }
      if (c === '/' && n === '/') { out += ' '.repeat(line.length - i); break; }
      if (c === '/' && n === '*') { inBlock = true; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'") {
        out += ' '; i++;
        while (i < line.length) {
          if (line[i] === '\\') { out += '  '; i += 2; continue; }
          if (line[i] === c) { out += ' '; i++; break; }
          out += ' '; i++;
        }
        continue;
      }
      if (c === '`') { inTemplate = true; out += ' '; i++; continue; }
      out += c; i++;
    }
    return out;
  };
}
function findSignature(src, name) {
  const idx = src.findIndex((l) => new RegExp(`^    ${name}\\s*\\(`).test(l));
  if (idx === -1) throw new Error(`method ${name} not found`);
  return idx;
}
function findMethodEnd(src, sigIdx) {
  const blank = makeBlanker();
  let depth = 0;
  let started = false;
  for (let i = sigIdx; i < src.length; i++) {
    for (const ch of blank(src[i])) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) return i; }
    }
  }
  throw new Error('unterminated');
}

const cases = [
  {
    cur: 'js/entities.js',
    bak: 'scratch/backup/entities.js.bak',
    methods: ['drawBlade', 'drawOverdriveBlade', 'drawAquaticBlade', 'drawPhaseAura', 'drawOverdriveAura',
      'drawAquaticAura', 'drawSoilBlade', 'drawSoilAura', 'drawMetallicBlade', 'drawMetallicAura',
      'drawFloraBlade', 'drawFloraAura', 'drawHellfireBlade', 'drawHellfireAura'],
    post: (text, eol) => {
      text = text.replace(BLADE_CHAIN_SRC.split('\n').join(eol), '        getSwordRenderer(this.swordId).drawBlade(ctx, geom, this);');
      text = text.replace(AURA_CHAIN_SRC.split('\n').join(eol), '        getSwordRenderer(this.swordId).drawAura(ctx, this);');
      const header = ` */${eol}(function(window) {`;
      return text.replace(header, ` */${eol}${eol}import { getSwordRenderer } from '../src/swords/SwordRegistry.js';${eol}${eol}(function(window) {`);
    }
  }
  // js/game.js is deliberately absent: it was further refactored in Phase 3
  // (15 cutscene methods removed), so it no longer equals the Phase 2 transform
  // of scratch/backup/game.js.bak. Its current state is covered by
  // scratch/verify_splice_cutscenes.mjs against scratch/backup/game.js.phase3.bak.
];

for (const c of cases) {
  const raw = fs.readFileSync(path.join(root, c.bak), 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const src = raw.split(/\r?\n/);

  const ranges = c.methods
    .map((n) => ({ start: findSignature(src, n), end: findMethodEnd(src, findSignature(src, n)) }))
    .sort((a, b) => b.start - a.start);

  const out = [...src];
  for (const r of ranges) out.splice(r.start, r.end - r.start + 1);

  // Windy sword lines added inside existing methods (they postdate this backup), so
  // they are removed from both sides before the byte comparison.
  const WINDY_ADDITIONS = [
    '      const isWindy = this.swordId === "windy";',
    '      else if (isWindy) shadowCol = "rgba(34, 211, 238, 0.45)";',
    '      else if (isWindy) playerFill = "#0f172a";',
    '      else if (isWindy) playerStroke = "#22d3ee";',
    '      else if (isWindy) eyeColor = "#06b6d4";'
  ];
  const stripWindy = (t) => t.split(eol).filter((l) => !WINDY_ADDITIONS.includes(l)).join(eol);

  // Windy changes that ADD or REWRITE lines, so they are folded into the
  // reconstructed `expected` exactly as they were made to the file. Every entry is an
  // exact match, so any other change outside the removed methods still fails.
  const WINDY_TRANSFORMS = [
    ['      const isHellfire = this.swordId === "hellfire";\n      const phaseColor = isLocked',
     '      const isHellfire = this.swordId === "hellfire";\n      const isWindy = this.swordId === "windy";\n      const phaseColor = isLocked'],
    ['          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {',
     '          compactSub = `PHASE ${pNum}`;\n        } else if (isWindy) {\n          compactTitle = "WINDY";\n          subColor = "#22d3ee";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {'],
    ['          headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));',
     '          headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));'],
    ['        headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));',
     '        headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));'],
    ['        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: EMBER";\n      } else if (isFlora) {',
     '        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: EMBER";\n      } else if (isWindy) {\n        fullTitle = "🌬️ WINDY";\n        subColor = "#22d3ee";\n        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("windy", activePhase.phase) : activePhase;\n        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: BREEZE";\n      } else if (isFlora) {']
  ];
  const applyWindy = (t) => WINDY_TRANSFORMS.reduce(
    (acc, [from, to]) => acc.split(from.split('\n').join(eol)).join(to.split('\n').join(eol)), t);

  const expected = stripWindy(applyWindy(c.post(out.join(eol), eol)));
  const actual = stripWindy(fs.readFileSync(path.join(root, c.cur), 'utf8'));
  let detail = '';
  if (expected !== actual) {
    const e = expected.split(/\r?\n/);
    const a = actual.split(/\r?\n/);
    const i = e.findIndex((l, k) => l !== a[k]);
    detail = `first divergence at line ${i + 1}\n        expected: ${e[i]}\n        actual  : ${a[i]}`;
  }
  check(`${c.cur} is byte-identical to the documented transform of its backup`, expected === actual, detail);
}

console.log('');
console.log(failures === 0 ? 'SPLICE VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
