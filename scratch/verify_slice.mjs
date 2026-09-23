/**
 * Phase 6 slice verifier — data-driven from scratch/slices/*.json.
 *
 * Every slice emitted by scratch/phase6_slice.mjs records a manifest. This walks
 * them all and checks, per slice:
 *
 *   - body fidelity : the module's exported body is the backup's body verbatim
 *                     (the only legitimate change is the signature)
 *   - refs          : every ref imported is a real domRefs export, every ref the
 *                     body uses is imported, and nothing is imported unused
 *   - main.js       : the local definition is gone, call sites pass the new args,
 *                     and no stale zero-arg call survives
 *
 * Adding a slice needs no change here — just run the tool again.
 *
 * Run:  node scratch/verify_slice.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

// every JS file under src/. Wiring relocation (the option-2 rule) keeps moving
// call sites OUT of main.js into these modules, so checks scoped to main.js go
// stale on every move. Widen the scope; keep the assertion.
const srcFiles = [];

// Functions whose bodies Phase 7 (the innerHTML audit) intentionally rewrote, so
// the Phase 6 body-verbatim gate no longer applies to them. See the skip below.
// The gate is kept for every other function — this is a targeted exemption, not
// a relaxation. Each skip prints its reason so the exemption stays visible.
const PHASE7_REWRITTEN = new Set([
  'renderBadges', 'renderDebugBadges', 'renderLibrary', 'renderLibraryNpcs',
  'renderLibrarySwords'
]);

// Functions whose bodies were legitimately edited AFTER extraction, so the Phase 6
// body-verbatim gate no longer applies to them. Like PHASE7_REWRITTEN this is a
// targeted, visible exemption — every other function keeps the gate.
//
// openScreen: Phase 6 moved the main menu into this module, and its MENU case
// toggled the main menu's own "Return to Lobby" button. That button was deleted
// from the game (with its domRef and its listener), and the show/hide block went
// with it. js/main.js's onAreaChange callback carried the same toggle and was
// cleaned up in the same change.
const POST_EXTRACTION_BODY_EDITS = new Map([
  ['openScreen', 'main-menu "Return to Lobby" button was deleted'],
]);
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.js')) srcFiles.push(rel);
  }
})('src');
const norm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();

/** body of `  function NAME(` (inside the IIFE) by blanking-aware brace match */
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

function bodyIn(text, name, indent) {
  // modules use `export function`, the IIFE uses plain `function`
  const re = new RegExp(`^${' '.repeat(indent)}(?:export )?(?:async )?function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  const opening = text.indexOf('{', m.index);

  // brace-count over a fully blanked copy so `{` inside strings/templates does
  // not close the body early. Blank per line to keep string state across lines.
  const blank = makeBlanker();
  const joined = text.split('\n').map((l) => blank(l)).join('\n');

  let depth = 0;
  let started = false;
  for (let j = opening; j < joined.length; j++) {
    if (joined[j] === '{') { depth++; started = true; }
    else if (joined[j] === '}') { if (started && --depth === 0) return text.slice(opening + 1, j); }
  }
  return null;
}

const sliceDir = path.join(root, 'scratch', 'slices');
if (!fs.existsSync(sliceDir)) {
  console.log('no slices recorded yet');
  process.exit(0);
}

const manifests = fs.readdirSync(sliceDir).filter((f) => f.endsWith('.json')).sort();
console.log(`verifying ${manifests.length} recorded slice(s)\n`);

for (const mf of manifests) {
  const m = JSON.parse(fs.readFileSync(path.join(sliceDir, mf), 'utf8'));
  const mod = read(m.out);
  const backup = read(m.backup);
  const main = read('js/main.js');
  const domRefs = new Set([...read('src/ui/domRefs.js').matchAll(/^export const ([A-Za-z_$][\w$]*) =/gm)].map((x) => x[1]));

  // Calls *between* moved functions had the extra argument inserted
  // (renderLibrary -> renderLibrarySwords(game)). The backup still has the
  // argument-less form, so undo that before comparing bodies.
  const internalArgs = Object.entries(m.callArgs || {});
  const undoInternal = (s) => {
    let out = s;
    for (const [name, args] of internalArgs) {
      out = out.replace(new RegExp(`(?<![\\w$.])${name}\\(${args}\\)`, 'g'), `${name}()`);
      out = out.replace(new RegExp(`(?<![\\w$.])${name}\\(${args}, `, 'g'), `${name}(`);
    }
    return out;
  };

  // A moved body can also REGISTER a callback — loop() re-schedules itself with
  // requestAnimationFrame(loop). The wrapper that supplies `game` is therefore a
  // legitimate difference from the backup, so normalise it away too.
  const undoCallbacks = (s) => {
    let out = s;
    for (const [name, spec] of Object.entries(m.callbacks || {})) {
      const wrapper = spec.event
        ? `(${spec.event}) => ${name}(${spec.args}, ${spec.event})`
        : `() => ${name}(${spec.args})`;
      out = out.split(wrapper).join(name);
    }
    return out;
  };

  // State that travelled to another module can only be written through its setter
  // (cogClickCount moved from modals.js to debugPanel.js), so a body legitimately
  // reads `setX(0)` where the backup had `x = 0`. Put the assignment form back.
  const undoStateSetters = (s) => {
    let out = s;
    for (const [name, setter] of Object.entries(m.stateSetters || {})) {
      // no trailing semicolon: the call being unwrapped already has its own, and
      // adding one produced `x = 0;;` against the backup's `x = 0;`
      out = out.replace(new RegExp(`(?<![\\w$.])${setter}\\(([^()]*)\\)`, 'g'), `${name} = $1`);
    }
    return out;
  };

  console.log(`--- ${m.out} ---`);

  for (const f of m.fns) {
    // Phase 7 routed data through textContent/dataset in these bodies. The check
    // below is PHASE 6's extraction-fidelity gate and for these four it now asserts
    // the opposite of the intent. Their equivalence is instead proven by the
    // canonical-DOM probe recorded in refactor-progress.json, where the hashes
    // before and after the rewrite are byte-identical.
    if (PHASE7_REWRITTEN.has(f.name)) {
      console.log(`SKIP  ${f.name}: body-verbatim — Phase 7 rewrote this body`);
      continue;
    }
    const postEdit = POST_EXTRACTION_BODY_EDITS.get(f.name);
    if (postEdit) {
      console.log(`SKIP  ${f.name}: body-verbatim — ${postEdit}`);
      continue;
    }
    const before = bodyIn(backup, f.name, 2);
    const after = bodyIn(mod, f.name, 0);
    if (before === null || after === null) {
      check(`${f.name}: present in both`, false, `backup=${before === null ? 'absent' : 'ok'} module=${after === null ? 'absent' : 'ok'}`);
      continue;
    }
    // Normalise BOTH sides. A call may have been rewired by an EARLIER slice
    // (updateSwordStandUI was done in slice 11), in which case this slice left it
    // alone and the backup already carries the argument — undoing only the module
    // side would then invent a difference that does not exist.
    const same = norm(undoStateSetters(undoCallbacks(undoInternal(before)))) === norm(undoStateSetters(undoCallbacks(undoInternal(after))));
    let detail = '';
    if (!same) {
      // Compare the SAME transformed strings the verdict used. Diffing the raw
      // bodies reported the first difference BEFORE normalisation, which pointed
      // at `f(game)` in a rewired call rather than at the real cause.
      const xf = (s) => norm(undoStateSetters(undoCallbacks(undoInternal(s))));
      const a = xf(before).split(' '); const b = xf(after).split(' ');
      const i = a.findIndex((t, k) => t !== b[k]);
      detail = `first differing token #${i}\n        backup: ...${a.slice(Math.max(0, i - 3), i + 3).join(' ')}\n        module: ...${b.slice(Math.max(0, i - 3), i + 3).join(' ')}`;
    }
    check(`${f.name}: body verbatim (${f.lines} lines)`, same, detail);
  }

  // A moved function that calls another moved function must pass the argument:
  // `renderLibrarySwords()` inside the module would leave `game` undefined.
  for (const [name, args] of internalArgs) {
    const bareCall = new RegExp(`(?<![\\w$.])${name}\\(\\s*\\)`);
    check(`${name}: no argument-less inner call survives`, !bareCall.test(norm(mod)),
      `found bare ${name}() — the inner callee needs its ${args} argument`);
  }

  // module hygiene
  // path varies: ./domRefs.js from src/ui, ../ui/domRefs.js from src/core
  const importBlock = mod.match(/import \{([^}]*)\} from '[^']*domRefs\.js';/);
  const imported = importBlock ? importBlock[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
  const bogus = imported.filter((r) => !domRefs.has(r));
  check('all imported refs are real domRefs exports', bogus.length === 0, bogus.join(', '));

  // Include the signatures, not just the bodies: default parameter expressions
  // (e.g. `targetElement = badgesList`) reference refs too.
  // Scan the whole module MINUS its imports, not just the slice's function bodies:
  // a module can also own hand-written wiring (initLibraryWiring) that uses refs,
  // and that would otherwise look like an unused import.
  //
  // Comments are blanked FIRST. A ref name that appears only in prose — e.g. a
  // doc comment saying "the canvas is a fixed bitmap" where `canvas` is a real
  // domRefs export — otherwise counts as a use, and the check fails on a module
  // that never touches that element. A name used only in a comment IS unused, so
  // blanking comments makes the check stricter, not looser.
  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const modBody = stripComments(mod).replace(/^import[\s\S]*?;$/gm, '');
  const excludedRefs = new Set(m.excludeRefs || []);
  const used = [...domRefs].filter(
    (r) => !excludedRefs.has(r) && new RegExp(`(?<![\\w$.])${r}(?![\\w$])`).test(modBody)
  );
  check('no ref used by the body is missing from the import',
    used.filter((r) => !imported.includes(r)).length === 0, used.filter((r) => !imported.includes(r)).join(', '));
  check('no ref imported but unused',
    imported.filter((r) => !used.includes(r)).length === 0, imported.filter((r) => !used.includes(r)).join(', '));

  // main.js
  for (const f of m.fns) {
    check(`${f.name}: definition removed from main.js`, !new RegExp(`^ {2}(?:async )?function ${f.name}\\s*\\(`, 'm').test(main));
    const args = m.callArgs[f.name];
    if (args) {
      // Counted across the whole live surface, not just main.js. Comments and
      // string/template contents are BLANKED first (a renamed function mentioned in
      // a module banner is not a call site), then the function's own declaration is
      // masked so `f(game)` in its signature is not counted either.
      const blank = makeBlanker();
      const surface = [main, ...srcFiles.map(read)]
        .join('\n')
        .split('\n')
        .map((l) => blank(l))
        .join('\n')
        .replace(new RegExp(`(?:export )?function ${f.name}\\s*\\(`, 'g'), '__DEF__(');
      // a zero-argument call becomes `f(game)`, one with args `f(game, `
      const rewired = (surface.match(new RegExp(`(?<![\\w$.])${f.name}\\(${args}[,)]`, 'g')) || []).length;
      const plain = (surface.match(new RegExp(`(?<![\\w$.])${f.name}\\(`, 'g')) || []).length;
      check(`${f.name}: all ${plain} call site(s) pass ${args}`, plain === rewired && plain > 0,
        `plain=${plain} rewired=${rewired}`);
    }
  }

  // A moved function that takes parameters must never be registered BARE as a
  // listener: addEventListener would hand it the event object as its first
  // argument, which for `game` is truthy and then explodes on the first property
  // access. Counts of `name(` misses these entirely — there is no call.
  for (const f of m.fns) {
    const params = f.params || [];
    if (!params.length) continue;
    // Strip imports (the import list mentions every name bare) AND blank comments
    // and string/template contents: prose describing a registration is not one.
    const blank = makeBlanker();
    const mainBody = main
      .replace(/^import[\s\S]*?;$/gm, '')
      .split('\n').map((l) => blank(l)).join('\n');
    const bare = (mainBody.match(new RegExp(`(?<![\\w$.])${f.name}(?![\\w$.(])`, 'g')) || []).length;
    if (bare === 0) continue;
    const spec = (m.callbacks || {})[f.name];
    if (!spec) {
      check(`${f.name}: ${bare} bare reference(s) wrapped`, false,
        `registered bare but missing from callbacks — the event would arrive as \`${params[0]}\``);
      continue;
    }
    // matches both `() => f(game)` and `(e) => f(game, e)`
    const wrapped = (mainBody.match(new RegExp(`=> ${f.name}\\(${spec.args}`, 'g')) || []).length;
    check(`${f.name}: ${bare} bare reference(s) wrapped`, wrapped === bare, `bare=${bare} wrapped=${wrapped}`);
  }

  // An argument-less CALL to a parameterised function: `f()` where f now takes
  // `game`. Four of these shipped during this refactor — two Enter-key handlers,
  // a self-scheduling rAF callback, and a keyword-argument misuse — and none was
  // visible to a count scoped to main.js. Comments and string contents are blanked
  // so prose cannot trip it.
  for (const f of m.fns) {
    const args = m.callArgs[f.name];
    if (!args) continue;
    const blank2 = makeBlanker();
    const surface = [main, ...srcFiles.map(read)]
      .join('\n').split('\n').map((l) => blank2(l)).join('\n');
    const zeroArg = (surface.match(new RegExp(`(?<![\\w$.])${f.name}\\(\\s*\\)`, 'g')) || []).length;
    check(`${f.name}: no argument-less call on the live surface`, zeroArg === 0,
      `found ${zeroArg} \`${f.name}()\` call(s) — it now needs ${args}`);
  }

  check(`${path.basename(m.out, '.js')}: imported by main.js`,
    m.out.endsWith('.js') && main.includes(`from '../${m.out}';`));
  console.log('');
}

console.log(failures === 0 ? 'ALL SLICES VERIFIED' : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
