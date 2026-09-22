/**
 * overdrive — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawOverdriveBlade / Player.drawOverdriveAura)
 * in Phase 2. `this` was rebound to the `player` parameter; no drawing
 * instruction, colour, coordinate or condition was altered.
 */

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = player.phase.phase;
    const len = player.phase.bladeLength;
    const w = player.phase.bladeWidth;
    const anim = player.animTimer || 0;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (pNum <= 3) {
      // --- PHASES 1 to 3: NEEDLE RAPIER ---
      // Slender needle rapier with swept cup hilt and crimson/white accents
      const isP1 = pNum === 1;
      const isP2 = pNum === 2;
      const isP3 = pNum === 3;

      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 22 : 10;

      // Swept Cup Hilt Guard
      ctx.fillStyle = isP2 ? "#991b1b" : "#475569";
      ctx.beginPath();
      ctx.arc(-2, 0, 7 + pNum * 1.5, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isP2 ? "#ffffff" : "#ef4444";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crossbar
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(-1, -6 - pNum * 2, 2.5, 12 + pNum * 4);

      // Needle Rapier Blade
      const bladeGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      if (isP2) {
        bladeGrad.addColorStop(0, "#ffffff");
        bladeGrad.addColorStop(0.5, "#ef4444");
        bladeGrad.addColorStop(1, "#ffffff");
      } else if (isP3) {
        bladeGrad.addColorStop(0, "#ffffff");
        bladeGrad.addColorStop(0.3, "#f8fafc");
        bladeGrad.addColorStop(0.5, "#ef4444");
        bladeGrad.addColorStop(1, "#ffffff");
      } else {
        bladeGrad.addColorStop(0, "#f1f5f9");
        bladeGrad.addColorStop(0.5, "#ffffff");
        bladeGrad.addColorStop(1, "#cbd5e1");
      }
      ctx.fillStyle = bladeGrad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len * 0.82, -w * 0.35);
      ctx.lineTo(len, 0); // Needle sharp point
      ctx.lineTo(len * 0.82, w * 0.35);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      // Central Red/White Fuller Spine
      ctx.fillStyle = isP2 ? "#ffffff" : "#ef4444";
      ctx.fillRect(4, -0.6, len * 0.75, 1.2);

      if (isP3) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(len - 2, 0);
        ctx.stroke();
      }

    } else if (pNum === 4) {
      // --- PHASE 4: TACHYON EDGE (AERODYNAMIC TRANSITIONAL SPEED BLADE) ---
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = player.isAttacking ? 28 : 14;

      // Aerodynamic Angled Guard
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(6, -8);
      ctx.lineTo(4, 8);
      ctx.lineTo(-6, 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Sleek Tachyon Blade
      const bladeGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      bladeGrad.addColorStop(0, "#ffffff");
      bladeGrad.addColorStop(0.2, "#dc2626");
      bladeGrad.addColorStop(0.8, "#991b1b");
      bladeGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = bladeGrad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.65, -w * 0.45);
      ctx.lineTo(len - 10, -w * 0.2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 8, w * 0.35);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      // Dual Tachyon Vent Lines
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(8, -1.5, len * 0.6, 1);
      ctx.fillRect(12, 0.5, len * 0.5, 1);

    } else {
      // --- PHASES 5 to 7: CURVED KATANA ---
      // Elegant curved katana silhouette with white hamon, crimson habaki/tsuba
      const isP5 = pNum === 5;
      const isP6 = pNum === 6;
      const isP7 = pNum === 7;

      ctx.shadowColor = isP7 ? "#ef4444" : (isP6 ? "#dc2626" : "#ffffff");
      ctx.shadowBlur = player.isAttacking ? (isP7 ? 40 : 30) : (isP7 ? 24 : 16);

      // Habaki (Blade Collar)
      ctx.fillStyle = isP7 ? "#facc15" : "#dc2626";
      ctx.fillRect(0, -w * 0.6, 6, w * 1.2);

      // Tsuba (Katana Guard)
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(-2, 0, 4, 12 + (pNum - 5) * 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isP7 ? "#ffffff" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Curved Katana Blade
      ctx.save();
      const curveOffset = len * 0.08;
      const hamonGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      if (isP7) {
        hamonGrad.addColorStop(0, "#ffffff");
        hamonGrad.addColorStop(0.4, "#f8fafc");
        hamonGrad.addColorStop(0.7, "#ef4444");
        hamonGrad.addColorStop(1, "#ffffff");
      } else if (isP6) {
        hamonGrad.addColorStop(0, "#991b1b");
        hamonGrad.addColorStop(0.3, "#dc2626");
        hamonGrad.addColorStop(0.8, "#ffffff");
        hamonGrad.addColorStop(1, "#ffffff");
      } else {
        hamonGrad.addColorStop(0, "#1e293b");
        hamonGrad.addColorStop(0.4, "#e2e8f0");
        hamonGrad.addColorStop(0.8, "#ef4444");
        hamonGrad.addColorStop(1, "#ffffff");
      }
      ctx.fillStyle = hamonGrad;

      ctx.beginPath();
      ctx.moveTo(6, -w * 0.45);
      ctx.quadraticCurveTo(len * 0.5, -w * 0.45 - curveOffset * 0.5, len - 14, -w * 0.35 - curveOffset);
      ctx.lineTo(len, -curveOffset);
      ctx.lineTo(len - 12, w * 0.4 - curveOffset * 0.8);
      ctx.quadraticCurveTo(len * 0.5, w * 0.45 - curveOffset * 0.3, 6, w * 0.45);
      ctx.closePath();
      ctx.fill();

      // Hamon Pattern
      ctx.strokeStyle = isP7 ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(10, w * 0.15);
      const waves = 8;
      const waveStep = (len - 25) / waves;
      for (let i = 0; i < waves; i++) {
        const wx = 10 + i * waveStep;
        const wy = w * 0.15 - curveOffset * ((i + 1) / waves) * 0.7;
        const waveAmp = (i % 2 === 0 ? -1.8 : 1.8);
        ctx.quadraticCurveTo(wx + waveStep * 0.5, wy + waveAmp, wx + waveStep, wy);
      }
      ctx.stroke();

      // Phase 7 Apex Godspeed Lightning Arcs
      if (isP7) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let lx = 8;
        let ly = 0;
        ctx.moveTo(lx, ly);
        while (lx < len - 10) {
          lx += 12 + Math.random() * 10;
          ly = (Math.random() - 0.5) * w * 0.8;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    if (!player.isSwordEquipped) return;
    const p = (player.phase && player.phase.phase) || 1;
    const anim = player.animTimer || 0;
    const r = player.radius;

    ctx.save();
    ctx.translate(player.x, player.y);

    if (p === 1) {
      // Phase 1: Quick Silver (Subtle silver-white needle slipstream)
      const pulse = Math.sin(anim * 4) * 1.5;
      ctx.strokeStyle = "rgba(248, 250, 252, 0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = anim * 3 + (i * Math.PI * 2 / 3);
        const dist = r + 6 + Math.sin(anim * 5 + i) * 2;
        ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 2) {
      // Phase 2: Velocity Sting (Crimson velocity streaks & kinetic sparks)
      const pulse = Math.sin(anim * 5) * 2;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const a = -anim * 4 + (i * Math.PI / 2);
        const dist = r + 8 + Math.cos(anim * 6 + i) * 2.5;
        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.8)" : "rgba(239, 68, 68, 0.8)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 3) {
      // Phase 3: Sonic Piercer (High frequency sonic rings)
      const pulse = Math.sin(anim * 7) * 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(239, 68, 68, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 13 - pulse * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p === 4) {
      // Phase 4: Tachyon Edge (Tachyon refraction waves & dual slipstreams)
      const pulse = Math.sin(anim * 8) * 3.5;
      ctx.strokeStyle = "rgba(220, 38, 38, 0.8)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([12, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 16 - pulse * 0.6, anim * 3, anim * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (p === 5) {
      // Phase 5: Flash Katana (White lightning arcs & crimson flash rings)
      const pulse = Math.sin(anim * 9) * 4;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 12 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 4; i++) {
        const a = anim * 5 + (i * Math.PI / 2);
        const innerR = r + 4;
        const outerR = r + 20 + Math.sin(anim * 10 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        const midA = a + 0.15;
        ctx.lineTo(Math.cos(midA) * (innerR + outerR) * 0.5, Math.sin(midA) * (innerR + outerR) * 0.5);
        ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
        ctx.stroke();
      }
    } else if (p === 6) {
      // Phase 6: Godspeed Blade (Sonic wake cone & violent red/white lightning)
      const pulse = Math.sin(anim * 11) * 4.5;
      ctx.strokeStyle = "rgba(185, 28, 28, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 15 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 8 - pulse * 0.4, -anim * 6, -anim * 6 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 6; i++) {
        const a = anim * 6 + (i * Math.PI / 3);
        const innerR = r + 6;
        const outerR = r + 24 + Math.sin(anim * 12 + i) * 6;
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        const midA = a + 0.15;
        ctx.lineTo(Math.cos(midA) * (innerR + outerR) * 0.5, Math.sin(midA) * (innerR + outerR) * 0.5);
        ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
        ctx.stroke();
      }
    } else if (p === 7) {
      // Phase 7: Apex Godspeed (Double sonic boom rings, orbiting lightning orbs, divine white radiance & crimson perimeter)
      const pulse = Math.sin(anim * 14) * 6;
      const grad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r + 30);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(0.5, "rgba(239, 68, 68, 0.25)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r + 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(239, 68, 68, 0.95)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 28 - pulse * 0.5, anim * 8, anim * 8 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 4; i++) {
        const a = anim * 8 + (i * Math.PI / 2);
        const dist = r + 22 + Math.sin(anim * 10 + i) * 4;
        ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#ef4444";
        ctx.shadowColor = i % 2 === 0 ? "#ffffff" : "#ef4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < 8; i++) {
        const a = -anim * 7 + (i * Math.PI / 4);
        const innerR = r + 8;
        const outerR = r + 36 + Math.sin(anim * 14 + i) * 6;
        ctx.strokeStyle = i % 2 === 0 ? "#ffffff" : "#f87171";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        ctx.lineTo(Math.cos(a + 0.12) * (innerR + outerR) * 0.5, Math.sin(a + 0.12) * (innerR + outerR) * 0.5);
        ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
};
