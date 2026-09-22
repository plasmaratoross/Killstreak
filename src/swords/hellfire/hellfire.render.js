/**
 * hellfire — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawHellfireBlade / Player.drawHellfireAura)
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
      // Phases 1-3: Ember / Flame / Blazing
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 18 : 8;

      ctx.fillStyle = "#18181b";
      ctx.fillRect(-2, -w - 2, 4, (w + 2) * 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#ea580c");
      grad.addColorStop(0.5, "#fbbf24");
      grad.addColorStop(1, "#dc2626");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 8, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 8, w / 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.fillRect(4, -1, len - 14, 2);
    } else if (pNum <= 6) {
      // Phases 4-6: Infernal / Hellborn / Magma
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 25 : 14;

      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.moveTo(-5, -w - 8);
      ctx.lineTo(4, -w - 6);
      ctx.lineTo(2, 0);
      ctx.lineTo(4, w + 6);
      ctx.lineTo(-5, w + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#7f1d1d");
      grad.addColorStop(0.25, "#dc2626");
      grad.addColorStop(0.5, "#fbbf24");
      grad.addColorStop(0.75, "#ea580c");
      grad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      for (let i = 1; i <= 4; i++) {
        const fx = (len * 0.85 * i) / 4;
        ctx.lineTo(fx - 7, -w / 2);
        ctx.lineTo(fx - 2, -w / 2 - 4);
        ctx.lineTo(fx, -w / 2);
      }
      ctx.lineTo(len, 0);
      for (let i = 4; i >= 1; i--) {
        const fx = (len * 0.85 * i) / 4;
        ctx.lineTo(fx, w / 2);
        ctx.lineTo(fx - 2, w / 2 + 4);
        ctx.lineTo(fx - 7, w / 2);
      }
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(6, -1.8, len - 22, 3.6);
    } else if (pNum <= 9) {
      // Phases 7-9: Devastation / Cataclysm / Apocalypse
      ctx.shadowColor = "#dc2626";
      ctx.shadowBlur = player.isAttacking ? 32 : 18;

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(-8, -w - 14);
      ctx.lineTo(6, -w - 16);
      ctx.lineTo(4, 0);
      ctx.lineTo(6, w + 16);
      ctx.lineTo(-8, w + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2.4;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#450a0a");
      grad.addColorStop(0.2, "#dc2626");
      grad.addColorStop(0.5, "#fbbf24");
      grad.addColorStop(0.8, "#dc2626");
      grad.addColorStop(1, "#450a0a");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(5, -w / 2);
      ctx.lineTo(len * 0.25, -w / 2 - 6);
      ctx.lineTo(len * 0.5, -w / 2);
      ctx.lineTo(len * 0.75, -w / 2 - 8);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.75, w / 2 + 8);
      ctx.lineTo(len * 0.5, w / 2);
      ctx.lineTo(len * 0.25, w / 2 + 6);
      ctx.lineTo(5, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 14;
      ctx.fillRect(8, -2.2, len - 26, 4.4);
    } else {
      // Phase 10: The Infernal
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = player.isAttacking ? 40 : 25;

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(-12, -w - 20);
      ctx.lineTo(10, -w - 24);
      ctx.lineTo(6, -w / 2);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, w / 2);
      ctx.lineTo(10, w + 24);
      ctx.lineTo(-12, w + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#000000");
      grad.addColorStop(0.15, "#dc2626");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.85, "#dc2626");
      grad.addColorStop(1, "#000000");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.2, -w / 2 - 8);
      ctx.lineTo(len * 0.4, -w / 2);
      ctx.lineTo(len * 0.6, -w / 2 - 12);
      ctx.lineTo(len * 0.8, -w / 2 - 6);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.8, w / 2 + 6);
      ctx.lineTo(len * 0.6, w / 2 + 12);
      ctx.lineTo(len * 0.4, w / 2);
      ctx.lineTo(len * 0.2, w / 2 + 8);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 3.2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 20;
      ctx.fillRect(10, -3, len - 32, 6);

      for (let i = 0; i < 6; i++) {
        const sAng = anim * 3.5 + (i * Math.PI * 2) / 6;
        const sDist = 18 + i * 8;
        const sx = Math.cos(sAng) * sDist + len * 0.4;
        const sy = Math.sin(sAng) * 16;
        ctx.fillStyle = i % 2 === 0 ? "#ef4444" : "#fbbf24";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
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
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 24;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 28, -anim * 3, -anim * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 6; i++) {
        const a = anim * 2.5 + (i * Math.PI / 3);
        const dist = r + 36;
        ctx.fillStyle = i % 2 === 0 ? "#dc2626" : "#f97316";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p >= 7) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 15, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p >= 4) {
      ctx.strokeStyle = "rgba(220, 38, 38, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};
