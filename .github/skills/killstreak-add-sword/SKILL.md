---
name: killstreak-add-sword
description: Add a new sword (weapon) to the Killstreak game — data file, blade/aura rendering, Z-ability, registry wiring, AbilitySystem dispatch, and i18n. Use this whenever the user asks to add a new sword, weapon, blade, or ultimate skill to the Killstreak project, wants to give an existing sword more phases, or asks "how do I add sword X" — even if they don't say the word "skill". Do not use for tuning existing sword numbers only (that's a plain data edit, not this workflow) or for adding an NPC (use killstreak-add-npc instead).
---

# Killstreak — Add a Sword

Killstreak's swords follow a real Strategy Pattern: `Player`/`Game` contain **no**
per-sword `if`/`switch` logic for rendering. A sword is three files plus two
registration points. Skipping one of the registration points is the single most
common way this silently breaks — the game keeps running, nothing throws, and the
new sword's active skill just does nothing.

Follow every step below in order. Do not skip step 5 even if the sword "seems to
work" after step 4 — it will equip, render, and deal auto-attack damage, but its Z
ability will silently do nothing (or worse, fire someone else's ability — see the
warning in step 5).

## Before you start

Read `docs/ARCHITECTURE.md` §3–4 if it's present in the repo — this skill mirrors
it, but the doc may have been updated since this skill was written. If the two
disagree about something structural (not just wording), trust the doc, but flag
the mismatch to the user rather than silently picking one.

Pick an existing sword closest in spirit to the new one and use its three files as
your template. Copy, then adapt — don't write from a blank file.

## Step 1 — Data: `src/swords/<id>/<id>.data.json`

Copy an existing sword's data file. Keep:
- `phases[].phase` contiguous starting at 1
- `phases[].killsRequired` strictly ascending
- every field the template sword has (damage, maxHp, speed, bladeLength,
  bladeWidth, arcAngle, color, glowColor, effects, notification, cssClass) — a
  missing field usually means "falls back to the last phase's value or undefined",
  not "uses a sensible default"

## Step 2 — Rendering: `src/swords/<id>/<id>.render.js`

Copy an existing `.render.js` and adapt `drawBlade(ctx, geom, player)` and
`drawAura(ctx, player)`. Both must be pure with respect to their parameters — read
state from `player`/`geom`, don't reach for globals or `window.Killstreak`. This is
what keeps the Strategy Pattern real instead of cosmetic.

## Step 3 — Ability: `src/swords/<id>/<id>.ability.js`

Export `default { activate(game) }`. Guard early-return when: the sword isn't the
one currently equipped, the game state isn't `COMBAT`, or the cooldown hasn't
elapsed. Copy the guard structure from an existing ability module — don't invent a
new guard pattern, the existing ones are what the rest of the codebase expects.

## Step 4 — Register the renderer: `src/swords/SwordRegistry.js`

Add the two imports and one entry:

```js
import <id>Data   from './<id>/<id>.data.json';
import <id>Render from './<id>/<id>.render.js';
// ...
<id>: { data: <id>Data, render: <id>Render },
```

Do **not** add an `ability` field to this registry entry even though you might
expect symmetry with step 3. The registry intentionally holds only
`{ data, render }` — see step 5 for why.

## Step 5 — Register the ability dispatch: `src/systems/AbilitySystem.js` (the step that's easy to miss)

Abilities are **not** looked up through `SwordRegistry` — they're an explicit
`if (swordId === "...")` chain in `AbilitySystem.js`. This is deliberate: it
reproduces original per-sword ability behavior exactly (including quirks like one
sword's ability guarding itself against being triggered by another sword's
equip state), and wiring it through the registry instead would risk silently
handing one sword's ability to a different sword. Read the file's own header
comment before touching it.

Add the import and the branch:

```js
import <id>Ability from '../swords/<id>/<id>.ability.js';
// ...
if (swordId === "<id>") return <id>Ability.activate(game);
```

**If you skip this step:** the new sword equips, renders, and auto-attacks fine.
Pressing its ability key does nothing, or falls through to whichever sword's
`if` branch is checked first — and nothing in the console says so. This is the
single most common failure mode when adding a sword here. Do not consider the
sword "done" until you've pressed its ability key in a running game and watched
it fire.

## Step 6 — i18n: `src/i18n/en.json` and `src/i18n/vi.json`

Add every string the new sword introduces — sword name, phase names, tag/subtitle,
unlock notification, ability name/description, toast copy — to **both** files.

A missing key does not throw and does not look broken: `I18n.t()` falls back to
returning the raw key string when no `{ defaultValue }` was passed, so the UI
shows something like `library.sword_name_hellfire` where the name should be. That
reads as real text on a quick glance and slips past casual review. After adding
keys, open both JSON files and diff the *values*, not just check that the same
keys exist in both — a key present in both languages but holding English text in
the `vi.json` slot is a real bug that has happened in this project before and
won't show up as a missing-key symptom.

## Step 7 — Wherever sword unlocks are listed

Search the codebase for how existing swords' unlock thresholds/order are declared
outside their own data file (e.g. a central unlock-order list or config) and add
the new sword there too. Grep for the id of the sword right before yours in
unlock order to find every place it's referenced, then add the new one alongside
each hit — don't assume a single file owns this.

## Step 8 — Verify before reporting done

```
npm run build      # (npm.cmd run build on Windows) — must exit 0
```

Then run whatever verifier suite the repo has (check `scratch/*.mjs` for scripts
matching `verify_`, `validate_`, `analyze_`, or check `package.json` for a test
script) — every one must exit 0. Do not run one-shot generator/migration scripts
that live alongside them (names like `extract_*`, `splice_*`, or anything
described as a one-time migration step in its own header) — those already ran
once and may throw on purpose to refuse a double-apply; that's not a failure.

Then actually run the game (`npm run dev`), equip the new sword, get it to at
least its first phase-up, and fire its ability once. Reading the code back is not
verification — seeing the ability fire in a running browser is.

## Reporting back

State plainly:
- which files you created or edited
- the exact numbers/strings you chose (damage, HP, unlock threshold, etc.) —
  don't make the user go diff the JSON to find out what you picked
- that you ran the build + verifier suite and the game itself, and what you saw
- anything you weren't able to verify, and why

Never say "done" or "verified" for a step you only read the code for.
