/**
 * aquatic — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawAquaticBlade / Player.drawAquaticAura)
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

    // Phase 8: Drought (Cracked, dry, desaturated, brittle stone/bone)
    if (pNum === 8) {
      ctx.shadowColor = "rgba(120, 113, 108, 0.4)";
      ctx.shadowBlur = 4;

      // Cracked dry hilt
      ctx.fillStyle = "#44403c";
      ctx.fillRect(-8, -3, 8, 6);
      ctx.fillStyle = "#78716c";
      ctx.fillRect(-2, -5, 3, 10);

      // Brittle cracked jagged blade
      ctx.fillStyle = "#a8a29e";
      ctx.beginPath();
      ctx.moveTo(1, -w * 0.4);
      ctx.lineTo(len * 0.4, -w * 0.35);
      ctx.lineTo(len * 0.45, -w * 0.15);
      ctx.lineTo(len * 0.8, -w * 0.25);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.75, w * 0.3);
      ctx.lineTo(len * 0.3, w * 0.35);
      ctx.lineTo(1, w * 0.4);
      ctx.closePath();
      ctx.fill();

      // Cracks along blade
      ctx.strokeStyle = "#44403c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(len * 0.2, 0);
      ctx.lineTo(len * 0.35, -w * 0.2);
      ctx.moveTo(len * 0.4, 0);
      ctx.lineTo(len * 0.55, w * 0.2);
      ctx.moveTo(len * 0.6, -w * 0.1);
      ctx.lineTo(len * 0.75, 0);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Water Blade Styling for all other phases
    ctx.shadowColor = player.phase.glowColor || "rgba(6, 182, 212, 0.8)";
    ctx.shadowBlur = player.isAttacking ? 22 : (pNum >= 9 ? 18 : 10);

    // Hilt / Guard
    if (pNum <= 3) {
      // Droplet / Ripple / Stream: subtle droplet hilt
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-6, -2.5, 6, 5);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (pNum <= 7) {
      // Current / Undertow / Maelstrom / Deep: ocean bronze/silver guard with wave crests
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-8, -3, 8, 6);
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(-1, 0, 6, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // High Phases 9-13: Primordial abyssal crystal hilt with radiant fins
      ctx.fillStyle = pNum === 13 ? "#082f49" : "#0c4a6e";
      ctx.fillRect(-10, -4, 10, 8);

      // Radiant crystal pommel
      ctx.fillStyle = pNum === 13 ? "#ffffff" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(-10, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Wave crest winged crossguard
      ctx.fillStyle = pNum === 13 ? "#38bdf8" : "#0284c7";
      ctx.beginPath();
      ctx.moveTo(-2, -w * 0.9);
      ctx.quadraticCurveTo(4, -w * 0.4, 0, 0);
      ctx.quadraticCurveTo(4, w * 0.4, -2, w * 0.9);
      ctx.lineTo(-5, w * 0.5);
      ctx.lineTo(-5, -w * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Blade Core Gradient
    const bladeGrad = ctx.createLinearGradient(0, 0, len, 0);
    if (pNum <= 3) {
      bladeGrad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
      bladeGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.95)");
      bladeGrad.addColorStop(1, "rgba(255, 255, 255, 0.9)");
    } else if (pNum <= 7) {
      bladeGrad.addColorStop(0, "rgba(2, 132, 199, 0.95)");
      bladeGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.9)");
      bladeGrad.addColorStop(1, "rgba(224, 242, 254, 0.95)");
    } else if (pNum <= 10) {
      bladeGrad.addColorStop(0, "rgba(3, 105, 161, 0.95)");
      bladeGrad.addColorStop(0.4, "rgba(6, 182, 212, 0.95)");
      bladeGrad.addColorStop(0.8, "rgba(125, 211, 252, 0.95)");
      bladeGrad.addColorStop(1, "#ffffff");
    } else if (pNum <= 12) {
      bladeGrad.addColorStop(0, "rgba(8, 47, 73, 0.95)");
      bladeGrad.addColorStop(0.3, "rgba(2, 132, 199, 0.95)");
      bladeGrad.addColorStop(0.7, "rgba(34, 211, 238, 0.95)");
      bladeGrad.addColorStop(1, "#ffffff");
    } else {
      // Phase 13 Omnitidal
      bladeGrad.addColorStop(0, "rgba(6, 182, 212, 0.95)");
      bladeGrad.addColorStop(0.3, "rgba(255, 255, 255, 1.0)");
      bladeGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.95)");
      bladeGrad.addColorStop(1, "#ffffff");
    }

    ctx.fillStyle = bladeGrad;

    // Curved Water Wave Blade Geometry
    ctx.beginPath();
    ctx.moveTo(0, -w * 0.35);
    const curveUp = Math.sin(anim * 6) * (pNum >= 9 ? 2.5 : 1);
    ctx.quadraticCurveTo(len * 0.5, -w * 0.5 + curveUp, len, 0);
    ctx.quadraticCurveTo(len * 0.6, w * 0.5 - curveUp, 0, w * 0.35);
    ctx.closePath();
    ctx.fill();

    // Sharp water highlights / inner stream
    ctx.strokeStyle = pNum === 13 ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = pNum >= 9 ? 2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(len * 0.1, 0);
    ctx.quadraticCurveTo(len * 0.6, -w * 0.15, len * 0.92, 0);
    ctx.stroke();

    // Fluid water wave ripple lines along the blade (animated)
    if (pNum >= 4) {
      const flowOffset = (anim * 35) % (len * 0.6);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rx = len * 0.2 + flowOffset;
      if (rx < len * 0.85) {
        ctx.moveTo(rx - 8, -w * 0.2);
        ctx.lineTo(rx + 8, w * 0.2);
        ctx.stroke();
      }
    }

    // Outer luminous water edge
    ctx.strokeStyle = pNum === 13 ? "rgba(255, 255, 255, 0.9)" : "rgba(186, 230, 253, 0.75)";
    ctx.lineWidth = pNum >= 11 ? 2.5 : 1.5;
    ctx.stroke();

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

    if (p === 8) {
      // Phase 8: Drought - Deliberate collapse: dry cracked ground ripple, weak dust specks, zero water
      const pulse = Math.sin(anim * 2) * 1.5;
      ctx.strokeStyle = "rgba(168, 162, 158, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small dying dust specks
      for (let i = 0; i < 3; i++) {
        const a = anim * 1.5 + (i * Math.PI * 2 / 3);
        const dist = r + 8 + Math.sin(anim * 3 + i) * 3;
        ctx.fillStyle = "rgba(120, 113, 108, 0.5)";
        ctx.fillRect(Math.cos(a) * dist - 1, Math.sin(a) * dist - 1, 2, 2);
      }
      ctx.restore();
      return;
    }

    // Natural Water Progression (Phases 1 - 7)
    if (p === 1) {
      // Phase 1: Droplet - Single soft pulsing water ring
      const pulse = (anim * 18) % 18;
      const alpha = Math.max(0, 1 - pulse / 18);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.45})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p === 2) {
      // Phase 2: Ripple - Concentric expanding water ripples
      for (let i = 0; i < 2; i++) {
        const pulse = ((anim * 22) + i * 14) % 28;
        const alpha = Math.max(0, 1 - pulse / 28);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.45})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (p === 3) {
      // Phase 3: Stream - Fluid current ring with floating water orbs
      const pulse = Math.sin(anim * 4) * 2;
      ctx.strokeStyle = "rgba(14, 165, 233, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const a = anim * 2.5 + (i * Math.PI * 2 / 3);
        const dist = r + 12 + Math.sin(anim * 5 + i) * 2;
        ctx.fillStyle = "rgba(186, 230, 253, 0.75)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 4) {
      // Phase 4: Current - Fast swirling slipstream
      ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
      ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 12, anim * 3, anim * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (p === 5) {
      // Phase 5: Undertow - Inward pulling dark oceanic vortex
      ctx.strokeStyle = "rgba(2, 132, 199, 0.65)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 14, -anim * 3.5, -anim * 3.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 22, anim * 2, anim * 2 + Math.PI * 2);
      ctx.stroke();
    } else if (p === 6) {
      // Phase 6: Maelstrom - 2 swirling vortex arms
      for (let arm = 0; arm < 2; arm++) {
        const baseA = anim * 4 + arm * Math.PI;
        ctx.strokeStyle = "rgba(6, 182, 212, 0.75)";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let step = 0; step < 16; step++) {
          const a = baseA + step * 0.15;
          const dist = r + 8 + step * 1.6;
          if (step === 0) ctx.moveTo(Math.cos(a) * dist, Math.sin(a) * dist);
          else ctx.lineTo(Math.cos(a) * dist, Math.sin(a) * dist);
        }
        ctx.stroke();
      }
    } else if (p === 7) {
      // Phase 7: Deep - Dark abyssal trench glow + bioluminescent motes
      const pulse = Math.sin(anim * 3) * 3;
      ctx.strokeStyle = "rgba(3, 105, 161, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 16 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const a = anim * 1.8 + (i * Math.PI / 3);
        const dist = r + 24 + Math.sin(anim * 4 + i * 2) * 5;
        ctx.fillStyle = i % 2 === 0 ? "#22d3ee" : "#38bdf8";
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 9) {
      // Phase 9: Flood - Violent churning surf ring with cyan spray
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
      ctx.lineWidth = 3.2;
      ctx.setLineDash([12, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 18, anim * 5, anim * 5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(224, 242, 254, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 26, -anim * 4, -anim * 4 + Math.PI * 2);
      ctx.stroke();
    } else if (p === 10) {
      // Phase 10: Monsoon - Downward rain streaks and torrential storm aura
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(14, 165, 233, 0.85)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(186, 230, 253, 0.65)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const rx = -r - 18 + i * ((r * 2 + 36) / 7);
        const ry = ((anim * 140 + i * 25) % 60) - 30;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 2, ry + 12);
        ctx.stroke();
      }
    } else if (p === 11) {
      // Phase 11: Cataclysm - Massive 3-arm tidal surge vortex with white foam
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 20;
      for (let arm = 0; arm < 3; arm++) {
        const baseA = anim * 5 + arm * (Math.PI * 2 / 3);
        ctx.strokeStyle = arm % 2 === 0 ? "rgba(6, 182, 212, 0.9)" : "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let step = 0; step < 20; step++) {
          const a = baseA + step * 0.14;
          const dist = r + 10 + step * 1.8;
          if (step === 0) ctx.moveTo(Math.cos(a) * dist, Math.sin(a) * dist);
          else ctx.lineTo(Math.cos(a) * dist, Math.sin(a) * dist);
        }
        ctx.stroke();
      }
    } else if (p === 12) {
      // Phase 12: Leviathan - Serpentine water dragon silhouette orbiting player
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 24;

      ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 26, -anim * 3, -anim * 3 + Math.PI * 2);
      ctx.stroke();

      const serpentLength = 14;
      for (let s = 0; s < serpentLength; s++) {
        const segAngle = anim * 3.5 - s * 0.18;
        const segDist = r + 32 + Math.sin(anim * 7 + s * 0.4) * 6;
        const segX = Math.cos(segAngle) * segDist;
        const segY = Math.sin(segAngle) * segDist;
        const segRadius = Math.max(2, 6.5 - s * 0.35);

        ctx.fillStyle = s === 0 ? "#ffffff" : (s % 2 === 0 ? "#38bdf8" : "#0284c7");
        ctx.beginPath();
        ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
        ctx.fill();

        if (s === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ffffff";
          ctx.beginPath();
          ctx.arc(segX + 2, segY - 2, 1.8, 0, Math.PI * 2);
          ctx.arc(segX + 2, segY + 2, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (p === 13) {
      // Phase 13: Omnitidal - Primordial planetary ocean divinity
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 28;

      const pulse = Math.sin(anim * 6) * 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 28 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(6, 182, 212, 0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 40 + pulse * 0.5, -anim * 4, -anim * 4 + Math.PI * 2);
      ctx.stroke();

      for (let arm = 0; arm < 4; arm++) {
        const baseA = anim * 5 + arm * (Math.PI / 2);
        ctx.strokeStyle = arm % 2 === 0 ? "#ffffff" : "#38bdf8";
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        for (let step = 0; step < 24; step++) {
          const a = baseA + step * 0.12;
          const dist = r + 12 + step * 2.0;
          if (step === 0) ctx.moveTo(Math.cos(a) * dist, Math.sin(a) * dist);
          else ctx.lineTo(Math.cos(a) * dist, Math.sin(a) * dist);
        }
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const a = -anim * 3 + (i * Math.PI / 4);
        const dist = r + 52 + Math.sin(anim * 8 + i) * 5;
        ctx.save();
        ctx.translate(Math.cos(a) * dist, Math.sin(a) * dist);
        ctx.rotate(a + Math.PI / 4);
        ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#06b6d4";
        ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.restore();
      }
    }

    ctx.restore();
  }
};
