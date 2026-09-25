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
    let moveX = 0;
    let moveY = 0;
    if (game.input) {
      if (game.input.up) moveY -= 1;
      if (game.input.down) moveY += 1;
      if (game.input.left) moveX -= 1;
      if (game.input.right) moveX += 1;
    }

    let angle = 0;
    if (moveX !== 0 || moveY !== 0) {
      angle = Math.atan2(moveY, moveX);
    } else if (typeof game.player.angle === "number" && !isNaN(game.player.angle)) {
      angle = game.player.angle;
    }

    if (typeof angle !== "number" || isNaN(angle)) {
      angle = 0;
    }

    const startX = (typeof game.player.x === "number" && !isNaN(game.player.x)) ? game.player.x : 0;
    const startY = (typeof game.player.y === "number" && !isNaN(game.player.y)) ? game.player.y : 0;

    // Resolve current map and safe boundary dimensions
    const Config = (window.Killstreak && window.Killstreak.Config) || {};
    const activeMap = (game.currentArea === "ATLANTIS" && ((window.Killstreak && window.Killstreak.Data && window.Killstreak.Data.Maps && window.Killstreak.Data.Maps.ATLANTIS) || (Config.MAPS && Config.MAPS.ATLANTIS)))
      || (Config.MAPS && Config.MAPS[game.currentArea])
      || (Config.MAPS && Config.MAPS.COMBAT)
      || game.map
      || {};

    const mapW = (typeof activeMap.width === "number" && activeMap.width > 0) ? activeMap.width : 5000;
    const mapH = (typeof activeMap.height === "number" && activeMap.height > 0) ? activeMap.height : 5000;
    const playerRadius = (game.player && typeof game.player.radius === "number" && !isNaN(game.player.radius)) ? game.player.radius : 20;
    const margin = playerRadius + 15;

    // Obstacle lists for collision detection during dash
    const circleObstacles = [
      ...(activeMap.obstacles || []),
      ...(activeMap.decorations || []),
      ...(activeMap.trees || []),
      ...(activeMap.rocks || []),
      ...(activeMap.corals || []),
      ...(activeMap.barrels || []),
      ...(activeMap.well ? [activeMap.well] : []),
      ...(activeMap.plants || []),
      ...(activeMap.lamps || [])
    ];

    const boxObstacles = [
      ...(activeMap.houses || []),
      ...(activeMap.hayBales || []),
      ...(activeMap.furniture || [])
    ];

    function collidesWithObstacle(px, py) {
      for (let i = 0; i < circleObstacles.length; i++) {
        const obs = circleObstacles[i];
        if (!obs || typeof obs.x !== "number" || typeof obs.y !== "number") continue;
        const obsR = typeof obs.radius === "number" ? obs.radius : 25;
        const d = Math.hypot(px - obs.x, py - obs.y);
        if (d < playerRadius + obsR) {
          return true;
        }
      }
      for (let i = 0; i < boxObstacles.length; i++) {
        const box = boxObstacles[i];
        if (!box || typeof box.x !== "number" || typeof box.y !== "number") continue;
        const closestX = Math.max(box.x, Math.min(px, box.x + (box.width || 0)));
        const closestY = Math.max(box.y, Math.min(py, box.y + (box.height || 0)));
        const d = Math.hypot(px - closestX, py - closestY);
        if (d < playerRadius) {
          return true;
        }
      }
      return false;
    }

    // Step along the 300px dash path in discrete increments to prevent clipping through obstacles or boundary walls
    const totalDist = TOXIC_DASH_DISTANCE;
    const numSteps = 20;
    const stepSize = totalDist / numSteps;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let finalX = startX;
    let finalY = startY;

    for (let s = 1; s <= numSteps; s++) {
      const targetDist = s * stepSize;
      const testX = startX + cosA * targetDist;
      const testY = startY + sinA * targetDist;

      // Check map boundary clamping
      if (testX < margin || testX > mapW - margin || testY < margin || testY > mapH - margin) {
        finalX = Math.max(margin, Math.min(mapW - margin, testX));
        finalY = Math.max(margin, Math.min(mapH - margin, testY));
        break;
      }

      // Check obstacle collision
      if (collidesWithObstacle(testX, testY)) {
        break;
      }

      finalX = testX;
      finalY = testY;
    }

    // Defensive clamp to ensure final coordinates are strictly within map boundaries and never NaN
    finalX = Math.max(margin, Math.min(mapW - margin, finalX));
    finalY = Math.max(margin, Math.min(mapH - margin, finalY));

    if (isNaN(finalX) || isNaN(finalY)) {
      finalX = Math.max(margin, Math.min(mapW - margin, startX));
      finalY = Math.max(margin, Math.min(mapH - margin, startY));
    }

    // Move player immediately and clear knockback impulses
    game.player.x = finalX;
    game.player.y = finalY;
    game.player.knockbackX = 0;
    game.player.knockbackY = 0;

    // Dash trail particles
    if (Particle && game.particles) {
      const steps = 16;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = startX + (finalX - startX) * t;
        const py = startY + (finalY - startY) * t;
        game.particles.push(
          new Particle(
            px + (Math.random() - 0.5) * 16,
            py + (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            s % 2 === 0 ? "#22c55e" : "#15803d",
            3.8,
            0.45
          )
        );
      }
    }

    // Current damage for the poison ticks
    const baseDmg = game.player.damage || (game.player.phase && game.player.phase.damage) || 12000;
    const tickDamage = Math.round(baseDmg * TOXIC_DASH_TICK_DAMAGE_FRACTION);

    // Hit detection along the line segment from (startX, startY) to (finalX, finalY)
    if (game.npcs && Array.isArray(game.npcs)) {
      const hitRadius = 45; // touch tolerance
      if (!game.activePoisonDots) game.activePoisonDots = [];

      for (let n = 0; n < game.npcs.length; n++) {
        const npc = game.npcs[n];
        if (!npc || npc.isDead || npc.hp <= 0) continue;

        // Distance from point (npc.x, npc.y) to segment (startX, startY) -> (finalX, finalY)
        const dx = finalX - startX;
        const dy = finalY - startY;
        const lenSq = dx * dx + dy * dy;
        let t = 0;
        if (lenSq > 0) {
          t = Math.max(0, Math.min(1, ((npc.x - startX) * dx + (npc.y - startY) * dy) / lenSq));
        }
        const projX = startX + t * dx;
        const projY = startY + t * dy;
        const dist = Math.hypot(npc.x - projX, npc.y - projY);

        if (dist <= hitRadius + (npc.radius || 20)) {
          // Apply Toxic Dash DoT to NPC
          game.activePoisonDots.push({
            npcId: npc.id,
            npc: npc,
            tickDamage: tickDamage,
            tickInterval: TOXIC_DASH_TICK_RATE,
            tickTimer: 0,
            remainingDuration: TOXIC_DASH_POISON_DURATION,
            source: "toxic_dash",
            color: "#22c55e"
          });

          if (FloatingText && game.floatingTexts) {
            game.floatingTexts.push(new FloatingText(npc.x, npc.y - 30, "TOXIC POISON!", "#22c55e", 17));
          }
        }
      }
    }

    if (FloatingText && game.floatingTexts) {
      game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 36, "TOXIC DASH!", "#22c55e", 20));
    }

    if (game.camera && game.saveData && game.saveData.settings && game.saveData.settings.screenShake) {
      game.camera.shake(6, 0.2);
    }

    if (game.camera && typeof game.camera.follow === "function") {
      game.camera.follow(game.player.x, game.player.y, mapW, mapH, 1);
    }

    return true;
  }
};
