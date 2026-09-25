/**
 * order — blade and phase-aura rendering.
 *
 * Order is the LAW / JUDGMENT sword.
 * Visual theme:
 *   - Silver, pure white, polished chrome and subtle gold law seals.
 *   - Dark geometric spine with razor-sharp white/silver edges.
 *   - Symmetrical Scale of Justice motif behind the player (especially phases 7+).
 *   - Phase 5: DELIBERATE COLLAPSE — cracked, dull gray blade, broken scale, flickering aura.
 *   - Phase 12: Absolute Judgment — pure white execution blade, black spine, rotating golden
 *               judgment seals, cosmic scale.
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`.
 */

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = (player.phase && player.phase.bladeLength) || 50;
    const w = (player.phase && player.phase.bladeWidth) || 4;
    const anim = player.animTimer || 0;
    const isCollapse = pNum === 5;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (isCollapse) {
      // Phase 5: DELIBERATE COLLAPSE — Brittle, cracked dull gray blade
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(0, -w * 0.8);
      ctx.lineTo(len * 0.45, -w * 0.8);
      ctx.lineTo(len * 0.5, -w * 0.3); // crack indentation
      ctx.lineTo(len * 0.7, -w * 0.7);
      ctx.lineTo(len * 0.85, 0);
      ctx.lineTo(len * 0.65, w * 0.7);
      ctx.lineTo(len * 0.4, w * 0.4); // crack
      ctx.lineTo(0, w * 0.8);
      ctx.closePath();
      ctx.fill();

      // Jagged crack lines
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(len * 0.2, 0);
      ctx.lineTo(len * 0.45, -w * 0.5);
      ctx.lineTo(len * 0.6, w * 0.4);
      ctx.lineTo(len * 0.8, -w * 0.2);
      ctx.stroke();

      // Broken scale guard
      ctx.fillStyle = "#475569";
      ctx.fillRect(-3, -w * 1.8, 6, w * 3.6);
      ctx.restore();
      return;
    }

    // Normal & High Phase Blades
    const glowColor = player.phase && player.phase.glowColor ? player.phase.glowColor : "rgba(255, 255, 255, 0.5)";
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = pNum >= 9 ? 16 : (pNum >= 6 ? 10 : 6);

    // Crossguard — Scale of Justice Crossbar
    const guardWidth = w * (pNum >= 9 ? 3.6 : (pNum >= 4 ? 3.0 : 2.4));
    ctx.fillStyle = pNum >= 9 ? "#fef08a" : "#cbd5e1";
    ctx.fillRect(-2, -guardWidth, 5, guardWidth * 2);

    // Small scale pans hanging from crossbar
    if (pNum >= 4) {
      ctx.strokeStyle = pNum >= 9 ? "rgba(254, 240, 138, 0.7)" : "rgba(203, 213, 225, 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Left pan
      ctx.moveTo(0, -guardWidth);
      ctx.lineTo(6, -guardWidth - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, -guardWidth - 4, 3, 0, Math.PI);
      ctx.stroke();
      // Right pan
      ctx.beginPath();
      ctx.moveTo(0, guardWidth);
      ctx.lineTo(6, guardWidth + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, guardWidth + 4, 3, 0, Math.PI);
      ctx.stroke();
    }

    // Main Blade Body (Silver / White Execution Blade)
    const grad = ctx.createLinearGradient(0, -w, 0, w);
    if (pNum >= 12) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.45, "#f8fafc");
      grad.addColorStop(0.5, "#0f172a"); // Dark central spine
      grad.addColorStop(0.55, "#f8fafc");
      grad.addColorStop(1, "#ffffff");
    } else if (pNum >= 6) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.48, "#e2e8f0");
      grad.addColorStop(0.5, "#334155");
      grad.addColorStop(0.52, "#e2e8f0");
      grad.addColorStop(1, "#ffffff");
    } else {
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.5, "#cbd5e1");
      grad.addColorStop(1, "#f8fafc");
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -w);
    ctx.lineTo(len * 0.85, -w * 0.9);
    ctx.lineTo(len, 0); // sharp chisel tip
    ctx.lineTo(len * 0.85, w * 0.9);
    ctx.lineTo(0, w);
    ctx.closePath();
    ctx.fill();

    // Central geometric judicial groove / light core
    ctx.strokeStyle = pNum >= 9 ? "#fef08a" : "#ffffff";
    ctx.lineWidth = pNum >= 10 ? 1.8 : 1.0;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(len * 0.8, 0);
    ctx.stroke();

    // Subtle geometric law runic notches along the edge
    if (pNum >= 3) {
      ctx.strokeStyle = pNum >= 9 ? "rgba(254, 240, 138, 0.8)" : "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1;
      const notches = pNum >= 8 ? 5 : 3;
      for (let n = 1; n <= notches; n++) {
        const nx = len * (n / (notches + 1));
        ctx.beginPath();
        ctx.moveTo(nx, -w * 0.85);
        ctx.lineTo(nx + 3, 0);
        ctx.lineTo(nx, w * 0.85);
        ctx.stroke();
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    if (pNum < 2) return; // minimal presence at phase 1
    const isCollapse = pNum === 5;
    const anim = player.animTimer || 0;

    ctx.save();

    if (isCollapse) {
      // Phase 5: Weak flickering gray sparks
      const sparkCount = 4;
      ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      for (let i = 0; i < sparkCount; i++) {
        const angle = anim * 2 + (i * Math.PI * 2 / sparkCount);
        const r = player.radius + 6 + Math.sin(anim * 4 + i) * 4;
        ctx.fillRect(player.x + Math.cos(angle) * r, player.y + Math.sin(angle) * r, 2, 2);
      }
      ctx.restore();
      return;
    }

    // Phase 2-4: Clean judicial circle with subtle scale ticks
    if (pNum < 6) {
      const radius = player.radius + 8 + Math.sin(anim * 3) * 2;
      ctx.strokeStyle = "rgba(248, 250, 252, 0.25)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Phase 6-8: Rotating Law Sigil
    const ringRadius = player.radius + 14 + (pNum >= 8 ? 6 : 0);
    ctx.strokeStyle = pNum >= 9 ? "rgba(254, 240, 138, 0.35)" : "rgba(248, 250, 252, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Geometric law seal triangles
    const sides = pNum >= 9 ? 6 : 4;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(anim * 0.4);
    ctx.strokeStyle = pNum >= 9 ? "rgba(254, 240, 138, 0.28)" : "rgba(255, 255, 255, 0.25)";
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const angle = (s * Math.PI * 2) / sides;
      const px = Math.cos(angle) * ringRadius;
      const py = Math.sin(angle) * ringRadius;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Phase 7+: Manifestation of the Scale of Justice behind the player
    if (pNum >= 7) {
      const scaleTilt = Math.sin(anim * 1.5) * 0.15;
      const scaleY = player.y - player.radius - 16;
      const barLen = pNum >= 12 ? 32 : (pNum >= 9 ? 26 : 20);

      ctx.save();
      ctx.translate(player.x, scaleY);
      ctx.rotate(scaleTilt);

      // Scale Beam
      ctx.strokeStyle = pNum >= 9 ? "rgba(254, 240, 138, 0.65)" : "rgba(248, 250, 252, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-barLen, 0);
      ctx.lineTo(barLen, 0);
      ctx.stroke();

      // Center pivot & stem
      ctx.fillStyle = pNum >= 9 ? "#fef08a" : "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Hanging chains and pans
      const panDrop = 10;
      // Left pan
      ctx.beginPath();
      ctx.moveTo(-barLen, 0);
      ctx.lineTo(-barLen - 3, panDrop);
      ctx.moveTo(-barLen, 0);
      ctx.lineTo(-barLen + 3, panDrop);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-barLen, panDrop, 4, 0, Math.PI);
      ctx.stroke();

      // Right pan
      ctx.beginPath();
      ctx.moveTo(barLen, 0);
      ctx.lineTo(barLen - 3, panDrop);
      ctx.moveTo(barLen, 0);
      ctx.lineTo(barLen + 3, panDrop);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(barLen, panDrop, 4, 0, Math.PI);
      ctx.stroke();

      ctx.restore();
    }

    // Phase 12: Absolute Judgment spatial judgment rays
    if (pNum >= 12) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      for (let r = 0; r < 4; r++) {
        const rayAngle = anim * 0.8 + (r * Math.PI / 2);
        const rLen = ringRadius + 18 + Math.sin(anim * 5 + r) * 6;
        ctx.beginPath();
        ctx.moveTo(player.x + Math.cos(rayAngle) * ringRadius, player.y + Math.sin(rayAngle) * ringRadius);
        ctx.lineTo(player.x + Math.cos(rayAngle) * rLen, player.y + Math.sin(rayAngle) * rLen);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
};
