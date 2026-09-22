/**
 * Phase 7 invariant: no innerHTML template may contain interpolation.
 *
 * Phase 7 exists to stop data reaching the HTML parser. The rule it establishes is
 * narrow and checkable without a DOM:
 *
 *   1. `x.innerHTML =` may only be a template literal that contains NO `${}`.
 *      A static skeleton is fine — it is the same string every time, so no data
 *      can ever change its meaning.
 *   2. `x.innerHTML = ""` is fine (a clear).
 *   3. Anything else — a concatenation, a variable, an interpolating template —
 *      fails. That is the shape that lets data become markup.
 *
 * Also asserted: no `insertAdjacentHTML` / `outerHTML` (same hazard, different name).
 *
 * The `${}` inside a template must be found by scanning with brace awareness,
 * not by a regex on the whole file: the skeletons are full of HTML braces and the
 * files contain template literals inside template literals (`${cond ? `...` : ""}`),
 * so a naive pattern both over- and under-matches.
 *
 * DOM equivalence for the six rewritten sites was checked separately, in-browser,
 * with scratch/phase7_dom_probe.js — that needs a real DOM and so cannot live here.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = [];
(function walk(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.js')) files.push(rel);
  }
})('src');
for (const e of fs.readdirSync(path.join(root, 'js'))) {
  if (e.endsWith('.js')) files.push(`js/${e}`);
}

/** Pull every `innerHTML <op> RHS` and classify the RHS. */
function scan(src) {
  const found = [];
  const re = /\.innerHTML\s*(\+?=)\s*/g;
  let m;
  while ((m = re.exec(src))) {
    const op = m[1];
    const at = m.index + m[0].length;
    const line = src.slice(0, m.index).split('\n').length;
    const c = src[at];

    if (c === '"' || c === "'") {
      let j = at + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      found.push({ line, op, kind: 'string', value: src.slice(at + 1, j), interp: false });
      re.lastIndex = j + 1;
      continue;
    }

    if (c === '`') {
      let j = at + 1, depth = 0, body = '', interp = false;
      const exprs = [];
      while (j < src.length) {
        const ch = src[j];
        if (ch === '\\') { body += src[j] + src[j + 1]; j += 2; continue; }
        if (ch === '$' && src[j + 1] === '{') {
          interp = true;
          // Capture the expression so a failure names what it found. Braces inside
          // strings within the expression are not modelled — good enough to report.
          let k = j + 2, d = 1;
          while (k < src.length && d > 0) { if (src[k] === '{') d++; else if (src[k] === '}') d--; if (d === 0) break; k++; }
          exprs.push(src.slice(j + 2, k).replace(/\s+/g, ' ').trim());
          depth++; body += '${'; j += 2; continue;
        }
        if (ch === '}' && depth > 0) { depth--; body += '}'; j++; continue; }
        if (ch === '`' && depth === 0) break;
        body += ch; j++;
      }
      found.push({ line, op, kind: 'template', bytes: body.length, interp, exprs });
      re.lastIndex = j + 1;
      continue;
    }

    // Anything else (identifier, concatenation, call) is the dangerous shape.
    found.push({ line, op, kind: 'expression', value: src.slice(at, at + 50).split('\n')[0], interp: null });
    re.lastIndex = at;
  }
  return found;
}

let failures = 0;
const say = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures++; };

let templates = 0, clears = 0;
for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const f of scan(src)) {
    const where = `${rel}:${f.line}`;
    if (f.kind === 'template') {
      templates++;
      if (f.interp) {
        say(false, `${where}: innerHTML template interpolates ${f.exprs.length} value(s): ${f.exprs.map(e => '${' + e + '}').join(' , ')}`);
      } else {
        say(true, `${where}: innerHTML template is a static skeleton (${f.bytes} bytes, no \${})`);
      }
    } else if (f.kind === 'string' && f.value === '' && f.op === '=') {
      clears++;
    } else {
      say(false, `${where}: innerHTML assigned from ${f.kind} — ${f.value}`);
    }
  }
}

say(templates > 0, `found ${templates} static innerHTML skeleton(s) and ${clears} clear(s)`);

// Same hazard, other entry points.
let alt = 0;
for (const rel of files) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  for (const name of ['insertAdjacentHTML', 'outerHTML', 'document.write']) {
    const hits = src.split('\n').map((l, i) => l.includes(name) ? i + 1 : 0).filter(Boolean);
    for (const l of hits) { alt++; say(false, `${rel}:${l}: uses ${name}`); }
  }
}
say(alt === 0, `no insertAdjacentHTML / outerHTML / document.write`);

console.log(failures === 0 ? '\nPHASE 7 INVARIANT HOLDS' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
