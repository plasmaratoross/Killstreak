/**
 * Debug panel — the developer overlay behind the settings cog.
 *
 * Phase 6, slice 10. Extracted from js/main.js; bodies verbatim.
 *
 * `isDebugUnlocked` lives here because this is where it is set. main.js imports
 * it as a LIVE BINDING, so every existing read (in openScreen, closeAllModals,
 * the language handler, onBadgesUpdated) keeps working unchanged — ESM imports
 * see mutations. Only assignment is illegal across a module boundary, and there
 * was exactly one of those left in main.js, which now calls setIsDebugUnlocked().
 *
 * `cogClickCount` stayed in main.js in slice 10 because no FUNCTION here touched
 * it. Slice 14 moved the cog-trigger WIRING in, so the counter and its timeout now
 * live beside the code that increments them — which also lets modals.js stop
 * exporting a debug concern it never wanted. modals.js imports setCogClickCount
 * from here; this module imports nothing from modals.js, so it stays one-way.
 */
import {
  debugAuthContainer,
  debugPasswordInput,
  debugPasswordError,
  debugPasswordSubmit,
  debugPanel,
  debugModeToggle,
  debugStatusPill,
  debugActionsArea,
  debugKillstreakHud,
  debugHudStreakInput,
  debugHudStreakApply,
  debugHudEventBtn,
  debugCustomKillsInput,
  debugAddCustomKillsBtn,
  debugSetCustomKillsBtn,
  debugGrantAllBadgesBtn,
  debugSummonBloodmoonBtn,
  debugEndBloodmoonBtn,
  settingsCogTrigger
} from './domRefs.js';
import { formatNumber, parseNumberInput } from '../utils/format.js';
import { renderDebugBadges } from './badges.js';
import { updateHudCounters, updateStatsUI, updateHudPhaseTracking } from './hud.js';
import { updateSwordStandUI } from './swordStand.js';
import { showToast } from './toast.js';
import * as BloodmoonEventSystem from '../systems/BloodmoonEventSystem.js';

export let isDebugUnlocked = false;

// private to this module: only the cog wiring below and setCogClickCount touch it
let cogClickCount = 0;
let cogClickTimeout = null;

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

export function updateDebugQuickButtons() {
  document.querySelectorAll("[data-debug-kills]").forEach((btn) => {
    const amount = parseInt(btn.dataset.debugKills, 10);
    const fAmount = formatNumber(amount).short;
    btn.textContent = I18n ? I18n.t("debug.quick_add_kills", { n: fAmount }) : `+${fAmount} Kills`;
  });
}

/** @param {*} game @param {*} active */
export function updateDebugModeUI(game, active) {
  if (game && typeof game.setDebugMode === "function") {
    game.setDebugMode(active);
  }
  if (debugStatusPill) {
    if (active) {
      debugStatusPill.textContent = I18n ? I18n.t("debug.status_on") : "[ ON ]";
      debugStatusPill.className = "debug-status-pill on";
    } else {
      debugStatusPill.textContent = I18n ? I18n.t("debug.status_off") : "[ OFF ]";
      debugStatusPill.className = "debug-status-pill off";
    }
  }
  if (debugActionsArea) {
    if (active) {
      debugActionsArea.classList.remove("disabled");
    } else {
      debugActionsArea.classList.add("disabled");
    }
  }
  if (debugKillstreakHud) {
    if (active && isDebugUnlocked && game && game.state !== "MENU") {
      debugKillstreakHud.classList.remove("hidden");
    } else {
      debugKillstreakHud.classList.add("hidden");
    }
  }
}

/** @param {*} game */
export function handleDebugPasswordSubmit(game) {
  const entered = (debugPasswordInput && debugPasswordInput.value) || "";
  if (entered === "supercalifragilisticexpialidocious") {
    isDebugUnlocked = true;
    if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
    if (debugPasswordError) debugPasswordError.classList.add("hidden");
    if (debugPasswordInput) debugPasswordInput.value = "";
    if (debugPanel) debugPanel.classList.remove("hidden");

    // Debug Mode is OFF by default when unlocked
    if (debugModeToggle) debugModeToggle.checked = false;
    updateDebugModeUI(game, false);
    renderDebugBadges(game);
    const devTitle = I18n ? I18n.t("toasts.dev_mode_title") : "Developer Mode";
    const devDesc = I18n ? I18n.t("toasts.dev_mode_desc") : "Access granted. Debug controls available.";
    showToast(devTitle, devDesc, "🛠️");
  } else {
    if (debugPasswordError) debugPasswordError.classList.remove("hidden");
    if (debugPasswordInput) debugPasswordInput.select();
  }
}

/** @param {*} game */
export function handleApplyDebugKillstreak(game) {
  if (!game.isDebugModeActive) return;
  const raw = (debugHudStreakInput && debugHudStreakInput.value.trim()) || "";
  if (raw === "") {
    const invTitle = I18n ? I18n.t("toasts.invalid_input_title") : "Invalid Input";
    const invDesc = I18n ? I18n.t("toasts.invalid_input_desc") : "Please enter a killstreak amount.";
    showToast(invTitle, invDesc, "⚠️");
    return;
  }
  const val = parseNumberInput(raw);
  if (isNaN(val) || val < 0) {
    const invTitle = I18n ? I18n.t("toasts.invalid_streak_title") : "Invalid Killstreak";
    const invDesc = I18n ? I18n.t("toasts.invalid_streak_desc") : "Killstreak must be 0 or positive.";
    showToast(invTitle, invDesc, "⚠️");
    return;
  }
  game.setDebugKillstreak(val);
  updateHudCounters(game);
  updateStatsUI(game);
  updateHudPhaseTracking(game);
  debugHudStreakInput.value = "";
}

/** @param {boolean} unlocked */
export function setIsDebugUnlocked(unlocked) {
  isDebugUnlocked = unlocked;
}

/** @param {number} n */
export function setCogClickCount(n) {
  cogClickCount = n;
}

/**
 * Returns the debug UI to its locked, off state. Used by the settings "Reset Save"
 * button, which must also clear the partial cog sequence and any typed input.
 *
 * @param {*} game
 */
export function resetDebugUI(game) {
  isDebugUnlocked = false;
  cogClickCount = 0;
  if (cogClickTimeout) clearTimeout(cogClickTimeout);
  if (debugAuthContainer) debugAuthContainer.classList.add("hidden");
  if (debugPasswordError) debugPasswordError.classList.add("hidden");
  if (debugPasswordInput) debugPasswordInput.value = "";
  if (debugPanel) debugPanel.classList.add("hidden");
  if (debugModeToggle) debugModeToggle.checked = false;
  updateDebugModeUI(game, false);
  if (debugKillstreakHud) debugKillstreakHud.classList.add("hidden");
  if (debugHudStreakInput) debugHudStreakInput.value = "";
  if (debugCustomKillsInput) debugCustomKillsInput.value = "";
}

/**
 * Registers every control on the debug overlay, plus the settings cog that
 * reveals it. Phase 6 wiring relocation (the option-2 rule); moved verbatim out
 * of js/main.js.
 *
 * TWO CALLS WERE FIXED WHILE MOVING, not preserved: the Enter-key handlers for
 * the password field and the killstreak field called
 * handleDebugPasswordSubmit() / handleApplyDebugKillstreak() with NO argument.
 * Both take `game` since slice 10, so pressing Enter in either field threw a
 * TypeError (renderDebugBadges(undefined) / undefined.isDebugModeActive). Clicking
 * the buttons always worked, which is why the earlier runtime pass missed it.
 *
 * @param {*} game
 */
export function initDebugWiring(game) {
  if (settingsCogTrigger) {
    settingsCogTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isDebugUnlocked) {
        if (debugPanel) debugPanel.classList.remove("hidden");
        return;
      }

      cogClickCount++;
      if (cogClickTimeout) clearTimeout(cogClickTimeout);
      cogClickTimeout = setTimeout(() => {
        cogClickCount = 0;
      }, 2500);

      if (cogClickCount >= 12) {
        cogClickCount = 0;
        if (cogClickTimeout) clearTimeout(cogClickTimeout);
        if (debugAuthContainer) debugAuthContainer.classList.remove("hidden");
        if (debugPasswordError) debugPasswordError.classList.add("hidden");
        if (debugPasswordInput) {
          debugPasswordInput.value = "";
          debugPasswordInput.focus();
        }
      }
    });
  }

  if (debugPasswordSubmit) {
    debugPasswordSubmit.addEventListener("click", () => handleDebugPasswordSubmit(game));
  }

  if (debugPasswordInput) {
    debugPasswordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleDebugPasswordSubmit(game);
      }
    });
  }

  if (debugModeToggle) {
    debugModeToggle.addEventListener("change", (e) => {
      updateDebugModeUI(game, e.target.checked);
    });
  }

  // Debug Total Kills Quick Buttons (Modifies Total Kills ONLY, not Killstreak)
  document.querySelectorAll("[data-debug-kills]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      const amount = parseInt(btn.dataset.debugKills, 10);
      if (amount > 0) {
        game.addDebugTotalKills(amount);
        updateHudCounters(game);
        updateStatsUI(game);
        updateSwordStandUI(game);
      }
    });
  });

  // Debug Custom Total Kills: Add Kills
  if (debugAddCustomKillsBtn) {
    debugAddCustomKillsBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      const amount = parseNumberInput(debugCustomKillsInput.value);
      if (amount > 0) {
        game.addDebugTotalKills(amount);
        debugCustomKillsInput.value = "";
        updateHudCounters(game);
        updateStatsUI(game);
        updateSwordStandUI(game);
      }
    });
  }

  // Debug Custom Total Kills: Set Total
  if (debugSetCustomKillsBtn) {
    debugSetCustomKillsBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      const rawVal = (debugCustomKillsInput && debugCustomKillsInput.value.trim()) || "";
      if (rawVal === "") return;
      const amount = parseNumberInput(rawVal);
      if (isNaN(amount) || amount < 0) {
        const invTitle = I18n ? I18n.t("toasts.invalid_amount_title") : "Invalid Amount";
        const invDesc = I18n ? I18n.t("toasts.invalid_amount_desc") : "Total kills must be 0 or positive.";
        showToast(invTitle, invDesc, "⚠️");
        return;
      }
      game.setDebugTotalKills(amount);
      debugCustomKillsInput.value = "";
      updateHudCounters(game);
      updateStatsUI(game);
      updateSwordStandUI(game);
    });
  }

  if (debugCustomKillsInput) {
    debugCustomKillsInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (debugAddCustomKillsBtn) debugAddCustomKillsBtn.click();
      }
    });
  }

  // Top-Right In-Game Debug Killstreak Controller

  if (debugHudStreakApply) {
    debugHudStreakApply.addEventListener("click", () => handleApplyDebugKillstreak(game));
  }

  if (debugHudStreakInput) {
    debugHudStreakInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApplyDebugKillstreak(game);
      }
    });
  }

  // Debug Grant All Badges
  if (debugGrantAllBadgesBtn) {
    debugGrantAllBadgesBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      game.grantAllDebugBadges();
      renderDebugBadges(game);
    });
  }

  // Debug Summon Game Event
  if (debugSummonBloodmoonBtn) {
    debugSummonBloodmoonBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      BloodmoonEventSystem.startBloodmoon(game);
      showToast("Bloodmoon Summoned!", "Event active for 5 minutes.", "🩸");
    });
  }

  if (debugEndBloodmoonBtn) {
    debugEndBloodmoonBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      BloodmoonEventSystem.endBloodmoon(game);
      showToast("Bloodmoon Ended", "Event concluded.", "🌑");
    });
  }

  if (debugHudEventBtn) {
    debugHudEventBtn.addEventListener("click", () => {
      if (!game.isDebugModeActive) return;
      if (game.bloodmoon.isActive) {
        BloodmoonEventSystem.endBloodmoon(game);
        showToast("Bloodmoon Ended", "Event concluded.", "🌑");
      } else {
        BloodmoonEventSystem.startBloodmoon(game);
        showToast("Bloodmoon Summoned!", "Event active for 5 minutes.", "🩸");
      }
    });
  }
}
