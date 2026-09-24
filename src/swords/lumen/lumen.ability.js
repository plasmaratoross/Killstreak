/**
 * lumen — primary (Z), Flash, phase 7+.
 *
 * Spec: unlocks at the first deliberate collapse (Phase 7: Eclipse), so the sword
 * is at its weakest when it gains its first real ability — the light is still
 * there, it is just being blocked. Radius is the CURRENT phase's normal swing
 * range, damage is 220% of the current sword damage, and everything caught in the
 * burst is stunned (rooted) for 1.4s. 26-second cooldown.
 *
 * Unlike Voltstrike's Zap this is explicitly an AREA burst: Lumen's identity is
 * "light arrives everywhere at once", so every valid enemy inside the radius is
 * hit, not only the nearest one. That is also why it does NOT refuse to fire on
 * an empty radius — a flash with nothing in it is still a flash (Voltstrike's
 * refusal exists because burning a precision cooldown on empty air reads as
 * broken; a screen-wide burst does not have that problem).
 *
 * The stun reuses `npc.rootTimer`, the same "cannot move or attack" timer Flora's
 * Worldroot and Voltstrike's Zap use, rather than introducing a parallel stun
 * system. As with those two, rootTimer does not suppress the physical-contact
 * attack path — a pre-existing quirk, deliberately left alone here.
 *
 * Guards follow src/swords/voltstrike/voltstrike.ability.js:
 * state -> equipped sword -> skill phase -> cooldown.
 */

export const FLASH_DAMAGE_MULTIPLIER = 2.2;
export const FLASH_STUN_DURATION = 1.4;
export const FLASH_COOLDOWN = 26.0;

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "lumen" || game.player.phase.phase < 7) return false;
    if (game.flashCooldown > 0) return false;

    game.flashCooldown = FLASH_COOLDOWN;

    // Radius is the CURRENT phase's swing range — the same maxReach expression
    // js/game.js uses for a normal swing.
    const radius = game.player.radius + (game.player.phase.bladeLength || 50) + 10;

    const flashDamage = Math.round((game.player.damage || game.player.phase.damage) * FLASH_DAMAGE_MULTIPLIER);
    const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;
    let stunned = 0;

    for (let i = game.npcs.length - 1; i >= 0; i--) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d > radius + npc.radius) continue;

      const hitAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
      npc.rootTimer = FLASH_STUN_DURATION;
      npc.takeDamage(flashDamage, hitAngle, 260);
      stunned++;

      if (showNumbers && FloatingText) {
        game.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${flashDamage}`, "#fef08a", 18));
      }

      if (npc.hp <= 0 && !npc.isDead) {
        game.handleNpcDeath(npc);
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "FLASH!", "#fef3c7", 19)
      );
    }

    // Light bursting outward in straight lines.
    if (Particle) {
      const rays = stunned > 0 ? 30 : 18;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const speed = 150 + Math.random() * 260;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#fef08a" : "#fbbf24"),
            4.6, 0.5
          )
        );
      }
    }

    // The burst ring, decayed per-frame in js/game.js.
    if (!game.activeFlashes) game.activeFlashes = [];
    game.activeFlashes.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: 0.55,
      maxTimer: 0.55
    });

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.lumen_flash_title", { defaultValue: "FLASH" }) : "FLASH";
      const desc = I18n
        ? I18n.t("toasts.lumen_flash_desc", { count: stunned, defaultValue: `${stunned} enemies blinded for 1.4s — 220% damage` })
        : `${stunned} enemies blinded for 1.4s — 220% damage`;
      game.callbacks.onToast(title, desc, "✨");
    }

    return true;
  }
};
