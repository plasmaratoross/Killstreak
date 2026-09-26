/**
 * umbra — secondary (X), Erasure, phase 12+.
 *
 * Spec: unlocks at the second deliberate collapse (Phase 12: Unravelling) — the
 * singularity comes apart and the sword finally learns to simply remove things.
 * 70-second cooldown, area of 3x the current normal swing range.
 *
 * The two halves of the effect are deliberately asymmetric:
 *   - any enemy at or below 25% of its MAX HP is erased outright (reduced to 0 HP
 *     and killed through handleNpcDeath, so drops, killstreak and the respawn
 *     queue all behave exactly as they do for a normal kill);
 *   - everything above that threshold takes 200% of current sword damage.
 *
 * The execute threshold is measured against `npc.maxHp`, not the current HP pool,
 * so it cannot drift if an NPC is later given temporary HP.
 *
 * Enemies with no `maxHp` (defensive: a partially-constructed NPC) are treated as
 * above the threshold and take the damage instead. That is the safe direction —
 * it can never delete something outright by accident.
 *
 * Guards follow src/swords/voltstrike/voltstrike.ability.js:
 * state -> equipped sword -> skill phase -> cooldown.
 */

export const ERASURE_EXECUTE_THRESHOLD = 0.25;
export const ERASURE_DAMAGE_MULTIPLIER = 2.0;
export const ERASURE_COOLDOWN = 70.0;
/** Area is 3x the sword's current normal swing range. */
export const ERASURE_AREA_MULTIPLIER = 3;

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "umbra" || game.player.phase.phase < 12) return false;
    if (game.erasureCooldown > 0) return false;

    game.erasureCooldown = ERASURE_COOLDOWN;

    const swingReach = game.player.radius + (game.player.phase.bladeLength || 86) + 10;
    const radius = swingReach * ERASURE_AREA_MULTIPLIER;
    const erasureDamage = Math.round((game.player.damage || game.player.phase.damage) * ERASURE_DAMAGE_MULTIPLIER);
    const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;
    let erased = 0;
    let damaged = 0;

    // Snapshot first: handleNpcDeath mutates game.npcs, and this loop kills.
    const targets = game.npcs.slice();
    for (let i = targets.length - 1; i >= 0; i--) {
      const npc = targets[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d > radius + npc.radius) continue;

      const maxHp = typeof npc.maxHp === "number" ? npc.maxHp : 0;
      const isExecutable = maxHp > 0 && npc.hp <= maxHp * ERASURE_EXECUTE_THRESHOLD;

      if (isExecutable) {
        erased++;
        if (showNumbers && FloatingText) {
          game.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, "ERASED", "#f5f3ff", 17));
        }
        npc.hp = 0;
        game.handleNpcDeath(npc);
        continue;
      }

      damaged++;
      const hitAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
      npc.takeDamage(erasureDamage, hitAngle, 260);
      if (showNumbers && FloatingText) {
        game.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${erasureDamage}`, "#c4b5fd", 18));
      }
      if (npc.hp <= 0 && !npc.isDead) {
        game.handleNpcDeath(npc);
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 34, "ERASURE!", "#f5f3ff", 20)
      );
    }

    // Anything the execute caught dissolves inward; the rest just gets thrown.
    if (Particle) {
      const motes = erased > 0 ? 40 : 24;
      for (let i = 0; i < motes; i++) {
        const angle = (i / motes) * Math.PI * 2;
        const start = radius * (0.25 + Math.random() * 0.75);
        const speed = 90 + Math.random() * 190;
        game.particles.push(
          new Particle(
            game.player.x + Math.cos(angle) * start,
            game.player.y + Math.sin(angle) * start,
            -Math.cos(angle) * speed, -Math.sin(angle) * speed,
            i % 2 === 0 ? "#ffffff" : "#7c3aed",
            4.6, 0.7
          )
        );
      }
    }

    // The erasure boundary, decayed per-frame in js/game.js.
    if (!game.activeErasures) game.activeErasures = [];
    game.activeErasures.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: 0.9,
      maxTimer: 0.9
    });

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.umbra_erasure_title", { defaultValue: "ERASURE" }) : "ERASURE";
      const desc = I18n
        ? I18n.t("toasts.umbra_erasure_desc", { erased, damaged, defaultValue: `${erased} erased outright, ${damaged} damaged for 200%` })
        : `${erased} erased outright, ${damaged} damaged for 200%`;
      game.callbacks.onToast(title, desc, "🕳️");
    }

    return true;
  }
};
