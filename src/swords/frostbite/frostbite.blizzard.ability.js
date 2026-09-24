/**
 * frostbite — secondary (X), Blizzard, phase 11+.
 *
 * Spec: unlock at phase 11 (the second deliberate collapse — Blizzard is
 * Frostbite's hidden final power), 60-second cooldown, area of 4x the average
 * normal swing range, 5-second duration, damage equal to 50% of current sword
 * damage every 0.25 seconds, and enemies inside move 15% slower.
 *
 * The zone is placed where the wielder is standing and then persists — it is an
 * environmental hazard, not a single attack. Because the damage tick and the slow
 * both have to be re-applied every 0.25s, the ticking lives in the `js/game.js`
 * update loop (which owns `dt`), and this module only spawns the zone. That
 * mirrors how Engulf's damage-over-time is driven from the loop.
 *
 * The slow is refreshed on every tick, so leaving the blizzard ends the slow
 * within one tick. Blizzard deliberately does NOT freeze — Freeze is hard control,
 * Blizzard is sustained area damage plus a movement debuff.
 */
import { frostbiteSkillReach } from './frostbite.ability.js';

export const BLIZZARD_DURATION = 5.0;
export const BLIZZARD_COOLDOWN = 60.0;
/** Multiplier applied to an enemy's speed while inside the blizzard (15% slower). */
export const BLIZZARD_SLOW_FACTOR = 0.85;
export const BLIZZARD_TICK_INTERVAL = 0.25;
/** Area is 4x the sword's average normal swing range. */
export const BLIZZARD_AREA_MULTIPLIER = 4;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "frostbite" || game.player.phase.phase < 11) return false;
    if (game.blizzardCooldown > 0) return false;

    game.blizzardCooldown = BLIZZARD_COOLDOWN;

    const radius = frostbiteSkillReach(game.player.radius) * BLIZZARD_AREA_MULTIPLIER;

    if (!game.activeBlizzards) game.activeBlizzards = [];
    game.activeBlizzards.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: BLIZZARD_DURATION,
      maxTimer: BLIZZARD_DURATION,
      tickTimer: BLIZZARD_TICK_INTERVAL
    });

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "BLIZZARD!", "#a5f3fc", 19)
      );
    }

    // Snow and ice erupting where the storm lands.
    if (Particle) {
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 220;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#bae6fd" : "#38bdf8"),
            5.2, 0.85
          )
        );
      }
    }

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.frostbite_blizzard_title", { defaultValue: "BLIZZARD" }) : "BLIZZARD";
      const desc = I18n
        ? I18n.t("toasts.frostbite_blizzard_desc", { defaultValue: "A freezing storm covers the ground for 5s" })
        : "A freezing storm covers the ground for 5s";
      game.callbacks.onToast(title, desc, "🧊");
    }

    return true;
  }
};
