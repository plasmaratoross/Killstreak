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

  // Sword lines added inside existing methods (they postdate this backup), so they
  // are removed from both sides before the byte comparison. Every entry is an exact
  // whole line, and the list is deliberately narrow: anything else still fails.
  const ADDITIONS = [
    // Windy
    '      const isWindy = this.swordId === "windy";',
    '      else if (isWindy) shadowCol = "rgba(34, 211, 238, 0.45)";',
    '      else if (isWindy) playerFill = "#0f172a";',
    '      else if (isWindy) playerStroke = "#22d3ee";',
    '      else if (isWindy) eyeColor = "#06b6d4";',
    // Frostbite
    '      const isFrostbite = this.swordId === "frostbite";',
    '      else if (isFrostbite) shadowCol = "rgba(165, 243, 252, 0.45)";',
    '      else if (isFrostbite) playerFill = "#082f49";',
    '      else if (isFrostbite) playerStroke = "#7dd3fc";',
    '      else if (isFrostbite) eyeColor = "#22d3ee";',
    // Voltstrike
    '      const isVoltstrike = this.swordId === "voltstrike";',
    '      else if (isVoltstrike) shadowCol = "rgba(253, 224, 71, 0.45)";',
    '      else if (isVoltstrike) playerFill = "#1c1917";',
    '      else if (isVoltstrike) playerStroke = "#fde047";',
    '      else if (isVoltstrike) eyeColor = "#facc15";'
  ];
  const stripAdditions = (t) => t.split(eol).filter((l) => !ADDITIONS.includes(l)).join(eol);

  // Changes that ADD or REWRITE lines, so they are folded into the reconstructed
  // `expected` exactly as they were made to the file. Every entry is an exact match,
  // so any other change outside the removed methods still fails.
  //
  // ORDER MATTERS for the headerColor pair: the 10-space form is a text superset of
  // the 8-space form, so the draw() entry has to be applied first or it would also
  // rewrite the drawBadge() line.
  const TRANSFORMS = [
    // ---------------------------------------------------------------- Windy
    ['      const isHellfire = this.swordId === "hellfire";\n      const phaseColor = isLocked',
     '      const isHellfire = this.swordId === "hellfire";\n      const isWindy = this.swordId === "windy";\n      const phaseColor = isLocked'],
    ['          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {',
     '          compactSub = `PHASE ${pNum}`;\n        } else if (isWindy) {\n          compactTitle = "WINDY";\n          subColor = "#22d3ee";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {'],
    ['          headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));',
     '          headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));'],
    ['        headerColor = isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))));',
     '        headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));'],
    ['        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: EMBER";\n      } else if (isFlora) {',
     '        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: EMBER";\n      } else if (isWindy) {\n        fullTitle = "🌬️ WINDY";\n        subColor = "#22d3ee";\n        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("windy", activePhase.phase) : activePhase;\n        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: BREEZE";\n      } else if (isFlora) {'],

    // ------------------------------------------------------------ Frostbite
    // SwordStand.draw AND drawBadge share this phaseColor fallback verbatim, so one
    // entry covers both.
    ['            : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8")))))));',
     '            : (isFrostbite ? "#7dd3fc" : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8"))))))));'],
    ['        : (isHellfire ? "rgba(220, 38, 38, 0.32)" : (isFlora ? "rgba(34, 197, 94, 0.30)" : (isMetallic ? "rgba(148, 163, 184, 0.28)" : (isSoil ? "rgba(180, 83, 9, 0.32)" : (isAquatic ? "rgba(6, 182, 212, 0.30)" : (isOverdrive ? "rgba(239, 68, 68, 0.28)" : "rgba(56, 189, 248, 0.28)"))))));',
     '        : (isFrostbite ? "rgba(165, 243, 252, 0.34)" : (isHellfire ? "rgba(220, 38, 38, 0.32)" : (isFlora ? "rgba(34, 197, 94, 0.30)" : (isMetallic ? "rgba(148, 163, 184, 0.28)" : (isSoil ? "rgba(180, 83, 9, 0.32)" : (isAquatic ? "rgba(6, 182, 212, 0.30)" : (isOverdrive ? "rgba(239, 68, 68, 0.28)" : "rgba(56, 189, 248, 0.28)")))))));'],
    ['        : (isHellfire ? "rgba(239, 68, 68, 0.85)" : (isFlora ? "rgba(74, 222, 128, 0.8)" : (isMetallic ? "rgba(203, 213, 225, 0.8)" : (isSoil ? "rgba(245, 158, 11, 0.8)" : (isAquatic ? "rgba(6, 182, 212, 0.75)" : (isOverdrive ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)"))))));',
     '        : (isFrostbite ? "rgba(125, 211, 252, 0.8)" : (isHellfire ? "rgba(239, 68, 68, 0.85)" : (isFlora ? "rgba(74, 222, 128, 0.8)" : (isMetallic ? "rgba(203, 213, 225, 0.8)" : (isSoil ? "rgba(245, 158, 11, 0.8)" : (isAquatic ? "rgba(6, 182, 212, 0.75)" : (isOverdrive ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)")))))));'],
    // draw() headerColor (10 spaces) BEFORE drawBadge()'s (8 spaces) — see the note above.
    // The full line is restated because wrapping the ternary in `isFrostbite ? ... : ( … )`
    // also adds one closing paren at the end.
    ['          headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));',
     '          headerColor = isFrostbite ? "#7dd3fc" : (isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))))));'],
    ['        headerColor = isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8"))))));',
     '        headerColor = isFrostbite ? "#7dd3fc" : (isWindy ? "#22d3ee" : (isHellfire ? "#ef4444" : (isFlora ? "#4ade80" : (isMetallic ? "#cbd5e1" : (isSoil ? "#f59e0b" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ef4444" : "#94a3b8")))))));'],
    ['        } else if (isWindy) {\n          compactTitle = "WINDY";\n          subColor = "#22d3ee";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {',
     '        } else if (isWindy) {\n          compactTitle = "WINDY";\n          subColor = "#22d3ee";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFrostbite) {\n          compactTitle = "FROSTBITE";\n          subColor = "#7dd3fc";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {'],
    ['        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: BREEZE";\n      } else if (isFlora) {',
     '        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: BREEZE";\n      } else if (isFrostbite) {\n        fullTitle = "🧊 FROSTBITE";\n        subColor = "#7dd3fc";\n        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("frostbite", activePhase.phase) : activePhase;\n        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: ICE CUBE";\n      } else if (isFlora) {'],
    // NPC status system (Frostbite's Freeze / Blizzard).
    ['      this.wingTimer = Math.random() * Math.PI * 2;\n\n      // Arbitrary zone wandering state',
     '      this.wingTimer = Math.random() * Math.PI * 2;\n\n      // Status effects (Frostbite\'s Freeze / Blizzard). `rootTimer` is older than\n      // these and is still set externally by Flora\'s Worldroot ability.\n      this.frozenTimer = 0;\n      this.slowTimer = 0;\n      this.slowFactor = 1;\n\n      // Arbitrary zone wandering state'],
    ['    takeDamage(amount, angle, force = 200) {\n      this.hp -= amount;\n      this.hitFlashTimer = 0.14;',
     '    takeDamage(amount, angle, force = 200) {\n      // Frostbite\'s Frozen status: a frozen target takes double damage from every\n      // player source. Doing it here rather than at the seven call sites means\n      // sword swings and abilities all behave the same, and the value actually\n      // dealt is returned so callers can display it.\n      const dealt = this.frozenTimer > 0 ? amount * 2 : amount;\n      this.hp -= dealt;\n      this.hitFlashTimer = 0.14;'],
    ['          game.handleNpcDeath(this);\n        }\n      }\n    }\n\n    getShoveRatio() {',
     '          game.handleNpcDeath(this);\n        }\n      }\n\n      return dealt;\n    }\n\n    getShoveRatio() {'],
    ['      this.wingTimer += dt * (this.isHostile ? 16 : 8);\n\n      // Apply knockback decay',
     '      this.wingTimer += dt * (this.isHostile ? 16 : 8);\n\n      // Status timers. Frozen stops movement and interrupts attacks; Slow scales\n      // movement speed until it expires.\n      if (this.frozenTimer > 0) this.frozenTimer -= dt;\n      if (this.slowTimer > 0) {\n        this.slowTimer -= dt;\n        if (this.slowTimer <= 0) this.slowFactor = 1;\n      }\n      const isFrozen = this.frozenTimer > 0;\n      const speedScale = this.slowTimer > 0 ? this.slowFactor : 1;\n\n      // Apply knockback decay'],
    ['        if (this.rootTimer > 0) {\n          this.rootTimer -= dt;\n        } else if (this.wanderMoveTimer > 0) {',
     '        if (this.rootTimer > 0) {\n          this.rootTimer -= dt;\n        } else if (isFrozen) {\n          // Frozen: movement stops entirely, so no wandering either.\n        } else if (this.wanderMoveTimer > 0) {'],
    ['        if (this.rootTimer > 0) {\n          this.rootTimer -= dt;\n        } else {\n          // HOSTILE RULE: Chases the player while staying strictly in zone',
     '        if (this.rootTimer > 0) {\n          this.rootTimer -= dt;\n        } else if (!isFrozen) {\n          // HOSTILE RULE: Chases the player while staying strictly in zone'],
    ['            const wSpeed = this.speed * 0.42;\n            this.x += (dirX / mag) * wSpeed * dt;',
     '            const wSpeed = this.speed * 0.42 * speedScale;\n            this.x += (dirX / mag) * wSpeed * dt;'],
    ['            this.x += (dirX / mag) * this.speed * dt;\n            this.y += (dirY / mag) * this.speed * dt;',
     '            this.x += (dirX / mag) * this.speed * speedScale * dt;\n            this.y += (dirY / mag) * this.speed * speedScale * dt;'],
    ['          // Physical contact attack: If hostile, deals damage on contact!\n          if (this.isHostile && this.attackCooldown <= 0) {',
     '          // Physical contact attack: If hostile, deals damage on contact!\n          // A frozen enemy cannot land this either — the weapon-range attack above\n          // is inside the frost guard, so this one needs its own check.\n          if (this.isHostile && this.attackCooldown <= 0 && !isFrozen) {'],
    ['        ctx.setLineDash([]);\n        ctx.restore();\n      }\n\n      // Health bar: Show for all living NPCs (fixed: normal sentries now properly have a health bar)',
     '        ctx.setLineDash([]);\n        ctx.restore();\n      }\n\n      // Frostbite Frozen status: the enemy is encased in ice. Drawn before the\n      // health bar so the bar stays readable on top of the encasement.\n      if (this.frozenTimer > 0) {\n        ctx.save();\n\n        ctx.fillStyle = "rgba(165, 243, 252, 0.42)";\n        ctx.beginPath();\n        ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);\n        ctx.fill();\n\n        ctx.strokeStyle = "#e0f2fe";\n        ctx.lineWidth = 2;\n        ctx.beginPath();\n        ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);\n        ctx.stroke();\n\n        // Angular facets, so the encasement reads as ice rather than a bubble.\n        ctx.strokeStyle = "rgba(224, 242, 254, 0.85)";\n        ctx.lineWidth = 1;\n        for (let i = 0; i < 5; i++) {\n          const a = (i / 5) * Math.PI * 2 + 0.4;\n          ctx.beginPath();\n          ctx.moveTo(this.x + Math.cos(a) * this.radius * 0.35, this.y + Math.sin(a) * this.radius * 0.35);\n          ctx.lineTo(this.x + Math.cos(a) * (this.radius + 4), this.y + Math.sin(a) * (this.radius + 4));\n          ctx.stroke();\n        }\n\n        // The ice cracks open as the effect expires.\n        if (this.frozenTimer < 1) {\n          ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 - this.frozenTimer * 0.9})`;\n          ctx.lineWidth = 1.4;\n          for (let i = 0; i < 3; i++) {\n            const off = (i - 1) * 4;\n            ctx.beginPath();\n            ctx.moveTo(this.x - this.radius * 0.6, this.y + off);\n            ctx.lineTo(this.x + this.radius * 0.6, this.y + off + Math.cos(i * 2.1) * 3);\n            ctx.stroke();\n          }\n        }\n\n        ctx.restore();\n      } else if (this.slowTimer > 0) {\n        // Blizzard slow: frost gathers around the enemy\'s feet.\n        ctx.save();\n\n        ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";\n        ctx.lineWidth = 2;\n        ctx.beginPath();\n        ctx.arc(this.x, this.y + this.radius * 0.5, this.radius * 0.85, 0, Math.PI * 2);\n        ctx.stroke();\n\n        ctx.fillStyle = "rgba(224, 242, 254, 0.6)";\n        for (let i = 0; i < 3; i++) {\n          const a = (i / 3) * Math.PI * 2 + this.wingTimer * 0.3;\n          ctx.beginPath();\n          ctx.arc(\n            this.x + Math.cos(a) * this.radius * 0.8,\n            this.y + this.radius * 0.5 + Math.sin(a) * this.radius * 0.4,\n            1.6, 0, Math.PI * 2\n          );\n          ctx.fill();\n        }\n\n        ctx.restore();\n      }\n\n      // Health bar: Show for all living NPCs (fixed: normal sentries now properly have a health bar)'],

    // ---------------------------------------------------------- Voltstrike
    // Same two phases as the sword lines above; phaseColor/aura/rune gain one
    // nesting level each, so their closing-paren runs grow by one.
    ['            : (isFrostbite ? "#7dd3fc" : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8"))))))));',
     '            : (isVoltstrike ? "#fde047" : (isFrostbite ? "#7dd3fc" : (isHellfire ? "#dc2626" : (isFlora ? "#15803d" : (isMetallic ? "#94a3b8" : (isSoil ? "#d97706" : (isAquatic ? "#06b6d4" : (isOverdrive ? "#ffffff" : "#38bdf8")))))))));'],
    ['        : (isFrostbite ? "rgba(165, 243, 252, 0.34)" : (isHellfire ? "rgba(220, 38, 38, 0.32)" : (isFlora ? "rgba(34, 197, 94, 0.30)" : (isMetallic ? "rgba(148, 163, 184, 0.28)" : (isSoil ? "rgba(180, 83, 9, 0.32)" : (isAquatic ? "rgba(6, 182, 212, 0.30)" : (isOverdrive ? "rgba(239, 68, 68, 0.28)" : "rgba(56, 189, 248, 0.28)")))))));',
     '        : (isVoltstrike ? "rgba(253, 224, 71, 0.30)" : (isFrostbite ? "rgba(165, 243, 252, 0.34)" : (isHellfire ? "rgba(220, 38, 38, 0.32)" : (isFlora ? "rgba(34, 197, 94, 0.30)" : (isMetallic ? "rgba(148, 163, 184, 0.28)" : (isSoil ? "rgba(180, 83, 9, 0.32)" : (isAquatic ? "rgba(6, 182, 212, 0.30)" : (isOverdrive ? "rgba(239, 68, 68, 0.28)" : "rgba(56, 189, 248, 0.28)"))))))));'],
    ['        : (isFrostbite ? "rgba(125, 211, 252, 0.8)" : (isHellfire ? "rgba(239, 68, 68, 0.85)" : (isFlora ? "rgba(74, 222, 128, 0.8)" : (isMetallic ? "rgba(203, 213, 225, 0.8)" : (isSoil ? "rgba(245, 158, 11, 0.8)" : (isAquatic ? "rgba(6, 182, 212, 0.75)" : (isOverdrive ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)")))))));',
     '        : (isVoltstrike ? "rgba(253, 224, 71, 0.8)" : (isFrostbite ? "rgba(125, 211, 252, 0.8)" : (isHellfire ? "rgba(239, 68, 68, 0.85)" : (isFlora ? "rgba(74, 222, 128, 0.8)" : (isMetallic ? "rgba(203, 213, 225, 0.8)" : (isSoil ? "rgba(245, 158, 11, 0.8)" : (isAquatic ? "rgba(6, 182, 212, 0.75)" : (isOverdrive ? "rgba(239, 68, 68, 0.7)" : "rgba(56, 189, 248, 0.7)"))))))));'],
    // headerColor uses the paren-neutral chain form, so no close is added.
    ['          headerColor = isFrostbite ? "#7dd3fc" : (',
     '          headerColor = isVoltstrike ? "#fde047" : isFrostbite ? "#7dd3fc" : ('],
    ['        headerColor = isFrostbite ? "#7dd3fc" : (',
     '        headerColor = isVoltstrike ? "#fde047" : isFrostbite ? "#7dd3fc" : ('],
    ['        } else if (isFrostbite) {\n          compactTitle = "FROSTBITE";\n          subColor = "#7dd3fc";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {',
     '        } else if (isFrostbite) {\n          compactTitle = "FROSTBITE";\n          subColor = "#7dd3fc";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isVoltstrike) {\n          compactTitle = "VOLTSTRIKE";\n          subColor = "#fde047";\n          compactSub = `PHASE ${pNum}`;\n        } else if (isFlora) {'],
    ['        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: ICE CUBE";\n      } else if (isFlora) {',
     '        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: ICE CUBE";\n      } else if (isVoltstrike) {\n        fullTitle = "⚡ VOLTSTRIKE";\n        subColor = "#fde047";\n        const pInfo = (I18n && activePhase) ? I18n.getPhaseInfo("voltstrike", activePhase.phase) : activePhase;\n        fullSubtitle = pInfo ? (I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || "").toUpperCase() }) : `PHASE: ${(pInfo.shortName || "").toUpperCase()}`) : "PHASE 1: SPARK";\n      } else if (isFlora) {']
  ];
  const applyTransforms = (t) => TRANSFORMS.reduce(
    (acc, [from, to]) => acc.split(from.split('\n').join(eol)).join(to.split('\n').join(eol)), t);

  const expected = stripAdditions(applyTransforms(c.post(out.join(eol), eol)));
  const actual = stripAdditions(fs.readFileSync(path.join(root, c.cur), 'utf8'));
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
