/**
 * hellfire — primary (Z), hellfire, phase 4+.
 *
 * Extracted verbatim from js/game.js (Game.activateCataclysm) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "hellfire" || game.player.phase.phase < 4) return false;
    if (game.cataclysmCooldown > 0) return false;

    game.cataclysmCooldown = 15.3;
    const blastRadius = 290;
    const blastDamage = Math.round(game.player.damage * 5.75);

    // Eruption AoE dealing 5.75x weapon damage (15% enhanced)
    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d <= blastRadius) {
        const knockAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
        npc.takeDamage(blastDamage, knockAngle, 320);
        if (game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
          game.floatingTexts.push(
            new FloatingText(npc.x, npc.y - 16, `-${blastDamage}`, "#ef4444", 19)
          );
        }
        if (npc.hp <= 0 && !npc.isDead) {
          game.handleNpcDeath(npc);
        }
      }
    }

    game.activeCataclysms.push({
      x: game.player.x,
      y: game.player.y,
      radius: blastRadius,
      timer: 0.8,
      maxTimer: 0.8
    });

    if (game.saveData.settings.screenShake) {
      game.camera.shake(16, 0.45);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.cataclysm", { defaultValue: "CATACLYSM!" }) : "CATACLYSM!", "#ef4444", 21)
    );

    for (let i = 0; i < 35; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240;
      const pColor = i % 3 === 0 ? "#ef4444" : (i % 3 === 1 ? "#f97316" : "#fbbf24");
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(pAngle) * speed, Math.sin(pAngle) * speed, pColor, 5.0, 0.6)
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
