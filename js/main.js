/**
 * Application Entry Point & UI Controller
 * Binds Main Menu, Walkable Lobby, Devourer Sword Stand, 2-Section Library, and Grassland Map.
 */
import { activatePrimary, activateSecondary } from '../src/systems/AbilitySystem.js';
import * as CutsceneSystem from '../src/systems/CutsceneSystem.js';
import { initCutsceneWiring } from '../src/ui/cutsceneUI.js';
import * as BloodmoonEventSystem from '../src/systems/BloodmoonEventSystem.js';

// DOM refs hoisted out of this IIFE in Phase 6 — see src/ui/domRefs.js
import {
  canvas,
  swordModal,
  libraryModal,
  achievementsModal,
  gameOverScreen,
  interactionPrompt,
  interactionText,
  minimapWidget,
  hudKillstreakVal,
  hudAreaLabel,
  hudLibraryBtn,
  hudLobbyBtn,
  libraryBadgesContainer,
  badgesList,
  debugAuthContainer,
  debugPasswordError,
  debugPanel,
  debugKillstreakHud,
  statsModal,
  runStreak,
  runWeapon,
  runPhase,
  runBestStreak,
  cutsceneOverlay,
  cutsceneSpeaker,
  cutsceneText
} from '../src/ui/domRefs.js';
import { loop, initResponsiveWiring } from '../src/core/GameLoop.js';
import { closeAllModals, openScreen, returnFromModal, promptReturnToLobby, showSwordStand, initModalWiring } from '../src/ui/modals.js';
import { initSwordStandWiring, updateSwordStandUI } from '../src/ui/swordStand.js';
import { initDebugWiring, resetDebugUI, isDebugUnlocked, updateDebugQuickButtons } from '../src/ui/debugPanel.js';
import { initLibraryWiring, renderLibrary, renderLibraryNpcs, renderLibrarySwords } from '../src/ui/library.js';
import { initInputWiring } from '../src/core/InputManager.js';
import { initLanguageWiring, updateLanguageUI } from '../src/ui/language.js';
import { initSettingsWiring } from '../src/ui/settings.js';
import { showToast } from '../src/ui/toast.js';
import { renderBadges, renderDebugBadges } from '../src/ui/badges.js';
import { initSkillsPanelWiring, updateSkillsUI } from '../src/ui/skillsPanel.js';
import { updateHudCounters, updateStatsUI, updateHudPhaseTracking } from '../src/ui/hud.js';

// Utility modules extracted in Phase 1/6 — these used to be duplicated below.
import { formatNumber, parseNumberInput } from '../src/utils/format.js';
import { setNumContent } from '../src/utils/dom.js';

(function() {
  const { Config, Game, Storage, I18n } = window.Killstreak;


  // Screens & Panels

  // Main Menu Buttons

  // Gameplay HUD

  // Skill Cooldown Elements

  // Sword Stand Modal Elements (Devourer)


  // Library Modal Elements (SWORDS & BADGES)

  // Library Sword Tabs & Headers

  let game = null;

  // Achievements Modal Elements

  // Settings & Debug Modal Elements

  // Statistics Modal Elements

  // Game Over Elements

  // Toast
  let toastTimeout = null;

  // Cutscene Overlay Elements







  /**
   * Format large numbers into shortened units: K, M, B, T, Q up to Googol (10^100).
   * Numbers < 10,000 are shown as-is with locale formatting.
   */

  /**
   * Format numbers into compact strings with clean suffix tags up to Googol (10^100).
   * @param {number} num - The number to format
   * @returns {{ short: string, full: string }} short display string and full number string
   */


  window.formatNumber = formatNumber;
  window.parseNumberInput = parseNumberInput;
  if (window.Killstreak) {
    window.Killstreak.formatNumber = formatNumber;
    window.Killstreak.parseNumberInput = parseNumberInput;
  }

  /**
   * Set element textContent to a shortened number with full value in title tooltip.
   * @param {HTMLElement} el - Target element
   * @param {number} num - The number to display
   */










  // Initialize Game
  game = new Game(canvas, {
    onKill(streak, highestStreak, kills, totalKills) {
      setNumContent(hudKillstreakVal, streak || 0);
      hudKillstreakVal.classList.add("streak-pulse");
      setTimeout(() => hudKillstreakVal.classList.remove("streak-pulse"), 180);
      updateHudCounters(game);
      updateStatsUI(game);
      updateHudPhaseTracking(game);
      if (!swordModal.classList.contains("hidden")) {
        updateSwordStandUI(game);
      }
    },

    onPhaseChange(phase) {
      updateHudPhaseTracking(game);
      if (!swordModal.classList.contains("hidden")) {
        updateSwordStandUI(game);
      }
      if (!statsModal.classList.contains("hidden")) {
        updateStatsUI(game);
      }
    },

    onAreaChange(areaId, areaName) {
      const displayName = I18n ? I18n.getMapName(areaId) : areaName;
      hudAreaLabel.textContent = I18n ? I18n.t("hud.area_prefix", { name: displayName.toUpperCase() }) : `AREA: ${areaName.toUpperCase()}`;
      // In-Game Library button is ALWAYS accessible in both Lobby and Combat
      if (hudLibraryBtn) hudLibraryBtn.classList.remove("hidden");

      // Return to Lobby button is visible when in COMBAT
      if (areaId === "COMBAT") {
        if (hudLobbyBtn) hudLobbyBtn.classList.remove("hidden");
      } else {
        if (hudLobbyBtn) hudLobbyBtn.classList.add("hidden");
      }
    },

    onPrompt(show, text) {
      if (show) {
        interactionText.textContent = text;
        interactionPrompt.classList.remove("hidden");
      } else {
        interactionPrompt.classList.add("hidden");
      }
    },

    onOpenSwordModal(swordId) {
      showSwordStand(game, swordId);
    },

    onGameOver(finalStreak, finalPhaseName, bestStreak) {
      closeAllModals();
      setNumContent(runStreak, finalStreak);
      const sInfo = I18n ? I18n.getSwordInfo(game.player.swordId) : { name: game.player.swordName || "DEVOURER" };
      if (runWeapon) {
        runWeapon.textContent = (sInfo.name || "DEVOURER").toUpperCase();
      }
      if (game.player.isSwordEquipped && game.player.phase) {
        const pInfo = I18n ? I18n.getPhaseInfo(game.player.swordId, game.player.phase.phase) : game.player.phase;
        runPhase.textContent = `${sInfo.name.toUpperCase()} — ${I18n ? I18n.t("hud.phase_prefix", { name: (pInfo.shortName || game.player.phase.shortName).toUpperCase() }) : `PHASE: ${game.player.phase.shortName.toUpperCase()}`}`;
      } else {
        runPhase.textContent = I18n ? I18n.t("hud.unequipped_caps") : "UNEQUIPPED";
      }
      setNumContent(runBestStreak, bestStreak);
      updateHudCounters(game);
      updateHudPhaseTracking(game);
      if (minimapWidget) minimapWidget.classList.add("hidden");
      gameOverScreen.classList.remove("hidden");
    },

    onRespawn() {
      closeAllModals();
      updateHudCounters(game);
      if (minimapWidget) minimapWidget.classList.remove("hidden");
      updateHudPhaseTracking(game);
      openScreen(game, "GAME");
    },

    onToast(title, desc, icon) {
      showToast(title, desc, icon);
    },

    onBadgesUpdated(badges) {
      renderBadges(badges, badgesList);
      renderBadges(badges, libraryBadgesContainer);
      if (isDebugUnlocked) {
        renderDebugBadges(game);
      }
    },

    onCutsceneStart(step) {
      cutsceneSpeaker.textContent = step.speaker;
      cutsceneText.textContent = step.text;
      const iconEl = cutsceneOverlay.querySelector(".cutscene-icon");
      if (iconEl) {
        if (step.speaker.includes("SOIL") || step.speaker.includes("EARTH") || step.speaker.includes("FORTRESS")) {
          iconEl.textContent = "🛡️";
        } else if (step.speaker.includes("AQUATIC") || step.speaker.includes("SPRING") || step.speaker.includes("OCEAN")) {
          iconEl.textContent = "🌊";
        } else if (step.speaker.includes("METALLIC") || step.speaker.includes("FORGED") || step.speaker.includes("UNBREAKABLE")) {
          iconEl.textContent = "⚙️";
        } else if (step.speaker.includes("FLORA") || step.speaker.includes("EVERGROWTH") || step.speaker.includes("WORLDROOT") || step.speaker.includes("NATURE")) {
          iconEl.textContent = "🌿";
        } else if (step.speaker.includes("HELLFIRE") || step.speaker.includes("INFERNAL") || step.speaker.includes("CATACLYSM") || step.speaker.includes("FLAME")) {
          iconEl.textContent = "🔥";
        } else if (step.speaker.includes("WINDY") || step.speaker.includes("AERIAL")) {
          iconEl.textContent = "🌬️";
        } else if (step.speaker.includes("FROSTBITE") || step.speaker.includes("FROZEN")) {
          iconEl.textContent = "🧊";
        } else if (step.speaker.includes("VOLTSTRIKE") || step.speaker.includes("THUNDERBOLT") || step.speaker.includes("LIGHTNING")) {
          iconEl.textContent = "⚡";
        } else {
          iconEl.textContent = "👑";
        }
      }
      cutsceneOverlay.classList.remove("hidden");
    },

    onCutsceneStep(step) {
      cutsceneSpeaker.textContent = step.speaker;
      cutsceneText.textContent = step.text;
    },

    onCutsceneEnd() {
      cutsceneOverlay.classList.add("hidden");
    },

    onSkillsUpdate(data) {
      updateSkillsUI(game, data);
    }
  });

  window.Killstreak.game = game;
  window.Killstreak.GameInstance = game;

  // The settings toggles and Reset Save are registered by src/ui/settings.js
  initSettingsWiring(game);

  // Every screen-navigation and modal-close control is registered by
  // src/ui/modals.js
  initModalWiring(game);

  // ========================================================
  // HIDDEN DEVELOPER DEBUG MODE CONTROLLER
  // Trigger: 12 clicks on the Settings cog icon within 2.5s
  // Password: supercalifragilisticexpialidocious
  // ========================================================




  // Every debug control, including the settings cog, is registered by
  // src/ui/debugPanel.js
  initDebugWiring(game);

  window.summonEvent = (name = "bloodmoon") => game && BloodmoonEventSystem.summonEvent(game, name);
  window.toggleBloodmoon = () => game && (game.bloodmoon.isActive ? (BloodmoonEventSystem.endBloodmoon(game), false) : (BloodmoonEventSystem.startBloodmoon(game), true));

  // The Library's own tabs are registered by src/ui/library.js
  initLibraryWiring(game);

  // The sword stand's own controls live in src/ui/swordStand.js. The close action
  // is INJECTED rather than imported: modals.js already imports this module, so
  // importing openScreen/returnFromModal back would create a cycle.
  initSwordStandWiring(game, () => returnFromModal(game));

  // The skill buttons are registered by src/ui/skillsPanel.js
  initSkillsPanelWiring(game);

  // Cutscene overlay handling lives in src/systems/CutsceneSystem.js
  initCutsceneWiring(game);

  // All keyboard and mouse handling is registered by src/core/InputManager.js
  initInputWiring(game);



  // The language buttons are registered by src/ui/language.js
  initLanguageWiring(game);

  // Viewport fitting for windows smaller than the native 1000x650 is owned by
  // src/core/GameLoop.js, which registers the resize/orientationchange listeners.
  initResponsiveWiring();


  if (I18n) {
    I18n.onLanguageChange((newLang) => {
      updateLanguageUI(newLang);
      updateHudCounters(game);
      updateHudPhaseTracking(game);
      updateStatsUI(game);
      updateSwordStandUI(game);
      updateDebugQuickButtons();
      if (hudAreaLabel && game.currentMap) {
        const displayName = I18n.getMapName(game.currentMap.id);
        hudAreaLabel.textContent = I18n.t("hud.area_prefix", { name: displayName.toUpperCase() });
      }
      if (libraryModal && !libraryModal.classList.contains("hidden")) {
        renderLibrary(game);
      }
      if (achievementsModal && !achievementsModal.classList.contains("hidden")) {
        renderBadges(game.saveData.badges, badgesList);
      }
      if (isDebugUnlocked) {
        renderDebugBadges(game);
      }
      updateSkillsUI(game, {
        isSwordEquipped: game.player.isSwordEquipped,
        swordId: game.player.swordId,
        phase: game.player.phase.phase,
        gluttonyCooldown: game.gluttonyCooldown,
        engulfCooldown: game.engulfCooldown,
        fortitudeCooldown: game.fortitudeCooldown,
        tsunamiCooldown: game.tsunamiCooldown,
        ironWillCooldown: game.ironWillCooldown,
        ironWillActive: Boolean(game.player.ironWillActive || game.player.ironWillTimer > 0),
        worldrootCooldown: game.worldrootCooldown,
        cataclysmCooldown: game.cataclysmCooldown
      });
    });

    const currentLang = (game && game.saveData && game.saveData.settings && game.saveData.settings.language) || "en";
    I18n.init(currentLang);
    updateLanguageUI(currentLang);
    updateDebugQuickButtons();
  }

  updateSkillsUI(game, {
    isSwordEquipped: game.player.isSwordEquipped,
    phase: game.player.phase.phase,
    gluttonyCooldown: 0,
    engulfCooldown: 0
  });
  if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
  if (debugPanel) debugPanel.classList.add("hidden");
  if (debugPasswordError) debugPasswordError.classList.add("hidden");
  if (debugKillstreakHud) debugKillstreakHud.classList.add("hidden");
  updateHudCounters(game);
  updateHudPhaseTracking(game);
  updateStatsUI(game);
  requestAnimationFrame((ts) => loop(game, ts));
})();
