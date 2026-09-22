/**
 * Keeps refactor-progress.json's created_files_manifest honest.
 *
 * Why this exists: the manifest accumulated 14 entries pointing at files that no
 * longer existed — the applied one-shot generators, the quarantined sibling JSON,
 * two scripts moved to scratch/backup/obsolete/, and the deleted data backups.
 * A "list of files created" that names missing files is worse than no list,
 * because it is trusted. This makes the drift fail loudly instead.
 *
 * Rules, per entry:
 *   - `path` with `*` or `<name>` is a pattern; only its leading directory is
 *     checked, since the concrete files are enumerated elsewhere.
 *   - otherwise the path must exist.
 *   - an entry may be stale ONLY if it carries a `note` explaining where the file
 *     went (the convention already used for moved and removed entries).
 *
 * It also asserts the two counts that must stay in sync with the filesystem: the
 * suite scripts and the slice manifests.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      ${detail}`}`);
};

const tracker = JSON.parse(fs.readFileSync(path.join(root, 'refactor-progress.json'), 'utf8'));
const manifest = tracker.created_files_manifest;

const exists = (rel) => fs.existsSync(path.join(root, rel));

// --------------------------------------------------------------- path integrity
const missingUnannotated = [];
const missingAnnotated = [];

for (const entry of manifest) {
  const p = entry.path;
  if (!p) { missingUnannotated.push('<entry with no path>'); continue; }

  let target = p;
  const special = Math.min(...[p.indexOf('*'), p.indexOf('<')].filter((i) => i >= 0), Infinity);
  if (special !== Infinity) {
    // Pattern: check the directory that precedes it.
    const cut = p.slice(0, special);
    target = cut.endsWith('/') ? cut.replace(/\/$/, '') : cut.replace(/[^/]*$/, '').replace(/\/$/, '');
  }
  if (!target) continue;

  if (exists(target)) continue;
  if (/\b(REMOVED|MOVED)\b/.test(entry.note || '')) missingAnnotated.push(p);
  else missingUnannotated.push(p);
}

check(`every manifest path exists or is annotated (${manifest.length} entries)`,
  missingUnannotated.length === 0,
  missingUnannotated.length
    ? `${missingUnannotated.length} unannotated missing path(s) — add a note, or delete the entry:\n      ${missingUnannotated.join('\n      ')}`
    : '');

if (missingAnnotated.length) {
  console.log(`      annotated as gone, as intended: ${missingAnnotated.length}`);
}

// ------------------------------------------------------- counts that can drift
const suiteScripts = fs.readdirSync(path.join(root, 'scratch'))
  .filter((f) => /^(verify_|validate_|analyze_).*\.mjs$/.test(f));

// Compare against the number the tracker CLAIMS, rather than a literal. This file
// is itself a suite script, so a hard-coded count would be both self-defeating and
// easy to leave stale — which is the exact failure mode this script exists for.
const documented = (tracker.developer_notes?.suite_command || '').match(/currently (\d+) scripts/);
check('the documented suite size matches the filesystem',
  documented !== null && Number(documented[1]) === suiteScripts.length,
  `developer_notes.suite_command says ${documented ? documented[1] : 'nothing'}, filesystem has ${suiteScripts.length}`);

const slices = fs.existsSync(path.join(root, 'scratch/slices'))
  ? fs.readdirSync(path.join(root, 'scratch/slices')).filter((f) => f.endsWith('.json'))
  : [];
check(`slice manifests present for verify_slice.mjs (${slices.length})`, slices.length > 0);

// A file named in the manifest as REMOVED must actually be gone, or the annotation lies.
const resurrected = manifest
  .filter((e) => /\bREMOVED\b/.test(e.note || '') && !e.path.includes('*') && exists(e.path))
  .map((e) => e.path);
check('nothing annotated REMOVED still exists on disk', resurrected.length === 0, resurrected.join(', '));

console.log(failures === 0 ? '\nMANIFEST HONEST' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
