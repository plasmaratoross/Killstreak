/**
 * InputManager — keyboard and mouse handling.
 *
 * Phase 6, slice 7 extracted updateMouseCoordinates(); the option-2 relocation
 * pass moved the listeners that call it in here too.
 *
 * This module is a deliberate FAN-OUT. Key handling is not "owned" by any one
 * feature: Escape closes modals and navigates, M toggles the map, Z/X fire sword
 * abilities, E interacts, Space attacks or respawns, WASD moves. So it imports
 * modals, CutsceneSystem and AbilitySystem. That is legal one-way — nothing
 * imports InputManager except main.js — and it is the honest shape of global
 * input dispatch. The alternative (leaving it in main.js) keeps main.js carrying
 * UI logic for five modules.
 *
 * updateMouseCoordinates stays a separate export because GameLoop.js's earlier
 * registration shape depends on it being callable with (game, e).
 */
import {
  canvas,
  mapModal,
  swordModal,
  libraryModal,
  achievementsModal,
  settingsModal,
  statsModal
} from '../ui/domRefs.js';
import { activatePrimary, activateSecondary } from '../systems/AbilitySystem.js';
import * as CutsceneSystem from '../systems/CutsceneSystem.js';
import { closeAllModals, openScreen, returnFromModal } from '../ui/modals.js';

/** @param {*} game @param {*} e */
export function updateMouseCoordinates(game, e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  game.input.screenMouseX = (e.clientX - rect.left) * scaleX;
  game.input.screenMouseY = (e.clientY - rect.top) * scaleY;
}

/**
 * Registers keyboard and mouse handling.
 *
 * Bodies are verbatim from js/main.js, including the cutscene input interception
 * and every preventDefault.
 *
 * @param {*} game
 */
export function initInputWiring(game) {
  window.addEventListener("keydown", (e) => {
    // Intercept input during Phase 17 cutscene
    if (game.isCutsceneActive) {
      if (e.code === "Space" || e.code === "KeyE" || e.code === "Enter") {
        CutsceneSystem.advance(game);
        e.preventDefault();
        return;
      }
      if (e.code === "Escape") {
        CutsceneSystem.skip(game);
        e.preventDefault();
        return;
      }
      return; // Ignore WASD movement/attack during cutscene
    }

    if (e.code === "Escape") {
      if ((mapModal && !mapModal.classList.contains("hidden")) ||
          (window.Killstreak && window.Killstreak.MapSystem && window.Killstreak.MapSystem.isFullMapOpen())) {
        returnFromModal(game);
        return;
      }

      if (!swordModal.classList.contains("hidden") ||
          !libraryModal.classList.contains("hidden") ||
          !achievementsModal.classList.contains("hidden") ||
          !settingsModal.classList.contains("hidden") ||
          !statsModal.classList.contains("hidden")) {
        returnFromModal(game);
        return;
      }

      if (game.state !== "MENU") {
        openScreen(game, "MENU");
      } else {
        openScreen(game, "GAME");
      }
      return;
    }

    if (e.code === "KeyM") {
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }
      if (game && game.state !== "MENU") {
        if (window.Killstreak && window.Killstreak.MapSystem) {
          window.Killstreak.MapSystem.toggleFullMap();
        }
      }
      return;
    }

    if (e.code === "KeyZ") {
      if (game.player && game.player.isSwordEquipped) {
        activatePrimary(game);
      }
      return;
    }

    if (e.code === "KeyX") {
      if (game.player && game.player.isSwordEquipped) {
        activateSecondary(game);
      }
      return;
    }

    if (e.code === "KeyE") {
      game.handleInteraction();
      return;
    }

    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        game.input.up = true;
        break;
      case "KeyS":
      case "ArrowDown":
        game.input.down = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        game.input.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        game.input.right = true;
        break;
      case "Space":
        if (game.isGameOver) {
          closeAllModals();
          game.returnToLobby();
        } else if (game.state === "COMBAT") {
          game.handleAttackInput();
        }
        e.preventDefault();
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
        game.input.up = false;
        break;
      case "KeyS":
      case "ArrowDown":
        game.input.down = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        game.input.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        game.input.right = false;
        break;
    }
  });

  canvas.addEventListener("mousemove", (e) => updateMouseCoordinates(game, e));

  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      game.input.isMouseDown = true;
      if (game.state === "COMBAT") {
        game.handleAttackInput();
      }
    }
  });

  window.addEventListener("mouseup", () => {
    game.input.isMouseDown = false;
  });
}
