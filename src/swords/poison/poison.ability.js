/**
 * poison — primary (Z), Toxic Dash, phase 4+.
 *
 * Spec:
 *   - Unlocks at Phase 4 (Contamination).
 *   - 15-second cooldown.
 *   - Instantly dashes forward 300 pixels in moving/facing direction.
 *   - Any enemy touched along the path receives Toxic Dash Poison:
 *       - 5.0-second duration.
 *       - Ticks every 0.1s (50 ticks total).
 *       - Each tick deals 25% of the sword's current phase damage.
 *       - All actual damage dealt contributes to Venomous Requiem if active.
 */

export const TOXIC_DASH_COOLDOWN = 15.0;
export const TOXIC_DASH_DISTANCE = 300.0;
export const TOXIC_DASH_POISON_DURATION = 5.0;
export const TOXIC_DASH_TICK_RATE = 0.1;
export const TOXIC_DASH_TICK_DAMAGE_FRACTION = 0.25;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "poison" || (game.player.phase && game.player.phase.phase < 4)) {
      return false;
    }
    if (game.toxicDashCooldown > 0) return false;

    game.toxicDashCooldown = TOXIC_DASH_COOLDOWN;

    // Movement / facing angle
    let angle = game.player.angle !== undefined ? game.player.angle : 0;
    if (game.player.vx !== 0 || game.player.vy !== 0) {
      angle = Math.atan2(game.player.vy, game.player.vx);
    }

    const startX = game.player.x;
    const startY = game.player.y;
    const endX = startX + Math.cos(angle) * TOXIC_DASH_DISTANCE;
    const endY = startY + Math.sin(angle) * TOXIC_DASH_DISTANCE;

    // Clamp end coordinates to map boundaries
    const currentMap = window.Killstreak.Config.MAPS[game.currentArea];
    const mapW = currentMap ? currentMap.width : 5000;
    const mapH = currentMap ? currentMap.height : 5000;
    const margin = 40;
    const clampedX = Math.max(margin, Math.min(mapW - margin, endX));
    const clampedY = Math.max(margin, Math.min(mapH - margin, endY));

    // Dash trail particles
    if (Particle) {
      const steps = 15;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = startX + (clampedX - startX) * t;
        const py = startY + (clampedY - startY) * t;
        game.particles.push(
          new Particle(px + (Math.random() - 0.5) * 16, py + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, s % 2 === 0 ? "#22c55e" : "#15803d", 3.8, 0.45)
        );
      }
    }

    // Move player immediately
    game.player.x = clampedX;
    game.player.y = clampedY;

    // Current damage for the poison ticks
    const baseDmg = game.player.damage || (game.player.phase && game.player.phase.damage) || 12000;
    const tickDamage = Math.round(baseDmg * TOXIC_DASH_TICK_DAMAGE_FRACTION);

    // Hit detection along the line segment from (startX, startY) to (clampedX, clampedY)
    if (game.npcs) {
      const hitRadius = 45; // touch tolerance
      if (!game.activePoisonDots) game.activePoisonDots = [];

      for (let n = 0; n < game.npcs.length; n++) {
        const npc = game.npcs[n];
        if (!npc || npc.isDead || npc.hp <= 0) continue;

        // Distance from point (npc.x, npc.y) to segment (startX, startY) -> (clampedX, clampedY)
        const dx = clampedX - startX;
        const dy = clampedY - startY;
        const lenSq = dx * dx + dy * dy;
        let t = 0;
        if (lenSq > 0) {
          t = Math.max(0, Math.min(1, ((npc.x - startX) * dx + (npc.y - startY) * dy) / lenSq));
        }
        const projX = startX + t * dx;
        const projY = startY + t * dy;
        const dist = Math.hypot(npc.x - projX, npc.y - projY);

        if (dist <= hitRadius + npc.radius) {
          // Apply Toxic Dash DoT to NPC
          game.activePoisonDots.push({
            npcId: npc.id,
            npc: npc,
            tickDamage: tickDamage,
            tickInterval: TOXIC_DASH_TICK_RATE,
            tickTimer: 0,
            remainingDuration: TOXIC_DASH_POISON_DURATION,
            source: "toxic_dash"
          });

          if (FloatingText) {
            game.floatingTexts.push(new FloatingText(npc.x, npc.y - 30, "TOXIC POISON!", "#22c55e", 17));
          }
        }
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 36, "TOXIC DASH!", "#22c55e", 20));
    }

    if (game.saveData.settings.screenShake) {
      game.camera.shake(6, 0.2);
    }

    return true;
  }
};
