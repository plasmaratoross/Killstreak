/**
 * lumen — secondary (X), Radiance, phase 12+.
 *
 * Spec: unlocks at the second deliberate collapse (Phase 12: Occultation) — the
 * light is hidden when you finally learn to *wear* it rather than swing it.
 * 50-second cooldown, 4-second duration, area of 2.5x the current normal swing
 * range, burns every enemy inside for 45% of current sword damage each second,
 * and heals the wielder for 10% of max HP each second.
 *
 * The aura is anchored to the WIELDER, not to the ground: it is a personal field,
 * unlike Frostbite's Blizzard which is an environmental hazard dropped where you
 * stand. That is why the zone carries `follow: true` — the tick loop in
 * js/game.js re-anchors it to the player every frame.
 *
 * Because the heal and the burn both have to be re-applied every second, the
 * ticking lives in the js/game.js update loop (which owns `dt`); this module only
 * creates the field. That mirrors how Blizzard and Engulf are driven.
 *
 * The heal is clamped to maxHp in the tick loop, never here, so a single place
 * owns the clamp.
 */

export const RADIANCE_DURATION = 4.0;
export const RADIANCE_COOLDOWN = 50.0;
export const RADIANCE_TICK_INTERVAL = 1.0;
/** Burn damage per tick, as a fraction of current sword damage. */
export const RADIANCE_DAMAGE_FRACTION = 0.45;
/** Heal per tick, as a fraction of the wielder's max HP. */
export const RADIANCE_HEAL_FRACTION = 0.10;
/** Area is 2.5x the sword's current normal swing range. */
export const RADIANCE_AREA_MULTIPLIER = 2.5;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "lumen" || game.player.phase.phase < 12) return false;
    if (game.radianceCooldown > 0) return false;

    game.radianceCooldown = RADIANCE_COOLDOWN;

    const radius = (game.player.radius + (game.player.phase.bladeLength || 84) + 10) * RADIANCE_AREA_MULTIPLIER;

    if (!game.activeRadiances) game.activeRadiances = [];
    game.activeRadiances.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: RADIANCE_DURATION,
      maxTimer: RADIANCE_DURATION,
      tickTimer: RADIANCE_TICK_INTERVAL,
      follow: true
    });

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "RADIANCE!", "#fef3c7", 20)
      );
    }

    // Light lifting off the wielder as the field opens.
    if (Particle) {
      for (let i = 0; i < 44; i++) {
        const angle = (i / 44) * Math.PI * 2;
        const speed = 80 + Math.random() * 200;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 2 === 0 ? "#ffffff" : "#fde68a",
            4.8, 0.75
          )
        );
      }
    }

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.lumen_radiance_title", { defaultValue: "RADIANCE" }) : "RADIANCE";
      const desc = I18n
        ? I18n.t("toasts.lumen_radiance_desc", { defaultValue: "Burning aura active for 4s — heals 10% max HP per second" })
        : "Burning aura active for 4s — heals 10% max HP per second";
      game.callbacks.onToast(title, desc, "✨");
    }

    return true;
  }
};
