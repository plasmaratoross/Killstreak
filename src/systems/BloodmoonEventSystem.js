/**
 * BloodmoonEventSystem — the Bloodmoon event lifecycle.
 *
 * Extracted from js/game.js in Phase 5. Bodies moved verbatim; `this` rebound to
 * the `game` parameter. Config is re-resolved from window.Killstreak.Config,
 * which was a file-scope binding in the original IIFE. Event state itself stays
 * on `game.bloodmoon` — this module only owns the behaviour.
 */

/** @param {object} game @param {number} dt */
export function updateBloodmoon(game, dt) {
  // Re-resolve bindings that were file-scope in js/game.js.
  const Config = window.Killstreak.Config;

  const bm = game.bloodmoon;
  const isInCombat = (game.currentArea === "COMBAT" || game.currentArea === "ATLANTIS") && !game.isGameOver;

  if (game.currentArea === "ATLANTIS") {
    updateBloodmoonTintStyle(game);
  }

  if (bm.isActive) {
    // --- BLOODMOON IS ACTIVE ---
    bm.activeTimer += dt;
    const DURATION = (Config.GAME_CONFIG && Config.GAME_CONFIG.bloodmoon && Config.GAME_CONFIG.bloodmoon.duration) || 300; // 5 minutes in seconds

    if (bm.activeTimer >= DURATION) {
      // End Bloodmoon
      endBloodmoon(game);
      return;
    }

    // Apply NPC stat boosts if not yet applied (or if new NPCs spawned)
    if (isInCombat) {
      applyBloodmoonNpcBoosts(game);
    }

  } else {
    // --- BLOODMOON NOT ACTIVE: Check every 60s (10% chance per 1 minute) ---
    bm.checkTimer += dt;
    const CHECK_INTERVAL = (Config.GAME_CONFIG && Config.GAME_CONFIG.bloodmoon && Config.GAME_CONFIG.bloodmoon.checkInterval) || 60; // 1 minute
    const CHANCE = (Config.GAME_CONFIG && Config.GAME_CONFIG.bloodmoon && Config.GAME_CONFIG.bloodmoon.chance) || 0.10; // 10% chance

    if (bm.checkTimer >= CHECK_INTERVAL) {
      bm.checkTimer = 0;
      const roll = Math.random();
      if (roll < CHANCE) {
        // 10% chance — trigger!
        startBloodmoon(game);
      }
    }
  }

  // --- BANNER ANIMATION STATE MACHINE ---
  const banner = document.getElementById("bloodmoon-banner");
  if (!banner) return;

  if (bm.bannerPhase === "entering") {
    bm.bannerTimer -= dt;
    if (bm.bannerTimer <= 0) {
      // Transition to "visible" hold
      bm.bannerPhase = "visible";
      bm.bannerTimer = 4.0; // Hold for 4s
      banner.classList.remove("bloodmoon-banner-entering");
      banner.classList.add("bloodmoon-banner-visible");
    }
  } else if (bm.bannerPhase === "visible") {
    bm.bannerTimer -= dt;
    if (bm.bannerTimer <= 0) {
      // Transition to exit animation
      bm.bannerPhase = "exiting";
      bm.bannerTimer = 0.5;
      banner.classList.remove("bloodmoon-banner-visible");
      banner.classList.add("bloodmoon-banner-exiting");
    }
  } else if (bm.bannerPhase === "exiting") {
    bm.bannerTimer -= dt;
    if (bm.bannerTimer <= 0) {
      // Hide completely
      bm.bannerPhase = "hidden";
      banner.classList.add("hidden");
      banner.classList.remove("bloodmoon-banner-exiting");
    }
  }
}

/** @param {object} game */
export function startBloodmoon(game) {
  const bm = game.bloodmoon;
  bm.isActive = true;
  bm.activeTimer = 0;
  bm.checkTimer = 0;
  bm.npcStatsApplied = false;

  // Immediately apply NPC boosts if in combat or Atlantis
  if (game.currentArea === "COMBAT" || game.currentArea === "ATLANTIS") {
    applyBloodmoonNpcBoosts(game);
  }

  // Show screen tint
  const tint = document.getElementById("bloodmoon-tint");
  if (tint) tint.classList.remove("hidden");
  if (game.currentArea === "ATLANTIS") {
    updateBloodmoonTintStyle(game);
  }

  // Show notification banner
  showBloodmoonBanner(game);
}

/** @param {object} game */
export function endBloodmoon(game) {
  const bm = game.bloodmoon;
  bm.isActive = false;
  bm.activeTimer = 0;
  bm.checkTimer = 0; // Reset 1-min check after event ends
  bm.bannerPhase = "hidden";

  // Restore NPC stats
  restoreBloodmoonNpcStats(game);

  // Hide screen tint and reset themes
  const tint = document.getElementById("bloodmoon-tint");
  if (tint) {
    tint.classList.add("hidden");
    if (tint.classList.contains("atlantis-corrupted-tint")) {
      tint.classList.remove("atlantis-corrupted-tint");
    }
  }

  // Hide banner immediately
  const banner = document.getElementById("bloodmoon-banner");
  if (banner) {
    banner.classList.add("hidden");
    const toRemove = ["bloodmoon-banner-entering", "bloodmoon-banner-visible", "bloodmoon-banner-exiting"];
    if (banner.classList.contains("atlantis-corrupted-banner")) toRemove.push("atlantis-corrupted-banner");
    banner.classList.remove(...toRemove);
  }
}

/** @param {object} game @param {string} name */
export function summonEvent(game, name = "bloodmoon") {
  // Re-resolve bindings that were file-scope in js/game.js.
  const { FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

  if (name === "bloodmoon") {
    if (game.bloodmoon.isActive) {
      endBloodmoon(game);
      return false;
    } else {
      startBloodmoon(game);
      if (game.player) {
        game.floatingTexts.push(
          new FloatingText(game.player.x, game.player.y - 48, "BLOODMOON SUMMONED!", "#ef4444", 22)
        );
      }
      return true;
    }
  }
  return false;
}

/** @param {object} game */
export function updateBloodmoonTintStyle(game) {
  const tint = document.getElementById("bloodmoon-tint");
  const banner = document.getElementById("bloodmoon-banner");
  if (!tint) return;

  const isBmActive = Boolean(game && game.bloodmoon && (game.bloodmoon.isActive || game.bloodmoon.active));

  if (isBmActive && game.currentArea === "ATLANTIS") {
    if (!tint.classList.contains("atlantis-corrupted-tint")) {
      tint.classList.add("atlantis-corrupted-tint");
    }
    if (banner && !banner.classList.contains("atlantis-corrupted-banner")) {
      banner.classList.add("atlantis-corrupted-banner");
    }
  } else {
    if (tint.classList.contains("atlantis-corrupted-tint")) {
      tint.classList.remove("atlantis-corrupted-tint");
    }
    if (banner && banner.classList.contains("atlantis-corrupted-banner")) {
      banner.classList.remove("atlantis-corrupted-banner");
    }
  }
}

/** @param {object} game */
export function showBloodmoonBanner(game) {
  const bm = game.bloodmoon;
  const banner = document.getElementById("bloodmoon-banner");
  if (!banner) return;

  // Update banner text via I18n if available
  const I18n = window.Killstreak && window.Killstreak.I18n;
  const labelEl = document.getElementById("bloodmoon-label-text");
  const subEl = document.getElementById("bloodmoon-sublabel-text");
  if (I18n) {
    if (labelEl) labelEl.textContent = I18n.t("bloodmoon.title") || "BLOODMOON";
    const subKey = game.currentArea === "ATLANTIS" ? "bloodmoon.atlantis_subtitle" : "bloodmoon.subtitle";
    if (subEl) subEl.textContent = I18n.t(subKey) || (game.currentArea === "ATLANTIS" ? "Corrupted abyss descends upon Atlantis!" : "The crimson moon rises — darkness descends upon the grassland!");
  }

  if (game.currentArea === "ATLANTIS") {
    updateBloodmoonTintStyle(game);
  }
  banner.classList.remove("hidden", "bloodmoon-banner-visible", "bloodmoon-banner-exiting");
  banner.classList.add("bloodmoon-banner-entering");
  bm.bannerPhase = "entering";
  bm.bannerTimer = 0.55; // Duration of enter animation
}

/** @param {object} game */
export function applyBloodmoonNpcBoosts(game) {
  for (const npc of game.npcs) {
    if (npc.isDead) continue;
    if (!npc._bloodmoonBoosted) {
      // Store original base values before boosting
      npc._baseMaxHp    = npc.configObj.maxHp    || npc.maxHp;
      npc._baseDamage   = npc.configObj.damage    || npc.damage;
      npc._baseSpeed    = npc.configObj.speed     || npc.speed;

      const hpBoost  = npc._baseMaxHp  * 0.25;
      const newMaxHp = npc._baseMaxHp  + hpBoost;

      // Scale current HP proportionally
      const hpRatio  = npc.maxHp > 0 ? (npc.hp / npc.maxHp) : 1;
      npc.maxHp  = newMaxHp;
      npc.hp     = Math.min(newMaxHp, newMaxHp * hpRatio);
      npc.damage = (npc._baseDamage) * 1.25;
      npc.speed  = (npc._baseSpeed)  * 1.25;
      npc._bloodmoonBoosted = true;
    }
  }
}

/** @param {object} game */
export function restoreBloodmoonNpcStats(game) {
  for (const npc of game.npcs) {
    if (npc._bloodmoonBoosted) {
      const hpRatio = npc.maxHp > 0 ? (npc.hp / npc.maxHp) : 1;
      npc.maxHp  = npc._baseMaxHp;
      npc.hp     = Math.min(npc._baseMaxHp, npc._baseMaxHp * hpRatio);
      npc.damage = npc._baseDamage;
      npc.speed  = npc._baseSpeed;
      npc._bloodmoonBoosted = false;
      delete npc._baseMaxHp;
      delete npc._baseDamage;
      delete npc._baseSpeed;
    }
  }
}

if (typeof window !== "undefined") {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.BloodmoonEventSystem = {
    updateBloodmoon,
    startBloodmoon,
    endBloodmoon,
    summonEvent,
    showBloodmoonBanner,
    applyBloodmoonNpcBoosts,
    restoreBloodmoonNpcStats,
    updateBloodmoonTintStyle
  };
}

export default { updateBloodmoon, startBloodmoon, endBloodmoon, summonEvent, showBloodmoonBanner, applyBloodmoonNpcBoosts, restoreBloodmoonNpcStats, updateBloodmoonTintStyle };
