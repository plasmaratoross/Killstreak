/**
 * AchievementSystem — badge/achievement granting and evaluation.
 *
 * Extracted from js/game.js in Phase 5. Bodies moved verbatim; `this` rebound to
 * the `game` parameter. Config is resolved from window.Killstreak.Config because
 * it was a file-scope binding in the original IIFE.
 */

/** @param {object} game */
export function checkFirstSessionAchievement(game) {
  // Re-resolve bindings that were file-scope in js/game.js.
  const Storage = window.Killstreak.Storage;

  if (!game.saveData.achievements.includes("getting_started")) {
    game.saveData.achievements.push("getting_started");
    if (!game.saveData.badges.includes("getting_started")) {
      game.saveData.badges.push("getting_started");
    }
    Storage.save(game.saveData);
    if (game.callbacks.onBadgesUpdated) {
      game.callbacks.onBadgesUpdated(game.saveData.badges);
    }
    if (game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const achInfo = I18n ? I18n.getAchievementInfo("getting_started") : { title: "Getting Started", description: "Join and begin your journey with Devourer." };
      const title = I18n ? I18n.t("toasts.achievement_unlocked_title") : "Achievement Unlocked!";
      game.callbacks.onToast(title, `${achInfo.title}: ${achInfo.description}`, "⚔️");
    }
  }
}

/** @param {object} game @param {string} achId */
export function unlockAchievement(game, achId) {
  // Re-resolve bindings that were file-scope in js/game.js.
  const Config = window.Killstreak.Config;
  const Storage = window.Killstreak.Storage;

  const ach = Config.ACHIEVEMENTS.find(a => (a.id === achId || a.badge === achId));
  if (!ach) return false;
  let newlyUnlocked = false;
  if (!game.saveData.achievements.includes(ach.id)) {
    game.saveData.achievements.push(ach.id);
    newlyUnlocked = true;
  }
  if (!game.saveData.badges.includes(ach.badge)) {
    game.saveData.badges.push(ach.badge);
    newlyUnlocked = true;
  }
  if (newlyUnlocked) {
    Storage.save(game.saveData);
    if (game.callbacks.onBadgesUpdated) {
      game.callbacks.onBadgesUpdated(game.saveData.badges);
    }
    if (game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const achInfo = I18n ? I18n.getAchievementInfo(ach.id) : ach;
      const title = I18n ? I18n.t("toasts.achievement_unlocked_title") : "Achievement Unlocked!";
      game.callbacks.onToast(title, `${achInfo.title}: ${achInfo.description}`, ach.icon);
    }
  }
  return true;
}

/** @param {object} game */
export function checkAchievements(game) {
  // Re-resolve bindings that were file-scope in js/game.js.
  const Config = window.Killstreak.Config;
  const Storage = window.Killstreak.Storage;

  const achievements = Config.ACHIEVEMENTS;
  let newlyUnlocked = false;

  achievements.forEach((ach) => {
    let qualifies = false;
    if (ach.id === "getting_started") {
      qualifies = true;
    } else if (ach.id === "all_devourer") {
      qualifies = (game.player.swordId === "devourer" && game.player.phase && game.player.phase.phase === 17) ||
                  (game.saveData.swordPhase === 17 || (game.saveData.devourerPhase && game.saveData.devourerPhase.phase === 17)) ||
                  game.saveData.phase17CutsceneSeen ||
                  (game.player.swordId === "devourer" && game.killstreak >= 75000);
    } else if (ach.id === "overdrive_ascended") {
      qualifies = (game.player.swordId === "overdrive" && game.player.phase && game.player.phase.phase === 7) ||
                  (game.saveData.overdrivePhase === 7 || (game.saveData.overdrivePhase && game.saveData.overdrivePhase.phase === 7)) ||
                  (game.player.swordId === "overdrive" && game.killstreak >= 25000);
    } else if (ach.id === "aquatic_ascended") {
      qualifies = (game.player.swordId === "aquatic" && game.player.phase && game.player.phase.phase === 13) ||
                  (game.saveData.aquaticPhase === 13 || (game.saveData.aquaticPhase && game.saveData.aquaticPhase.phase === 13)) ||
                  game.saveData.aquaticPhase13CutsceneSeen ||
                  (game.player.swordId === "aquatic" && game.killstreak >= 145000);
    } else if (ach.id === "soil_ascended") {
      qualifies = (game.player.swordId === "soil" && game.player.phase && game.player.phase.phase === 10) ||
                  (game.saveData.soilPhase === 10) ||
                  game.saveData.soilPhase10CutsceneSeen ||
                  (game.player.swordId === "soil" && game.killstreak >= 160000);
    } else if (ach.id === "metallic_ascended") {
      qualifies = (game.player.swordId === "metallic" && game.player.phase && game.player.phase.phase === 10) ||
                  (game.saveData.metallicPhase === 10) ||
                  game.saveData.metallicPhase10CutsceneSeen ||
                  (game.player.swordId === "metallic" && game.killstreak >= 180000);
    } else if (ach.id === "flora_ascended") {
      qualifies = (game.player.swordId === "flora" && game.player.phase && game.player.phase.phase === 10) ||
                  (game.saveData.floraPhase === 10) ||
                  game.saveData.floraPhase10CutsceneSeen ||
                  (game.player.swordId === "flora" && game.killstreak >= 200000);
    } else if (ach.id === "hellfire_ascended") {
      qualifies = (game.player.swordId === "hellfire" && game.player.phase && game.player.phase.phase === 10) ||
                  (game.saveData.hellfirePhase === 10) ||
                  game.saveData.hellfirePhase10CutsceneSeen ||
                  (game.player.swordId === "hellfire" && game.killstreak >= 225000);
    } else {
      qualifies = ach.killsRequired === 0 ||
        game.killstreak >= ach.killsRequired ||
        game.saveData.highestKillstreak >= ach.killsRequired ||
        game.saveData.kills >= ach.killsRequired ||
        (typeof game.saveData.totalKills === "number" && game.saveData.totalKills >= ach.killsRequired);
    }

    if (qualifies && !game.saveData.achievements.includes(ach.id)) {
      game.saveData.achievements.push(ach.id);
      if (!game.saveData.badges.includes(ach.badge)) {
        game.saveData.badges.push(ach.badge);
      }
      newlyUnlocked = true;

      if (game.callbacks.onToast) {
        const I18n = window.Killstreak && window.Killstreak.I18n;
        const achInfo = I18n ? I18n.getAchievementInfo(ach.id) : ach;
        const title = I18n ? I18n.t("toasts.achievement_unlocked_title") : "Achievement Unlocked!";
        game.callbacks.onToast(title, `${achInfo.title}: ${achInfo.description}`, ach.icon);
      }
    }
  });

  if (newlyUnlocked) {
    Storage.save(game.saveData);
    if (game.callbacks.onBadgesUpdated) {
      game.callbacks.onBadgesUpdated(game.saveData.badges);
    }
  }
}

export default { checkFirstSessionAchievement, unlockAchievement, checkAchievements };
