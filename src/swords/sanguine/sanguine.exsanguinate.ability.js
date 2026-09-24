/**
 * sanguine — secondary (X), Exsanguinate, phase 12+.
 *
 * Spec: unlocks at the second deliberate collapse (Phase 12: Fester) — the blade
 * rots and learns to bleed things other than itself. 60-second cooldown, 5-second
 * duration, area of 3x the current normal swing range, 45% of current sword damage
 * per second to everything inside, and the wielder is healed for 10% of the damage
 * the bleed actually deals.
 *
 * The field is anchored to the WIELDER for its whole duration (like Lumen's
 * Radiance and unlike Frostbite's Blizzard): it is the sword's own circulation,
 * not weather. `follow: true` is what tells the js/game.js tick loop to re-anchor
 * it every frame.
 *
 * SIMPLIFICATION, DELIBERATE: the bleed is applied to enemies *inside the field*
 * rather than stamped onto each enemy as an independent 5-second timer. A per-NPC
 * bleed timer would need new persistent state on NPC, a new status branch in
 * NPC.update, and a new status visual in NPC.draw — three new touchpoints in a
 * file this project treats as frozen-ish, in exchange for a difference a player
 * cannot observe at a 5-second duration. Walking out of the field ends the bleed;
 * that is the behaviour, and it is consistent with Blizzard, Cataclysm and
 * Cyclone, which all tick on the zone too.
 *
 * The heal is clamped in the tick loop (js/game.js), which owns the clamp for
 * every other healing-over-time effect.
 */

export const EXSANGUINATE_DURATION = 5.0;
export const EXSANGUINATE_COOLDOWN = 60.0;
export const EXSANGUINATE_TICK_INTERVAL = 1.0;
/** Bleed damage per tick, as a fraction of current sword damage. */
export const EXSANGUINATE_DAMAGE_FRACTION = 0.45;
/** Fraction of the bleed's damage that comes back to the wielder as health. */
export const EXSANGUINATE_HEAL_FRACTION = 0.10;
/** Area is 3x the sword's current normal swing range. */
export const EXSANGUINATE_AREA_MULTIPLIER = 3;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "sanguine" || game.player.phase.phase < 12) return false;
    if (game.exsanguinateCooldown > 0) return false;

    game.exsanguinateCooldown = EXSANGUINATE_COOLDOWN;

    const radius = (game.player.radius + (game.player.phase.bladeLength || 72) + 10) * EXSANGUINATE_AREA_MULTIPLIER;

    if (!game.activeExsanguinates) game.activeExsanguinates = [];
    game.activeExsanguinates.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: EXSANGUINATE_DURATION,
      maxTimer: EXSANGUINATE_DURATION,
      tickTimer: EXSANGUINATE_TICK_INTERVAL,
      follow: true
    });

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "EXSANGUINATE!", "#fca5a5", 20)
      );
    }

    // Blood erupting outward from the wielder as the field opens.
    if (Particle) {
      for (let i = 0; i < 46; i++) {
        const angle = (i / 46) * Math.PI * 2;
        const speed = 110 + Math.random() * 240;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 2 === 0 ? "#ef4444" : "#7f1d1d",
            5.0, 0.8
          )
        );
      }
    }

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.sanguine_exsanguinate_title", { defaultValue: "EXSANGUINATE" }) : "EXSANGUINATE";
      const desc = I18n
        ? I18n.t("toasts.sanguine_exsanguinate_desc", { defaultValue: "Bleed field active for 5s — 45% damage per second, healing you for 10%" })
        : "Bleed field active for 5s — 45% damage per second, healing you for 10%";
      game.callbacks.onToast(title, desc, "🩸");
    }

    return true;
  }
};
