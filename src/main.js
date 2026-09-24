/**
 * Killstreak 2D — ES Module Entry Point
 *
 * This file acts as a single bundle root for Vite.
 * All existing IIFE scripts are imported in their original dependency order.
 * Each file self-registers onto window.Killstreak, preserving all existing logic
 * verbatim without any gameplay, balance, or UI changes.
 *
 * Load order mirrors the original index.html <script> sequence:
 *   1. i18n  (src/i18n/I18n.js — Phase 1 extraction)
 *   2. data/swords/* (7 swords)
 *   3. data/npcs/*   (22 NPCs)
 *   4. data/maps/*   (2 maps)
 *   5. config.js
 *   6. storage.js
 *   7. entities.js
 *   8. map.js
 *   9. game.js
 *  10. main.js (UI entry)
 */

// 1. Internationalisation
import './i18n/I18n.js';

// 2. Sword Data Modules
import '../data/swords/devourer/devourer.js';
import '../data/swords/overdrive/overdrive.js';
import '../data/swords/aquatic/aquatic.js';
import '../data/swords/soil/soil.js';
import '../data/swords/metallic/metallic.js';
import '../data/swords/flora/flora.js';
import '../data/swords/hellfire/hellfire.js';
import '../data/swords/windy/windy.js';
import '../data/swords/frostbite/frostbite.js';
import '../data/swords/voltstrike/voltstrike.js';

// 3. NPC Data Modules
import '../data/npcs/normal/normal.js';
import '../data/npcs/fairy/fairy.js';
import '../data/npcs/thug/thug.js';
import '../data/npcs/guard/guard.js';
import '../data/npcs/swordman/swordman.js';
import '../data/npcs/buff_man/buff_man.js';
import '../data/npcs/elf/elf.js';
import '../data/npcs/ironborn/ironborn.js';
import '../data/npcs/bloodfang/bloodfang.js';
import '../data/npcs/arcanist/arcanist.js';
import '../data/npcs/colossus/colossus.js';
import '../data/npcs/starforged/starforged.js';
import '../data/npcs/grizzlehorn/grizzlehorn.js';
import '../data/npcs/brambleback/brambleback.js';
import '../data/npcs/embermane/embermane.js';
import '../data/npcs/duskhorn/duskhorn.js';
import '../data/npcs/mirewalker/mirewalker.js';
import '../data/npcs/thunderhoof/thunderhoof.js';
import '../data/npcs/gloomscale/gloomscale.js';
import '../data/npcs/wildtusk/wildtusk.js';
import '../data/npcs/moonmane/moonmane.js';
import '../data/npcs/crimsonhide/crimsonhide.js';

// 4. Map Data Modules
import '../data/maps/lobby.js';
import '../data/maps/grassland.js';

// 5. Core Systems (in dependency order)
import '../js/config.js';
import '../js/storage.js';
import '../js/entities.js';
import '../js/map.js';
import '../js/game.js';

// 6. UI / Application Entry Point
import '../js/main.js';
