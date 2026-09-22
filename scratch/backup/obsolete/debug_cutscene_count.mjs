import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.join(import.meta.dirname, '..'));
const mainText = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
let srcText = '';
const walkSrc = (dir) => {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walkSrc(rel);
    else if (e.name.endsWith('.js')) srcText += fs.readFileSync(path.join(root, rel), 'utf8') + '\n';
  }
};
walkSrc('src');
const surfaceText = mainText + '\n' + srcText;
const callSites = surfaceText.replace(/export function (advance|skip)\s*\(/g, '__DEF__(');

for (const name of ['advance', 'skip']) {
  const re = new RegExp(`(?:CutsceneSystem\\.)?${name}\\(game\\)`, 'g');
  const hits = [...callSites.matchAll(re)];
  console.log(`${name}: ${hits.length} hit(s)`);
  // show which file each hit is in
  for (const h of hits) {
    const before = callSites.slice(0, h.index);
    const file = /js\/main\.js/.test(before) ? '?' : '?';
    console.log('   ...' + callSites.slice(Math.max(0, h.index - 60), h.index + 30).replace(/\n/g, ' | '));
  }
}
console.log('\nlegacy names present?', surfaceText.includes('game.advanceCutscene('), surfaceText.includes('game.skipCutscene('));
