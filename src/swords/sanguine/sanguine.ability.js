/**
 * sanguine — primary (Z), Bloodletting, phase 7+.
 *
 * Spec: unlocks at the first deliberate collapse (Phase 7: Flatline) — the sword
 * has no pulse of its own, so it takes yours. 26-second cooldown, radius is the
 * CURRENT phase's normal swing range, 400% of current sword damage to everything
 * inside, and the wielder is healed for 30% of the total damage dealt.
 *
 * THE COST IS CLAMPED SO IT CAN NEVER KILL YOU. 15% of current HP is taken, but
 * the taken amount is capped at `hp - 1`, so the ability can bring you to 1 HP and
 * no lower. A self-damaging ability that can kill its own user is a bug report
 * waiting to happen, and "you died to your own Z" is not a death this game has any
 * other precedent for. The heal is applied after the damage, from the real total
 * dealt, so a whiffed cast costs HP and returns nothing — that is the intended
 * risk, not an oversight.
 *
 * Healing is clamped to maxHp here because this is the only place that writes the
 * healed value.
 *
 * Guards follow src/swords/voltstrike/voltstrike.ability.js:
 * state -> equipped sword -> skill phase -> cooldown.
 */

export const BLOODLETTING_HP_COST_FRACTION = 0.15;
export const BLOODLETTING_DAMAGE_MULTIPLIER = 4.0;
export const BLOODLETTING_HEAL_FRACTION = 0.30;
export const BLOODLETTING_COOLDOWN = 26.0;

export default {
  /** @param {object} game */
  activate(game) {
    // Re-resolve entity classes that are file-scope bindings in js/entities.js.
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "sanguine" || game.player.phase.phase < 7) return false;
    if (game.bloodlettingCooldown > 0) return false;

    game.bloodlettingCooldown = BLOODLETTING_COOLDOWN;

    // Pay in blood first — capped so it can never be the thing that kills you.
    const cost = Math.max(0, Math.min(
      Math.floor(game.player.hp * BLOODLETTING_HP_COST_FRACTION),
      Math.floor(game.player.hp) - 1
    ));
    game.player.hp -= cost;

    const radius = game.player.radius + (game.player.phase.bladeLength || 50) + 10;
    const damage = Math.round((game.player.damage || game.player.phase.damage) * BLOODLETTING_DAMAGE_MULTIPLIER);
    const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;
    let totalDealt = 0;
    let hit = 0;

    // Snapshot first: handleNpcDeath mutates game.npcs.
    const targets = game.npcs.slice();
    for (let i = targets.length - 1; i >= 0; i--) {
      const npc = targets[i];
      if (npc.isDead || npc.hp <= 0) continue;
      const d = Math.hypot(npc.x - game.player.x, npc.y - game.player.y);
      if (d > radius + npc.radius) continue;

      const before = npc.hp;
      const hitAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
      npc.takeDamage(damage, hitAngle, 280);
      totalDealt += Math.max(0, before - npc.hp);
      hit++;

      if (showNumbers && FloatingText) {
        game.floatingTexts.push(new FloatingText(npc.x, npc.y - 16, `-${damage}`, "#fca5a5", 19));
      }

      if (npc.hp <= 0 && !npc.isDead) {
        game.handleNpcDeath(npc);
      }
    }

    const healed = Math.round(totalDealt * BLOODLETTING_HEAL_FRACTION);
    if (healed > 0) {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + healed);
      if (FloatingText) {
        game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 48, `+${healed}`, "#fecaca", 17));
      }
    }

    if (FloatingText) {
      game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 34, "BLOODLETTING!", "#fca5a5", 19));
      if (cost > 0) {
        game.floatingTexts.push(new FloatingText(game.player.x, game.player.y - 62, `-${cost}`, "#7f1d1d", 15));
      }
    }

    // Blood leaving the wielder and coming back as spray.
    if (Particle) {
      const motes = hit > 0 ? 36 : 20;
      for (let i = 0; i < motes; i++) {
        const angle = (i / motes) * Math.PI * 2;
        const speed = 130 + Math.random() * 250;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 3 === 0 ? "#fee2e2" : (i % 3 === 1 ? "#ef4444" : "#7f1d1d"),
            4.8, 0.6
          )
        );
      }
    }

    // The burst ring, decayed per-frame in js/game.js.
    if (!game.activeBloodlettings) game.activeBloodlettings = [];
    game.activeBloodlettings.push({
      x: game.player.x,
      y: game.player.y,
      radius: radius,
      timer: 0.6,
      maxTimer: 0.6
    });

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.sanguine_bloodletting_title", { defaultValue: "BLOODLETTING" }) : "BLOODLETTING";
      const desc = I18n
        ? I18n.t("toasts.sanguine_bloodletting_desc", { dealt: totalDealt, healed, defaultValue: `${totalDealt} damage dealt — healed ${healed} HP` })
        : `${totalDealt} damage dealt — healed ${healed} HP`;
      game.callbacks.onToast(title, desc, "🩸");
    }

    return true;
  }
};
