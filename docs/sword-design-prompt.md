# Killstreak — Sword Design Prompt (for Claude / ChatGPT)

Copy everything from **"PROMPT BEGINS"** to **"PROMPT ENDS"** into a fresh chat,
then fill in the **YOUR SWORD BRIEF** block at the bottom (or let the AI choose).

---

PROMPT BEGINS

You are a senior game designer and technical designer for **Killstreak**, a
fast-paced 2D top-down killstreak arena game. Your job is to design **one new
sword** and deliver it as a complete, implementation-ready spec that matches the
existing roster's rules, schema, tone, and balance envelope. Do not write the
game's engine — write the design contract a programmer can drop in.

## 1. Game context

- Top-down 2D, mouse-aim, auto-attacking melee blades. The player equips ONE
  sword. Kills build a **killstreak**. Each sword has a list of **phases**; when
  the killstreak crosses a phase's `killsRequired`, the sword transforms
  (new stats, new look, a notification).
- Each sword has a **theme** (fire, frost, blood, void, light, wind, earth,
  metal, water, speed, predatory hunger).
- Most swords have an active **Z ability** unlocked partway through the phase
  list; some have a second **X ability** unlocked much later.
- Numbers grow *enormously* across the roster — endgame phases deal millions of
  damage. This is intentional power fantasy, not a bug.

## 2. The 13-sword roster (study this — do not duplicate a niche)

| id | Name / Tag | Unlock (kills) | Phases | Collapse phase(s) | Z (unlock) | X (unlock) | Phase 1 DMG/HP | Final DMG/HP/SPD |
|---|---|---|---|---|---|---|---|---|
| devourer | Devourer / FIRST WEAPON | 0 | 17 | 9, 16 | Gluttony (10) | Engulf (17) | 5 / 100 | 6,500 / 30,000 / 189 |
| overdrive | Overdrive / SPEED WEAPON | 1,250 | 7 | — | none | none | 8 / 120 | 5,500 / 25,500 / 300 |
| aquatic | Aquatic / EVOLUTIONARY WEAPON | 2,500 | 13 | 8 | Tsunami (9) | — | 15 / 150 | 18,000 / 62,000 / 185 |
| soil | Soil / DEFENSIVE FORTRESS | 3,500 | 10 | 9 | Fortitude (4) | — | 3 / 250 | 8,500 / 315,000 / 120 |
| metallic | Metallic / THE FORGED WILL | 6,613 | 10 | — | Iron Will (4) | — | 24 / 196 | 24,930 / 391,500 / 125 |
| flora | Flora / THE EVERGROWTH | 10,500 | 10 | — | Worldroot (4) | — | 23 / 413 | 31,500 / 750,000 / 130 |
| hellfire | Hellfire / THE INFERNAL | 18,125 | 10 | — | Cataclysm (4) | — | 45 / 190 | 54,432 / 435,200 / 145 |
| windy | Windy / AERIAL | 24,000 | 13 | 8 | Cyclone (4) | — | 15 / 40 | 70,000 / 145,000 / 220 |
| frostbite | Frostbite / FROZEN | 32,500 | 12 | 7, 11 | Freeze (7) | Blizzard (11) | 4 / 20 | 165,000 / 366,000 / 150 |
| voltstrike | Voltstrike / LIGHTNING | 45,000 | 14 | 5 | Zap (5) | — | 333 / 40 | 1,333,333 / 3,666,666 / 160 |
| lumen | Lumen / RADIANT | 50,000 | 14 | 7, 12 | Flash (7) | Radiance (12) | 120 / 400 | 2,000,000 / 6,000,000 / 118 |
| umbra | Umbra / VOID | 70,000 | 15 | 7, 12 | Gravity Well (7) | Erasure (12) | 900 / 12,000 | 3,400,000 / 42,000,000 / 92 |
| sanguine | Sanguine / BLOOD | 100,000 | 16 | 7, 12 | Bloodletting (7) | Exsanguinate (12) | 3 / 12 | 5,200,000 / 15,000,000 / 168 |

**The design language, in one line each:**

- **devourer** — the baseline "grows on kills" sword; two big power dips before
  huge resurrections.
- **overdrive** — raw speed and mobility, fragile, no ability, never collapses.
- **aquatic** — one collapse then a tidal power spike; area damage.
- **soil** — the tank; trades damage for absurd HP; one collapse.
- **metallic** — the defensive bruiser; smooth, no collapse, damage-reduction Z.
- **flora** — sustain/growth; heals and roots; smooth, no collapse.
- **hellfire** — the glass cannon; biggest raw damage for its phase count.
- **windy** — mobility + AoE vortex; one collapse ("Calm").
- **frostbite** — control (freeze/slow); the first sword with two collapses and
  its own X.
- **voltstrike** — single-target burst and stun; one early collapse; huge numbers
  for its slot.
- **lumen** — arrives strong immediately, then grows slowly; two collapses.
- **umbra** — starts strong and stays heavy; two collapses despite a lore claim
  of "no collapse" (the data wins).
- **sanguine** — weakest start in the game, then the strongest finish; two
  collapses.

## 3. Hard rules — the data contract

A sword is defined by a JSON file with this exact shape. Every field is required
unless marked optional.

```jsonc
{
  "id": "mySword",              // lowercase, one word, unique
  "name": "My Sword",           // display name
  "tag": "ALL CAPS THEME",      // 1-3 words, all caps
  "icon": "🗡️",                 // single emoji
  "unlockKills": 140000,        // total kills needed to equip
  "signatureSkill": "MyZ",      // omit if no ability
  "skillUnlockPhase": 7,        // phase number the Z unlocks at
  "description": "One or two sentences of power fantasy, ending with the skill(s).",
  "phases": [
    {
      "phase": 1,               // contiguous from 1, ascending
      "killsRequired": 0,       // strictly ascending across phases
      "name": "Phase 1: Title", // "Phase N: Title"
      "shortName": "Title",     // Title only
      "damage": 100,            // integer
      "maxHp": 400,             // integer
      "speed": 60,              // movement speed, integer
      "bladeLength": 50,        // px, ~40-235 across all swords
      "bladeWidth": 4,          // px, ~3-36 across all swords
      "arcAngle": 2.1,          // radians, ~1.4-5.8
      "swingDuration": 0.15,    // seconds, ~0.08-0.35
      "cooldown": 0.22,         // seconds between auto-attacks, ~0.12-0.65
      "color": "#fef9c3",       // blade hex colour
      "glowColor": "rgba(254, 249, 195, 0.30)",  // shadow/glow
      "trailColor": "rgba(254, 249, 195, 0.15)", // swing trail
      "effects": "What the blade looks like and does. Base X DMG and Y HP.",
      "notification": "A short in-character line shown on phase-up.",
      "cssClass": "phase-mn-1", // phase-<2-letter abbr>-<N> (legacy swords use phase-<N>)
      "weaponType": "glimmer",  // snake_case silhouette name
      "unlockSkill": "my_z",    // OPTIONAL: only on/after the skill's unlock phase
      "isFinal": true           // OPTIONAL: only on the last phase
    }
  ]
}
```

**Non-negotiable:**
1. `phases[].phase` is contiguous starting at 1; `killsRequired` strictly
   ascending; phase 1 is always `killsRequired: 0`.
2. Every phase carries the full stat/colour block. Never omit a field hoping for
   a default — missing fields are undefined, not "sensible".
3. The last phase is flagged `"isFinal": true` and should feel like an
   apotheosis.
4. Colours: pick a coherent ramp (early = pale/desaturated, late = saturated/
   white-hot). `glowColor` and `trailColor` are the same hue as `color` at
   ~0.3→1.0 and ~0.15→0.7 alpha respectively.

## 4. Balance envelope

- **Unlock:** the roster already occupies 0 → 100,000. A new endgame sword should
  sit above the highest existing unlock (unless you are intentionally
  respecifying one).
- **Phase count:** 7–17. More phases = a longer, more granular climb.
- **Per-phase growth:** damage typically climbs ×1.5–2.2 per phase, HP ×1.6–3.0,
  speed +1 to +40. A **collapse phase** drops damage/HP to a tiny fraction of the
  previous phase (often single digits to low hundreds), then the next phase
  spikes far above the pre-collapse peak ("the resurrection"). Collapses are the
  roster's signature pacing device.
- **Speed:** ~10 at the slowest tank start to 300 at the fastest endgame.
- **Geometry:** `bladeLength` 40→235, `bladeWidth` 3→36, `arcAngle`
  ~1.4 rad (≈80°, narrow/piercing) to ~5.8 rad (≈333°, wide cleave),
  `swingDuration` 0.35→0.08 as it gets faster, `cooldown` 0.65→0.12.
- **Ability budget:**
  - Z unlocks at phase 4, 5, or 7; cooldown 12–35 s; usually a damage multiplier
    (2×–5.75× weapon damage) or a defensive buff.
  - X unlocks at phase 11, 12, or 17; cooldown 45–70 s; the "ultimate".
  - A sword may have no ability (Overdrive) — that is legal.
- Do not hand a new sword a strictly better version of an existing niche; give it
  a distinct mechanic (control, sustain, burst, mobility, area, single-target).

## 5. Naming and copy conventions

- `id` lowercase single word; `name` Title Case; `tag` ALL CAPS.
- Phase titles are evocative single concepts that escalate: Breeze → Draft →
  Gust → Gale → Squall → Tempest … → Ultimate Tempest. Short and cinematic.
- `effects` describes the *look* plus mechanics, then always ends with a plain
  stat line: `"Base 9,000 DMG and 20,000 HP."`
- `notification` is a single in-character line (the sword has a personality):
  calm ("Can you feel that?"), menacing ("Run."), or wistful. Later swords have
  the most voice.
- Collapse phases label themselves `"DELIBERATE COLLAPSE."` and explain what the
  sword lost — and hint that it will return.
- Final phases begin `"FINAL TRANSFORMATION: <TITLE>."` and close with a
  one-word imperative ("Cease.", "Strike.", "Shine.", "Stop.").

## 6. Rendering contract (describe, don't code)

The render module exposes `drawBlade(ctx, geom, player)` and
`drawAura(ctx, player)`. For the spec, describe in enough detail that an engineer
can draw it with the Canvas 2D API:

- **Silhouette per phase-group** (e.g. phases 1-3 rapier, 4 transitional,
  5-7 katana). Say what the guard/hilt, blade body, and core look like.
- **Palette ramp** per phase (hex + rgba glow/trail).
- **Animation:** idle motes, orbiting particles, pulsing cores, trails, ground
  effects, screen-space impact VFX.
- **State hooks available:** `player.phase`, `player.isAttacking`, `player.animTimer`,
  `player.radius`, `player.isSwordEquipped`, plus ability-active flags.

## 7. Ability contract

For each ability give:

- Name and key (Z primary, X secondary).
- Unlock phase and cooldown (seconds).
- Effect: damage multiplier or amount, radius in px (or "within N× swing range"),
  duration, crowd-control, healing/shield, movement.
- Guard conditions (must be equipped, combat state, phase gate, cooldown).
- VFX and the floating text shown on cast.
- The exact HUD strings and i18n keys: `skills.<id>_label` =
  `"[ Z — NAME ]"`, `skills.<id>_title` = `"Name [Z] — <description> (Phase N+, Ns CD)"`,
  and a `floating.<id>` cast shout.

## 8. Integration surfaces a finished sword must feed (context only)

`src/swords/<id>/<id>.data.json`, `<id>.render.js`, `<id>.ability.js` (+ optional
`<id>.<x>.ability.js`); registry entry in `SwordRegistry.js`; a dispatch branch in
`AbilitySystem.js` `activatePrimary` / `activateSecondary`; `SWORD_IDS`; i18n
`swords.*` and `phases.*` in `en.json` + `vi.json`; Library subtab; pedestal
entry; skills HUD; save keys; lobby row. You do not implement these — but your
output must contain everything they need.

## 9. Required output format

Return, in this order:

1. **Concept** — id, name, tag, icon, unlockKills, 2-3 sentence pitch, and which
   existing niche it avoids.
2. **Role & feel** — combat role, speed/weight, signature mechanic, and its place
   in progression.
3. **Full phase table as valid JSON** — the complete data object, every field,
   following the schema exactly.
4. **Render spec** — per phase-group: silhouette, colours, animation.
5. **Ability spec(s)** — Z, and X if you chose one.
6. **i18n strings** — English and Vietnamese for: name, tag, description, every
   phase name/shortName/effects, ability labels/titles, floating text, unlock
   toast.
7. **Balance rationale** — why the numbers sit where they do versus the roster.
8. **Open questions** — anything you had to assume.

Constraints: keep the JSON valid; keep stat progression internally consistent
(no accidental phase where damage goes *down* except a labelled collapse); do not
exceed 17 phases; do not reuse an existing id/name/tag.

## YOUR SWORD BRIEF

Fill this in, or delete it and invent something the roster is missing:

- Working name:
- Theme / element:
- Combat role (AoE / single-target / tank / speed / sustain / control / hybrid):
- Power fantasy in one sentence:
- Feel (slow & heavy / fast & light / precise / chaotic / inevitable):
- Number of phases (or "you decide"):
- Target unlock (kills) (or "you decide"):
- Ability: none / Z only / Z + X — and what it should do:
- Must NOT resemble (optional):
- Any hard constraint (optional):

Now design the sword.

PROMPT ENDS
