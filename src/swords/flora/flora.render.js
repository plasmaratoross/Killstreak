/**
 * flora — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawFloraBlade / Player.drawFloraAura)
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
      // Phases 1-3: Sprout / Rooted / Growing
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 15 : 6;

      ctx.fillStyle = "#78350f";
      ctx.fillRect(-2, -w * 0.8, 4, w * 1.6);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#22c55e");
      grad.addColorStop(0.5, "#4ade80");
      grad.addColorStop(1, "#15803d");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.quadraticCurveTo(len * 0.5, -w * 0.7, len, 0);
      ctx.quadraticCurveTo(len * 0.5, w * 0.7, 2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#86efac";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = "#bbf7d0";
      ctx.fillRect(4, -0.8, len - 12, 1.6);
    } else if (pNum <= 6) {
      // Phases 4-6: Thorned / Wild / Ancient
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 22 : 12;

      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(-1, 0, w + 4, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#166534");
      grad.addColorStop(0.3, "#22c55e");
      grad.addColorStop(0.7, "#15803d");
      grad.addColorStop(1, "#14532d");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      for (let i = 1; i <= 4; i++) {
        const fx = (len * 0.8 * i) / 4;
        ctx.lineTo(fx - 6, -w / 2);
        ctx.lineTo(fx - 2, -w / 2 - 4);
        ctx.lineTo(fx, -w / 2);
      }
      ctx.lineTo(len, 0);
      for (let i = 4; i >= 1; i--) {
        const fx = (len * 0.8 * i) / 4;
        ctx.lineTo(fx, w / 2);
        ctx.lineTo(fx - 2, w / 2 + 4);
        ctx.lineTo(fx - 6, w / 2);
      }
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "#86efac";
      ctx.fillRect(6, -1.5, len - 20, 3);
    } else if (pNum <= 9) {
      // Phases 7-9: Overgrown / Colossus / Worldroot
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = player.isAttacking ? 28 : 16;

      ctx.fillStyle = "#271202";
      ctx.beginPath();
      ctx.moveTo(-8, -w - 10);
      ctx.lineTo(6, -w - 12);
      ctx.lineTo(4, 0);
      ctx.lineTo(6, w + 12);
      ctx.lineTo(-8, w + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#15803d");
      grad.addColorStop(0.2, "#86efac");
      grad.addColorStop(0.5, "#14532d");
      grad.addColorStop(0.8, "#86efac");
      grad.addColorStop(1, "#15803d");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(5, -w / 2);
      ctx.lineTo(len * 0.25, -w / 2 - 4);
      ctx.lineTo(len * 0.5, -w / 2);
      ctx.lineTo(len * 0.75, -w / 2 - 6);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.75, w / 2 + 6);
      ctx.lineTo(len * 0.5, w / 2);
      ctx.lineTo(len * 0.25, w / 2 + 4);
      ctx.lineTo(5, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#bbf7d0";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.fillStyle = "#dcfce7";
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 12;
      ctx.fillRect(8, -2, len - 24, 4);
    } else {
      // Phase 10: Evergrowth
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = player.isAttacking ? 35 : 22;

      ctx.fillStyle = "#1c0d02";
      ctx.beginPath();
      ctx.moveTo(-10, -w - 16);
      ctx.lineTo(8, -w - 20);
      ctx.lineTo(5, -w / 2);
      ctx.lineTo(12, 0);
      ctx.lineTo(5, w / 2);
      ctx.lineTo(8, w + 20);
      ctx.lineTo(-10, w + 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#22c55e");
      grad.addColorStop(0.2, "#86efac");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.8, "#86efac");
      grad.addColorStop(1, "#22c55e");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.2, -w / 2 - 6);
      ctx.lineTo(len * 0.4, -w / 2);
      ctx.lineTo(len * 0.6, -w / 2 - 10);
      ctx.lineTo(len * 0.8, -w / 2 - 4);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.8, w / 2 + 4);
      ctx.lineTo(len * 0.6, w / 2 + 10);
      ctx.lineTo(len * 0.4, w / 2);
      ctx.lineTo(len * 0.2, w / 2 + 6);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.8;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#86efac";
      ctx.shadowBlur = 18;
      ctx.fillRect(10, -2.5, len - 28, 5);

      for (let i = 0; i < 5; i++) {
        const sAng = anim * 2.5 + (i * Math.PI * 2) / 5;
        const sDist = 16 + i * 9;
        const sx = Math.cos(sAng) * sDist + len * 0.45;
        const sy = Math.sin(sAng) * 16;
        ctx.fillStyle = "#86efac";
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
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 22;
      ctx.strokeStyle = "rgba(74, 222, 128, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(34, 197, 94, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 28, anim * 2, anim * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 6; i++) {
        const a = anim * 1.8 + (i * Math.PI / 3);
        const dist = r + 36;
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p >= 7) {
      ctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 15, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p >= 4) {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};
