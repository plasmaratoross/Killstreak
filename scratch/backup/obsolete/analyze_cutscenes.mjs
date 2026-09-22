/**
 * Phase 3 reconnaissance.
 *
 * Prints the *effect sequence* of every `start*Cutscene` method with the dialogue
 * array collapsed, so the data table in cutscenes.data.js can be designed
 * against the real structure instead of an assumption.
 *
 * Also reports the engine methods (advance/skip/finish/getCutsceneDialogue) and
 * every call site, including whether the caller sets its own `*Seen` flag.
 *
 * Run:  node scratch/analyze_cutscenes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const gameLines = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8').split(/\r?\n/);

function findSignature(lines, name) {
  const idx = lines.findIndex((l) => new RegExp(`^    ${name}\\s*\\(`).test(l));
  if (idx === -1) throw new Error(`${name} not found`);
  return idx;
}
function findEnd(lines, sigIdx) {
  let depth = 0;
  let started = false;
  for (let i = sigIdx; i < lines.length; i++) {
    const code = lines[i].replace(/\/\/.*$/, '');
    for (const ch of code) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') { if (started && --depth === 0) return i; }
    }
  }
  throw new Error('unterminated');
}

const STARTS = [
  'startAquaticUnlockCutscene', 'startAquaticPhase13Cutscene',
  'startSoilUnlockCutscene', 'startSoilPhase10Cutscene',
  'startMetallicUnlockCutscene', 'startMetallicPhase10Cutscene',
  'startFloraUnlockCutscene', 'startFloraPhase10Cutscene',
  'startHellfireUnlockCutscene', 'startHellfirePhase10Cutscene',
  'startPhase17Cutscene'
];

console.log('=== start*Cutscene effect sequences (dialogue collapsed) ===\n');
for (const name of STARTS) {
  const sig = findSignature(gameLines, name);
  const end = findEnd(gameLines, sig);
  const body = gameLines.slice(sig + 1, end);

  // collapse the dialogue array
  const out = [];
  let inDialogue = false;
  let depth = 0;
  let lineCount = 0;
  for (const line of body) {
    if (!inDialogue && /cutsceneDialogue\s*=\s*\[/.test(line)) { inDialogue = true; depth = 1; continue; }
    if (inDialogue) {
      lineCount += /speaker:|text:/.test(line) ? 1 : 0;
      for (const ch of line.replace(/\/\/.*$/, '')) {
        if (ch === '[') depth++;
        else if (ch === ']') { depth--; }
      }
      if (depth <= 0) { inDialogue = false; out.push(`  [ ...dialogue array, ${lineCount} speaker/text lines... ]`); }
      continue;
    }
    if (line.trim() !== '') out.push(`  ${line.trim()}`);
  }
  console.log(`${name}():`);
  out.forEach((l) => console.log(l));
  console.log('');
}

console.log('=== engine methods ===\n');
for (const name of ['getCutsceneDialogue', 'advanceCutscene', 'skipCutscene', 'finishCutscene']) {
  const sig = findSignature(gameLines, name);
  const end = findEnd(gameLines, sig);
  console.log(`${name}() — lines ${sig + 1}-${end + 1}`);
  console.log(gameLines.slice(sig + 1, end).map((l) => `  ${l.trim()}`).filter((l) => l.trim()).join('\n'));
  console.log('');
}

console.log('=== call sites (start*/advance/skip/finish) ===\n');
const callRe = /(start[A-Z]\w*Cutscene|advanceCutscene|skipCutscene|finishCutscene|getCutsceneDialogue)\s*\(/;
gameLines.forEach((line, i) => {
  if (!callRe.test(line)) return;
  if (new RegExp(`^    (${STARTS.join('|')}|advanceCutscene|skipCutscene|finishCutscene|getCutsceneDialogue)\\s*\\(`).test(line)) return;
  const ctx = gameLines.slice(Math.max(0, i - 3), i + 1).map((l) => l.trim()).filter(Boolean);
  console.log(`  line ${i + 1}:`);
  ctx.forEach((l) => console.log(`      ${l}`));
});
