# Killstreak 2D — v1.3

A fast-paced 2D killstreak game featuring 7 unique swords across 60+ progressive phases, 22 enemy types, skill abilities, a Bloodmoon event system, and full English/Vietnamese localisation.

## 🚀 Development

```bash
npm install
npm run dev       # http://localhost:5173
```

## 📦 Build

```bash
npm run build     # Outputs to dist/
npm run preview   # Preview the production build
```

## 🏗️ Architecture

This project uses **Vite** + vanilla **ES Modules**. All scripts are bundled from a single entry point:

```
src/main.js              ← Vite entry — imports all modules in correct order
```

### Directory Structure

```
src/
├── main.js              Vite entry — ordered side-effect imports
├── core/
│   ├── GameLoop.js      requestAnimationFrame driver + responsive viewport fitting
│   ├── InputManager.js  Keyboard/mouse handling
│   └── SaveManager.js   Persistent save/load
├── config/
│   ├── gameConfig.js    Viewport, player, bloodmoon, achievements
│   └── npcFormations.js Formation slot arrays for NPC zones
├── i18n/
│   ├── I18n.js          Translation lookup (DOM-free)
│   └── en.json, vi.json Strings
├── utils/
│   ├── format.js        formatNumber / parseNumberInput
│   ├── collision.js     checkLineCircleCollision
│   └── dom.js           setNumContent / formatPlaytime / qs()
├── maps/                lobby (sanctuary) + grassland (combat) map data
├── render/              WorldRenderer, LobbyRenderer
├── swords/
│   ├── SwordRegistry.js swordId → { data, render }
│   └── <name>/          <name>.data.json + .render.js + .ability.js  (7 swords)
├── npcs/
│   ├── NpcRegistry.js   npcType → data
│   └── <name>/<name>.data.json   NPC stat data (22 types)
├── systems/             AbilitySystem, AchievementSystem,
│                        BloodmoonEventSystem, CutsceneSystem
└── ui/                  One module per screen/panel, each owning its own wiring
    ├── domRefs.js       Every getElementById, in one place
    └── hud, modals, library, swordStand, badges, skillsPanel,
        debugPanel, settings, language, cutsceneUI, toast
```

> For how these fit together — the ownership rules, the sword Strategy Pattern, and
> the responsive scaling model — see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

### Legacy Files

The original IIFE files in `js/` are still loaded, because they register onto
`window.Killstreak` and still implement the parts of the game that were not
modularised. They are imported in their original order by `src/main.js`.

| File | Lines | Status |
|------|-------|--------|
| `js/main.js` | 294 | Active — **composition root** (0 top-level functions, 0 listeners) |
| `js/game.js` | 1,592 | Active — the `Game` class |
| `js/entities.js` | 2,735 | Active — `Player`, `NPC`, `Particle`, … |
| `js/map.js` | 698 | Active — `MapSystem` (minimap + full map) |
| `js/config.js` | 331 | Active — `Config` (maps, achievements, zones) |
| `js/storage.js` | 179 | Active — save/load; also sets `window.Killstreak.Storage` |

`js/i18n.js` was the last dead file in this folder and has been retired to
`scratch/backup/obsolete/js-i18n.js` — `src/main.js` has used `src/i18n/I18n.js`
since Phase 1.

## 📱 Responsive

The 1000×650 scene is uniformly scaled to fit any window while keeping its aspect
ratio, and capped at 1× so the canvas is never upscaled into blur. The canvas's own
resolution never changes. See [docs/ARCHITECTURE.md §5](docs/ARCHITECTURE.md#5-responsive-scaling-the-1000650-design).

## ⚔️ Swords

| Sword | Phases | Ability | Unlock |
|-------|--------|---------|--------|
| Devourer | 17 | Gluttony [Z] + Engulf [X] | Default |
| Overdrive | 7 | — | 1,250 kills |
| Aquatic | 13 | Tsunami [Z] | 2,500 kills |
| Soil | 10 | Fortitude [Z] | 3,500 kills |
| Metallic | 10 | Iron Will [Z] | 6,613 kills |
| Flora | 10 | Worldroot [Z] | 10,500 kills |
| Hellfire | 10 | Cataclysm [Z] | 18,125 kills |

## 🎮 Controls

| Action | Key |
|--------|-----|
| Move | WASD / Arrow Keys |
| Aim | Mouse |
| Attack | Left Click / Space |
| Skill (Z) | Z |
| Skill (X) | X |
| Interact / Enter | E |
| Menu | ESC |

## 🏆 Achievements

8 achievements tied to sword progression milestones, each awarding a badge displayed in the Library.

## 🌐 Localisation

Full English + Vietnamese support via the I18n system. Toggle in Settings.

---

*Built with Vite 6 · Vanilla JS · No external runtime dependencies*
