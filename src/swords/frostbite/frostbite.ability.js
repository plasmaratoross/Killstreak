/**
 * frostbite — primary (Z), Freeze, phase 7+.
 *
 * Spec: unlock at phase 7 (immediately after the first deliberate collapse), the
 * radius is Frostbite's AVERAGE normal swing range, frozen enemies last 5 seconds
 * and take 2x damage from player attacks while frozen.
 *
 * The radius is deliberately NOT the current phase's swing range. Frostbite's
 * identity is control, not reach, so it stays fixed for the whole sword: the mean
 * `bladeLength` across all 12 phases, converted to a reach with the same
 * `player.radius + bladeLength + 10` expression `js/game.js` uses for a normal
 * swing. The mean is derived from the data file rather than hard-coded so the two
 * can never drift apart.
 *
 * Freeze deals no damage itself — only the crowd-control. The damage comes from
 * attacking the frozen target (see the 2x multiplier in NPC.takeDamage).
 *
 * Guards follow src/swords/windy/windy.ability.js rather than inventing a new
 * pattern: state -> equipped sword -> skill phase -> cooldown.
 */
import frostbiteData from './frostbite.data.json';

/** Mean normal swing range across every phase — the fixed skill reach. */
const AVG_BLADE_LENGTH =
  frostbiteData.phases.reduce((sum, p) => sum + (p.bladeLength || 0), 0) / frostbiteData.phases.length;

export const FREEZE_DURATION = 5.0;
export const FREEZE_COOLDOWN = 25.0;

/** Reach of a Frostbite skill, matching game.js's maxReach expression. */
export function frostbiteSkillReach(playerRadius) {
  return playerRadius + AVG_BLADE_LENGTH + 10;
}

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "frostbite" || game.player.phase.phase < 7) return false;
    if (game.freezeCooldown > 0) return false;

    game.freezeCooldown = FREEZE_COOLDOWN;

    const radius = frostbiteSkillReach(game.player.radius);
    let frozen = 0;

    // Frost gathers around the wielder, then a circular freezing pulse expands.
    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d <= radius + npc.radius) {
        // Frozen: movement stops, attacks are interrupted, and player attacks deal
        // 2x. The multiplier itself lives in NPC.takeDamage.
        npc.frozenTimer = FREEZE_DURATION;
        frozen++;
        if (game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
          game.floatingTexts.push(
            new FloatingText(npc.x, npc.y - 16, "FROZEN", "#a5f3fc", 15)
          );
        }
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "FREEZE!", "#a5f3fc", 18)
      );
    }

    // Ice shards bursting outward from the wielder.
    if (Particle) {
      const shards = frozen > 0 ? 26 : 14;
      for (let i = 0; i < shards; i++) {
        const angle = (i / shards) * Math.PI * 2;
        const speed = 90 + Math.random() * 170;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 2 === 0 ? "#e0f2fe" : "#7dd3fc",
            4.4, 0.55
          )
        );
      }
    }

    // Expanding pulse ring, decayed per-frame in js/game.js.
    if (!game.activeFreezes) game.activeFreezes = [];
    game.activeFreezes.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: 0.7,
      maxTimer: 0.7
    });

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.frostbite_freeze_title", { defaultValue: "FROZEN" }) : "FROZEN";
      const desc = I18n
        ? I18n.t("toasts.frostbite_freeze_desc", { count: frozen, defaultValue: `${frozen} enemies frozen for 5s — deal double damage` })
        : `${frozen} enemies frozen for 5s — deal double damage`;
      game.callbacks.onToast(title, desc, "🧊");
    }

    return true;
  }
};
