/**
 * Throwaway: locate the openScreen body difference between modals.js and its
 * pre-slice backup. Uses the same blanking logic as verify_slice.mjs so string
 * and template contents cannot confuse the brace match.
 */
import fs from 'node:fs';

function makeBlanker() {
  let inBlock = false, inTemplate = false;
  return function blank(line) {
    let out = '', i = 0;
    while (i < line.length) {
      const c = line[i], n = line[i + 1];
      if (inBlock) { if (c === '*' && n === '/') { inBlock = false; out += '  '; i += 2; continue; } out += ' '; i++; continue; }
      if (inTemplate) { if (c === '\\') { out += '  '; i += 2; continue; } if (c === '`') { inTemplate = false; out += ' '; i++; continue; } out += ' '; i++; continue; }
      if (c === '/' && n === '/') { out += ' '.repeat(line.length - i); break; }
      if (c === '/' && n === '*') { inBlock = true; out += '  '; i += 2; continue; }
      if (c === '"' || c === "'") { out += ' '; i++; while (i < line.length) { if (line[i] === '\\') { out += '  '; i += 2; continue; } if (line[i] === c) { out += ' '; i++; break; } out += ' '; i++; } continue; }
      if (c === '`') { inTemplate = true; out += ' '; i++; continue; }
      out += c; i++;
    }
    return out;
  };
}

function bodyIn(text, name, indent) {
  const re = new RegExp(`^${' '.repeat(indent)}(?:export )?(?:async )?function ${name}\\s*\\(`, 'm');
  const m = re.exec(text);
  if (!m) return null;
  const opening = text.indexOf('{', m.index);
  const blank = makeBlanker();
  const joined = text.split('\n').map((l) => blank(l)).join('\n');
  let depth = 0, started = false;
  for (let j = opening; j < joined.length; j++) {
    if (joined[j] === '{') { depth++; started = true; }
    else if (joined[j] === '}') { if (started && --depth === 0) return text.slice(opening + 1, j); }
  }
  return null;
}

const norm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();

const mod = fs.readFileSync('src/ui/modals.js', 'utf8');
const bak = fs.readFileSync('scratch/backup/main.js.modals.bak', 'utf8');

const before = norm(bodyIn(bak, 'openScreen', 2));
const raw = norm(bodyIn(mod, 'openScreen', 0));
// mirror verify_slice's undoInternal for this slice
const undo = raw
  .replace(/(?<![\w$.])openScreen\(game\)/g, 'openScreen()')
  .replace(/(?<![\w$.])openScreen\(game, /g, 'openScreen(')
  .replace(/(?<![\w$.])returnFromModal\(game\)/g, 'returnFromModal()')
  .replace(/(?<![\w$.])returnFromModal\(game, /g, 'returnFromModal(')
  .replace(/(?<![\w$.])updateSwordStandUI\(game\)/g, 'updateSwordStandUI()')
  .replace(/(?<![\w$.])updateSwordStandUI\(game, /g, 'updateSwordStandUI(');

const A = before.split(' ');
const B = undo.split(' ');
console.log('backup tokens:', A.length, ' module tokens:', B.length);

const setA = new Map();
A.forEach((t, i) => { if (!setA.has(t)) setA.set(t, 0); setA.set(t, setA.get(t) + 1); });
const setB = new Map();
B.forEach((t, i) => { if (!setB.has(t)) setB.set(t, 0); setB.set(t, setB.get(t) + 1); });

console.log('\ntokens only in BACKUP:', [...setA.keys()].filter((t) => !setB.has(t)).join(' | '));
console.log('tokens only in MODULE:', [...setB.keys()].filter((t) => !setA.has(t)).join(' | '));
console.log('\ncount mismatches:');
for (const t of new Set([...setA.keys(), ...setB.keys()])) {
  if ((setA.get(t) || 0) !== (setB.get(t) || 0)) console.log(`  ${t}: backup=${setA.get(t) || 0} module=${setB.get(t) || 0}`);
}
console.log('\nraw (un-undoed) module tail:\n' + raw.slice(-400));
