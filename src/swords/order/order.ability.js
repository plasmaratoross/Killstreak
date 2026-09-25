/**
 * order — primary (Z), Judgment, phase 4+.
 *
 * Spec:
 *   - Unlocks at Phase 4 (Ruin).
 *   - 45-second cooldown (starts after verdict is delivered).
 *   - 10-second marking window on first cast.
 *   - While active, touching an NPC marks it with `⚖ JUDGED`.
 *   - Second Z press (or expiry of 10s window) unleashes the Final Verdict:
 *     ALL marked targets take 500% current phase damage simultaneously (not split!).
 *   - Cancels cleanly on death, sword change, or returning to lobby.
 */

export const JUDGMENT_COOLDOWN = 45.0;
export const JUDGMENT_MARK_DURATION = 10.0;
export const JUDGMENT_DAMAGE_MULTIPLIER = 5.0;

/**
 * Execute the Final Verdict on all marked targets.
 * @param {object} game
 */
export function executeVerdict(game) {
  const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};
  const markedIds = game.judgmentMarkedNpcIds || [];
  game.judgmentMarkingTimer = 0;
  game.judgmentCooldown = JUDGMENT_COOLDOWN;

  const currentDmg = (game.player && (game.player.damage || (game.player.phase && game.player.phase.damage))) || 125000;
  const verdictDamage = Math.round(currentDmg * JUDGMENT_DAMAGE_MULTIPLIER);
  const showNumbers = game.saveData && game.saveData.settings && game.saveData.settings.damageNumbers;

  let totalDealt = 0;
  let targetCount = 0;

  // Snapshot targets: handleNpcDeath mutates game.npcs
  const targets = (game.npcs || []).slice();
  for (let i = targets.length - 1; i >= 0; i--) {
    const npc = targets[i];
    if (!npc || npc.isDead || npc.hp <= 0) continue;
    if (!markedIds.includes(npc.id)) continue;

    const before = npc.hp;
    const hitAngle = Math.atan2(npc.y - game.player.y, npc.x - game.player.x);
    npc.takeDamage(verdictDamage, hitAngle, 320);
    totalDealt += Math.max(0, before - npc.hp);
    targetCount++;

    if (showNumbers && FloatingText) {
      game.floatingTexts.push(new FloatingText(npc.x, npc.y - 20, `-${verdictDamage}`, "#fef08a", 24));
      game.floatingTexts.push(new FloatingText(npc.x, npc.y - 44, "⚖ JUDGED", "#ffffff", 18));
    }

    // Vertical strike beam particles
    if (Particle) {
      for (let p = 0; p < 24; p++) {
        const speed = 60 + Math.random() * 160;
        const pAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        game.particles.push(
          new Particle(npc.x, npc.y, Math.cos(pAngle) * speed, Math.sin(pAngle) * speed, p % 2 === 0 ? "#ffffff" : "#fef08a", 4.5, 0.5)
        );
      }
    }

    if (npc.hp <= 0 && !npc.isDead) {
      game.handleNpcDeath(npc);
    }
  }

  // Clear marked IDs
  game.judgmentMarkedNpcIds = [];

  // Visual & Sound Feedback
  if (game.camera) {
    game.camera.shake(targetCount > 0 ? 16 : 8, 0.4);
  }

  if (FloatingText && game.player) {
    game.floatingTexts.push(
      new FloatingText(game.player.x, game.player.y - 40, "VERDICT: FINAL!", "#ffffff", 22)
    );
  }

  if (game.callbacks && game.callbacks.onToast) {
    const I18n = window.Killstreak && window.Killstreak.I18n;
    const title = I18n ? I18n.t("toasts.order_verdict_title", { defaultValue: "FINAL VERDICT" }) : "FINAL VERDICT";
    const desc = I18n
      ? I18n.t("toasts.order_verdict_desc", { targets: targetCount, damage: totalDealt, defaultValue: `${targetCount} target(s) executed — ${totalDealt} total damage` })
      : `${targetCount} target(s) executed — ${totalDealt} total damage`;
    game.callbacks.onToast(title, desc, "⚖️");
  }

  return true;
}

export default {
  /** @param {object} game */
  activate(game) {
    const { Particle, FloatingText } = (window.Killstreak && window.Killstreak.Entities) || {};

    if (game.state !== "COMBAT" || game.isGameOver || game.isCutsceneActive) return false;
    if (!game.player || !game.player.isSwordEquipped || game.player.swordId !== "order" || (game.player.phase && game.player.phase.phase < 4)) {
      return false;
    }

    // If already in marking window, second Z press fires the verdict immediately!
    if (game.judgmentMarkingTimer > 0) {
      return executeVerdict(game);
    }

    // Cooldown check for first press
    if (game.judgmentCooldown > 0) return false;

    // Begin 10-second marking window
    game.judgmentMarkingTimer = JUDGMENT_MARK_DURATION;
    game.judgmentMarkedNpcIds = [];

    if (FloatingText && game.player) {
      game.floatingTexts.push(
        new FloatingText(game.player.x, game.player.y - 36, "JUDGMENT BEGINS!", "#fef08a", 20)
      );
    }

    if (Particle && game.player) {
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 90 + Math.random() * 120;
        game.particles.push(
          new Particle(
            game.player.x, game.player.y,
            Math.cos(angle) * speed, Math.sin(angle) * speed,
            i % 2 === 0 ? "#ffffff" : "#fef08a",
            4.0, 0.5
          )
        );
      }
    }

    if (game.callbacks && game.callbacks.onToast) {
      const I18n = window.Killstreak && window.Killstreak.I18n;
      const title = I18n ? I18n.t("toasts.order_judgment_title", { defaultValue: "JUDGMENT BEGINS" }) : "JUDGMENT BEGINS";
      const desc = I18n ? I18n.t("toasts.order_judgment_desc", { defaultValue: "Touch targets within 10s to mark them, then press [Z] again to execute." }) : "Touch targets within 10s to mark them, then press [Z] again to execute.";
      game.callbacks.onToast(title, desc, "⚖️");
    }

    return true;
  }
};
