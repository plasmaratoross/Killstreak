/**
 * Screen router — the menu, the HUD, and every modal.
 *
 * Phase 6, slice 12. Bodies verbatim.
 *
 * Extracted AFTER swordStand.js on purpose: openScreen's SWORD_STAND case
 * renders that panel, so writing this first would have meant importing back out
 * of main.js.
 *
 * panelOrigin is private here — openScreen writes it, returnFromModal reads it,
 * and nothing outside touches it.
 *
 * cogClickCount now lives in debugPanel.js, beside the cog wiring that increments
 * it. closeAllModals and openScreen still RESET it when the debug panel is not
 * unlocked, so they import setCogClickCount. That direction is deliberate:
 * modals.js already imports isDebugUnlocked from debugPanel.js, so importing the
 * other way would be a cycle.
 */
import {
  mainMenu,
  gameplayHud,
  swordModal,
  libraryModal,
  achievementsModal,
  settingsModal,
  mapModal,
  gameOverScreen,
  minimapWidget,
  hudLibraryBtn,
  hudLobbyBtn,
  badgesList,
  debugAuthContainer,
  debugPasswordInput,
  debugPasswordError,
  debugPanel,
  debugKillstreakHud,
  statsModal,
  menuPlayBtn,
  menuAchievementsBtn,
  menuSettingsBtn,
  menuLibraryBtn,
  hudStatsBtn,
  hudMenuBtn,
  closeLibraryBtn,
  closeLibraryBtnBottom,
  closeAchievementsBtn,
  closeAchievementsBtnBottom,
  closeSettingsBtn,
  closeSettingsBtnBottom,
  closeStatsBtn,
  closeStatsBtnBottom,
  returnLobbyBtn
} from './domRefs.js';
import { isDebugUnlocked, setCogClickCount } from './debugPanel.js';
import { renderBadges } from './badges.js';
import { renderLibrary } from './library.js';
import { setInspectedSwordId, updateSwordStandUI } from './swordStand.js';
import { updateHudCounters, updateHudPhaseTracking, updateStatsUI } from './hud.js';

let panelOrigin = "MENU";

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

export function closeAllModals() {
  swordModal.classList.add("hidden");
  libraryModal.classList.add("hidden");
  achievementsModal.classList.add("hidden");
  settingsModal.classList.add("hidden");
  statsModal.classList.add("hidden");
  if (mapModal) mapModal.classList.add("hidden");
  if (window.Killstreak && window.Killstreak.MapSystem) {
    window.Killstreak.MapSystem.closeFullMap();
  }
  gameOverScreen.classList.add("hidden");
  if (!isDebugUnlocked) {
    if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
    if (debugPasswordError) debugPasswordError.classList.add("hidden");
    if (debugPasswordInput) debugPasswordInput.value = "";
    if (debugPanel) debugPanel.classList.add("hidden");
    setCogClickCount(0);
  }
}

/** @param {*} game @param {*} screenName @param {*} origin */
export function openScreen(game, screenName, origin = "MENU") {
  panelOrigin = origin;
  closeAllModals();

  switch (screenName) {
    case "MENU":
      mainMenu.classList.remove("hidden");
      gameplayHud.classList.add("hidden");
      if (minimapWidget) minimapWidget.classList.add("hidden");
      game.state = "MENU";
      break;

    case "GAME":
      mainMenu.classList.add("hidden");
      gameplayHud.classList.remove("hidden");
      if (minimapWidget) minimapWidget.classList.remove("hidden");
      if (game) {
        game.setPaused(false);
        game.state = game.currentArea || "LOBBY";
      }
      updateHudCounters(game);
      updateHudPhaseTracking(game);
      if (hudLibraryBtn) hudLibraryBtn.classList.remove("hidden");
      if (hudLobbyBtn) {
        if (game && game.currentArea === "COMBAT") {
          hudLobbyBtn.classList.remove("hidden");
        } else {
          hudLobbyBtn.classList.add("hidden");
        }
      }
      if (isDebugUnlocked && game.isDebugModeActive && debugKillstreakHud) {
        debugKillstreakHud.classList.remove("hidden");
      } else if (debugKillstreakHud) {
        debugKillstreakHud.classList.add("hidden");
      }
      break;

    case "ACHIEVEMENTS":
      mainMenu.classList.add("hidden");
      if (debugKillstreakHud) debugKillstreakHud.classList.add("hidden");
      renderBadges(game.saveData.badges, badgesList);
      achievementsModal.classList.remove("hidden");
      break;

    case "SETTINGS":
      if (game && origin === "GAME") game.setPaused(true);
      mainMenu.classList.add("hidden");
      if (debugKillstreakHud) debugKillstreakHud.classList.add("hidden");
      if (isDebugUnlocked) {
        if (debugPanel) debugPanel.classList.remove("hidden");
        if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
      } else {
        if (debugPanel) debugPanel.classList.add("hidden");
        if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
        if (debugPasswordError) debugPasswordError.classList.add("hidden");
        if (debugPasswordInput) debugPasswordInput.value = "";
        setCogClickCount(0);
      }
      settingsModal.classList.remove("hidden");
      break;

    case "STATISTICS":
      mainMenu.classList.add("hidden");
      updateStatsUI(game);
      statsModal.classList.remove("hidden");
      break;

    case "SWORD_STAND":
      updateSwordStandUI(game);
      swordModal.classList.remove("hidden");
      break;

    case "LIBRARY":
      if (game && origin === "GAME") game.setPaused(true);
      renderLibrary(game);
      libraryModal.classList.remove("hidden");
      break;
  }
}

/** @param {*} game */
export function returnFromModal(game) {
  closeAllModals();
  if (panelOrigin === "MENU") {
    openScreen(game, "MENU");
  } else {
    if (game) game.setPaused(false);
    openScreen(game, "GAME");
  }
}

/** @param {*} game */
export function promptReturnToLobby(game) {
  if (!game) return;
  if (game.killstreak > 0) {
    const confirmMsg = I18n
      ? I18n.t("prompts.confirm_return_lobby", { streak: game.killstreak })
      : `Return to Sanctuary Lobby? Current sword killstreak (${game.killstreak}) will reset to 0.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
  }
  closeAllModals();
  game.returnToLobby();
  openScreen(game, "GAME");
}

/**
 * Registers every screen-navigation and modal-close control.
 *
 * Phase 6 wiring relocation (the option-2 rule). These 16 listeners moved out of
 * js/main.js: the eight close buttons plus the menu/HUD navigation buttons. They
 * are pure routing, so the router owns them — and main.js no longer has to know
 * which button closes which panel.
 *
 * The `if (node)` guards on the optional buttons are kept exactly as they were.
 *
 * @param {*} game
 */
export function initModalWiring(game) {
  menuPlayBtn.addEventListener("click", () => {
    openScreen(game, "GAME");
    game.startInLobby();
  });

  menuAchievementsBtn.addEventListener("click", () => {
    openScreen(game, "ACHIEVEMENTS", "MENU");
  });

  menuSettingsBtn.addEventListener("click", () => {
    openScreen(game, "SETTINGS", "MENU");
  });

  hudStatsBtn.addEventListener("click", () => {
    openScreen(game, "STATISTICS", "GAME");
  });

  if (hudLobbyBtn) {
    hudLobbyBtn.addEventListener("click", () => promptReturnToLobby(game));
  }

  if (menuLibraryBtn) {
    menuLibraryBtn.addEventListener("click", () => {
      openScreen(game, "LIBRARY", "MENU");
    });
  }

  hudMenuBtn.addEventListener("click", () => {
    openScreen(game, "MENU");
  });

  const hudSettingsBtn = document.getElementById("hud-settings-btn");
  if (hudSettingsBtn) {
    hudSettingsBtn.addEventListener("click", () => {
      openScreen(game, "SETTINGS", "GAME");
    });
  }

  hudLibraryBtn.addEventListener("click", () => {
    openScreen(game, "LIBRARY", "GAME");
  });

  closeLibraryBtn.addEventListener("click", () => returnFromModal(game));
  closeLibraryBtnBottom.addEventListener("click", () => returnFromModal(game));
  closeAchievementsBtn.addEventListener("click", () => returnFromModal(game));
  closeAchievementsBtnBottom.addEventListener("click", () => returnFromModal(game));
  closeSettingsBtn.addEventListener("click", () => returnFromModal(game));
  closeSettingsBtnBottom.addEventListener("click", () => returnFromModal(game));
  closeStatsBtn.addEventListener("click", () => returnFromModal(game));
  closeStatsBtnBottom.addEventListener("click", () => returnFromModal(game));

  returnLobbyBtn.addEventListener("click", () => {
    closeAllModals();
    game.returnToLobby();
  });
}

/**
 * Navigates to the sword stand for a given sword.
 *
 * This is routing, so it lives with the router rather than in main.js. It also
 * keeps the sword stand's own module free of any knowledge of openScreen().
 *
 * @param {*} game
 * @param {string} [swordId]
 */
export function showSwordStand(game, swordId) {
  setInspectedSwordId(swordId || "devourer");
  openScreen(game, "SWORD_STAND", "LOBBY");
}
