/**
 * Phase 6 reusable slice tool.
 *
 * Slices one or more top-level functions out of the js/main.js IIFE into a module.
 * Handles the four mechanics every remaining slice needs:
 *
 *   1. move the body verbatim (dedented), taking the host as an explicit param
 *   2. import the DOM refs the body actually mentions from ./domRefs.js
 *   3. import the shared utils it actually mentions from ../utils/*
 *   4. rewire call sites inside main.js to pass the extra arguments
 *
 * Configured via SLICE below. Gates fail loudly rather than emitting something
 * subtly wrong.
 *
 * Usage:
 *   node scratch/phase6_slice.mjs            # dry run
 *   node scratch/phase6_slice.mjs --write    # emit + splice
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
const WRITE = process.argv.includes('--write');
const BACKUP = path.join(root, 'scratch', 'backup');
const mainPath = path.join(root, 'js', 'main.js');

// ---------------------------------------------------------------- configure
// Registry of slices. Select one by name:  node scratch/phase6_slice.mjs badges --write
const SLICES = {
  badges: {
    out: 'src/ui/badges.js',
    banner: `/**
 * Badges — the achievements list plus the debug-mode badge grid.
 *
 * Phase 6, slice 5. Extracted from js/main.js. Bodies are verbatim.
 *
 * renderBadges keeps its default \`targetElement = badgesList\`; the default is
 * evaluated at call time against the ref imported from ./domRefs.js, exactly as
 * it resolved against the IIFE constant before.
 *
 * I18n is captured once at module load, mirroring the IIFE's startup destructure.
 */`,
    fns: [
      { name: 'renderBadges', params: ['unlockedBadges = []', 'targetElement = badgesList'] },
      { name: 'renderDebugBadges', params: ['game'] }
    ],
    callArgs: { renderDebugBadges: 'game' },
    mainImports: ["import { renderBadges, renderDebugBadges } from '../src/ui/badges.js';"]
  },

  toast: {
    out: 'src/ui/toast.js',
    banner: `/**
 * Toast notification UI.
 *
 * Phase 6, slice 6. Replaces the earlier speculative version of this module,
 * which re-queried the DOM on every call while js/main.js closure-captured the
 * refs. The body below is main.js's original, moved verbatim, so the captured-ref
 * semantics are preserved exactly and the two implementations no longer diverge.
 */`,
    moduleState: ['let toastTimeout = null;'],
    fns: [{ name: 'showToast', params: ['title', 'desc', 'icon = "👁️"'] }],
    mainImports: ["import { showToast } from '../src/ui/toast.js';"]
  },

  inputManager: {
    out: 'src/core/InputManager.js',
    banner: `/**
 * InputManager — mouse position tracking for the HUD readout.
 *
 * Phase 6, slice 7. Extracted from js/main.js; body verbatim.
 *
 * It is registered as an addEventListener callback, not called directly, so the
 * registration site now wraps it to supply the game instance:
 *   canvas.addEventListener("mousemove", (e) => updateMouseCoordinates(game, e));
 */`,
    fns: [{ name: 'updateMouseCoordinates', params: ['game', 'e'] }],
    callbacks: { updateMouseCoordinates: { event: 'e', args: 'game' } },
    mainImports: ["import { updateMouseCoordinates } from '../src/core/InputManager.js';"]
  },

  language: {
    out: 'src/ui/language.js',
    banner: `/**
 * Language toggle — swaps the menu button labels and re-applies translations.
 *
 * Phase 6, slice 8. Extracted from js/main.js; body verbatim.
 *
 * NOTE: KILLSTREAK_REFACTOR_GUIDE.md targets src/i18n/I18n.js for this function.
 * It lives here instead because I18n.js is the pure i18n engine that the legacy
 * modules import; hanging a DOM-mutating UI function off it would invert that
 * dependency. Worth reconciling with the guide.
 */`,
    fns: [{ name: 'updateLanguageUI', params: ['lang'] }],
    mainImports: ["import { updateLanguageUI } from '../src/ui/language.js';"]
  },

  library: {
    out: 'src/ui/library.js',
    banner: `/**
 * Library modal — the three-section codex (SWORDS, BADGES, BESTIARY).
 *
 * Phase 6, slice 9. Extracted from js/main.js; bodies verbatim.
 *
 * \`selectedLibrarySword\` is the one piece of state that travels with the group.
 * It moved into this module, and the seven tab handlers that used to assign it
 * directly now call setSelectedLibrarySword() — a bare assignment left in
 * main.js can no longer reach a module binding. renderLibrarySwords() still
 * reads it from here, so the read/write pair stays intact.
 *
 * renderLibraryNpcs() is state-free: it reads window.Killstreak.Data / .NPC
 * directly, exactly as it did inside the IIFE.
 */`,
    moduleState: ['let selectedLibrarySword = "devourer";'],
    removeState: ['let selectedLibrarySword = "devourer";'],
    stateSetters: { selectedLibrarySword: 'setSelectedLibrarySword' },
    moduleExports: [
      '/** @param {string} id */',
      'export function setSelectedLibrarySword(id) {',
      '  selectedLibrarySword = id;',
      '}'
    ],
    // `canvas` appears only as a local `const canvas = card.querySelector(...)`
    // inside renderLibraryNpcs; importing the DOM ref would shadow confusingly.
    excludeRefs: ['canvas'],
    fns: [
      { name: 'renderLibrary', params: ['game'] },
      { name: 'renderLibraryNpcs', params: [] },
      { name: 'renderLibrarySwords', params: ['game'] }
    ],
    callArgs: { renderLibrary: 'game', renderLibrarySwords: 'game' },
    mainImports: [
      "import { renderLibrary, renderLibraryNpcs, renderLibrarySwords, setSelectedLibrarySword } from '../src/ui/library.js';"
    ]
  },

  debugPanel: {
    out: 'src/ui/debugPanel.js',
    banner: `/**
 * Debug panel — the developer overlay behind the settings cog.
 *
 * Phase 6, slice 10. Extracted from js/main.js; bodies verbatim.
 *
 * \`isDebugUnlocked\` lives here because this is where it is set. main.js imports
 * it as a LIVE BINDING, so every existing read (in openScreen, closeAllModals,
 * the language handler, onBadgesUpdated) keeps working unchanged — ESM imports
 * see mutations. Only assignment is illegal across a module boundary, and there
 * was exactly one of those left in main.js, which now calls setIsDebugUnlocked().
 *
 * \`cogClickCount\` deliberately stays in main.js: no function in this slice
 * touches it, it belongs to the cog-trigger wiring.
 */`,
    moduleState: ['export let isDebugUnlocked = false;'],
    removeState: ['let isDebugUnlocked = false;'],
    stateSetters: { isDebugUnlocked: 'setIsDebugUnlocked' },
    moduleExports: [
      '/** @param {boolean} unlocked */',
      'export function setIsDebugUnlocked(unlocked) {',
      '  isDebugUnlocked = unlocked;',
      '}'
    ],
    // the auto-detector only knows domRefs + utils/format + utils/dom
    extraImports: [
      "import { renderDebugBadges } from './badges.js';",
      "import { updateHudCounters, updateStatsUI, updateHudPhaseTracking } from './hud.js';",
      "import { showToast } from './toast.js';"
    ],
    fns: [
      { name: 'updateDebugQuickButtons', params: [] },
      { name: 'updateDebugModeUI', params: ['game', 'active'] },
      { name: 'handleDebugPasswordSubmit', params: ['game'] },
      { name: 'handleApplyDebugKillstreak', params: ['game'] }
    ],
    callArgs: {
      updateDebugModeUI: 'game'
    },
    // Both handlers are registered by BARE REFERENCE (addEventListener), so
    // neither has a `name(...)` call site — putting them in callArgs would find
    // nothing and throw. The wrappers below are what supply their `game`. Both
    // ignore the event object, so they wrap to `() => f(game)`.
    callbacks: {
      handleDebugPasswordSubmit: { args: 'game' },
      handleApplyDebugKillstreak: { args: 'game' }
    },
    mainImports: [
      "import { isDebugUnlocked, setIsDebugUnlocked, updateDebugModeUI, updateDebugQuickButtons, handleDebugPasswordSubmit, handleApplyDebugKillstreak } from '../src/ui/debugPanel.js';"
    ]
  },

  swordStand: {
    out: 'src/ui/swordStand.js',
    banner: `/**
 * Sword stand (pedestal) panel.
 *
 * Phase 6, slice 11. Extracted from js/main.js; body verbatim.
 *
 * Extracted BEFORE the modals group on purpose: openScreen() renders this panel
 * via its SWORD_STAND case, so if modals.js were written first it would have to
 * import updateSwordStandUI back out of main.js — an inverted dependency.
 *
 * The inspectedSwordId binding travels with it as an exported live binding, so
 * the two
 * reads that remain in main.js wiring (onOpenSwordModal and the equip handler)
 * keep working untouched. Only the assignment goes through the setter.
 *
 * This module calls nothing outside itself — no HUD, no other UI module.
 */`,
    moduleState: ['export let inspectedSwordId = "devourer";'],
    removeState: ['let inspectedSwordId = "devourer";'],
    stateSetters: { inspectedSwordId: 'setInspectedSwordId' },
    moduleExports: [
      '/** @param {string} id */',
      'export function setInspectedSwordId(id) {',
      '  inspectedSwordId = id;',
      '}'
    ],
    fns: [{ name: 'updateSwordStandUI', params: ['game'] }],
    callArgs: { updateSwordStandUI: 'game' },
    mainImports: [
      "import { inspectedSwordId, setInspectedSwordId, updateSwordStandUI } from '../src/ui/swordStand.js';"
    ]
  },

  modals: {
    out: 'src/ui/modals.js',
    banner: `/**
 * Screen router — the menu, the HUD, and every modal.
 *
 * Phase 6, slice 12. Bodies verbatim.
 *
 * Extracted AFTER swordStand.js on purpose: openScreen's SWORD_STAND case
 * renders that panel, so writing this first would have meant importing back out
 * of main.js.
 *
 * panelOrigin is private here — openScreen writes it, returnFromModal reads it,
 * and nothing outside touches it.
 *
 * cogClickCount lives here for now because closeAllModals and openScreen both
 * reset it. It is really the debug-unlock click counter, so when the settings-cog
 * wiring moves into debugPanel.js under the option-2 rule it should move with it.
 */`,
    moduleState: ['export let cogClickCount = 0;', 'let panelOrigin = "MENU";'],
    removeState: ['let cogClickCount = 0;', 'let panelOrigin = "MENU";'],
    stateSetters: { cogClickCount: 'setCogClickCount' },
    moduleExports: [
      '/** @param {number} n */',
      'export function setCogClickCount(n) {',
      '  cogClickCount = n;',
      '}'
    ],
    extraImports: [
      "import { isDebugUnlocked } from './debugPanel.js';",
      "import { renderBadges } from './badges.js';",
      "import { renderLibrary } from './library.js';",
      "import { updateSwordStandUI } from './swordStand.js';",
      "import { updateHudCounters, updateHudPhaseTracking, updateStatsUI } from './hud.js';"
    ],
    fns: [
      { name: 'closeAllModals', params: [] },
      { name: 'openScreen', params: ['game', 'screenName', 'origin = "MENU"'] },
      { name: 'returnFromModal', params: ['game'] },
      { name: 'promptReturnToLobby', params: ['game'] }
    ],
    // closeAllModals takes nothing back — it touches no game state
    callArgs: {
      openScreen: 'game',
      returnFromModal: 'game',
      updateSwordStandUI: 'game'
    },
    // returnFromModal is BOTH called directly (2 sites, handled by callArgs) and
    // registered bare on 10 close buttons. Only the bare ones need wrapping: left
    // alone, the click event arrives as `game` and game.setPaused throws.
    callbacks: {
      promptReturnToLobby: { args: 'game' },
      returnFromModal: { args: 'game' }
    },
    mainImports: [
      "import { cogClickCount, setCogClickCount, closeAllModals, openScreen, returnFromModal, promptReturnToLobby } from '../src/ui/modals.js';"
    ]
  },

  gameLoop: {
    out: 'src/core/GameLoop.js',
    banner: `/**
 * Game loop — the requestAnimationFrame driver.
 *
 * Phase 6, slice 13: the last function to leave js/main.js.
 *
 * It re-schedules ITSELF with requestAnimationFrame(loop) — a bare reference
 * inside the very body being moved, so the callback wrapper had to be applied to
 * moved bodies and not only to main.js.
 *
 * DOCUMENTED NUANCE: lastTimestamp is now initialised when this module is
 * evaluated rather than partway through the IIFE body, so it is captured a few
 * milliseconds earlier. Not observable: the game starts in the MENU state, where
 * Game.update() early-returns, and the first frame's dt is clamped to 0.1 anyway.
 */`,
    moduleState: ['let lastTimestamp = performance.now();'],
    removeState: ['let lastTimestamp = performance.now();'],
    fns: [{ name: 'loop', params: ['game', 'currentTimestamp'] }],
    // no callArgs: loop is never called by name, only registered
    // loop takes the rAF timestamp as its SECOND argument, but requestAnimationFrame
    // hands it to the callback as its FIRST — so it has to be forwarded, not dropped.
    // Dropping it makes dt NaN on every frame, which silently corrupts the whole
    // simulation while still looking fine in the HUD.
    callbacks: { loop: { event: 'ts', args: 'game' } },
    mainImports: ["import { loop } from '../src/core/GameLoop.js';"]
  }
};

const SLICE_NAME = process.argv[2];
if (!SLICE_NAME || !SLICES[SLICE_NAME]) {
  console.error(`usage: node scratch/phase6_slice.mjs <${Object.keys(SLICES).join('|')}> [--write]`);
  process.exit(1);
}
const SLICE = SLICES[SLICE_NAME];

// Import paths must be relative to the module being written: src/ui/foo.js and
// src/core/foo.js need different specifiers for the same shared files.
const outDir = path.dirname(path.join(root, SLICE.out));
const relTo = (target) => {
  let r = path.relative(outDir, path.join(root, target)).replace(/\\/g, '/');
  return r.startsWith('.') ? r : `./${r}`;
};
const REFS_IMPORT = relTo('src/ui/domRefs.js');
const UTILS_PREFIX = relTo('src/utils');

// ------------------------------------------------------------------ helpers
function makeBlanker() {
  let inBlock = false;
  let inTemplate = false;
  return function blank(line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      const n = line[i + 1];
      if (inBlock) { if (c === '*' && n === '/') { inBlock = false; out += '  '; i += 2; continue; } out += ' '; i++; continue; }
      if (inTemplate) { if (c === '\\') { out += '  '; i += 2; continue; } if (c === '`') { inTemplate = false; out += ' '; i++; continue; } out += ' '; i++; continue; }
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

/**
 * Wrap a bare callback registration so it still receives its arguments.
 * addEventListener("click", fn) and requestAnimationFrame(loop) reference fn
 * without calling it, so no argument can be inserted at a call site — the
 * registration itself is replaced with `(e) => fn(game, e)` or `() => fn(game)`.
 * Occurrences are counted with split() so the wrapper needs no regex escaping.
 */
function rewireCallbacks(src, callbacks, context = '', { required = true } = {}) {
  let out = src;
  for (const [name, spec] of Object.entries(callbacks || {})) {
    const re = new RegExp(`(?<![\\w$.])${name}(?![\\w$.(])`, 'g');
    const found = (out.match(re) || []).length;
    if (found === 0) {
      if (required) throw new Error(`no bare callback registration found for ${name}${context}`);
      continue;
    }
    // `event` is optional: a handler that ignores its event object wraps to `() => f(game)`.
    const wrapper = spec.event
      ? `(${spec.event}) => ${name}(${spec.args}, ${spec.event})`
      : `() => ${name}(${spec.args})`;
    out = out.replace(re, wrapper);
    const after = out.split(wrapper).length - 1;
    if (after !== found) throw new Error(`${name}${context}: wrapped ${after} of ${found} registrations`);
    console.log(`  wrapped ${after} callback registration(s) of ${name}${context}`);
  }
  return out;
}

/**
 * Rewire `name(` -> `name(game, `. One pass, peeking at what follows, so an
 * argument-less `name()` becomes `name(game)` and not `name(game, )`. Two passes
 * would re-match the text the first pass had just written.
 */
function rewireCallArgs(src, callArgs, context = '', { required = true } = {}) {
  let out = src;
  for (const [name, args] of Object.entries(callArgs || {})) {
    const re = new RegExp(`(?<![\\w$.])${name}\\(`, 'g');
    const before = (out.match(re) || []).length;
    if (before === 0) {
      if (required) throw new Error(`no call sites found for ${name}${context}`);
      continue;
    }
    out = out.replace(re, (match, offset, whole) => {
      const rest = whole.slice(offset + match.length);
      // Already rewired by an earlier slice (updateSwordStandUI was done in slice
      // 11) — leave it, or the argument would be added a second time.
      // `args` is always a plain identifier here, so it needs no escaping — and
      // escapeRe is declared further down, so referencing it would hit the TDZ.
      if (new RegExp(`^\\s*${args}[,)]`).test(rest)) return match;
      return /^\s*\)/.test(rest) ? `${name}(${args}` : `${name}(${args}, `;
    });
    const after = (out.match(new RegExp(`(?<![\\w$.])${name}\\(${args}[,)]`, 'g')) || []).length;
    if (after !== before) throw new Error(`${name}${context}: rewired ${after} of ${before} call sites`);
    console.log(`  rewired ${after} call site(s) of ${name}${context}`);
  }
  return out;
}

let lines = fs.readFileSync(mainPath, 'utf8').split(/\r?\n/);
const eol = fs.readFileSync(mainPath, 'utf8').includes('\r\n') ? '\r\n' : '\n';

function fnRange(name) {
  const sig = lines.findIndex((l) => new RegExp(`^ {2}(?:async )?function ${name}\\s*\\(`).test(l));
  if (sig === -1) throw new Error(`function ${name} not found`);
  const blank = makeBlanker();
  let depth = 0;
  let started = false;
  for (let i = sig; i < lines.length; i++) {
    for (const ch of blank(lines[i])) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) return [sig, i]; }
    }
  }
  throw new Error(`function ${name} unterminated`);
}

const bodies = {};
for (const f of SLICE.fns) {
  const [s, e] = fnRange(f.name);
  bodies[f.name] = lines.slice(s + 1, e).map((l) => (l.trim() === '' ? '' : l.slice(2)));
}

// Applied to the moved bodies as well as to main.js. A moved body can call a
// function that lives in ANOTHER module (openScreen -> updateSwordStandUI), and
// that callee needs the argument exactly as much as a same-slice one does.
const internalCallArgs = SLICE.callArgs || {};
for (const f of SLICE.fns) {
  let body = rewireCallArgs(
    bodies[f.name].join('\n'),
    internalCallArgs,
    ` (inside ${f.name})`,
    { required: false }
  );
  // A moved body can also REGISTER a callback, not just call things: loop()
  // re-schedules itself with requestAnimationFrame(loop). Applying the wrapper
  // to main.js alone would leave that inner registration passing no `game`.
  body = rewireCallbacks(body, SLICE.callbacks, ` (inside ${f.name})`, { required: false });
  bodies[f.name] = body.split('\n');
}

// what does the body need? include each signature too — default parameter
// expressions (e.g. `targetElement = badgesList`) reference refs as well, and
// those would otherwise be missed and left unimported.
const bodyText = SLICE.fns
  .map((f) => `${f.params.join(', ')}\n${bodies[f.name].join('\n')}`)
  .join('\n');
const refNames = [...fs.readFileSync(path.join(root, 'src/ui/domRefs.js'), 'utf8')
  .matchAll(/^export const ([A-Za-z_$][\w$]*) = document\.getElementById/gm)].map((m) => m[1]);
const excludedRefs = new Set(SLICE.excludeRefs || []);
const neededRefs = refNames.filter(
  (r) => !excludedRefs.has(r) && new RegExp(`(?<![\\w$.])${r}(?![\\w$])`).test(bodyText)
);

const UTILS = [
  { file: 'format', names: ['formatNumber', 'parseNumberInput', 'NUMBER_UNITS'] },
  { file: 'dom', names: ['setNumContent', 'formatPlaytime', 'qs'] }
];
const neededUtils = UTILS.map((u) => ({
  file: u.file,
  names: u.names.filter((n) => new RegExp(`(?<![\\w$.])${n}\\s*\\(`).test(bodyText))
})).filter((u) => u.names.length);

const needsI18n = /(?<![\w$.])I18n(?![\w$])/.test(bodyText);
const needsConfig = /(?<![\w$.])Config(?![\w$])/.test(bodyText);
console.log(`  extraImports      : ${(SLICE.extraImports || []).length}`);

console.log(`slice: ${SLICE.out}`);
for (const f of SLICE.fns) console.log(`  ${f.name}(${f.params.join(', ')})  ${bodies[f.name].length} lines`);
console.log(`  refs from domRefs : ${neededRefs.length}${neededRefs.length ? ' — ' + neededRefs.join(', ') : ''}`);
console.log(`  utils             : ${neededUtils.map((u) => `${u.file}:${u.names.join('/')}`).join(', ') || 'none'}`);
console.log(`  I18n              : ${needsI18n}`);
console.log(`  Config            : ${needsConfig}`);
if (needsConfig) console.log('  NOTE Config will be re-resolved from window.Killstreak at module load');

// ------------------------------------------------------------------- emit
const imports = [];
if (neededRefs.length) {
  imports.push(`import {\n${neededRefs.map((r, i) => `  ${r}${i === neededRefs.length - 1 ? '' : ','}`).join('\n')}\n} from '${REFS_IMPORT}';`);
}
for (const u of neededUtils) imports.push(`import { ${u.names.join(', ')} } from '${UTILS_PREFIX}/${u.file}.js';`);
// imports the auto-detector cannot infer: sibling UI modules (hud, toast, badges)
for (const line of SLICE.extraImports || []) imports.push(line);

const consts = [];
if (needsConfig) consts.push('const Config = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.Config) || null;');
if (needsI18n) consts.push('const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;');

// module-private mutable state that travelled with the functions
const stateDecls = SLICE.moduleState || [];

const fnSource = SLICE.fns.map((f) => {
  const jsdoc = f.params.map((p) => `@param {*} ${p.split('=')[0].trim()}`).join(' ');
  const head = jsdoc ? `/** ${jsdoc} */\n` : '';
  return `${head}export function ${f.name}(${f.params.join(', ')}) {\n${bodies[f.name].join('\n')}\n}`;
}).join('\n\n');

const preamble = [imports.join('\n'), stateDecls.join('\n'), consts.join('\n')].filter(Boolean).join('\n\n');
// extra module-level code that is not a moved function (e.g. a state setter)
const extraSource = (SLICE.moduleExports || []).join('\n').trim();
const moduleSource = `${SLICE.banner}\n${preamble}\n\n${fnSource}${extraSource ? `\n\n${extraSource}\n` : '\n'}`;

if (!WRITE) {
  console.log('\n(dry run — re-run with --write)');
  process.exit(0);
}

fs.mkdirSync(path.dirname(path.join(root, SLICE.out)), { recursive: true });
fs.writeFileSync(path.join(root, SLICE.out), moduleSource, 'utf8');

// ------------------------------------------------------------------ splice
const ranges = SLICE.fns.map((f) => fnRange(f.name)).sort((a, b) => b[0] - a[0]);
for (const [s, e] of ranges) lines.splice(s, e - s + 1);

let text = lines.join(eol);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Module-private state that travelled with the functions. Drop the old
// declaration, then route the assignments that stayed behind through a setter —
// a bare `x = v` in main.js can no longer reach a module-level binding.
for (const decl of SLICE.removeState || []) {
  const found = (text.match(new RegExp(`^[ \\t]*${escapeRe(decl)}[ \\t]*$`, 'gm')) || []).length;
  if (found !== 1) throw new Error(`removeState: expected 1 "${decl}", found ${found}`);
  text = text.replace(new RegExp(`^[ \\t]*${escapeRe(decl)}[ \\t]*\\r?\\n`, 'm'), '');
  console.log(`  removed state declaration: ${decl}`);
}

for (const [name, setter] of Object.entries(SLICE.stateSetters || {})) {
  const re = new RegExp(`(?<![\\w$.])${name}\\s*=\\s*([^;\\n]+);`, 'g');
  const before = (text.match(re) || []).length;
  if (before === 0) throw new Error(`no assignments found for ${name}`);
  text = text.replace(re, (_, v) => `${setter}(${v});`);
  console.log(`  rewrote ${before} assignment(s) of ${name} -> ${setter}()`);

  // `name++` cannot be left alone once `name` is an imported binding — mutating
  // an import is a SyntaxError, and it does not match the assignment pattern
  // above. The binding is still readable, so route it through the setter.
  const inc = new RegExp(`(?<![\\w$.])${name}(\\+\\+|--)\\s*;`, 'g');
  const incFound = (text.match(inc) || []).length;
  if (incFound) {
    text = text.replace(inc, (_, op) => `${setter}(${name} ${op === '++' ? '+' : '-'} 1);`);
    console.log(`  rewrote ${incFound} increment(s) of ${name} -> ${setter}()`);
  }
}

// rewire call sites in main.js (the definitions are already gone)
if (Object.keys(SLICE.callArgs || {}).length) text = rewireCallArgs(text, SLICE.callArgs);

// bare registrations left in main.js get their arguments the same way the moved
// bodies do — see rewireCallbacks()
text = rewireCallbacks(text, SLICE.callbacks);

const anchor = `} from '../src/ui/domRefs.js';`;
if (!text.includes(anchor)) throw new Error('domRefs import anchor not found');
text = text.replace(anchor, [anchor, ...SLICE.mainImports].join(eol));

// gates
for (const f of SLICE.fns) {
  if (new RegExp(`^ {2}(?:async )?function ${f.name}\\s*\\(`, 'm').test(text)) {
    throw new Error(`stale local definition of ${f.name} survived`);
  }
}
new Function(text.replace(/^import[\s\S]*?;$/gm, ''));

fs.copyFileSync(mainPath, path.join(BACKUP, `main.js.${path.basename(SLICE.out, '.js')}.bak`));
fs.writeFileSync(mainPath, text, 'utf8');

// record what happened so scratch/verify_slice.mjs can check every slice uniformly
const sliceDir = path.join(root, 'scratch', 'slices');
fs.mkdirSync(sliceDir, { recursive: true });
const manifest = {
  out: SLICE.out,
  backup: `scratch/backup/main.js.${path.basename(SLICE.out, '.js')}.bak`,
  fns: SLICE.fns.map((f) => ({ name: f.name, params: f.params, lines: bodies[f.name].length })),
  callArgs: SLICE.callArgs || {},
  callbacks: SLICE.callbacks || {},
  neededRefs,
  refsImport: REFS_IMPORT,
  neededUtils,
  needsI18n,
  needsConfig,
  moduleState: stateDecls,
  stateSetters: SLICE.stateSetters || {},
  excludeRefs: SLICE.excludeRefs || [],
  extraImports: SLICE.extraImports || [],
  recordedAt: new Date().toISOString()
};
fs.writeFileSync(path.join(sliceDir, `${path.basename(SLICE.out, '.js')}.json`), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`\nwrote ${SLICE.out} (${moduleSource.split(/\r?\n/).length} lines)`);
console.log(`spliced js/main.js: removed ${SLICE.fns.length} function(s)`);
console.log(`backup: ${manifest.backup}`);
console.log(`manifest: scratch/slices/${path.basename(SLICE.out, '.js')}.json`);
