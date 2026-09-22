/**
 * devourer — primary (Z), devourer, phase 10+.
 *
 * Extracted verbatim from js/game.js (Game.activateGluttony) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "devourer" || game.player.phase.phase < 10) return false;
    if (game.gluttonyCooldown > 0) return false;

    game.gluttonyCooldown = 10.0;
    const baseDmg = game.player.damage || game.player.phase.damage;
    const phaseBonus = Math.max(0, game.player.phase.phase - 10) * 0.1;
    const damage = Math.round(baseDmg * (1.5 + phaseBonus));

    const beamLength = 420;
    const beamHalfWidth = 24;
    const angle = game.player.angle;
    const x1 = game.player.x;
    const y1 = game.player.y;
    const x2 = x1 + Math.cos(angle) * beamLength;
    const y2 = y1 + Math.sin(angle) * beamLength;

    game.activeBeam = {
      x1, y1, x2, y2,
      timer: 0.32,
      color: game.player.phase.color
    };

    if (game.saveData.settings.screenShake) {
      game.camera.shake(8, 0.25);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.gluttony") : "GLUTTONY!", "#38bdf8", 18)
    );

    // Hit all NPCs in beam trajectory
    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      const isHit = game.checkLineCircleCollision(x1, y1, x2, y2, npc.x, npc.y, npc.radius + beamHalfWidth);
      if (isHit) {
        game.player.timeSinceCombat = 0;
        npc.takeDamage(damage, angle, 220);

        if (game.saveData.settings.damageNumbers) {
          game.floatingTexts.push(
            new FloatingText(npc.x, npc.y - 14, `-${damage}`, "#38bdf8", 16)
          );
        }

        for (let p = 0; p < 8; p++) {
          const pAngle = angle + (Math.random() - 0.5) * 1.5;
          const pSpeed = 80 + Math.random() * 120;
          game.particles.push(
            new Particle(npc.x, npc.y, Math.cos(pAngle) * pSpeed, Math.sin(pAngle) * pSpeed, "#38bdf8", 3.8, 0.4)
          );
        }

        if (npc.hp <= 0) {
          game.handleNpcDeath(npc);
        }
      }
    }

    return true;
  }
};
