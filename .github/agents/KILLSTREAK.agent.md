---
name: KILLSTREAK
description: "Project rules for Killstreak 2D — a browser game (Vite + ES modules) with existing players who have saved progress. Use when: editing this repo, adding or tuning a sword/NPC/phase, working on the HUD, UI, cutscenes, rendering or i18n, debugging gameplay, or running the verifier suite. Covers the frozen save schema, frozen gameplay constants, i18n key parity, and the js/ vs src/ two-layer split."
---

# KILLSTREAK — development agent

Killstreak 2D is a browser game with **existing players and saved progress**. The
modular refactor is **complete and closed**. You are doing ordinary development on
it now, not migration.

Everything here is either irreversible if broken, or something that has already
cost real debugging time. The architecture itself lives in
[`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) — read that rather than
re-deriving it. §8 below says which document answers which question.

---

## 1. Three rules that are never negotiable

**1. The save schema is frozen.**
One key: `killstreak_v1_data` (`src/config/gameConfig.js`). Never rename or remove
a key; never change the payload shape without migrating old saves and proving they
still load. A player losing progress is the worst thing this project can do. If you
touch `src/core/SaveManager.js` or `js/storage.js`, read both end to end first.

**2. Gameplay numbers are content, not code.**
`damage`, `maxHp`, `speed`, `killsRequired`, phase thresholds, cooldowns, rewards,
`unlockKills`, NPC stats, formation positions. Do not tidy them, reorder them, or
round them. Change them only when explicitly asked — and then say exactly which
values you changed.

**3. `git` is not installed here.**
There is no undo. **Never delete a file** — move it to `scratch/backup/obsolete/`.
Every step of this project has been kept reversible that way. Keep it that way.

---

## 2. Where the code actually lives

Two layers, **both live**. This is the thing that trips up everyone:

```
index.html → <script type="module" src="/src/main.js">
src/main.js              load-order manifest ONLY (ordered side-effect imports)
  ├── src/**             extracted modules — i18n, data, swords, systems, render, ui, core, utils
  └── js/*.js            legacy shells     — config, storage, entities, map, game, main
```

`js/` is **not** dead code. `js/entities.js` still defines `Player` (~3100 lines),
`js/game.js` still defines `Game` (~1870), and `js/main.js` is the composition
root (~370). The refactor **strangled** them: they got much smaller and now import
from `src/`.

So:

> **To change a behaviour, follow the import.** If the `js/` file delegates that
> concern to an `src/` module, the edit belongs in the `src/` module — nowhere else.

Watch the name collisions: `js/config.js` (354 lines, live) vs
`src/config/gameConfig.js`; `js/storage.js` (190, live) vs
`src/core/SaveManager.js`. Editing the wrong twin changes nothing and looks fine.

---

## 3. The refactor is closed — do not resume it

`js/entities.js` and `js/game.js` are still large, and it is tempting to keep
extracting. Don't. That remaining size is a **known, accepted end state**, not
unfinished work.

Further extraction is a product decision, not a cleanup opportunity. It has to be
explicitly requested, and done one class at a time behind the full verifier suite.
Adding a feature to `Game` is normal and correct. "While I'm here, let me split
`Game`" is not.

---

## 4. Traps that have actually caused bugs here

1. **A missing i18n key renders as the key itself.** `I18n.t()` returns the key
   when the lookup misses and no `{ defaultValue }` was passed, so the UI shows
   `library.foo` — which *looks like text* and survives review. Add to **both**
   `src/i18n/en.json` and `vi.json`. Key-set parity is not translation: Vietnamese
   values have been found holding English text verbatim. Compare values, not keys.

2. **`el.style.color = x` is not the same as a `style` attribute.** The HTML parser
   keeps `color: #38bdf8;` verbatim; the CSSOM re-serialises it to
   `color: rgb(56, 189, 248);`. Use `setAttribute("style", ...)` when the DOM has
   to match.

3. **Canvas hit-testing must divide by the transform scale**, not
   `canvas.width / rect.width`. `#game-container` is scaled by `--game-scale`
   (ARCHITECTURE §5). Use `canvasPointFromEvent` in `js/map.js`.

4. **Editing the last element of a JSON array can silently add a trailing comma.**
   Include the following line in the anchor, and re-parse the file after every edit
   to `refactor-progress.json`.

5. **A regex source check must blank comments and strings first**, or it matches
   prose. This produced false positives three separate times.

6. **PowerShell: never put a backtick inside a `Select-String -Pattern`.** It opens
   a `>>` continuation prompt that swallows every following command. Use
   single-quoted patterns. The console also mangles UTF-8 (`─æ`, `ΓÇö`) — check
   encoding by bytes, never by what the console prints.

7. **`innerHTML` must be either a clear (`""`) or a template containing no `${}`.**
   Enforced by `scratch/verify_phase7_innerhtml.mjs`. The escape hatch is building
   nodes through the DOM API instead.

---

## 5. Verify before you claim

```powershell
npm.cmd run build            # must be 0 errors. npm.cmd, not npm.
# then the suite — every script must exit 0
Get-ChildItem scratch -Filter *.mjs | Where-Object { $_.Name -match '^(verify_|validate_|analyze_)' } | ForEach-Object {
  node $_.FullName > $null 2>&1; if ($LASTEXITCODE -ne 0) { Write-Output ('FAIL ' + $_.Name) }
}
```

Do **not** blanket-run every `*.mjs` in `scratch/`. `extract_*`, `splice_*` and
`phase4_*`–`phase6_*` are one-shot generators that already ran; they throw on
purpose to refuse a double-apply. That is not a failure.

Anything user-visible — HUD, rendering, i18n, input, scaling — counts as verified
only once you have **run the game** (`npm.cmd run dev`, port 5173, then check it in
a browser). Reading the code is not verification.

Report honestly and concretely:

- files changed, and exactly which numbers or strings you changed
- what you ran, and what you did not
- known issues, assumptions, anything you could not verify

Never say "verified" for something you only read. Never claim a test you skipped.

---

## 6. How to work here

**Before editing:** find every caller and every reader of the field you are
touching, then check what the change does to save data, the loop, rendering and
i18n. Then edit.

**One class of change at a time.** Moving code plus renaming plus tuning in a
single pass is how behaviour silently changes.

**When something breaks:** find the first observable difference and compare it with
what it was, instead of rewriting the system. Restore equivalence — do not invent a
third implementation. Before acting on "the code must be newer", verify which
artefact is actually stale; assuming once cost a working file.

**Pre-existing bugs you happen to find:** record them. Do not fix them silently
inside an unrelated change. If one blocks you, fix the minimum and say so.

**Adding content:** a sword is six steps in `docs/ARCHITECTURE.md` §4 — skipping
step 5 leaves its Z ability dead with no error. An NPC needs a data file,
`src/npcs/NpcRegistry.js`, and both dictionaries. Phases live in the sword's
`*.data.json`. The Library, the sword stand and the phase HUD are data-driven and
pick all of it up automatically.

---

## 7. Ask instead of guessing

Stop and ask when: the code contradicts the docs in a way that changes behaviour;
a change would alter gameplay or balance; a save migration looks necessary; two
readings of the request would produce different games; or the source alone cannot
establish intent.

A question costs one message. Silently breaking the game costs a player.

---

## 8. Reference map — read the smallest thing that answers the question

| Question | Read |
|---|---|
| How is it wired, where does X live | `docs/ARCHITECTURE.md` |
| How do I run / build it | `README.md` |
| How do I add a sword | `docs/ARCHITECTURE.md` §4 |
| Why is it like this? past bug history | `refactor-progress.json` — 28 findings, each with a lesson. **Search it, don't read it whole.** |
| What a verifier asserts | the header of that `scratch/verify_*.mjs` |
| Original refactor plan | `KILLSTREAK_REFACTOR_GUIDE.md` — Vietnamese, written against the **pre-refactor monolith**. Historical. **Do not read it to learn the current structure.** |

**Preserve data. Change behaviour only on purpose. Verify, then report.**
