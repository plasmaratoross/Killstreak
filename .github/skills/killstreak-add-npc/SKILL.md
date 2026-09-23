---
name: killstreak-add-npc
description: Add a new NPC/enemy type to the Killstreak game — data file, optional custom rendering, and zone spawn assignment. Use this whenever the user asks to add a new NPC, enemy, monster, or mini-boss to Killstreak, or asks "how do I add NPC/enemy X" — even if they don't say the word "skill". Do not use for tuning an existing NPC's stats only (plain data edit) or for adding a sword (use killstreak-add-sword instead).
---

# Killstreak — Add an NPC

**Read this whole skill before touching any file.** The project's own written
docs (`docs/ARCHITECTURE.md`, `.github/agents/*.agent.md` if present) may describe
an NPC pipeline that goes through `src/npcs/NpcRegistry.js`. As of the last time
this skill was verified against the actual running code, **that registry is not
imported anywhere and has no effect at runtime** — it's leftover scaffolding from
the modular refactor that was never wired in. The pipeline described below is what
`js/entities.js` and `js/game.js` actually read. If you're not sure which is still
true, grep for `NpcRegistry` across the repo — if nothing outside
`src/npcs/NpcRegistry.js` itself imports it, treat this skill's steps as current
and flag the docs as stale to the user rather than trusting the doc over the code.

Unlike swords, **NPC rendering is not behind a Strategy Pattern**. Named NPC types
with bespoke visuals are one long `if (this.type === "...") { ... } else if (...)`
chain inside `NPC.draw()` in `js/entities.js`. This is real, working, and not a
bug — just know that giving an NPC a custom look means adding a branch to that
chain, not dropping in a separate render module the way swords work.

## Step 1 — Decide: generic look or bespoke look?

Any NPC type not matched by a named branch in `NPC.draw()` automatically falls
back to a working generic renderer (a colored circle with simple eyes, tinted by
hostility state) — this is a real, intentional fallback, not a broken state. So:

- **Generic look is fine** (a reskinned "grunt" using only color/size/stats) →
  Step 2 only. You're done after that plus zone assignment.
- **Bespoke visuals needed** (a mini-boss, a unique silhouette) → Step 2 **and**
  Step 3.

Confirm which one the user wants before doing extra work — a generic-look request
doesn't need Step 3 at all.

## Step 2 — Data: `data/npcs/<type>/<type>.js`

This is the file actually read at runtime (via
`window.Killstreak.Data.NPCs.<type>`), **not** a `.json` file under `src/npcs/`.
Copy the structure of an existing one (e.g. `data/npcs/fairy/fairy.js`) exactly —
same IIFE wrapper, same `window.Killstreak.Data.NPCs.<type> = {...}` assignment —
and adapt the fields: `id`, `name`, `description`, `radius`, `speed`, `maxHp`,
`damage`, `attackRate`, `attackRange`, `killsAwarded`, `killstreakAwarded`,
`respawnDelay`, `color`, `glowColor`, `massScale`, `shoveRatio`, `barWidth`,
`barColor`. Missing fields tend to fall back silently to a generic default rather
than erroring, so match the template's field set exactly even if a value seems
redundant.

Optionally, also create the matching `src/npcs/<type>/<type>.data.json` and add it
to `src/npcs/NpcRegistry.js`, purely to keep the repo internally consistent with
what its own docs claim — but understand this step currently has **zero effect on
gameplay** since nothing reads that registry. Don't let the user believe this step
made the NPC live; the `data/npcs/<type>/<type>.js` file in this step is what did.

## Step 3 — Bespoke rendering (only if Step 1 said so): `NPC.draw()` in `js/entities.js`

Find the long `if (this.type === "...")  { ... } else if (this.type === "...") {
...}` chain (search for an existing type name close in spirit to what you're
adding). Add a new `else if (this.type === "<type>") { ... }` branch **before**
the final unconditional `else { /* Normal Sentry fallback */ }` block — order
matters here only in that your branch must come before that final `else`, not
after it.

Copy an existing branch as your template and adapt the drawing calls
(`ctx.arc`, `ctx.fill`, gradients, etc.) rather than inventing new canvas
primitives from scratch — consistency with the existing visual language (glow
radius, hit-flash white fill, hostile vs. passive coloring) matters more than
originality here.

Also check `NPC.update()` and the mass/shove-ratio helper methods earlier in the
same class for other `this.type === "..."` branches (e.g. mass scale overrides,
shove ratio, health-bar width/color per type) — a fully bespoke NPC may want
entries in those too, though they're optional polish, not required for the NPC to
function.

## Step 4 — Assign it to a spawn zone: `data/maps/<mapname>.js`

Find the `npcZones` array (currently in `data/maps/grassland.js` for the combat
map) and either add a new zone entry with `npcType: "<type>"` or change an
existing zone's `npcType` to the new one. Check neighboring zone entries for
other required fields (position, count, formation) and match the pattern.

## Step 5 — i18n (usually not needed, but check)

As of the last verification, NPC `name`/`description` are read directly from the
data file in English and are **not** routed through the i18n system the way sword
strings are — so there is usually nothing to add to `en.json`/`vi.json` for a new
NPC. Before skipping this step, grep the UI code (Library panel, HUD) for how it
displays the NPC name — if you find an `I18n.t(...)` call involved, add the keys;
if it reads `data.name` directly, there's nothing to do here.

## Step 6 — Verify before reporting done

```
npm run build      # (npm.cmd run build on Windows) — must exit 0
```

Run the repo's verifier suite if one exists (check `scratch/*.mjs` for
`verify_`/`validate_`/`analyze_` scripts, or `package.json` for a test script) —
every one must exit 0. Skip one-shot migration/generator scripts (names like
`extract_*`, `splice_*`) — those are expected to throw on a second run.

Then run the game (`npm run dev`), get the new NPC to actually spawn in its
assigned zone, and confirm it looks and fights as intended. Reading the code back
is not verification.

## Reporting back

State plainly:
- which files you created or edited, and whether you took the generic-look or
  bespoke-look path
- the exact stat numbers you chose
- whether you also touched `src/npcs/` for doc-consistency, and that doing so had
  no gameplay effect
- that you ran the build + verifier suite and the game itself, and what you saw
- anything you weren't able to verify, and why

Never say "done" or "verified" for a step you only read the code for.
