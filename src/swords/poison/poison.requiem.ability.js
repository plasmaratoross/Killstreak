/**
 * poison — secondary (X), Venomous Requiem, phase 12+.
 *
 * Spec:
 *   - Unlocks at Phase 12 (Poisoned Collapse).
 *   - Two-stage ultimate ability:
 *       1. Press X to begin 30-second Storage Mode.
 *          Records all actual poison damage inflicted by the player during this window.
 *       2. Press X again to execute Poison Slash:
 *          - Deals 125% of stored poison damage in an assassin crescent slash.
 *          - Secondary poison: 10% of stored damage every 0.2s for 1.0s (5 ticks = 50%).
 *          - 75-second cooldown begins upon release.
 */

export const REQUIEM_STORAGE_DURATION = 30.0;
export const REQUIEM_COOLDOWN = 75.0;
export const REQUIEM_RELEASE_MULTIPLIER = 1.25;
export const REQUIEM_SECONDARY_POISON_TICK_RATE = 0.2;
export const REQUIEM_SECONDARY_POISON_DURATION = 1.0;
export const REQUIEM_SECONDARY_POISON_TICK_FRACTION = 0.10;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "poison" || (game.player.phase && game.player.phase.phase < 12)) {
      return false;
    }

    // Cooldown check (only blocks if not currently in storage mode / ready to release)
    if (game.requiemCooldown > 0 && !game.isRequiemRecording && !game.isRequiemReadyToRelease) {
      return false;
    }

    // STAGE 2: Release Slash
    if (game.isRequiemRecording || game.isRequiemReadyToRelease) {
      const stored = Math.max(0, game.requiemStoredDamage || 0);
      const slashDamage = Math.round(stored * REQUIEM_RELEASE_MULTIPLIER);
      const secondaryTickDamage = Math.round(stored * REQUIEM_SECONDARY_POISON_TICK_FRACTION);

      // Reset storage states and start 75s cooldown
      game.isRequiemRecording = false;
      game.isRequiemReadyToRelease = false;
      game.requiemRecordingTimer = 0;
      game.requiemStoredDamage = 0;
      game.requiemCooldown = REQUIEM_COOLDOWN;

      // Calculate slash area: in front of player
      const angle = game.player.angle !== undefined ? game.player.angle : 0;
      const slashRadius = 180;
      const slashArc = Math.PI * 1.1;

      if (game.saveData.settings.screenShake) {
        game.camera.shake(18, 0.4);
      }

      // Visual execution burst
      if (Particle) {
        for (let i = 0; i < 45; i++) {
          const a = angle - slashArc * 0.5 + Math.random() * slashArc;
          const spd = 120 + Math.random() * 220;
          game.particles.push(
            new Particle(game.player.x, game.player.y, Math.cos(a) * spd, Math.sin(a) * spd, i % 2 === 0 ? "#86efac" : "#22c55e", 4.2, 0.5)
          );
        }
      }

      if (FloatingText) {
        game.floatingTexts.push(
          new FloatingText(game.player.x, game.player.y - 48, "VENOMOUS REQUIEM!", "#86efac", 22)
        );
      }

      // Deal slash damage & inflict secondary poison to enemies in arc
      if (game.npcs) {
        if (!game.activePoisonDots) game.activePoisonDots = [];
        const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;

        for (let n = 0; n < game.npcs.length; n++) {
          const npc = game.npcs[n];
          if (!npc || npc.isDead || npc.hp <= 0) continue;

          const dist = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
          if (dist > slashRadius + npc.radius) continue;

          const targetAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
          let diff = targetAngle - angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          if (Math.abs(diff) <= slashArc * 0.5) {
            // Apply 125% stored damage slash
            npc.takeDamage(slashDamage, angle, 400);
            if (showNumbers && FloatingText) {
              game.floatingTexts.push(new FloatingText(npc.x, npc.y - 20, `-${slashDamage}`, "#86efac", 22));
            }

            // Apply secondary poison
            if (secondaryTickDamage > 0) {
              game.activePoisonDots.push({
                npcId: npc.id,
                npc: npc,
                tickDamage: secondaryTickDamage,
                tickInterval: REQUIEM_SECONDARY_POISON_TICK_RATE,
                tickTimer: 0,
                remainingDuration: REQUIEM_SECONDARY_POISON_DURATION,
                source: "requiem_secondary"
              });
            }

            if (npc.hp <= 0 && !npc.isDead) {
              game.handleNpcDeath(npc);
            }
          }
        }
      }

      return true;
    }

    // STAGE 1: Start 30s Storage Mode
    game.isRequiemRecording = true;
    game.isRequiemReadyToRelease = false;
    game.requiemRecordingTimer = REQUIEM_STORAGE_DURATION;
    game.requiemStoredDamage = 0;

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 36, "REQUIEM: RECORDING!", "#22c55e", 18)
      );
    }

    return true;
  }
};
