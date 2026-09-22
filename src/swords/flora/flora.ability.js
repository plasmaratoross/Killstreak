/**
 * flora — primary (Z), flora, phase 4+.
 *
 * Extracted verbatim from js/game.js (Game.activateWorldroot) in Phase 2. `this` was
 * rebound to the `game` parameter; no damage value, cooldown, duration or
 * condition was altered.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that were file-scope bindings in js/game.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "flora" || game.player.phase.phase < 4) return false;
    if (game.worldrootCooldown > 0) return false;

    game.worldrootCooldown = 19.0;
    const rootRadius = 250;

    // Root all enemies within radius for 2.9s and deal 0.58x damage (15% enhanced)
    const rootDamage = Math.max(1, Math.round(game.player.damage * 0.58));
    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d <= rootRadius) {
        npc.rootTimer = 2.9;
        npc.takeDamage(rootDamage, Math.atan2(npc.y - game.player.y, npc.x - game.player.x), 50);
        if (game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
          game.floatingTexts.push(
            new FloatingText(npc.x, npc.y - 14, `-${rootDamage}`, "#22c55e", 17)
          );
        }
        if (npc.hp <= 0 && !npc.isDead) {
          game.handleNpcDeath(npc);
        }
      }
    }

    // Heal player 23% max HP over 4s (15% enhanced)
    game.player.worldrootHealTimer = 4.0;
    game.player.worldrootHealRate = (game.player.maxHp * 0.23) / 4.0;

    game.activeWorldroots.push({
      x: game.player.x,
      y: game.player.y,
      radius: rootRadius,
      timer: 1.2,
      maxTimer: 1.2
    });

    if (game.saveData.settings.screenShake) {
      game.camera.shake(9, 0.35);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.worldroot", { defaultValue: "WORLDROOT!" }) : "WORLDROOT!", "#4ade80", 19)
    );

    for (let i = 0; i < 28; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 180;
      const pColor = i % 2 === 0 ? "#4ade80" : "#15803d";
      game.particles.push(
        new Particle(game.player.x, game.player.y, Math.cos(pAngle) * speed, Math.sin(pAngle) * speed, pColor, 4.2, 0.55)
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
