# Architecture

How the project is put together, and the two things you are most likely to need:
**adding a sword** and **understanding the responsive scaling**.

For "how do I run it" see [../README.md](../README.md). For the phase-by-phase history of
the modular refactor, including 28 logged findings and their lessons, see
[../refactor-progress.json](../refactor-progress.json). For the original refactor plan,
see [../KILLSTREAK_REFACTOR_GUIDE.md](../KILLSTREAK_REFACTOR_GUIDE.md) — historical,
written against the pre-refactor monolith.

---

## 1. Entry point and load order

```
index.html
  └── <script type="module" src="/src/main.js">
        └── src/main.js          ordered side-effect imports (order matters)
              ├── ...data, src/*   ES modules
              └── ../js/main.js    the composition root
```

`src/main.js` is intentionally almost empty: it is a **load order manifest**. The
legacy files under `js/` are plain IIFEs that register onto `window.Killstreak`, so
they must be evaluated in their original order. That ordering is the only reason
`src/main.js` exists in this shape.

`js/main.js` is the **composition root**. It builds the `Game`, wires the 13
`new Game(...)` callbacks, calls each `init*Wiring(game)`, and starts the loop. It
is deliberately kept at ~365 lines with **zero top-level functions and zero
`addEventListener` calls**.

Both of those properties are enforced, not aspirational — see §7.

### The ownership rules

These were established during the refactor and are worth preserving:

1. **Every listener belongs to the module that owns the thing being listened to.**
   `main.js` registers none. Each `src/ui/*.js` module exposes `initXWiring(game)`
   and `js/main.js` calls it once.
2. **Modules that must stay importable under bare Node stay DOM-free.**
   `src/systems/CutsceneSystem.js` is pure logic so the Node verifiers can import
   it; its DOM wiring lives in `src/ui/cutsceneUI.js`. Do not mix them back together.
3. **Avoid import cycles by injection.** `initSwordStandWiring(game, () => returnFromModal(game))`
   — `modals.js` already imports the sword-stand module, so importing back would
   create a cycle. The close action is passed in instead of imported.
4. **Cross-module assignment needs an exported setter.** `export let x` gives
   importers a live read, but assignment across a module boundary is illegal, hence
   `setInspectedSwordId`, `setCogClickCount`, `setSelectedLibrarySword`, `setIsDebugUnlocked`.

---

## 2. Directory map

```
src/
├── main.js                  Ordered import manifest (Vite entry)
├── config/
│   ├── gameConfig.js        Viewport, player, bloodmoon, achievements
│   └── npcFormations.js     Formation slot arrays per NPC zone
├── core/
│   ├── GameLoop.js          requestAnimationFrame driver + viewport fitting
│   ├── InputManager.js      Keyboard/mouse -> game.input
│   └── SaveManager.js       Persistent save/load
├── i18n/
│   ├── I18n.js              Translation lookup (DOM-free)
│   ├── en.json / vi.json    Strings
├── maps/                    Map data (lobby = sanctuary, grassland = combat)
├── npcs/
│   ├── NpcRegistry.js       npcType -> data
│   └── <name>/<name>.data.json
├── render/                  WorldRenderer, LobbyRenderer (world drawing)
├── swords/
│   ├── SwordRegistry.js     swordId -> { data, render }
│   └── <name>/              See §4
├── systems/                 AbilitySystem, AchievementSystem,
│                            BloodmoonEventSystem, CutsceneSystem
├── ui/                      One module per screen/panel, each owning its wiring
│   ├── domRefs.js           Every getElementById, in one place
│   └── hud, modals, library, swordStand, badges, skillsPanel,
│       debugPanel, settings, language, cutsceneUI, toast
└── utils/                   format, collision, dom

js/                          Legacy IIFEs — STILL LIVE, not dead code (§8):
├── entities.js              the Player class
├── game.js                  the Game class
├── main.js                  the composition root
├── map.js                   minimap / full-map input and tooltips
├── config.js, storage.js    still loaded for their side effects
└── (i18n.js retired — see §8)
```

---

## 3. The sword Strategy Pattern

The point of the pattern is that **`Player` and `Game` contain no per-sword
`if`/`switch` chains.** All variation lives in three files per sword:

| File | Exports | Responsibility |
|---|---|---|
| `<id>.data.json` | (JSON) | Phase table: damage, HP, speed, blade geometry, colours, i18n keys |
| `<id>.render.js` | `default { drawBlade(ctx, geom, player), drawAura(ctx, player), … }` | How the blade and aura are drawn |
| `<id>.ability.js` | `default { activate(game) }` | The Z skill: cost, cooldown, damage, effects |

A sword's data file drives the Library, the sword stand, and `player.phase`:

```jsonc
{
  "id": "hellfire", "name": "Hellfire", "unlockKills": 18125,
  "phases": [
    { "phase": 1, "killsRequired": 0, "name": "...", "damage": 5, "maxHp": 100,
      "speed": 21, "bladeLength": 34, "bladeWidth": 3, "arcAngle": 1.6,
      "color": "#ea580c", "glowColor": "...", "effects": "...",
      "notification": "...", "cssClass": "..." }
  ]
}
```

### There are TWO dispatch sites, and they work differently

This is the part that trips people up:

- **Rendering** goes through the registry:
  `js/entities.js` → `getSwordRenderer(swordId).drawBlade(...)`. Unknown ids fall
  back to Devourer, mirroring the original `else` branch.
- **Abilities** do **not** use the registry. `src/systems/AbilitySystem.js` has an
  explicit `if (swordId === "...")` chain and imports each ability module directly.

The reason is behavioural, and `AbilitySystem.js` documents it: the original code
called `activateEngulf` unconditionally, with no `swordId` test, and Gluttony
guards itself with `swordId !== "devourer"`. Wiring abilities up as
`getSword(id).ability` would therefore hand **Overdrive** a skill it never had —
a gameplay change. The explicit chain reproduces the original branching exactly.

So the registry deliberately holds only `{ data, render }`. It used to hold an
`ability` field plus `getSword()` / `getSwordData()` / `getSwordAbility()`
accessors; none was ever read, and the field was removed because *using* it would
have been the bug described above. `AbilitySystem.js` is the single place that
records which sword has which ability. Do not re-add the field.

---

## 4. How to add a new sword

Six steps. Steps 1–4 are the four the original plan described; **step 5 is the one
that plan omits, and skipping it means the sword has no working Z ability.**

1. **`src/swords/<id>/<id>.data.json`** — copy an existing sword's data file and
   edit. Keep `phases[].phase` contiguous from 1 and `killsRequired` ascending.

2. **`src/swords/<id>/<id>.render.js`** — copy an existing render module and adapt
   `drawBlade` / `drawAura`. Both receive real parameters; do not reach for globals.

3. **`src/swords/<id>/<id>.ability.js`** — export `default { activate(game) }`.
   Return `false` early when the sword is not the equipped one, the game is not in
   `COMBAT`, or the cooldown is running — follow the guards in an existing ability
   module rather than inventing new ones.

4. **Register in `src/swords/SwordRegistry.js`** — add two imports and one entry.
   (No ability module here — the registry holds `{ data, render }` only.)
   ```js
   import hellfireData   from './hellfire/hellfire.data.json';
   import hellfireRender from './hellfire/hellfire.render.js';
   // ...
   hellfire: { data: hellfireData, render: hellfireRender },
   ```

5. **Add the Z dispatch branch in `src/systems/AbilitySystem.js`**, *and* the
   import above it:
   ```js
   import hellfireAbility from '../swords/hellfire/hellfire.ability.js';
   // ...
   if (swordId === "hellfire") return hellfireAbility.activate(game);
   ```
   Without this the sword silently falls through to Devourer's Gluttony, which
   then rejects it because `swordId !== "devourer"` — so Z does nothing at all.

6. **Add the sword's name/tag/phase strings to `src/i18n/en.json` and
   `src/i18n/vi.json`**, and its unlock entry wherever sword unlocks are listed.
   Missing keys do not throw: `I18n.t()` falls back to the **key itself** unless a
   `{ defaultValue }` is supplied, so the UI silently shows `library.something`
   instead of a label. Check both languages, and run
   `scratch/verify_i18n_unit_keys.mjs` if you also added NPC types.

Then verify:

```powershell
npm run build
# and the suite — see §7
```

The Library, the sword stand and the phase HUD are all data-driven, so they pick
the new sword up with no further edits.

---

## 5. Responsive scaling (the 1000×650 design)

Everything inside `#game-container` is positioned in px against a fixed
**1000×650** box. The window is therefore handled by scaling that whole box, not by
reflowing its children.

```
resize / orientationchange
  └── resizeCanvasToFit()            src/core/GameLoop.js
        └── sets --game-scale        on <html>
              └── styles/responsive.css applies it:
                    #game-container {
                      position: absolute; top: 50%; left: 50%;
                      transform: translate(-50%, -50%) scale(var(--game-scale));
                    }
```

**The canvas resolution is never changed.** Player position, camera, collision
distances and the minimap projection are all expressed against a 1000×650 world,
so altering the backing store would invalidate every one of them.

Two decisions worth knowing:

- **Capped at 1.** The canvas is a fixed bitmap, so a factor above 1 would only
  enlarge pixels and blur the scene.
- **The scale factor is applied to `translate` first, then `scale`.** That keeps
  the visual centre pinned to the viewport centre even when the unscaled 1000px
  box is wider than the window — which is the entire case this exists for.

### Mouse input and scaling

CSS transforms change what `getBoundingClientRect()` reports, so anything doing
screen → game coordinate maths needs correcting:

| Site | Status |
|---|---|
| `src/core/InputManager.js` `updateMouseCoordinates` | Divides by `rect.width` — already correct |
| `js/map.js` `canvasPointFromEvent` | Divides by the **transform scale** |

**Use the transform scale, not `canvas.width / rect.width`.** All three canvases now
render 1:1 with their bitmap, so the two formulas agree:

| Canvas | Bitmap | CSS layout |
|---|---|---|
| `#game-canvas` | 1000 | 1000 |
| `#minimap-canvas` | 180 | 180 (in a 182px wrapper content box) |
| `#full-map-canvas` | 880 | 880 (in an 882px wrapper content box) |

They did **not** agree before: `#minimap-canvas` was a 180px bitmap laid out at
184, and the full map was 880 laid out at 890. So `canvas.width / rect.width` was
0.978 / 0.989 with no transform at all — a silent ~2% error in zone hit-testing,
*plus* 2px clipped off the right and bottom of both canvases. `rect.width /
canvas.offsetWidth` is exactly 1 at rest, which is what `canvasPointFromEvent`
uses, so the arithmetic is correct either way.

If you resize any of these canvases, keep bitmap and CSS box equal. Sizing a canvas
by its wrapper (rather than by its `width`/`height` attributes) reintroduces both the
stretch and the clip.

---

## 6. The debug panel

Hidden developer mode. Unlocked by entering the password
`supercalifragilisticexpialidocious` in Settings, or by clicking the Settings cog
**12 times within 2.5 s**. It exposes streak manipulation, badge granting, quick
kills and the Bloodmoon event. Implementation: `src/ui/debugPanel.js`.

---

## 7. The verifier suite

Run after any change:

```powershell
Get-ChildItem scratch -Filter *.mjs | Where-Object { $_.Name -match '^(verify_|validate_|analyze_)' } | ForEach-Object {
  node $_.FullName > $null 2>&1; if ($LASTEXITCODE -ne 0) { Write-Output ('FAIL ' + $_.Name) }
}
```

Currently **21 scripts, all must exit 0.**

Do **not** blanket-run every `*.mjs` in `scratch/`. The `extract_*`, `splice_*`,
`phase4_*`, `phase5_*` and `phase6_*` files are one-shot generators that have already
been applied; they deliberately throw when re-run, and that is them refusing to
double-apply rather than a failure.

Two invariants are worth knowing about specifically:

- `scratch/verify_slice.mjs` asserts that every extracted function's body is still
  verbatim, that no argument-less inner call survived extraction, and that
  `js/main.js` registers no listeners. Functions whose bodies a later phase
  intentionally rewrote are listed in an explicit `PHASE7_REWRITTEN` set which
  *prints a SKIP and the reason* — a targeted exemption, not a relaxed rule.
- `scratch/verify_phase7_innerhtml.mjs` enforces that every `x.innerHTML =` is
  either an empty-string clear or a template literal containing **no `${}`**.

DOM-equivalence checking needs a real DOM and therefore cannot run under bare Node:
see `scratch/phase7_dom_probe.js`.

---

## 8. Known dead code and traps

### Dead code

| Item | Note |
|---|---|
| ~~`js/i18n.js`~~ | **Retired** to `scratch/backup/obsolete/js-i18n.js`. Dead since Phase 1, when `src/main.js` switched to `src/i18n/I18n.js`. The two parity scripts (`verify_i18n.mjs`, `validate_phase1.mjs`) were re-pointed at the preserved copy, so the check that proves the extracted dictionaries were not altered still runs. |
| `js/config.js`, `js/storage.js` | Superseded by `src/config/gameConfig.js` and `src/core/SaveManager.js`, but still loaded for their side effects. |
| `getSword()`, `getSwordData()`, `getSwordAbility()` | **Removed**, along with the unread `ability` field they exposed. Only `getSwordRenderer()` had a consumer. Re-adding the `ability` field would re-create a trap: reading it is the bug §3 describes. |
| ~~`scratch/backup/dead-data-json/`~~ | **Deleted.** The 31 stale sibling JSONs were referenced by no code. `data/` now holds only the 31 `.js` data scripts the game actually loads; the authoritative data is `src/**/*.data.json`. |

### Traps

- **`el.style.color = x` is not equivalent to a `style` attribute.** The HTML parser
  keeps the attribute text verbatim (`color: #38bdf8;`) but the CSSOM re-serialises
  it (`color: rgb(56, 189, 248);`). Use `setAttribute("style", ...)` when the DOM
  has to match.
- **`I18n.t()` honours `{ defaultValue }`, and falls back to the raw key when none is
  given.** A missing key with no defaultValue still renders as `zones.unit_normal`,
  which survives review because it looks like text. Pass a defaultValue for anything
  data-derived, and add the string to both `en.json` and `vi.json` — run
  `scratch/verify_i18n_unit_keys.mjs` to confirm every NPC type resolves.
- **`git` is installed but not on `PATH`** — invoke it as
  `C:\Program Files\Git\cmd\git.exe`. Even so, do not delete files: move them to
  `scratch/backup/obsolete/`. The verifiers read those snapshots back, so deleting
  one breaks the suite rather than just losing a copy.
- **PowerShell:** a backtick inside a `Select-String -Pattern` argument opens a `>>`
  continuation prompt that swallows every following command. Use single-quoted
  patterns and avoid backticks.
- **`formatNumber` handles non-finite input.** ±Infinity used to overflow the stack
  (the Googol branch recursed forever) and -Infinity produced the garbage suffix
  "-Infinity Googol". Both now return `∞` / `-∞`; NaN is unchanged. See
  `scratch/verify_utils.mjs`, which asserts this as an intentional divergence from
  the legacy copy rather than hiding it.
