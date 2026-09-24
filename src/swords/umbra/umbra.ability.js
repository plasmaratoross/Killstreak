/**
 * umbra — primary (Z), Gravity Well, phase 7+.
 *
 * Spec: unlocks at the first deliberate collapse (Phase 7: Unmaking) — the void
 * eats its own edge and learns to reach outward instead. 30-second cooldown, area
 * of 3x the CURRENT phase's normal swing range, 180% of current sword damage, and
 * every enemy inside is physically ripped toward the wielder.
 *
 * The pull reuses the existing NPC `x`/`y` fields and nothing else: enemies are
 * moved to just outside the player's own radius, so they end up in melee range
 * rather than inside the player. It deliberately does NOT clamp against walls or
 * obstacles — the collision system does not expose a push-out helper, and
 * faking one here would be the third implementation of collision in the codebase.
 * Enemies that land in scenery will walk out of it on their normal pathing, which
 * is the same behaviour a respawning enemy has.
 *
 * The pull is instant rather than a timed force. A multi-frame pull would need new
 * per-NPC velocity state; an instant reposition reads identically at these
 * distances and keeps the NPC model untouched.
 *
 * Guards follow src/swords/voltstrike/voltstrike.ability.js:
 * state -> equipped sword -> skill phase -> cooldown.
 */

export const GRAVITY_WELL_DAMAGE_MULTIPLIER = 1.8;
export const GRAVITY_WELL_COOLDOWN = 30.0;
/** Area is 3x the sword's current normal swing range. */
export const GRAVITY_WELL_AREA_MULTIPLIER = 3;

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "umbra" || game.player.phase.phase < 7) return false;
    if (game.gravityWellCooldown > 0) return false;

    game.gravityWellCooldown = GRAVITY_WELL_COOLDOWN;

    const swingReach = game.player.radius + (game.player.phase.bladeLength || 72) + 10;
    const radius = swingReach * GRAVITY_WELL_AREA_MULTIPLIER;
    const wellDamage = Math.round((game.player.damage || game.player.phase.damage) * GRAVITY_WELL_DAMAGE_MULTIPLIER);
    const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;
    let caught = 0;

    // Snapshot the list first: takeDamage can kill an NPC and call
    // handleNpcDeath, which mutates game.npcs while we are walking it.
    const targets = game.npcs.slice();
    for (let i = targets.length - 1; i >= 0; i--) {
      const npc = targets[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const dx = npc.x - game.player.x;
      const dy = npc.y - game.player.y;
      const d = Math.hypot(dx, dy);
      if (d > radius + npc.radius) continue;
      if (d > 0.001) {
        // Land just outside the player's body, not inside it.
        const stop = game.player.radius + npc.radius + 4;
        npc.x = game.player.x + (dx / d) * stop;
        npc.y = game.player.y + (dy / d) * stop;
      }
      caught++;

      const hitAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
      npc.takeDamage(wellDamage, hitAngle, 220);

      if (showNumbers && FloatingText) {
        game.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${wellDamage}`, "#c4b5fd", 18));
      }

      if (npc.hp <= 0 && !npc.isDead) {
        game.handleNpcDeath(npc);
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "GRAVITY WELL!", "#c4b5fd", 19)
      );
    }

    // Matter streaming inward from the rim of the well.
    if (Particle) {
      const motes = caught > 0 ? 34 : 20;
      for (let i = 0; i < motes; i++) {
        const angle = (i / motes) * Math.PI * 2;
        const start = radius * (0.6 + Math.random() * 0.4);
        const speed = 120 + Math.random() * 220;
        game.particles.push(
          new Particle(
            game.player.x + Math.cos(angle) * start,
            game.player.y + Math.sin(angle) * start,
            -Math.cos(angle) * speed, -Math.sin(angle) * speed,
            i % 3 === 0 ? "#f5f3ff" : (i % 3 === 1 ? "#c4b5fd" : "#7c3aed"),
            4.4, 0.6
          )
        );
      }
    }

    // The well ring, decayed per-frame in js/game.js.
    if (!game.activeGravityWells) game.activeGravityWells = [];
    game.activeGravityWells.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: 0.75,
      maxTimer: 0.75
    });

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.umbra_gravity_title", { defaultValue: "GRAVITY WELL" }) : "GRAVITY WELL";
      const desc = I18n
        ? I18n.t("toasts.umbra_gravity_desc", { count: caught, defaultValue: `${caught} enemies dragged in — 180% damage` })
        : `${caught} enemies dragged in — 180% damage`;
      game.callbacks.onToast(title, desc, "🕳️");
    }

    return true;
  }
};
