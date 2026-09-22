/**
 * aquatic — primary (Z), aquatic, phase 9+.
 *
 * Extracted verbatim from js/game.js (Game.activateTsunami) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText, TsunamiWave } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "aquatic" || game.player.phase.phase < 9) return false;
    if (game.tsunamiCooldown > 0) return false;

    game.tsunamiCooldown = 12.0;
    const angle = game.player.angle;
    const pNum = game.player.phase.phase;
    const damage = Math.round(game.player.damage * 4);

    const startDist = game.player.radius + 15;
    const waveX = game.player.x + Math.cos(angle) * startDist;
    const waveY = game.player.y + Math.sin(angle) * startDist;

    game.activeTsunamis.push(new TsunamiWave(waveX, waveY, angle, damage, pNum));

    if (game.saveData.settings.screenShake) {
      game.camera.shake(pNum >= 12 ? 14 : 9, 0.3);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.tsunami") : "TSUNAMI!", "#06b6d4", 19)
    );

    for (let i = 0; i < 22; i++) {
      const pAngle = angle + (Math.random() - 0.5) * 1.2;
      const speed = 90 + Math.random() * 160;
      const pColor = i % 2 === 0 ? "#06b6d4" : "#ffffff";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(pAngle) * speed, Math.sin(pAngle) * speed, pColor, 3.8, 0.45)
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
        phase: game.player.phase.phase
      });
    }
    return true;
  }
};
