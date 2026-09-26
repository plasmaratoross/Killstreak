/**
 * tremor — blade and phase-aura rendering.
 *
 * Tremor is the EARTHQUAKE sword.
 * Visual theme:
 *   - Brutal, colossal tectonic stone and obsidian blade.
 *   - Jagged basalt edges with incandescent magma cracks (#ea580c / #f97316 / #fdba74).
 *   - Heavy rock crossguard and floating orbiting boulders.
 *   - Phase 6: DELIBERATE COLLAPSE — fractured, dead crumbly gray stone, broken guard.
 *   - Phase 10: Tremor — immense volcanic tectonic blade, intense seismic distortion rings,
 *               orbiting boulders, ground fissures.
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`.
 */

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = (player.phase && player.phase.bladeLength) || 52;
    const w = (player.phase && player.phase.bladeWidth) || 6;
    const anim = player.animTimer || 0;
    const isCollapse = pNum === 6;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (isCollapse) {
      // Phase 6: DELIBERATE COLLAPSE — Crumbled, dead gray stone slab
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#57534e";
      ctx.beginPath();
      ctx.moveTo(0, -w);
      ctx.lineTo(len * 0.4, -w);
      ctx.lineTo(len * 0.45, -w * 0.4);
      ctx.lineTo(len * 0.65, -w * 0.8);
      ctx.lineTo(len * 0.75, 0);
      ctx.lineTo(len * 0.55, w * 0.7);
      ctx.lineTo(0, w);
      ctx.closePath();
      ctx.fill();

      // Dead crack lines
      ctx.strokeStyle = "#292524";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(len * 0.15, -w * 0.3);
      ctx.lineTo(len * 0.45, w * 0.2);
      ctx.lineTo(len * 0.6, -w * 0.2);
      ctx.stroke();

      // Broken rough guard
      ctx.fillStyle = "#44403c";
      ctx.fillRect(-3, -w * 1.5, 6, w * 3);
      ctx.restore();
      return;
    }

    // Normal & High Phase Blades
    const glowColor = (player.phase && player.phase.glowColor) || "rgba(234, 88, 12, 0.5)";
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = pNum >= 9 ? 18 : (pNum >= 7 ? 12 : (pNum >= 3 ? 8 : 4));

    // Rock Guard — blocky volcanic crossguard
    const guardWidth = w * (pNum >= 8 ? 2.8 : (pNum >= 4 ? 2.4 : 2.0));
    ctx.fillStyle = pNum >= 7 ? "#1c1917" : "#292524";
    ctx.fillRect(-4, -guardWidth, 8, guardWidth * 2);

    if (pNum >= 3) {
      // Glowing magma vein in guard
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(-1, -guardWidth * 0.7, 2, guardWidth * 1.4);
    }

    // Main Blade Slab (Dark Basalt / Tectonic Stone)
    const stoneGrad = ctx.createLinearGradient(0, -w, 0, w);
    if (pNum >= 8) {
      stoneGrad.addColorStop(0, "#0c0a09");
      stoneGrad.addColorStop(0.3, "#1c1917");
      stoneGrad.addColorStop(0.5, "#431407"); // Volcanic heat inside
      stoneGrad.addColorStop(0.7, "#1c1917");
      stoneGrad.addColorStop(1, "#0c0a09");
    } else if (pNum >= 4) {
      stoneGrad.addColorStop(0, "#1c1917");
      stoneGrad.addColorStop(0.5, "#292524");
      stoneGrad.addColorStop(1, "#1c1917");
    } else {
      stoneGrad.addColorStop(0, "#44403c");
      stoneGrad.addColorStop(0.5, "#57534e");
      stoneGrad.addColorStop(1, "#44403c");
    }

    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.moveTo(0, -w);
    // Jagged tectonic silhouette
    ctx.lineTo(len * 0.35, -w * 1.05);
    ctx.lineTo(len * 0.4, -w * 0.95);
    ctx.lineTo(len * 0.75, -w * 1.08);
    ctx.lineTo(len, -w * 0.3); // Heavy blunt chisel point
    ctx.lineTo(len * 0.95, w * 0.5);
    ctx.lineTo(len * 0.7, w * 1.05);
    ctx.lineTo(len * 0.35, w * 0.95);
    ctx.lineTo(0, w);
    ctx.closePath();
    ctx.fill();

    // Jagged basalt edge outline
    ctx.strokeStyle = pNum >= 7 ? "#f97316" : (pNum >= 3 ? "#ea580c" : "#78716c");
    ctx.lineWidth = pNum >= 8 ? 2.0 : 1.2;
    ctx.stroke();

    // Central Magma Fractures / Tectonic Fault Lines
    if (pNum >= 2) {
      const crackColor = pNum >= 9 ? "#fdba74" : (pNum >= 5 ? "#f97316" : "#ea580c");
      ctx.strokeStyle = crackColor;
      ctx.lineWidth = pNum >= 8 ? 2.5 : (pNum >= 4 ? 1.8 : 1.2);
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(len * 0.25, -w * 0.3);
      ctx.lineTo(len * 0.45, w * 0.35);
      ctx.lineTo(len * 0.7, -w * 0.2);
      ctx.lineTo(len * 0.9, w * 0.15);
      ctx.stroke();

      // Secondary branching fissures
      if (pNum >= 5) {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(len * 0.45, w * 0.35);
        ctx.lineTo(len * 0.55, w * 0.75);
        ctx.moveTo(len * 0.7, -w * 0.2);
        ctx.lineTo(len * 0.78, -w * 0.7);
        ctx.stroke();
      }
    }

    // Orbiting rock shards near blade tip for high phases
    if (pNum >= 7) {
      ctx.fillStyle = "#292524";
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1;
      const shardCount = pNum >= 10 ? 4 : 2;
      for (let s = 0; s < shardCount; s++) {
        const sAngle = anim * 3 + (s * Math.PI * 2 / shardCount);
        const sDist = w * 1.5 + Math.sin(anim * 4 + s) * 3;
        const sx = len * 0.75 + Math.cos(sAngle) * sDist;
        const sy = Math.sin(sAngle) * sDist;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
        ctx.strokeRect(sx - 2, sy - 2, 4, 4);
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    if (pNum < 2) return;
    const isCollapse = pNum === 6;
    const anim = player.animTimer || 0;

    ctx.save();

    if (isCollapse) {
      // Phase 6: Occasional weak dust specks
      ctx.fillStyle = "rgba(120, 113, 108, 0.35)";
      for (let i = 0; i < 3; i++) {
        const angle = anim * 1.5 + (i * Math.PI * 2 / 3);
        const r = player.radius + 4 + Math.sin(anim * 2 + i) * 3;
        ctx.fillRect(player.x + Math.cos(angle) * r, player.y + Math.sin(angle) * r, 2.5, 2.5);
      }
      ctx.restore();
      return;
    }

    // Phase 2-5: Concentric ground tremor rings
    const ringRadius = player.radius + 10 + (pNum >= 7 ? 8 : (pNum >= 4 ? 4 : 0));
    const pulse = Math.sin(anim * 4) * 3;

    ctx.strokeStyle = pNum >= 7 ? "rgba(249, 115, 22, 0.4)" : "rgba(234, 88, 12, 0.3)";
    ctx.lineWidth = pNum >= 8 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, ringRadius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Radial shockwave ticks on the ring
    const ticks = pNum >= 8 ? 8 : (pNum >= 4 ? 6 : 4);
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(anim * 0.6);
    ctx.strokeStyle = pNum >= 7 ? "rgba(251, 146, 60, 0.5)" : "rgba(168, 162, 158, 0.4)";
    ctx.lineWidth = 1.5;
    for (let t = 0; t < ticks; t++) {
      const a = (t * Math.PI * 2) / ticks;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * ringRadius, Math.sin(a) * ringRadius);
      ctx.lineTo(Math.cos(a) * (ringRadius + 5), Math.sin(a) * (ringRadius + 5));
      ctx.stroke();
    }
    ctx.restore();

    // Phase 7+: Floating boulders orbiting the player
    if (pNum >= 7) {
      const boulderCount = pNum >= 10 ? 5 : (pNum >= 8 ? 4 : 3);
      for (let b = 0; b < boulderCount; b++) {
        const bAngle = anim * 1.8 + (b * Math.PI * 2 / boulderCount);
        const bDist = ringRadius + 14 + Math.sin(anim * 3 + b) * 4;
        const bx = player.x + Math.cos(bAngle) * bDist;
        const by = player.y + Math.sin(bAngle) * bDist;
        const bSize = pNum >= 10 ? 4.5 : 3.5;

        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ea580c";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Phase 10: Tremor — Violent tectonic ground cracks beneath player
    if (pNum >= 10) {
      ctx.strokeStyle = "rgba(251, 146, 60, 0.6)";
      ctx.lineWidth = 2.0;
      for (let c = 0; c < 4; c++) {
        const cAngle = (c * Math.PI / 2) + Math.sin(anim * 2 + c) * 0.2;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + Math.cos(cAngle) * (ringRadius * 1.3), player.y + Math.sin(cAngle) * (ringRadius * 1.3));
        ctx.stroke();
      }
    }

    ctx.restore();
  }
};
