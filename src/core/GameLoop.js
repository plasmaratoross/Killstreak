/**
 * Game loop — the requestAnimationFrame driver.
 *
 * Phase 6, slice 13: the last function to leave js/main.js.
 *
 * It re-schedules ITSELF with requestAnimationFrame(loop) — a bare reference
 * inside the very body being moved, so the callback wrapper had to be applied to
 * moved bodies and not only to main.js.
 *
 * DOCUMENTED NUANCE: lastTimestamp is now initialised when this module is
 * evaluated rather than partway through the IIFE body, so it is captured a few
 * milliseconds earlier. Not observable: the game starts in the MENU state, where
 * Game.update() early-returns, and the first frame's dt is clamped to 0.1 anyway.
 */
import {
  hudHpText,
  hudHpBar,
  hudShieldBar,
  hudDmgVal,
  hudScaleVal
} from '../ui/domRefs.js';
import { formatNumber } from '../utils/format.js';

let lastTimestamp = performance.now();

const I18n = (typeof window !== "undefined" && window.Killstreak && window.Killstreak.I18n) || null;

/** @param {*} game @param {*} currentTimestamp */
export function loop(game, currentTimestamp) {
  const dt = Math.min(0.1, (currentTimestamp - lastTimestamp) / 1000);
  lastTimestamp = currentTimestamp;

  game.update(dt);

  if (game.input.isMouseDown && game.state === "COMBAT" && !game.isGameOver) {
    game.handleAttackInput();
  }

  game.render();

  const playerShield = game.player.shield || 0;
  const effectiveTotal = Math.max(game.player.maxHp, game.player.hp + playerShield);
  const hpRatio = Math.max(0, game.player.hp / effectiveTotal);
  hudHpBar.style.width = `${hpRatio * 100}%`;

  if (hudShieldBar) {
    const shieldRatio = Math.max(0, playerShield / effectiveTotal);
    hudShieldBar.style.width = `${shieldRatio * 100}%`;
    const hpOuter = hudHpBar.parentElement;
    if (hpOuter) {
      if (playerShield > 0) {
        hpOuter.classList.add("has-shield");
      } else {
        hpOuter.classList.remove("has-shield");
      }
    }
  }

  const fHp = formatNumber(Math.ceil(game.player.hp));
  const fMaxHp = formatNumber(game.player.maxHp);
  if (playerShield > 0) {
    const fShield = formatNumber(Math.ceil(playerShield));
    hudHpText.textContent = `${fHp.short} / ${fMaxHp.short} (+${fShield.short} 🛡️)`;
    hudHpText.title = `${fHp.full} / ${fMaxHp.full} (+${fShield.full} 🛡️)`;
  } else {
    hudHpText.textContent = `${fHp.short} / ${fMaxHp.short}`;
    hudHpText.title = `${fHp.full} / ${fMaxHp.full}`;
  }

  if (hudDmgVal && hudScaleVal) {
    if (game.player.isSwordEquipped) {
      const fDmg = formatNumber(game.player.damage);
      hudDmgVal.textContent = I18n
        ? I18n.t("hud.dmg_tag", { damage: fDmg.short })
        : `⚔️ ${fDmg.short} DMG`;
      hudDmgVal.title = `${fDmg.full} DMG`;
      // Show streak scaling for ALL swords (not just devourer)
      const fBaseDmg = formatNumber(game.player.baseDamage);
      const fBaseHp = formatNumber(game.player.baseMaxHp);
      const fStreak = formatNumber(game.player.phaseKills || 0);
      hudScaleVal.textContent = I18n
        ? I18n.t("hud.scale_streak", { dmg: fBaseDmg.short, hp: fBaseHp.short, streak: fStreak.short })
        : `Base: ${fBaseDmg.short} DMG / ${fBaseHp.short} HP (+${fStreak.short} streak)`;
      hudScaleVal.title = `Base: ${fBaseDmg.full} DMG / ${fBaseHp.full} HP (+${fStreak.full} streak)`;
    } else {
      hudDmgVal.textContent = I18n ? I18n.t("hud.no_sword") : `🛡️ NO SWORD`;
      hudScaleVal.textContent = I18n ? I18n.t("hud.unequipped") : `Unequipped`;
    }
  }

  requestAnimationFrame((ts) => loop(game, ts));
}

// ============================================================================
// VIEWPORT FITTING (Phase 8)
// ============================================================================

/** The native canvas size — and the design size every coordinate is expressed in. */
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 650;

/**
 * Scales #game-container so the whole 1000x650 scene fits the window.
 *
 * The canvas's own resolution is deliberately NOT touched. Player position,
 * camera, collision distances and the minimap projection are all expressed
 * against a 1000x650 world, so changing the backing store would invalidate every
 * one of them. A CSS transform scales the rendered result instead, and the
 * stylesheet applies it as `transform: translate(-50%, -50%) scale(var(--game-scale))`
 * — this function only publishes the factor.
 *
 * Capped at 1: the canvas is a fixed 1000x650 bitmap, so a factor above 1 would
 * only enlarge pixels and blur the scene rather than add detail.
 *
 * Mouse input already survives this. InputManager converts screen to canvas
 * coordinates by dividing by getBoundingClientRect().width, which reflects the
 * transform — the same correction js/map.js's canvasPointFromEvent() applies.
 *
 * @returns {number} the factor actually applied
 */
export function resizeCanvasToFit() {
  const scale = Math.min(1, window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  document.documentElement.style.setProperty("--game-scale", String(scale));
  return scale;
}

/**
 * Applies the fit once and keeps it applied as the window changes.
 *
 * Registered from this module rather than from js/main.js, following the rule
 * established in Phase 6: every listener belongs to the module that owns the
 * thing being listened to. main.js keeps zero addEventListener calls.
 */
export function initResponsiveWiring() {
  resizeCanvasToFit();
  window.addEventListener("resize", resizeCanvasToFit);
  window.addEventListener("orientationchange", resizeCanvasToFit);
}
