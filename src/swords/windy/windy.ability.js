/**
 * windy — primary (Z), Cyclone, phase 4+.
 *
 * Spec: unlock at phase 4, 35-second cooldown, radius 3x the normal sword swing
 * radius, damage 550% of current sword damage (Current Damage x 5.5).
 *
 * The normal swing radius is `player.radius + phase.bladeLength + 10` — the same
 * `maxReach` js/game.js computes for a regular swing — so Cyclone is exactly 3x
 * that value at every phase.
 *
 * Behaviour order mirrors the spec: wind gathers, the wielder spins, the vortex
 * expands to 3x swing radius, everything inside is struck, then it disperses and
 * the 35-second cooldown begins.
 *
 * Guards follow src/swords/hellfire/hellfire.ability.js rather than inventing a
 * new pattern: state -> equipped sword -> skill phase -> cooldown.
 */

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "windy" || game.player.phase.phase < 4) return false;
    if (game.cycloneCooldown > 0) return false;

    game.cycloneCooldown = 35.0;

    // 3x the normal sword swinging radius (same expression as game.js maxReach).
    const bladeLength = game.player.phase.bladeLength || 40;
    const vortexRadius = (game.player.radius + bladeLength + 10) * 3;
    const vortexDamage = Math.round(game.player.damage * 5.5);

    // Enemies inside the vortex are hit by air pressure.
    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d <= vortexRadius) {
        // Knock toward the centre is what a vortex does, so the pull direction is
        // inverted relative to an outward blast like Cataclysm.
        const pullAngle = Math.atan2(game.player.y - npc.y, game.player.x - npc.x);
        npc.takeDamage(vortexDamage, pullAngle, 220);
        if (game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers) {
          game.floatingTexts.push(
            new FloatingText(npc.x, npc.y - 16, `-${vortexDamage}`, "#22d3ee", 19)
          );
        }
        if (npc.hp <= 0 && !npc.isDead) {
          game.handleNpcDeath(npc);
        }
      }
    }

    game.activeCyclones.push({
      x: game.player.x,
      y: game.player.y,
      radius: vortexRadius,
      timer: 0.8,
      maxTimer: 0.8
    });

    if (game.saveData.settings.screenShake) {
      game.camera.shake(14, 0.4);
    }

    const I18n = window.Killstreak && window.Killstreak.I18n;
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 36, I18n ? I18n.t("floating.cyclone", { defaultValue: "CYCLONE!" }) : "CYCLONE!", "#22d3ee", 21)
    );

    // Wind gathers: fast, light specks rather than the heavy Cataclysm embers.
    for (let i = 0; i < 40; i++) {
      const pAngle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 260;
      const pColor = i % 3 === 0 ? "#67e8f9" : (i % 3 === 1 ? "#22d3ee" : "#e0f2fe");
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
        cycloneCooldown: game.cycloneCooldown,
        phase: game.player.phase.phase
      });
    }
    return true;
  }
};
