/**
 * voltstrike — primary (Z), Zap, phase 5+.
 *
 * Spec: unlock at phase 5 (deliberately during the first collapse, so the sword is
 * physically weak but gains its first real ability), radius equal to the CURRENT
 * normal swing range, 125% of current sword damage, 1.75-second stun, 30-second
 * cooldown. It strikes ONE target — Voltstrike must never drift into being an AoE
 * sword, so only the nearest valid enemy inside the swing radius is hit and the
 * visual branches deal no secondary damage.
 *
 * The stun reuses `npc.rootTimer`, the same "cannot move or attack" timer Flora's
 * Worldroot uses, rather than introducing a parallel stun system. Note that
 * rootTimer does not suppress the physical-contact attack path — a pre-existing
 * quirk that also applies to Flora, deliberately left alone here.
 *
 * Unlike the other swords' abilities this one REFUSES to fire when nothing is in
 * range, and does not start its cooldown — burning a 30-second cooldown on empty
 * air would make the ability feel broken rather than precise.
 *
 * Guards follow src/swords/frostbite/frostbite.ability.js: state -> equipped sword
 * -> skill phase -> cooldown.
 */

export const ZAP_DAMAGE_MULTIPLIER = 1.25;
export const ZAP_STUN_DURATION = 1.75;
export const ZAP_COOLDOWN = 30.0;

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "voltstrike" || game.player.phase.phase < 5) return false;
    if (game.zapCooldown > 0) return false;

    // Radius is the CURRENT phase's swing range — the same maxReach expression
    // js/game.js uses for a normal swing.
    const radius = game.player.radius + (game.player.phase.bladeLength || 74) + 10;

    // SINGLE TARGET: the nearest valid enemy inside that radius.
    let target = null;
    let bestDist = Infinity;
    for (let i = 0; i < game.npcs.length; i++) {
      const npc = game.npcs[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d <= radius + npc.radius && d < bestDist) {
        bestDist = d;
        target = npc;
      }
    }

    // No target means no cast and no cooldown.
    if (!target) return false;

    game.zapCooldown = ZAP_COOLDOWN;

    const zapDamage = Math.round((game.player.damage || game.player.phase.damage) * ZAP_DAMAGE_MULTIPLIER);
    const hitAngle = Math.atan2(target.y - game.player.y, target.x - game.player.x);

    // Stun first, so the strike lands on an already-stunned target.
    target.rootTimer = ZAP_STUN_DURATION;
    target.takeDamage(zapDamage, hitAngle, 260);

    const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;
    if (showNumbers && FloatingText) {
      game.floatingTexts.push(new FloatingText(target.x, target.y - 16, `-${zapDamage}`, "#fde047", 19));
      game.floatingTexts.push(new FloatingText(target.x, target.y - 32, "ZAP!", "#fef08a", 15));
    }

    // Electrical particles that linger briefly around the struck target.
    if (Particle) {
      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 150;
        game.particles.push(
          new Particle(
            target.x, target.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#fde047" : "#7dd3fc"),
            4.2, 0.45
          )
        );
      }
    }

    // The bolt itself, drawn from the wielder to the target for a few frames.
    if (!game.activeZaps) game.activeZaps = [];
    game.activeZaps.push({
      x0: game.player.x,
      y0: game.player.y,
      x1: target.x,
      y1: target.y,
      seed: Math.floor(Math.random() * 1000),
      timer: 0.22,
      maxTimer: 0.22
    });

    if (target.hp <= 0 && !target.isDead) {
      game.handleNpcDeath(target);
    }

    return true;
  }
};
