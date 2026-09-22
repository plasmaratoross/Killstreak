/**
 * soil — primary (Z), soil, phase 4+.
 *
 * Extracted verbatim from js/game.js (Game.activateFortitude) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "soil" || game.player.phase.phase < 4) return false;
    if (game.fortitudeCooldown > 0) return false;

    game.fortitudeCooldown = 20.0;
    const shieldAmount = Math.max(1, Math.round(game.player.hp * 0.15));
    game.player.shield = shieldAmount;
    game.player.maxShield = shieldAmount;
    game.player.shieldDuration = 5.0;

    if (game.saveData.settings.screenShake) {
      game.camera.shake(7, 0.25);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.fortitude") : "FORTITUDE!", "#f59e0b", 19)
    );

    for (let i = 0; i < 24; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      const pColor = i % 2 === 0 ? "#f59e0b" : "#78350f";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(pAngle) * speed, Math.sin(pAngle) * speed, pColor, 4.0, 0.5)
      );
    }

    if (game.callbacks.onSkillsUpdate) {
      game.callbacks.onSkillsUpdate({
        isSwordEquipped: game.player.isSwordEquipped,
        swordId: game.player.swordId,
        gluttonyCooldown: game.gluttonyCooldown,
        engulfCooldown: game.engulfCooldown,
        isEngulfActive: game.isEngulfActive,
        tsunamiCooldown: game.tsunamiCooldown,
        fortitudeCooldown: game.fortitudeCooldown,
        shield: game.player.shield,
        ironWillCooldown: game.ironWillCooldown,
        ironWillActive: Boolean(game.player.ironWillActive || game.player.ironWillTimer > 0),
        worldrootCooldown: game.worldrootCooldown,
        cataclysmCooldown: game.cataclysmCooldown,
        phase: game.player.phase.phase
      });
    }
    return true;
  }
};
