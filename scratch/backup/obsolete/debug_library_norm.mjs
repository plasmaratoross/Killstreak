import fs from 'node:fs';

const m = JSON.parse(fs.readFileSync('scratch/slices/library.json', 'utf8'));
console.log('manifest callArgs   =', JSON.stringify(m.callArgs));
console.log('manifest callbacks  =', JSON.stringify(m.callbacks));
console.log('manifest fns        =', m.fns.map((f) => f.name).join(', '));

const mod = fs.readFileSync(m.out, 'utf8');
const bak = fs.readFileSync(m.backup, 'utf8');

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
  const mm = re.exec(text);
  if (!mm) return null;
  const opening = text.indexOf('{', mm.index);
  const blank = makeBlanker();
  const joined = text.split('\n').map((l) => blank(l)).join('\n');
  let depth = 0, started = false;
  for (let j = opening; j < joined.length; j++) {
    if (joined[j] === '{') { depth++; started = true; }
    else if (joined[j] === '}') { if (started && --depth === 0) return text.slice(opening + 1, j); }
  }
  return null;
}

const internalArgs = Object.entries(m.callArgs || {});
const undoInternal = (s) => {
  let out = s;
  for (const [name, args] of internalArgs) {
    const before = out;
    out = out.replace(new RegExp(`(?<![\\w$.])${name}\\(${args}\\)`, 'g'), `${name}()`);
    out = out.replace(new RegExp(`(?<![\\w$.])${name}\\(${args}, `, 'g'), `${name}(`);
    if (before !== out) console.log(`   [undo] ${name}(${args}) -> ${name}()`);
  }
  return out;
};

const bakBody = bodyIn(bak, 'renderLibrary', 2);
const modBody = bodyIn(mod, 'renderLibrary', 0);
console.log('\nBACKUP first 90 chars :', JSON.stringify(bakBody.slice(0, 90)));
console.log('MODULE first 90 chars :', JSON.stringify(modBody.slice(0, 90)));
console.log('\nafter undoInternal(bak):', JSON.stringify(undoInternal(bakBody).slice(0, 90)));
console.log('after undoInternal(mod):', JSON.stringify(undoInternal(modBody).slice(0, 90)));
