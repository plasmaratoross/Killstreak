# Killstreak — Tài liệu Tái cấu trúc & Tối ưu Dự án

**Mục đích tài liệu:** hướng dẫn từng bước, đủ chi tiết để một AI coding agent (Claude Code, Cursor, v.v.) có thể tự thực hiện việc tách/tổ chức lại toàn bộ codebase hiện tại (`Killstreak-V1.2-main/`) sang một cấu trúc module hóa, chuyên nghiệp, **không đổi gameplay, không đổi số liệu cân bằng (damage/HP/kills required...), không đổi trải nghiệm người chơi** — chỉ tổ chức lại mã nguồn.

> Nguyên tắc tối thượng cho agent: **REFACTOR, KHÔNG REWRITE.** Di chuyển và chia nhỏ logic hiện có, giữ nguyên hành vi. Sau mỗi phase, phải chạy được game và test thủ công theo checklist ở cuối tài liệu trước khi sang phase kế tiếp.

---

## 1. Hiện trạng & vấn đề cần giải quyết

Codebase hiện tại (~18.850 dòng JS thuần, không build tool, load qua 30+ thẻ `<script>` toàn cục):

| File | Dòng | Vấn đề chính |
|---|---|---|
| `js/entities.js` | 5.852 | Class `Player` dài **3.423 dòng** (dòng 65–3488), gộp cả state, vật lý, combat lẫn 15 hàm vẽ riêng cho từng thanh kiếm (`drawBlade`, `drawOverdriveBlade`, `drawAquaticBlade`, `drawSoilBlade`, `drawMetallicBlade`, `drawFloraBlade`, `drawHellfireBlade` + 6 hàm `draw*Aura` tương ứng) |
| `js/game.js` | 4.205 | Class `Game` ôm luôn: cutscene (11 hàm `start*Cutscene` gần như trùng khuôn mẫu), 7 skill ultimate (`activateGluttony/Engulf/Tsunami/Fortitude/IronWill/Worldroot/Cataclysm`), achievement system, sự kiện Bloodmoon, debug tools, **và** vẽ world/map (`drawMapWorld`, `drawVillageStructures`, `drawLobbyFloor`, `drawLobbyFurnitureAndProps`, `drawLobbyDecorations`) |
| `js/main.js` | 2.199 | 26 hàm rời trong 1 IIFE: UI (HUD, Library, Badges, Modal), input handling, vòng lặp game (`loop`), tiện ích format số, debug panel — không phân chia theo module |
| ~~`js/i18n.js`~~ | ~~2.164~~ | **Đã ngừng dùng** — đã chuyển sang `scratch/backup/obsolete/js-i18n.js`; `src/main.js` dùng `src/i18n/I18n.js` từ Phase 1 |
| Toàn cục | — | `swordId === "..."` xuất hiện **111 lần** rải rác 3 file → mỗi lần thêm sword mới phải sửa ở nhiều nơi, dễ sót |
| Toàn cục | — | 30+ thẻ `<script>` phụ thuộc **thứ tự load** thủ công trong `index.html`, dùng biến toàn cục `window.Killstreak` — dễ vỡ, không tree-shake, không dev server/hot reload |
| — | — | Không có README, không có test, không responsive (canvas cố định 1000×650, không `@media`) |

**Chẩn đoán gốc rễ:** đây là "vibe coding" điển hình — mỗi tính năng mới (thêm 1 sword, 1 NPC, 1 ability) được viết bằng cách **copy khối code cũ rồi sửa tên biến**, thay vì tạo interface chung. Kết quả là code phình to tuyến tính theo số lượng nội dung thay vì tổ chức theo kiến trúc.

---

## 2. Nguyên tắc thiết kế áp dụng

1. **Strategy Pattern cho nội dung theo sword/NPC**: mỗi sword là một "plugin" gồm 3 phần độc lập — `data` (đã có sẵn dạng JSON, giữ nguyên), `render` (logic vẽ blade/aura), `ability` (logic active skill). Player/Game chỉ gọi qua **1 interface chung**, không biết chi tiết từng sword.
2. **Data-driven thay vì copy-paste**: cutscene, achievement, dialogue nên định nghĩa bằng data (JSON/JS object) + 1 engine xử lý chung, thay vì 10 hàm gần giống hệt nhau.
3. **Tách theo trách nhiệm (Separation of Concerns)**: state/logic (update) tách khỏi rendering (draw); UI (DOM) tách khỏi Game core (Canvas); input tách khỏi cả hai.
4. **Một file = một trách nhiệm rõ ràng**, không quá ~300–400 dòng. Nếu vượt, đó là dấu hiệu cần tách tiếp.
5. **ES Modules thật (`import`/`export`)** thay cho biến toàn cục `window.Killstreak.*` — loại bỏ phụ thuộc thứ tự `<script>` thủ công.
6. **Không đổi hành vi khi refactor** — mọi thay đổi số liệu/tính năng phải là commit riêng, sau khi tái cấu trúc xong.

---

## 3. Cây thư mục đề xuất

```
killstreak/
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── (favicon, manifest nếu có)
├── src/
│   ├── main.js                        # entry point duy nhất — bootstrap app, gắn <script type="module">
│   │
│   ├── core/                          # Lõi engine, không biết gì về sword/npc cụ thể
│   │   ├── Game.js                    # Orchestrator MỎNG: chỉ điều phối state (MENU/LOBBY/COMBAT), gọi các system
│   │   ├── GameLoop.js                # requestAnimationFrame, delta time, tách khỏi Game
│   │   ├── Camera.js
│   │   ├── InputManager.js            # bàn phím, chuột, tách khỏi main.js
│   │   └── SaveManager.js             # đổi tên từ storage.js, giữ nguyên logic load/save/validate
│   │
│   ├── entities/                      # Các entity thuần: state + physics + vòng đời, KHÔNG chứa logic vẽ theo sword
│   │   ├── Player.js                  # sau refactor chỉ còn constructor/takeDamage/setPhase/update/attack (~500-600 dòng)
│   │   ├── NPC.js
│   │   ├── Tree.js
│   │   ├── Rock.js
│   │   ├── SwordStand.js
│   │   ├── Portal.js
│   │   ├── Particle.js
│   │   ├── FloatingText.js
│   │   └── TsunamiWave.js
│   │
│   ├── swords/                        # 1 THƯ MỤC = 1 THANH KIẾM = 1 module tự chứa
│   │   ├── SwordRegistry.js           # map swordId -> { data, renderer, ability } — điểm truy cập DUY NHẤT
│   │   ├── devourer/
│   │   │   ├── devourer.data.json     # giữ nguyên nội dung từ data/swords/devourer/devourer.json
│   │   │   ├── devourer.render.js     # tách từ Player.drawBlade + Player.drawPhaseAura
│   │   │   └── devourer.ability.js    # tách từ Game.activateGluttony (phím Z, phase 10+)
│   │   │   └── devourer.engulf.ability.js  # tách từ Game.activateEngulf — ĐÍNH CHÍNH: là skill phím X của DEVOURER (phase 17), không phải của Overdrive
│   │   ├── overdrive/
│   │   │   ├── overdrive.data.json
│   │   │   ├── overdrive.render.js    # tách từ drawOverdriveBlade + drawOverdriveAura
│   │   │   └── (không có ability — xem đính chính ở bước Ability bên dưới)
│   │   ├── aquatic/
│   │   │   ├── aquatic.data.json
│   │   │   ├── aquatic.render.js      # tách từ drawAquaticBlade + drawAquaticAura
│   │   │   └── aquatic.ability.js     # tách từ activateTsunami (+ class TsunamiWave dùng chung ở entities/)
│   │   ├── soil/
│   │   │   ├── soil.data.json
│   │   │   ├── soil.render.js         # tách từ drawSoilBlade + drawSoilAura
│   │   │   └── soil.ability.js        # tách từ activateFortitude
│   │   ├── metallic/
│   │   │   ├── metallic.data.json
│   │   │   ├── metallic.render.js     # tách từ drawMetallicBlade + drawMetallicAura
│   │   │   └── metallic.ability.js    # tách từ activateIronWill
│   │   ├── flora/
│   │   │   ├── flora.data.json
│   │   │   ├── flora.render.js        # tách từ drawFloraBlade + drawFloraAura
│   │   │   └── flora.ability.js       # tách từ activateWorldroot
│   │   └── hellfire/
│   │       ├── hellfire.data.json
│   │       ├── hellfire.render.js     # tách từ drawHellfireBlade + drawHellfireAura
│   │       └── hellfire.ability.js    # tách từ activateCataclysm
│   │
│   ├── npcs/
│   │   ├── NpcRegistry.js             # map npcType -> { data, renderer? }
│   │   └── <22 thư mục con giữ nguyên>/<type>.data.json  (+ .render.js chỉ nếu NPC có vẽ tùy biến, kiểm tra thực tế)
│   │
│   ├── maps/
│   │   ├── lobby.data.js              # nội dung từ data/maps/lobby.js, export object thuần
│   │   └── grassland.data.js
│   │
│   ├── systems/                       # Logic "ngang" áp dụng cho nhiều sword/npc — nơi loại bỏ copy-paste
│   │   ├── CutsceneSystem.js          # 1 engine chung, nhận vào cutscene definition (xem mục 4.3)
│   │   ├── cutscenes.data.js          # định nghĩa nội dung 10 cutscene hiện có dưới dạng data, KHÔNG code
│   │   ├── AchievementSystem.js       # tách từ Game.checkAchievements/unlockAchievement
│   │   ├── AbilitySystem.js           # dispatcher: activate(player, swordId) → gọi swords/<id>/ability.js tương ứng
│   │   └── BloodmoonEventSystem.js    # tách từ Game.updateBloodmoon/startBloodmoon/.../applyBloodmoonNpcBoosts
│   │
│   ├── render/
│   │   ├── WorldRenderer.js           # tách từ Game.drawMapWorld/drawVillageStructures/drawSafeRoundRect
│   │   ├── LobbyRenderer.js           # tách từ drawLobbyFloor/drawLobbyFurnitureAndProps/drawLobbyDecorations/drawAmbientMenuBg
│   │   └── HudCanvasRenderer.js       # nếu có phần vẽ HUD trực tiếp trên canvas (kiểm tra Game.render/draw)
│   │
│   ├── ui/                            # Toàn bộ thao tác DOM, tách khỏi main.js
│   │   ├── hud.js                     # updateHudCounters/updateStatsUI/updateHudPhaseTracking
│   │   ├── library.js                 # renderLibrary/renderLibraryNpcs/renderLibrarySwords
│   │   ├── badges.js                  # renderBadges
│   │   ├── swordStandPanel.js         # updateSwordStandUI
│   │   ├── skillsPanel.js             # updateSkillsUI
│   │   ├── modals.js                  # openScreen/closeAllModals/returnFromModal/promptReturnToLobby
│   │   ├── debugPanel.js              # updateDebugModeUI/renderDebugBadges/handleDebugPasswordSubmit/handleApplyDebugKillstreak/updateDebugQuickButtons
│   │   └── toast.js                   # showToast
│   │
│   ├── i18n/
│   │   ├── I18n.js                    # chỉ phần logic (t(), init(), interpolation {var}) — còn lại ~30 dòng thật
│   │   ├── en.json                    # tách khối "en: {...}" hiện có trong i18n.js
│   │   └── vi.json                    # tách khối "vi: {...}" hiện có trong i18n.js
│   │
│   ├── config/
│   │   ├── gameConfig.js              # viewport, storageKey, player base config...
│   │   └── npcFormations.js           # NPC_FORMATION_*_SLOTS tách khỏi config.js
│   │
│   └── utils/
│       ├── format.js                  # formatNumber/formatPlaytime/parseNumberInput/setNumContent
│       ├── collision.js               # checkLineCircleCollision
│       └── dom.js                     # helper DOM nhỏ dùng chung
│
├── styles/
│   ├── base.css                       # reset, layout khung #game-container
│   ├── hud.css
│   ├── menu.css
│   ├── library.css
│   ├── modals.css
│   ├── debug.css
│   └── responsive.css                 # MỚI — bổ sung @media cho mobile/tablet (xem mục 5)
│
└── docs/
    └── ARCHITECTURE.md                # sơ đồ kiến trúc sau refactor, cách thêm 1 sword/npc mới (xem mục 6)
```

**Ghi chú quan trọng:** số dòng ước tính cho `Player.render()`/`draw()` sau khi tách hết theo sword sẽ giảm từ 3.423 dòng xuống còn khoảng 500–700 dòng (chỉ còn state, vật lý, combat, và việc gọi `SwordRegistry.get(this.swordId).renderer.drawBlade(ctx, geom, this)`).

---

## 4. Hướng dẫn tách chi tiết (agent thực hiện theo thứ tự này)

### Phase 0 — Chuẩn bị an toàn
1. Tạo git repo mới (nếu chưa có) hoặc branch `refactor/modularize`, commit trạng thái gốc trước khi sửa gì.
2. Khởi tạo `package.json` + cài Vite làm dev server/bundler nhẹ (không thay đổi cách chơi, chỉ đổi cách build):
   ```bash
   npm create vite@latest . -- --template vanilla
   ```
   hoặc thêm thủ công `"scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }`.
3. Đổi `index.html`: xóa 30+ thẻ `<script src="...">`, thay bằng **1 dòng duy nhất**:
   ```html
   <script type="module" src="/src/main.js"></script>
   ```

### Phase 1 — Tách dữ liệu thuần (rủi ro thấp nhất, làm trước)
- Di chuyển từng `data/swords/<name>/<name>.json` → `src/swords/<name>/<name>.data.json` (copy nguyên văn, không sửa số liệu).
- Di chuyển `data/npcs/**/*.json` → `src/npcs/<name>/<name>.data.json`.
- Di chuyển `data/maps/*.js` → `src/maps/*.data.js`, chuyển từ gán `window.Killstreak.Data.Maps.X = {...}` sang `export default {...}`.
- Tách `js/i18n.js`: cắt object `en: {...}` thành `src/i18n/en.json`, object `vi: {...}` thành `src/i18n/vi.json`. Phần còn lại (hàm `t()`, `init()`, interpolate biến `{var}`) giữ làm `src/i18n/I18n.js`, import 2 file JSON này vào.
- Tách `js/config.js`: các mảng `NPC_FORMATION_*_SLOTS` → `src/config/npcFormations.js`; phần còn lại (viewport, storageKey...) → `src/config/gameConfig.js`.

### Phase 2 — Tách theo Strategy Pattern cho từng sword (việc quan trọng nhất)
Với **mỗi** trong 7 sword (`devourer, overdrive, aquatic, soil, metallic, flora, hellfire`), agent thực hiện 3 bước sau — dùng `devourer` làm mẫu:

1. **Render**: cắt nguyên văn thân hàm `Player.drawBlade()` (dòng 378–757 trong `entities.js` gốc) và `Player.drawPhaseAura()` (dòng 1132–1543) → đặt vào `src/swords/devourer/devourer.render.js`, export dạng:
   ```js
   export default {
     drawBlade(ctx, geom, player) { /* thân hàm gốc, thay this -> player */ },
     drawAura(ctx, player) { /* thân hàm gốc */ }
   };
   ```
   Làm tương tự với 6 cặp hàm còn lại: `drawOverdriveBlade/drawOverdriveAura`, `drawAquaticBlade/drawAquaticAura`, `drawSoilBlade/drawSoilAura`, `drawMetallicBlade/drawMetallicAura`, `drawFloraBlade/drawFloraAura`, `drawHellfireBlade/drawHellfireAura`.

2. **Ability**: cắt nguyên văn thân hàm `Game.activateGluttony()` → `src/swords/devourer/devourer.ability.js`, export `{ activate(game, player) {...} }`. Tương tự cho `activateTsunami → aquatic`, `activateFortitude → soil`, `activateIronWill → metallic`, `activateWorldroot → flora`, `activateCataclysm → hellfire`.

   > ⚠️ **ĐÍNH CHÍNH (đã kiểm chứng bằng source code).** Bảng gốc của guide ghi `activateEngulf → overdrive`. **Sai.** Thân hàm `activateEngulf()` guard bằng `swordId !== "devourer"` và `phase.phase < 17` — mà Devourer mới là sword có 17 phase. Vậy **Engulf là skill phụ (phím X, phase 17) của Devourer**, không phải của Overdrive. File thực tế được đặt tên `src/swords/devourer/devourer.engulf.ability.js`.
   >
   > Hệ quả kèm theo: **Overdrive không có ability nào**. Phím Z của Overdrive rơi vào nhánh `else` → gọi Gluttony, nhưng Gluttony lại guard `swordId !== "devourer"` nên từ chối. Đây là hành vi có sẵn của game, **phải giữ nguyên**, không được "sửa".
   >
   > Vì vậy dispatcher ở bước 5 **không thể** là `getSword(player.swordId).ability` — làm vậy sẽ vô tình cấp cho Overdrive một skill mới (thay đổi gameplay). Phải mô phỏng đúng chuỗi nhánh gốc tại hai call site trong `js/main.js`.

3. **Registry**: tạo `src/swords/SwordRegistry.js`:
   ```js
   import devourerData from "./devourer/devourer.data.json";
   import devourerRender from "./devourer/devourer.render.js";
   import devourerAbility from "./devourer/devourer.ability.js";
   // ...import tương tự cho 6 sword còn lại

   const REGISTRY = {
     devourer:  { data: devourerData,  render: devourerRender,  ability: devourerAbility },
     overdrive: { data: overdriveData, render: overdriveRender, ability: overdriveAbility },
     // ... 5 sword còn lại
   };

   export function getSword(swordId) {
     return REGISTRY[swordId] || REGISTRY.devourer;
   }
   export function getAllSwordIds() {
     return Object.keys(REGISTRY);
   }
   ```

4. **Sửa `Player.js`**: thay 15 hàm `draw*` và toàn bộ nhánh `if (swordId === "...")` liên quan đến vẽ bằng:
   ```js
   import { getSword } from "../swords/SwordRegistry.js";
   // trong draw(ctx):
   const sword = getSword(this.swordId);
   sword.render.drawBlade(ctx, geom, this);
   sword.render.drawAura(ctx, this);
   ```

5. **Sửa `Game.js`**: thay 7 hàm `activate*` bằng dispatcher trong `src/systems/AbilitySystem.js`. **API thực tế đã dùng** (giữ đúng thứ tự nhánh của code gốc):
   ```js
   export function activatePrimary(game) {   // phím Z
     const swordId = game.player && game.player.swordId;
     if (swordId === "soil")     return soilAbility.activate(game);
     if (swordId === "aquatic")  return aquaticAbility.activate(game);
     if (swordId === "metallic") return metallicAbility.activate(game);
     if (swordId === "flora")    return floraAbility.activate(game);
     if (swordId === "hellfire") return hellfireAbility.activate(game);
     return devourerAbility.activate(game);  // devourer + overdrive + fallback
   }
   export function activateSecondary(game) { // phím X
     return devourerEngulfAbility.activate(game);
   }
   ```
   Hai call site cũ trong `js/main.js` (nút skill + phím Z/X) nay gọi `activatePrimary(game)` / `activateSecondary(game)`. Các guard như `player.isSwordEquipped` **giữ nguyên tại call site**, không chuyển vào dispatcher.

> Lưu ý cho agent: đây là bước có rủi ro cao nhất vì logic bên trong các hàm `draw*`/`activate*` tham chiếu nhiều đến `this.` (Player) hoặc biến nội bộ của `Game`. Khi cắt sang file mới, **giữ nguyên toàn bộ logic**, chỉ đổi cách truy cập: `this.x` → `player.x`, các biến/hàm thuộc `Game` (như `this.floatingTexts`, `this.saveData`) → truyền qua tham số `game` (`game.floatingTexts`, `game.saveData`). Không được tối ưu/rút gọn logic trong bước này — chỉ di chuyển.

### Phase 3 — Data-driven Cutscene System
**11** hàm `start*Cutscene()` trong `Game.js` (không phải 10) có cấu trúc gần giống nhau (danh sách thoại, ảnh, điều kiện kích hoạt). Agent thực hiện:

> 📌 **Phạm vi thực tế đã thực hiện (rộng hơn guide mô tả).** Ngoài 11 hàm `start*`, Phase 3 còn phải xử lý:
> - `getCutsceneDialogue()` — nguồn thoại của `devourer_p17` (constructor `Game` cũng gọi hàm này).
> - `advanceCutscene()`, `skipCutscene()` — engine.
> - `finishCutscene()` — **~348 dòng**, gồm 10 khối `if (cutsceneType === "...")` riêng biệt, **cộng thêm một khối phase-17 KHÔNG có guard ở cuối** đóng vai trò fall-through. Khối fall-through này chạy cho `devourer_p17` **và cho mọi `cutsceneType` không nhận diện được** — hành vi này phải được giữ nguyên.
> - `advanceCutscene()`/`skipCutscene()` gọi nội bộ `this.finishCutscene()`; sau khi tách file, lời gọi này phải trỏ về `finish(game)` của chính engine.
>
> Xem `critical_findings` trong `refactor-progress.json` để biết các sai lệch khác giữa guide và source code.
1. Đọc kỹ nội dung từng hàm, trích xuất phần **dữ liệu** (id, danh sách dòng thoại, tên nhân vật, điều kiện trigger) sang `src/systems/cutscenes.data.js`:
   ```js
   export default {
     aquaticUnlock: { flagKey: "aquaticUnlockCutsceneSeen", lines: [...], /* ... */ },
     aquaticPhase13: { flagKey: "aquaticPhase13CutsceneSeen", lines: [...] },
     // ... 8 cutscene còn lại
   };
   ```
2. Viết 1 engine chung duy nhất trong `src/systems/CutsceneSystem.js` với các hàm `start(game, cutsceneId)`, `advance(game)`, `skip(game)`, `finish(game)` — logic lấy từ phần **chung** của `advanceCutscene/skipCutscene/finishCutscene` (dòng 1286–1680), chỉ tham số hóa theo `cutsceneId`.
3. Xóa 10 hàm `start*Cutscene` cũ, thay bằng gọi `CutsceneSystem.start(game, "aquaticUnlock")` tại đúng vị trí đang gọi hàm cũ.

### Phase 4 — Tách phần vẽ world khỏi Game
Cắt nguyên văn các hàm sau từ `Game.js` sang file mới, đổi `this.` → `game.` hoặc truyền tham số cần thiết:
- `drawMapWorld`, `drawVillageStructures`, `drawSafeRoundRect` → `src/render/WorldRenderer.js`
- `drawLobbyFloor`, `drawLobbyFurnitureAndProps`, `drawLobbyDecorations`, `drawAmbientMenuBg` → `src/render/LobbyRenderer.js`

`Game.render()` sau đó chỉ còn gọi `WorldRenderer.draw(ctx, this)` / `LobbyRenderer.draw(ctx, this)` theo `currentArea`.

### Phase 5 — Tách Bloodmoon & Achievement khỏi Game
- `updateBloodmoon, startBloodmoon, endBloodmoon, summonEvent, showBloodmoonBanner, applyBloodmoonNpcBoosts, restoreBloodmoonNpcStats` → `src/systems/BloodmoonEventSystem.js`, export các hàm nhận `game` làm tham số đầu.
- `checkFirstSessionAchievement, unlockAchievement, checkAchievements` → `src/systems/AchievementSystem.js`.
- `Game` giữ lại field state (`this.bloodmoonActive`, `this.achievements`...) nhưng **gọi** vào 2 system trên thay vì chứa logic.

### Phase 6 — Tách `main.js` theo UI module
Di chuyển nguyên văn từng nhóm hàm liệt kê trong bảng mục 1 (không sửa logic bên trong):

| Hàm gốc trong `main.js` | Đích |
|---|---|
| `updateHudCounters, updateStatsUI, updateHudPhaseTracking` | `src/ui/hud.js` |
| `renderLibrary, renderLibraryNpcs, renderLibrarySwords` | `src/ui/library.js` |
| `renderBadges, renderDebugBadges` | `src/ui/badges.js` |
| `updateSwordStandUI` | `src/ui/swordStandPanel.js` |
| `updateSkillsUI` | `src/ui/skillsPanel.js` |
| `openScreen, closeAllModals, returnFromModal, promptReturnToLobby` | `src/ui/modals.js` |
| `updateDebugModeUI, handleDebugPasswordSubmit, handleApplyDebugKillstreak, updateDebugQuickButtons` | `src/ui/debugPanel.js` |
| `showToast` | `src/ui/toast.js` |
| `formatNumber, formatPlaytime, parseNumberInput, setNumContent` | `src/utils/format.js` |
| `updateMouseCoordinates, loop` | `src/core/InputManager.js` / `src/core/GameLoop.js` |
| `updateLanguageUI` | `src/ui/language.js` (xem ghi chú bên dưới) |

**Ghi chú về `updateLanguageUI`:** hướng dẫn gốc gộp nó vào `src/i18n/I18n.js`. Thực tế nó nằm ở `src/ui/language.js`, và **cố ý** như vậy: `I18n.js` phải giữ thuần logic (không đụng DOM) để các test chạy dưới Node vẫn import được, còn `updateLanguageUI` sửa trực tiếp DOM của HUD. Trộn hai thứ đó vào một file sẽ phá tính chất đó.

`src/main.js` sau cùng còn **365 dòng**, và phần còn lại là **cố ý giữ lại** chứ không phải chưa làm xong: đó là composition root — 13 callback của `new Game(...)` (`onKill`, `onPhaseChange`, `onAreaChange`, `onPrompt`, `onOpenSwordModal`, `onGameOver`, `onRespawn`, `onToast`, `onBadgesUpdated`, `onCutsceneStart|Step|End`, `onSkillsUpdate`) và bộ điều phối `I18n.onLanguageChange`. Cả hai đều toả ra rất nhiều module, nên chuyển chúng đi chỉ tạo thêm một hub mới. `main.js` hiện có **0 hàm top-level** và **0 `addEventListener`**.

### Phase 7 — Rà soát toàn bộ `innerHTML` — ĐÃ HOÀN TẤT

**Đính chính số liệu:** câu "12 chỗ dùng `innerHTML` với template string" là **sai**. Con số 12 là tổng số lần xuất hiện `innerHTML`, nhưng chỉ **6 chỗ** từng nội suy dữ liệu; 6 chỗ còn lại là lệnh xoá `innerHTML = ""`. Các dòng 810/932/1107/1131/1410 trong `main.js` cũng **không còn đúng** — chúng đã chuyển sang `src/ui/*` từ Phase 6.

Trạng thái thực tế khi hoàn tất:

| Nơi | Nội dung |
|---|---|
| `src/ui/badges.js` (`renderBadges`, `renderDebugBadges`) | 2 skeleton tĩnh + 1 clear |
| `src/ui/library.js` (`renderLibrary`, `renderLibraryNpcs`, `renderLibrarySwords`) | 3 skeleton tĩnh + 3 clear |
| `js/map.js` (`showTooltip`) | 1 skeleton tĩnh |
| `src/ui/settings.js` | 1 clear |

Quy tắc đã chốt, và **được kiểm tra tự động** bởi `scratch/verify_phase7_innerhtml.mjs`: mọi `x.innerHTML =` chỉ được là template literal **không chứa `${}`**, hoặc `= ""`. Mọi dạng khác (nối chuỗi, biến, template có nội suy) đều fail, cùng với `insertAdjacentHTML` / `outerHTML` / `document.write`.

Hai điều rút ra khi làm:

- **Dùng `setAttribute("style", ...)`, KHÔNG dùng `el.style.color = ...`.** Trình phân tích HTML giữ nguyên văn bản của thuộc tính `style` (`"color: #38bdf8;"`), còn CSSOM serialize lại thành `"color: rgb(56, 189, 248);"`. Màu hiển thị giống nhau nhưng DOM khác nhau — đủ để phá vỡ phép so sánh tương đương.
- **Đây là chỗ duy nhất "zero behavioural change" không tuyệt đối**, và cần nói rõ thay vì lờ đi: code cũ diễn giải dữ liệu như HTML, nên chuỗi chứa markup sẽ cho DOM khác. Với tooltip bản đồ, nhãn `<b>INJ</b>" onmouseover="x` tạo ra **1 thẻ `<b>` thật** trước đây, còn bây giờ hiển thị nguyên văn (**0 thẻ**). Với mọi dữ liệu game thực sự có, DOM giống hệt nhau — đó là điều các hash quy tắc đã chứng minh.

Kiểm chứng tương đương DOM cần DOM thật nên **không nằm trong bộ test Node**: xem `scratch/phase7_dom_probe.js`.

---

## 5. Bổ sung Responsive — ĐÃ HOÀN TẤT

Chọn phương án `resizeCanvasToFit()` trong `src/core/GameLoop.js` (không tạo `Camera.js`, vì dự án không có khái niệm camera cần tách riêng).

- `resizeCanvasToFit()` đặt biến CSS `--game-scale`; `styles/responsive.css` áp dụng nó bằng `transform: translate(-50%, -50%) scale(var(--game-scale))`.
- Lắng nghe `resize` + `orientationchange`, đăng ký **trong `GameLoop.js`** chứ không phải `js/main.js` — theo đúng quy tắc Phase 6 (mỗi listener thuộc module sở hữu thứ được lắng nghe).
- Breakpoint `@media (max-width: 999px)`.
- **KHÔNG** đổi độ phân giải canvas, đúng như yêu cầu trong bản gốc.

Ba điểm khác so với văn bản gốc, kèm lý do:

- **Chặn trên ở 1×.** Canvas là bitmap cố định 1000×650, nên scale > 1 chỉ làm mờ chứ không thêm chi tiết.
- **KHÔNG "thu nhỏ HUD" ở breakpoint.** Vì cả khung được scale đồng nhất nên HUD đã tự nhỏ theo tỉ lệ; thêm quy tắc `font-size` riêng sẽ làm chữ lệch khỏi bố cục px của các phần tử xung quanh. Breakpoint chỉ giảm đổ bóng và bo góc, vốn được thiết kế cho khung full-screen.
- **Thêm `orientationchange`**, không chỉ `resize` — trên mobile, xoay máy không phải lúc nào cũng bắn `resize` kịp.

**Cảnh báo quan trọng nếu sau này muốn sửa hit-testing của bản đồ:** hai canvas được layout **lớn hơn** bitmap của chúng — `#minimap-canvas` là bitmap 180 nhưng CSS 184px, `#full-map-canvas` là 880 nhưng CSS 890px. Vì vậy **không được** dùng `canvas.width / rect.width` để bù scale: tỉ số đó ra 0.978 / 0.989 **ngay cả khi không scale**, tức là tự ý làm lệch hit-testing ~2% so với hành vi hiện tại. Phải dùng `rect.width / canvas.offsetWidth`, đúng bằng 1 khi không scale.

Đã kiểm chứng: quét 1.012 điểm trên bản đồ ở scale 1 và scale 0.5 → 966 điểm trúng zone, 12 zone khác nhau, **0 khác biệt**. Ở scale 1, hàm chuyển đổi trả về đúng biểu thức gốc `clientX - rect.left`.

---

## 6. Tài liệu cần tạo kèm

Sau khi hoàn tất refactor, agent tạo thêm:

1. **`README.md`** ở gốc dự án, gồm: mô tả game, cách chạy (`npm install && npm run dev`), cấu trúc thư mục tóm tắt, cách build production (`npm run build`).
2. **`docs/ARCHITECTURE.md`**: giải thích Strategy Pattern cho `swords/`, và **hướng dẫn cụ thể "cách thêm 1 sword mới"** (tạo `<id>.data.json`, `<id>.render.js`, `<id>.ability.js`, đăng ký vào `SwordRegistry.js`) — đây chính là lợi ích lớn nhất của việc refactor, giúp bạn của bạn (hoặc agent) mở rộng nội dung sau này mà không cần sửa `Player.js`/`Game.js`.

   **Đính chính quan trọng:** 4 bước trên là **chưa đủ** — file thực tế cần **6 bước**. Thiếu bước nào sẽ hỏng âm thầm:
   - **Bước 5:** phải thêm nhánh `if (swordId === "<id>") return <id>Ability.activate(game);` **và** dòng `import` tương ứng vào `src/systems/AbilitySystem.js`. `activatePrimary` phát tán skill Z bằng chuỗi `if` riêng, **không** dùng `SwordRegistry.ability` (xem lý do ở Phase 2 — dùng registry sẽ vô tình cấp cho Overdrive một skill). Bỏ bước này thì Z rơi xuống Gluttony của Devourer, và Gluttony tự chặn vì `swordId !== "devourer"` → **Z không làm gì cả, không báo lỗi**.
   - **Bước 6:** thêm chuỗi vào **cả** `src/i18n/en.json` và `src/i18n/vi.json`. `I18n.t()` trả về chính key khi tra không thấy, nên thiếu key sẽ hiển thị `library.something` — trông như text bình thường nên rất dễ lọt qua review. (Từ bản vá sau refactor, `t()` có tôn trọng `{ defaultValue }`, nhưng vẫn nên thêm key thật.)

---

## 7. Checklist kiểm thử sau mỗi phase (bắt buộc)

Sau **mỗi phase** ở mục 4, agent phải chạy `npm run dev` và xác nhận thủ công (hoặc qua Playwright nếu có sẵn):

- [ ] Game load được vào Main Menu, không lỗi console.
- [ ] Vào được Lobby, trang bị/tháo sword hoạt động bình thường.
- [ ] Đi vào Combat zone, tấn công NPC, sát thương đúng số liệu như trước refactor.
- [ ] Lên phase (kill đủ số kills yêu cầu) — hiệu ứng blade/aura của sword đang test vẫn hiển thị đúng như bản gốc (so sánh trực quan).
- [ ] Kích hoạt active ability của sword đang test (Gluttony/Engulf/Tsunami/Fortitude/Iron Will/Worldroot/Cataclysm) — hoạt động đúng.
- [ ] Cutscene liên quan (nếu vừa refactor) chạy đủ số dòng thoại, bấm skip hoạt động.
- [ ] Library, Achievements, Settings mở/đóng đúng, dữ liệu hiển thị khớp.
- [ ] Đổi ngôn ngữ EN ⇄ VI, toàn bộ text đổi đúng, không có key bị thiếu (hiển thị `undefined`).
- [ ] Save/Load: tắt trình duyệt, mở lại, tiến trình (kills, phase, badges) được giữ nguyên.
- [ ] Debug panel (nếu có) vẫn hoạt động.

Chỉ merge/commit phase khi **toàn bộ checklist trên pass**. Nếu phát hiện lỗi, agent phải khoanh vùng đúng phần vừa di chuyển (vì hành vi không được đổi so với trước refactor).

---

## 8. Việc KHÔNG làm trong lần refactor này

Để tránh rủi ro, agent **không** được tự ý:
- Đổi số liệu cân bằng (damage, HP, killsRequired, tốc độ...) trong bất kỳ file `.data.json` nào.
- Đổi tên các key trong `localStorage` save data (sẽ làm mất tiến trình người chơi hiện có).
- Đổi hành vi gameplay, thêm/bớt tính năng.
- Đổi giao diện/CSS hiện có (trừ phần bổ sung responsive ở mục 5, chỉ thêm, không sửa style cũ).

Những việc trên nên là các đề xuất riêng, thực hiện **sau khi** refactor kiến trúc đã ổn định và có test pass.
