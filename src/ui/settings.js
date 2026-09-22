/**
 * Settings modal — the three display toggles and the Reset Save action.
 *
 * Phase 6 wiring relocation (the option-2 rule). Moved verbatim out of js/main.js.
 *
 * `resetDebugUI` is imported because Reset Save must also clear the debug overlay
 * (it is what dropped isDebugUnlocked back to false). That direction is safe:
 * debugPanel.js does not import this module.
 *
 * Storage is resolved INSIDE the handler rather than captured at module load, for
 * the same load-order reason documented in language.js — js/storage.js publishes
 * it on window and this module evaluates earlier in the graph.
 */
import {
  settingShake,
  settingNumbers,
  settingDamageTaken,
  resetSaveBtn,
  badgesList,
  libraryBadgesContainer,
  debugIndividualBadgesList,
  hudShieldBar
} from './domRefs.js';
import { resetDebugUI } from './debugPanel.js';
import { renderBadges } from './badges.js';
import { updateHudCounters, updateStatsUI, updateHudPhaseTracking } from './hud.js';
import { updateSwordStandUI } from './swordStand.js';
import { showToast } from './toast.js';

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} game */
export function initSettingsWiring(game) {
  settingShake.checked = Boolean(game.saveData.settings.screenShake);
  settingNumbers.checked = Boolean(game.saveData.settings.damageNumbers);
  if (settingDamageTaken) {
    settingDamageTaken.checked = Boolean(game.saveData.settings.damageTaken !== false);
  }

  settingShake.addEventListener("change", (e) => {
    game.saveData.settings.screenShake = e.target.checked;
    const Storage = window.Killstreak && window.Killstreak.Storage;
    Storage.save(game.saveData);
  });

  settingNumbers.addEventListener("change", (e) => {
    game.saveData.settings.damageNumbers = e.target.checked;
    const Storage = window.Killstreak && window.Killstreak.Storage;
    Storage.save(game.saveData);
  });

  if (settingDamageTaken) {
    settingDamageTaken.addEventListener("change", (e) => {
      game.saveData.settings.damageTaken = e.target.checked;
      const Storage = window.Killstreak && window.Killstreak.Storage;
      Storage.save(game.saveData);
    });
  }

  resetSaveBtn.addEventListener("click", () => {
    const confirmMsg = I18n ? I18n.t("settings.reset_confirm") : "Reset all lifetime kills, highest streak, and unlocked badges?";
    if (confirm(confirmMsg)) {
      game.resetAllProgress();

      // Reset developer debug mode state and interface
      resetDebugUI(game);

      // Reset badges UI
      renderBadges([], badgesList);
      renderBadges([], libraryBadgesContainer);
      if (debugIndividualBadgesList) debugIndividualBadgesList.innerHTML = "";

      // Reset settings toggles back to default
      if (settingShake) settingShake.checked = true;
      if (settingNumbers) settingNumbers.checked = true;

      // Reset all HUD and modal UI elements
      updateHudCounters(game);
      updateStatsUI(game);
      updateHudPhaseTracking(game);

      const hudHpBar = document.getElementById("hud-hp-bar");
      const hudHpText = document.getElementById("hud-hp-text");
      const hudDmgVal = document.getElementById("hud-dmg-val");
      const hudScaleVal = document.getElementById("hud-scale-val");

      if (hudHpBar) hudHpBar.style.width = "100%";
      if (hudShieldBar) hudShieldBar.style.width = "0%";
      if (hudHpText) hudHpText.textContent = `${game.player.maxHp} / ${game.player.maxHp}`;
      if (hudDmgVal) hudDmgVal.textContent = `⚔️ ${game.player.damage} DMG`;
      if (hudScaleVal) hudScaleVal.textContent = `Base: ${game.player.baseDamage} DMG • ${game.player.baseMaxHp} HP`;

      updateSwordStandUI(game);
      const toastTitle = I18n ? I18n.t("toasts.save_reset_title") : "Save Reset";
      const toastDesc = I18n ? I18n.t("toasts.save_reset_desc") : "All progress has been reset.";
      showToast(toastTitle, toastDesc, "🔄");
    }
  });
}
