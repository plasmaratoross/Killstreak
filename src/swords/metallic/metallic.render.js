/**
 * metallic — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawMetallicBlade / Player.drawMetallicAura)
 * in Phase 2. `this` was rebound to the `player` parameter; no drawing
 * instruction, colour, coordinate or condition was altered.
 */

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = player.phase.bladeLength;
    const w = player.phase.bladeWidth;
    const anim = player.animTimer || 0;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (pNum <= 3) {
      // Phases 1-3: Scrap / Forged / Tempered
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 15 : 6;

      ctx.fillStyle = "#334155";
      ctx.fillRect(-2, -w - 3, 4, (w + 3) * 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#94a3b8");
      grad.addColorStop(0.5, pNum === 3 ? "#f1f5f9" : "#cbd5e1");
      grad.addColorStop(1, "#475569");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 10, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 10, w / 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (pNum >= 2) {
        ctx.fillStyle = pNum === 3 ? "#f8fafc" : "#64748b";
        ctx.fillRect(4, -1, len - 16, 2);
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Steelbound / Reinforced / Hardened
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 22 : 12;

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-4, -w - 6);
      ctx.lineTo(5, -w - 8);
      ctx.lineTo(3, w + 8);
      ctx.lineTo(-4, w + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#cbd5e1");
      grad.addColorStop(0.25, "#64748b");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.75, "#64748b");
      grad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.4, -w / 2);
      ctx.lineTo(len * 0.45, -w / 2 - 3);
      ctx.lineTo(len - 14, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 14, w / 2);
      ctx.lineTo(len * 0.45, w / 2 + 3);
      ctx.lineTo(len * 0.4, w / 2);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(6, -1.5, len - 22, 3);
    } else if (pNum <= 9) {
      // Phases 7-9: Forgemaster / Iron Fortress / Unyielding
      ctx.shadowColor = "#e2e8f0";
      ctx.shadowBlur = player.isAttacking ? 30 : 16;

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(-6, -w - 10);
      ctx.lineTo(6, -w - 12);
      ctx.lineTo(4, -w / 2);
      ctx.lineTo(8, 0);
      ctx.lineTo(4, w / 2);
      ctx.lineTo(6, w + 12);
      ctx.lineTo(-6, w + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.2, "#475569");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.8, "#475569");
      grad.addColorStop(1, "#f8fafc");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2);
      ctx.lineTo(len * 0.35, -w / 2 - 5);
      ctx.lineTo(len * 0.7, -w / 2 - 2);
      ctx.lineTo(len - 18, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 18, w / 2);
      ctx.lineTo(len * 0.7, w / 2 + 2);
      ctx.lineTo(len * 0.35, w / 2 + 5);
      ctx.lineTo(len * 0.3, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.fillRect(8, -2, len - 26, 4);
    } else {
      // Phase 10: Eternal Steel
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = player.isAttacking ? 36 : 22;

      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.moveTo(-10, -w - 14);
      ctx.lineTo(8, -w - 18);
      ctx.lineTo(6, -w / 2);
      ctx.lineTo(12, 0);
      ctx.lineTo(6, w / 2);
      ctx.lineTo(8, w + 18);
      ctx.lineTo(-10, w + 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2.8;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.18, "#64748b");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.82, "#64748b");
      grad.addColorStop(1, "#ffffff");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.25, -w / 2);
      ctx.lineTo(len * 0.32, -w / 2 - 8);
      ctx.lineTo(len * 0.65, -w / 2 - 4);
      ctx.lineTo(len * 0.72, -w / 2 - 10);
      ctx.lineTo(len - 22, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 22, w / 2);
      ctx.lineTo(len * 0.72, w / 2 + 10);
      ctx.lineTo(len * 0.65, w / 2 + 4);
      ctx.lineTo(len * 0.32, w / 2 + 8);
      ctx.lineTo(len * 0.25, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#f8fafc";
      ctx.shadowBlur = 18;
      ctx.fillRect(10, -2.5, len - 30, 5);

      for (let i = 0; i < 4; i++) {
        const sAng = anim * 3 + (i * Math.PI * 2) / 4;
        const sDist = 18 + i * 8;
        const sx = Math.cos(sAng) * sDist + len * 0.4;
        const sy = Math.sin(sAng) * 14;
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
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

    if (p === 10) {
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "rgba(248, 250, 252, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18, 0, Math.PI * 2);
      ctx.stroke();

      const sides = 8;
      ctx.rotate(anim * 1.5);
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides;
        const px = Math.cos(a) * (r + 26);
        const py = Math.sin(a) * (r + 26);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(203, 213, 225, 0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const a = -anim * 2.5 + (i * Math.PI / 2);
        const dist = r + 34;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.cos(a) * dist - 3, Math.sin(a) * dist - 3, 6, 6);
      }
    } else if (p >= 7) {
      ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 16, anim * 2, anim * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (p >= 4) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};
