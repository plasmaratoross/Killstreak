/**
 * Badges — the achievements list plus the debug-mode badge grid.
 *
 * Phase 6, slice 5. Extracted from js/main.js. Bodies are verbatim.
 *
 * renderBadges keeps its default `targetElement = badgesList`; the default is
 * evaluated at call time against the ref imported from ./domRefs.js, exactly as
 * it resolved against the IIFE constant before.
 *
 * I18n is captured once at module load, mirroring the IIFE's startup destructure.
 */
import {
  badgesList,
  debugIndividualBadgesList
} from './domRefs.js';

const Config = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.Config) || null;
const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} unlockedBadges @param {*} targetElement */
export function renderBadges(unlockedBadges = [], targetElement = badgesList) {
  targetElement.innerHTML = "";
  Config.ACHIEVEMENTS.forEach((ach) => {
    const isUnlocked = unlockedBadges.includes(ach.badge || ach.id);
    const achInfo = I18n ? I18n.getAchievementInfo(ach.id) : ach;
    const item = document.createElement("div");
    item.className = `badge-item ${isUnlocked ? "unlocked" : "locked"}`;
    const statusText = isUnlocked ? (I18n ? I18n.t("achievements.status_unlocked") : "Unlocked") : (I18n ? I18n.t("achievements.status_locked") : "Locked");
    // Phase 7: innerHTML carries only the static skeleton. Every value that comes
    // from data or i18n is written with textContent, so a future achievement title
    // containing < or & can no longer break the markup or inject it.
    item.innerHTML = `
      <div class="badge-icon"></div>
      <div class="badge-details">
        <div class="badge-name"></div>
        <div class="badge-desc"></div>
      </div>
      <div class="badge-status-tag"></div>
    `;
    item.querySelector(".badge-icon").textContent = ach.icon;
    item.querySelector(".badge-name").textContent = achInfo.title;
    item.querySelector(".badge-desc").textContent = achInfo.description;
    const statusTag = item.querySelector(".badge-status-tag");
    // classList rather than an interpolated class attribute: this was the last
    // ${} left in any innerHTML template, and the class list is a fixed choice.
    statusTag.classList.add(isUnlocked ? "unlocked" : "locked");
    statusTag.textContent = statusText;
    targetElement.appendChild(item);
  });
}

/** @param {*} game */
export function renderDebugBadges(game) {
  if (!debugIndividualBadgesList) return;
  debugIndividualBadgesList.innerHTML = "";
  Config.ACHIEVEMENTS.forEach((ach) => {
    const isUnlocked = game.saveData.badges.includes(ach.badge || ach.id);
    const achInfo = I18n ? I18n.getAchievementInfo(ach.id) : ach;
    const row = document.createElement("div");
    row.className = "debug-badge-row";
    const statusText = isUnlocked ? (I18n ? I18n.t("library.badge_unlocked") : "UNLOCKED") : (I18n ? I18n.t("library.badge_locked") : "LOCKED");
    const btnText = isUnlocked ? (I18n ? I18n.t("debug.granted_btn") : "Granted") : (I18n ? I18n.t("debug.grant_btn") : "Grant");
    // Phase 7: note the data-badge-id in particular — an interpolated ATTRIBUTE is
    // the sharpest edge of innerHTML (it can escape the attribute, not just the
    // text node), so it is set through dataset instead.
    row.innerHTML = `
      <div class="debug-badge-info">
        <span></span>
        <strong></strong>
      </div>
      <div class="debug-badge-action-group">
        <span class="badge-status-tag"></span>
        <button type="button" class="btn-debug-grant"></button>
      </div>
    `;
    row.querySelector(".debug-badge-info span").textContent = ach.icon;
    row.querySelector(".debug-badge-info strong").textContent = achInfo.title;
    const debugStatusTag = row.querySelector(".badge-status-tag");
    debugStatusTag.classList.add(isUnlocked ? "unlocked" : "locked");
    debugStatusTag.textContent = statusText;
    const grantBtn = row.querySelector(".btn-debug-grant");
    if (grantBtn) {
      grantBtn.dataset.badgeId = ach.id;
      // The template used to carry ${isUnlocked ? "disabled" : ""}; an
      // interpolated ATTRIBUTE is the sharpest edge of innerHTML.
      if (isUnlocked) grantBtn.setAttribute("disabled", "");
      grantBtn.textContent = btnText;
    }
    if (grantBtn && !isUnlocked) {
      grantBtn.addEventListener("click", () => {
        if (!game.isDebugModeActive) return;
        game.grantDebugBadge(ach.id);
        renderDebugBadges(game);
      });
    }
    debugIndividualBadgesList.appendChild(row);
  });
}
