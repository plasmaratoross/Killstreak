/**
 * soil — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawSoilBlade / Player.drawSoilAura)
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

    if (pNum === 9) {
      // --- PHASE 9: COLLAPSE (DELIBERATE WEAK PHASE — CRACKED, SHATTERED, CRUMBLING DIRT & STONE) ---
      ctx.shadowColor = "rgba(120, 113, 108, 0.4)";
      ctx.shadowBlur = 3;

      // Fractured weathered hilt
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(-7, -2.5, 6, 5);

      // Broken chipped crossguard
      ctx.fillStyle = "#52525b";
      ctx.beginPath();
      ctx.moveTo(-1, -6);
      ctx.lineTo(3, -4);
      ctx.lineTo(2, 4);
      ctx.lineTo(-2, 3);
      ctx.closePath();
      ctx.fill();

      // Jagged shattered earth blade with missing chunks
      ctx.fillStyle = "#78716c";
      ctx.beginPath();
      ctx.moveTo(3, -w * 0.4);
      ctx.lineTo(len * 0.3, -w * 0.35);
      ctx.lineTo(len * 0.35, -w * 0.1); // Broken notch
      ctx.lineTo(len * 0.65, -w * 0.3);
      ctx.lineTo(len * 0.8, -w * 0.05); // Broken chunk missing
      ctx.lineTo(len * 0.9, -w * 0.2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.7, w * 0.2);
      ctx.lineTo(len * 0.5, w * 0.05);
      ctx.lineTo(len * 0.3, w * 0.3);
      ctx.lineTo(3, w * 0.35);
      ctx.closePath();
      ctx.fill();

      // Deep crack fissures
      ctx.strokeStyle = "#292524";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(len * 0.15, 0);
      ctx.lineTo(len * 0.35, -w * 0.15);
      ctx.lineTo(len * 0.5, w * 0.1);
      ctx.lineTo(len * 0.75, -w * 0.05);
      ctx.stroke();

      // Faint dying sediment speck
      ctx.fillStyle = "rgba(217, 119, 6, 0.3)";
      ctx.fillRect(len * 0.4, -1, 4, 2);

      ctx.restore();
      return;
    }

    if (pNum === 10) {
      // --- PHASE 10: INDESTRUCTIBLE SOIL FORTRESS (COLOSSAL BASTION BLADE, MONOLITHIC BEDROCK & GOLDEN LIGHT) ---
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = player.isAttacking ? 35 : 20;

      // 1. Towering Citadel Crossguard (Heavy stone bulwarks with rampart flanges)
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(8, -26);
      ctx.lineTo(6, -6);
      ctx.lineTo(12, 0);
      ctx.lineTo(6, 6);
      ctx.lineTo(8, 26);
      ctx.lineTo(-10, 22);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      // Fortified Bronze / Gold Trim on Guard
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 2. Colossal Earthen Citadel Blade Body (Multi-layer Sedimentary & Bedrock Plate)
      const fortGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      fortGrad.addColorStop(0, "#d97706");   // Golden Lithified Edge
      fortGrad.addColorStop(0.2, "#78350f"); // Compacted Bedrock
      fortGrad.addColorStop(0.5, "#fef08a"); // Radiant Tectonic Vein
      fortGrad.addColorStop(0.8, "#78350f"); // Compacted Bedrock
      fortGrad.addColorStop(1, "#d97706");   // Golden Lithified Edge
      ctx.fillStyle = fortGrad;

      // Fortress ramparts and battlement barb spurs
      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.28, -w / 2);
      ctx.lineTo(len * 0.34, -w / 2 - 8); // Fortress Rampart Spur 1
      ctx.lineTo(len * 0.42, -w / 2);
      ctx.lineTo(len * 0.65, -w / 2);
      ctx.lineTo(len * 0.72, -w / 2 - 10); // Fortress Rampart Spur 2
      ctx.lineTo(len - 18, -w / 2);
      ctx.lineTo(len, 0); // Monolithic Citadel Apex
      ctx.lineTo(len - 18, w / 2);
      ctx.lineTo(len * 0.72, w / 2 + 10);
      ctx.lineTo(len * 0.65, w / 2);
      ctx.lineTo(len * 0.42, w / 2);
      ctx.lineTo(len * 0.34, w / 2 + 8);
      ctx.lineTo(len * 0.28, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 3. Central Glowing Golden Tectonic Fissure Core
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 14;
      ctx.fillRect(10, -2, len - 28, 4);

      // 4. Floating Tectonic Orbital Shards around Hilt
      const orb1 = anim * 3.5;
      const orb2 = orb1 + Math.PI;
      [orb1, orb2].forEach((oAng) => {
        const ox = Math.cos(oAng) * 20;
        const oy = Math.sin(oAng) * 11;
        ctx.fillStyle = "#b45309";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.2;
        ctx.fillRect(ox + 6, oy - 2.5, 5, 5);
        ctx.strokeRect(ox + 6, oy - 2.5, 5, 5);
      });

      ctx.restore();
      return;
    }

    // --- PHASES 1 to 8: PROGRESSIVE EARTH & FORTRESS BLADE ---
    ctx.shadowColor = player.phase.glowColor || "rgba(180, 83, 9, 0.6)";
    ctx.shadowBlur = player.isAttacking ? 18 : (pNum >= 6 ? 12 : 6);

    // Hilt / Crossguard
    if (pNum <= 3) {
      // Loose Dirt / Gathering Soil / Hardened Earth: rustic dirt handle
      ctx.fillStyle = "#451a03";
      ctx.fillRect(-6, -2.5, 6, 5);
      ctx.fillStyle = pNum === 3 ? "#78350f" : "#92400e";
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 + pNum * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Phases 4-8: Earthen Guard up to Immovable
      const guardW = 4 + pNum * 1.5;
      const guardH = 10 + pNum * 2.2;
      ctx.fillStyle = "#451a03";
      ctx.fillRect(-7, -2.5, 7, 5);
      ctx.fillStyle = pNum >= 7 ? "#78350f" : "#92400e";
      ctx.fillRect(0, -guardH / 2, guardW, guardH);
      ctx.strokeStyle = pNum >= 6 ? "#f59e0b" : "#b45309";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, -guardH / 2, guardW, guardH);
    }

    // Blade Body
    ctx.fillStyle = player.phase.color;
    ctx.beginPath();
    if (pNum === 1) {
      // Loose dirt: crude uneven edges
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 1);
      ctx.lineTo(len * 0.6, -w / 2 + 0.5);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.6, w / 2 - 0.5);
      ctx.lineTo(len * 0.3, w / 2 + 1);
      ctx.lineTo(2, w / 2);
    } else if (pNum <= 3) {
      // Gathering Soil / Hardened Earth: standard sturdy taper
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 6, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2);
      ctx.lineTo(2, w / 2);
    } else if (pNum <= 6) {
      // Earthen Guard, Deep Foundation, Dense Earth: layered stepped bevels
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.45, -w / 2);
      ctx.lineTo(len * 0.52, -w / 2 - 3);
      ctx.lineTo(len - 10, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 10, w / 2);
      ctx.lineTo(len * 0.52, w / 2 + 3);
      ctx.lineTo(len * 0.45, w / 2);
      ctx.lineTo(3, w / 2);
    } else {
      // Earth Fortress, Immovable (Phases 7-8): fortress crenellations
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2);
      ctx.lineTo(len * 0.36, -w / 2 - 5);
      ctx.lineTo(len * 0.44, -w / 2);
      ctx.lineTo(len * 0.68, -w / 2);
      ctx.lineTo(len * 0.74, -w / 2 - 6);
      ctx.lineTo(len - 14, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 14, w / 2);
      ctx.lineTo(len * 0.74, w / 2 + 6);
      ctx.lineTo(len * 0.68, w / 2);
      ctx.lineTo(len * 0.44, w / 2);
      ctx.lineTo(len * 0.36, w / 2 + 5);
      ctx.lineTo(len * 0.3, w / 2);
      ctx.lineTo(4, w / 2);
    }
    ctx.closePath();
    ctx.fill();

    // Trim / Edge Highlights
    if (pNum >= 4) {
      ctx.strokeStyle = pNum >= 7 ? "#f59e0b" : "#d97706";
      ctx.lineWidth = pNum >= 7 ? 1.8 : 1.2;
      ctx.stroke();
    }

    // Inner Core Vein (Sediment / Amber Light)
    if (pNum >= 3) {
      ctx.fillStyle = pNum >= 7 ? "rgba(254, 240, 138, 0.85)" : (pNum >= 5 ? "rgba(245, 158, 11, 0.7)" : "rgba(180, 83, 9, 0.6)");
      ctx.fillRect(pNum >= 5 ? 8 : 4, -1, len - (pNum >= 5 ? 18 : 10), 2);
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

    if (p === 9) {
      // Collapse: dry falling dirt fragments
      const pulse = Math.sin(anim * 3) * 1.5;
      ctx.strokeStyle = "rgba(120, 113, 108, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) {
        const a = anim * 1.2 + (i * Math.PI * 2 / 3);
        const dist = r + 8;
        ctx.fillStyle = "rgba(87, 83, 78, 0.6)";
        ctx.fillRect(Math.cos(a) * dist - 1.5, Math.sin(a) * dist - 1.5, 3, 3);
      }
      ctx.restore();
      return;
    }

    if (p === 10) {
      // Phase 10: Indestructible Soil Fortress - Colossal monolithic citadel aura
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 24;

      // Radiant concentric fortress barrier rings
      const pulse = Math.sin(anim * 5) * 3;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.9)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 24 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(254, 240, 138, 0.7)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 34 + pulse * 0.5, anim * 2, anim * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6 orbiting bedrock shield plates
      const plates = 6;
      for (let i = 0; i < plates; i++) {
        const ang = -anim * 2.5 + (i * Math.PI * 2 / plates);
        const pDist = r + 44 + Math.sin(anim * 4 + i) * 4;
        const px = Math.cos(ang) * pDist;
        const py = Math.sin(ang) * pDist;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang + Math.PI / 4);
        ctx.fillStyle = "#78350f";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1.4;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.strokeRect(-4, -4, 8, 8);
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    // Phases 1-8: Steady earthen ground aura
    if (p <= 3) {
      // Soft ground ripple
      const pulse = (anim * 14) % 16;
      const alpha = Math.max(0, 1 - pulse / 16);
      ctx.strokeStyle = `rgba(180, 83, 9, ${alpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p <= 6) {
      // Rotating earthen rune ring with bedrock dust
      ctx.strokeStyle = "rgba(217, 119, 6, 0.65)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 12, anim * 3, anim * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 4; i++) {
        const a = anim * 2.2 + (i * Math.PI / 2);
        const dist = r + 18;
        ctx.fillStyle = "rgba(245, 158, 11, 0.75)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Phases 7-8: Fortress Wall Ramparts
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(217, 119, 6, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 26, -anim * 2.5, -anim * 2.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
};
