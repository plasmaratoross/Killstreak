/**
 * windy — blade and phase-aura rendering.
 *
 * Windy is the AERIAL sword: it must read as fast and weightless rather than
 * heavy. Every silhouette here is deliberately slim, and the auras are open
 * rotating rings and streaks instead of the dense filled shapes the heavier
 * swords use. As the spec puts it, Windy does not become stronger by becoming
 * heavier — it becomes faster, larger and harder to contain.
 *
 * Phase bands:
 *   1-3   Breeze / Draft / Gust      — near-plain blade, a few drifting specks
 *   4-6   Airflow / Gale / Squall    — swirling particles, growing vortex ring
 *   7     Tempest                    — the first true storm (major milestone)
 *   8     Calm                       — DELIBERATELY plain: the calm before the
 *                                      storm. Almost no aura, almost no
 *                                      particles, a quiet and near-bare blade.
 *   9-10  Awakening / Cyclone        — wind returns, organized rotating vortex
 *   11-13 Typhoon / Supercell /      — multiple rotating layers, atmospheric
 *         Ultimate Tempest             rings, constant debris
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = player.phase.bladeLength;
    const w = player.phase.bladeWidth;
    const anim = player.animTimer || 0;
    const accent = player.phase.color;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (pNum === 8) {
      // Phase 8: Calm — the storm goes silent. Bare, muted, deliberately plain:
      // no glow, no streaks, a dull grey edge. This is a weak phase and the art
      // must not sell it as an upgrade.
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = "#a1a1aa";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 6, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#71717a";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (pNum <= 3) {
      // Phases 1-3: Breeze / Draft / Gust — a faint current around a simple blade.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 12 : 5;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 8, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 8, w / 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Faint wind streaks trailing off the edge.
      ctx.strokeStyle = "rgba(248, 250, 252, 0.5)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const off = -w / 2 - 3 - i * 3;
        ctx.beginPath();
        ctx.moveTo(6, off);
        ctx.lineTo(len * 0.7 + Math.sin(anim * 4 + i) * 3, off);
        ctx.stroke();
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Airflow / Gale / Squall — swirling air, fluid trails.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 20 : 11;

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(-4, -w - 4);
      ctx.lineTo(3, -w - 3);
      ctx.lineTo(2, 0);
      ctx.lineTo(3, w + 3);
      ctx.lineTo(-4, w + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#0c4a6e");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#f8fafc");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#0c4a6e");
      ctx.fillStyle = grad;

      // Slim, swept blade with a fine notched spine.
      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      for (let i = 1; i <= 3; i++) {
        const fx = (len * 0.8 * i) / 3;
        ctx.lineTo(fx - 5, -w / 2);
        ctx.lineTo(fx - 1, -w / 2 - 2.5);
        ctx.lineTo(fx, -w / 2);
      }
      ctx.lineTo(len, 0);
      for (let i = 3; i >= 1; i--) {
        const fx = (len * 0.8 * i) / 3;
        ctx.lineTo(fx, w / 2);
        ctx.lineTo(fx - 1, w / 2 + 2.5);
        ctx.lineTo(fx - 5, w / 2);
      }
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Wind streaks that flow slightly past the tip.
      ctx.strokeStyle = "rgba(224, 242, 254, 0.6)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const off = -w / 2 - 3 - i * 3.5;
        const reach = len * (0.85 + i * 0.06) + Math.sin(anim * 5 + i * 1.7) * 4;
        ctx.beginPath();
        ctx.moveTo(5, off);
        ctx.lineTo(reach, off);
        ctx.stroke();
      }
    } else if (pNum === 7) {
      // Phase 7: Tempest — the first true storm. Wider, denser, debris nearby.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 28 : 16;

      ctx.fillStyle = "#082f49";
      ctx.beginPath();
      ctx.moveTo(-6, -w - 8);
      ctx.lineTo(5, -w - 6);
      ctx.lineTo(3, 0);
      ctx.lineTo(5, w + 6);
      ctx.lineTo(-6, w + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#075985");
      grad.addColorStop(0.35, accent);
      grad.addColorStop(0.5, "#f0f9ff");
      grad.addColorStop(0.65, accent);
      grad.addColorStop(1, "#075985");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 5);
      ctx.lineTo(len * 0.55, -w / 2);
      ctx.lineTo(len * 0.95, -w / 2 + 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.95, w / 2 - 2);
      ctx.lineTo(len * 0.55, w / 2);
      ctx.lineTo(len * 0.3, w / 2 + 5);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#bae6fd";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Debris caught in the blade's slipstream.
      for (let i = 0; i < 5; i++) {
        const t = anim * 6 + i * 1.3;
        const dx = 8 + ((i * 17 + anim * 40) % (len + 10));
        const dy = (i % 2 === 0 ? -1 : 1) * (w / 2 + 5 + Math.sin(t) * 3);
        ctx.fillStyle = i % 2 === 0 ? "#7dd3fc" : "#e0f2fe";
        ctx.fillRect(dx, dy, 3, 1.6);
      }
    } else if (pNum <= 10) {
      // Phases 9-10: Awakening / Cyclone — wind returns, organized rotation.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 30 : 17;

      ctx.fillStyle = "#083344";
      ctx.beginPath();
      ctx.moveTo(-6, -w - 10);
      ctx.lineTo(6, -w - 8);
      ctx.lineTo(4, 0);
      ctx.lineTo(6, w + 8);
      ctx.lineTo(-6, w + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#155e75");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#ecfeff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#155e75");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(5, -w / 2);
      ctx.lineTo(len * 0.35, -w / 2 - 6);
      ctx.lineTo(len * 0.6, -w / 2 - 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.6, w / 2 + 2);
      ctx.lineTo(len * 0.35, w / 2 + 6);
      ctx.lineTo(5, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#cffafe";
      ctx.lineWidth = 2;
      ctx.stroke();

      // A rotating core line — the "organized" part of the pattern.
      ctx.strokeStyle = "rgba(207, 250, 254, 0.75)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(len - 6, 0);
      ctx.stroke();
    } else {
      // Phases 11-13: Typhoon / Supercell / Ultimate Tempest — maximum density.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 38 : 22;

      ctx.fillStyle = "#042f2e";
      ctx.beginPath();
      ctx.moveTo(-8, -w - 14);
      ctx.lineTo(7, -w - 11);
      ctx.lineTo(5, 0);
      ctx.lineTo(7, w + 11);
      ctx.lineTo(-8, w + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.6;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#164e63");
      grad.addColorStop(0.25, accent);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.75, accent);
      grad.addColorStop(1, "#164e63");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.2, -w / 2 - 8);
      ctx.lineTo(len * 0.45, -w / 2 - 4);
      ctx.lineTo(len * 0.7, -w / 2 - 8);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.7, w / 2 + 8);
      ctx.lineTo(len * 0.45, w / 2 + 4);
      ctx.lineTo(len * 0.2, w / 2 + 8);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f0fdff";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Multiple parallel wind streaks: the "several rotating layers" motif.
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        const off = -w / 2 - 4 - i * 4;
        const phase = Math.sin(anim * 7 + i * 1.1) * 5;
        ctx.strokeStyle = `rgba(240, 253, 255, ${0.65 - i * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(6, off);
        ctx.lineTo(len * (0.9 + i * 0.04) + phase, off);
        ctx.stroke();
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const p = (player.phase && player.phase.phase) || 1;
    const r = player.radius;
    const anim = player.animTimer || 0;

    ctx.save();
    ctx.translate(player.x, player.y);

    if (p === 8) {
      // Phase 8: Calm — quiet atmosphere. One faint, static ring and nothing else.
      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p >= 11) {
      // Phases 11-13: multiple rotating atmospheric layers + constant debris.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = p === 13 ? 26 : 18;

      ctx.strokeStyle = player.phase.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1.8;
      for (let layer = 0; layer < 3; layer++) {
        const dir = layer % 2 === 0 ? 1 : -1;
        const radius = r + 30 + layer * 7;
        ctx.strokeStyle = `rgba(224, 242, 254, ${0.55 - layer * 0.13})`;
        ctx.setLineDash([12 + layer * 4, 7]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, dir * anim * (2.2 + layer * 0.5), dir * anim * (2.2 + layer * 0.5) + Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const count = p === 13 ? 9 : 6;
      for (let i = 0; i < count; i++) {
        const a = anim * 3 + (i * Math.PI * 2) / count;
        const dist = r + 30 + Math.sin(anim * 2 + i) * 8;
        ctx.fillStyle = i % 2 === 0 ? player.phase.color : "#f0fdff";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p >= 9) {
      // Phases 9-10: the wind returns and starts to organize.
      ctx.strokeStyle = player.phase.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 17, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(207, 250, 254, 0.7)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([9, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 25, -anim * 2.6, -anim * 2.6 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 5; i++) {
        const a = anim * 2.2 + (i * Math.PI * 2) / 5;
        ctx.fillStyle = i % 2 === 0 ? "#22d3ee" : "#ecfeff";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (r + 25), Math.sin(a) * (r + 25), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 7) {
      // Phase 7: Tempest — the storm announces itself.
      ctx.strokeStyle = "rgba(125, 211, 252, 0.8)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 15, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const a = anim * 2 + (i * Math.PI) / 2;
        ctx.fillStyle = "#7dd3fc";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (r + 19), Math.sin(a) * (r + 19), 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p >= 4) {
      // Phases 4-6: swirling air around the wielder.
      ctx.strokeStyle = "rgba(125, 211, 252, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = anim * 1.8 + (i * Math.PI * 2) / 3;
        ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (r + 13), Math.sin(a) * (r + 13), 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Phases 1-3: almost no aura — just a drifting speck.
      ctx.fillStyle = "rgba(248, 250, 252, 0.5)";
      const a = anim * 1.4;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (r + 8), Math.sin(a) * (r + 8), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
