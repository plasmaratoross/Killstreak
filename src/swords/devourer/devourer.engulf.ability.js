/**
 * devourer — secondary (X), devourer, phase 17+.
 *
 * Extracted verbatim from js/game.js (Game.activateEngulf) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "devourer" || game.player.phase.phase < 17) return false;
    if (game.engulfCooldown > 0) return false;

    game.engulfCooldown = 45.0;
    game.isEngulfActive = true;
    game.player.isEngulfActive = true;
    game.engulfTimer = 3.0;
    game.engulfTickTimer = 0;

    if (game.saveData.settings.screenShake) {
      game.camera.shake(14, 0.45);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 40, I18n ? I18n.t("floating.engulf") : "ENGULF!", "#facc15", 22)
    );

    for (let p = 0; p < 35; p++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const color = p % 2 === 0 ? "#facc15" : "#7c3aed";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4.5, 0.6)
      );
    }

    return true;
  }
};
