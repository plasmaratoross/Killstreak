/**
 * devourer — blade and phase-aura rendering.
 *
 * Extracted verbatim from js/entities.js (Player.drawBlade / Player.drawPhaseAura)
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

    if (pNum === 9) {
      // --- PHASE 9: STARVED HUSK (STUNTED, CHIPPED, DIMMED) ---
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;

      // Chipped Stone Guard
      ctx.fillStyle = "#3f3f46";
      ctx.fillRect(0, -4, 4, 8);

      // Jagged Chipped Blade
      ctx.fillStyle = "#52525b";
      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.35, -w / 2);
      ctx.lineTo(len * 0.5, -w / 2 + 2); // Chipped notch
      ctx.lineTo(len * 0.8, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.6, w / 2);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      // Dying Faint Ash Core
      ctx.fillStyle = "rgba(161, 161, 170, 0.25)";
      ctx.fillRect(5, -0.5, len - 9, 1);

    } else if (pNum === 16) {
      // --- PHASE 16: ASHEN DORMANCY (SUBDUED CHRYSALIS, WEAK PHASE) ---
      ctx.shadowColor = "rgba(100, 116, 139, 0.25)";
      ctx.shadowBlur = player.isAttacking ? 8 : 4;

      // Slate Stone Guard
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, -6, 5, 12);

      // Fractured Dormant Blade Body
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len - 6, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      // Dull Violet Fissure Veins (Fractured Energy)
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(len * 0.35, -2);
      ctx.lineTo(len * 0.65, 2);
      ctx.lineTo(len - 8, 0);
      ctx.stroke();

    } else if (pNum === 12) {
      // --- PHASE 12: ABYSSAL SOVEREIGN (FLANGED VOID & CRIMSON) ---
      ctx.shadowColor = player.phase.color;
      ctx.shadowBlur = player.isAttacking ? 24 : 12;

      // Heavy Flared Guard with Blood Gems
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.moveTo(-2, -12);
      ctx.lineTo(6, -8);
      ctx.lineTo(6, 8);
      ctx.lineTo(-2, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(2, -2, 3, 4);

      // Deep Void Violet Blade Body
      ctx.fillStyle = "#581c87";
      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.35, -w / 2);
      ctx.lineTo(len * 0.45, -w / 2 - 6); // First Serrated Flange
      ctx.lineTo(len * 0.5, -w / 2);
      ctx.lineTo(len * 0.75, -w / 2 - 8); // Second Serrated Flange
      ctx.lineTo(len - 14, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 14, w / 2);
      ctx.lineTo(len * 0.75, w / 2 + 8);
      ctx.lineTo(len * 0.5, w / 2);
      ctx.lineTo(len * 0.45, w / 2 + 6);
      ctx.lineTo(len * 0.35, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      // Blood-Crimson Razor Edge Lines
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing Inner Abyssal Core
      const pulse = 0.6 + Math.sin(anim * 6) * 0.3;
      ctx.fillStyle = `rgba(254, 202, 202, ${pulse})`;
      ctx.fillRect(8, -1.5, len - 22, 3);

    } else if (pNum === 13) {
      // --- PHASE 13: SINGULARITY CORE (EVENT HORIZON OBSIDIAN & MAGENTA) ---
      ctx.shadowColor = "#ec4899";
      ctx.shadowBlur = player.isAttacking ? 28 : 14;

      // Event Horizon Guard
      ctx.fillStyle = "#18181b";
      ctx.fillRect(-2, -10, 6, 20);

      // Obsidian Blade Body with Radiant Magenta Edges
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len - 12, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 12, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Orbiting Singularity Disc at Hilt Base
      ctx.save();
      ctx.translate(2, 0);
      ctx.rotate(anim * 4);
      ctx.strokeStyle = "rgba(236, 72, 153, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Vacuum Stream Center Line
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(12, -1, len - 26, 2);

    } else if (pNum === 14) {
      // --- PHASE 14: ELDRITCH ECLIPSE (SOLAR ECLIPSE TWIN-HORNED SCYTHE) ---
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = player.isAttacking ? 30 : 16;

      // Forward Curving Eclipse Horn Guard
      ctx.fillStyle = "#431407";
      ctx.beginPath();
      ctx.moveTo(-4, -14);
      ctx.lineTo(8, -18);
      ctx.lineTo(6, 0);
      ctx.lineTo(8, 18);
      ctx.lineTo(-4, 14);
      ctx.closePath();
      ctx.fill();

      // Eclipse Blade with Solar Gradients
      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#f97316");
      grad.addColorStop(0.3, "#1c1917");
      grad.addColorStop(0.7, "#1c1917");
      grad.addColorStop(1, "#f97316");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len - 28, -w / 2);
      ctx.lineTo(len, -w / 2 - 8); // Top Horned Scythe Tip
      ctx.lineTo(len - 14, 0);      // Recessed Maw Center
      ctx.lineTo(len, w / 2 + 8);  // Bottom Horned Scythe Tip
      ctx.lineTo(len - 28, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Solar Flare Plasma Core
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(8, -1.5, len - 28, 3);

    } else if (pNum === 15) {
      // --- PHASE 15: COSMIC OBLIVION (ASTRAL CONSTELLATION TITAN BLADE) ---
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = player.isAttacking ? 35 : 18;

      // Astral Crystalline Crossguard
      ctx.fillStyle = "#082f49";
      ctx.fillRect(-2, -14, 7, 28);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(1, -12, 3, 24);

      // Constellation Starfield Blade Body
      const cosGrad = ctx.createLinearGradient(0, 0, len, 0);
      cosGrad.addColorStop(0, "#0c4a6e");
      cosGrad.addColorStop(0.5, "#0284c7");
      cosGrad.addColorStop(1, "#38bdf8");
      ctx.fillStyle = cosGrad;

      ctx.beginPath();
      ctx.moveTo(5, -w / 2);
      ctx.lineTo(len - 16, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 16, w / 2);
      ctx.lineTo(5, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#a5f3fc";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Etched Constellation Nodes & Connecting Luminous Lines
      const nodes = [
        { x: len * 0.18, y: -w * 0.2 },
        { x: len * 0.36, y: w * 0.22 },
        { x: len * 0.54, y: -w * 0.15 },
        { x: len * 0.72, y: w * 0.18 },
        { x: len * 0.88, y: 0 }
      ];

      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
      }
      ctx.stroke();

      // Pulsing Star Nodes
      for (let n of nodes) {
        const starSize = 2.5 + Math.sin(anim * 5 + n.x) * 1.0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(n.x, n.y, starSize, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (pNum === 17) {
      // --- PHASE 17: THE ALL DEVOURER (DEFINITIVE FINAL TRANSFORMATION) ---
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = player.isAttacking ? 45 : 25;

      // 1. Majestic Divine Golden Wings Crossguard
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(-8, -22);
      ctx.lineTo(10, -28);
      ctx.lineTo(6, -6);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 6);
      ctx.lineTo(10, 28);
      ctx.lineTo(-8, 22);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Colossal Divine Blade Body (Multi-Tier Divine Gold & Crystalline Void)
      const bladeGrad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      bladeGrad.addColorStop(0, "#facc15");   // Divine Gold Edge
      bladeGrad.addColorStop(0.22, "#7c3aed"); // Cosmic Void Mantle
      bladeGrad.addColorStop(0.5, "#ffffff");  // Pure Light Beam Core
      bladeGrad.addColorStop(0.78, "#7c3aed"); // Cosmic Void Mantle
      bladeGrad.addColorStop(1, "#facc15");   // Divine Gold Edge
      ctx.fillStyle = bladeGrad;

      ctx.beginPath();
      ctx.moveTo(6, -w / 2);
      ctx.lineTo(len * 0.4, -w / 2);
      ctx.lineTo(len * 0.46, -w / 2 - 8); // Divine Crest Barb 1
      ctx.lineTo(len * 0.52, -w / 2);
      ctx.lineTo(len * 0.78, -w / 2 - 10); // Divine Crest Barb 2
      ctx.lineTo(len - 22, -w / 2);
      ctx.lineTo(len, 0); // Apex God-slaying Tip
      ctx.lineTo(len - 22, w / 2);
      ctx.lineTo(len * 0.78, w / 2 + 10);
      ctx.lineTo(len * 0.52, w / 2);
      ctx.lineTo(len * 0.46, w / 2 + 8);
      ctx.lineTo(len * 0.4, w / 2);
      ctx.lineTo(6, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 3. Central Pulsing Light Core
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(10, -2, len - 34, 4);

      // 4. Animated Eye of Devouring at Guard Center
      ctx.save();
      ctx.translate(0, 0);
      // Sclera
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Golden Iris
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Slit Pupil that pulses
      const pupilHeight = 3.5 + Math.sin(anim * 4) * 1.0;
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.2, pupilHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Orbiting Celestial Halo Satellites around Blade Base
      const orbAngle1 = anim * 5;
      const orbAngle2 = orbAngle1 + Math.PI;
      const orbDistX = 18;
      const orbDistY = 9;

      [orbAngle1, orbAngle2].forEach((oAngle) => {
        const ox = Math.cos(oAngle) * orbDistX;
        const oy = Math.sin(oAngle) * orbDistY;
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ox + 8, oy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

    } else {
      // --- STANDARD PHASES (1-8, 10, 11) ---
      ctx.shadowColor = player.phase.color;
      ctx.shadowBlur = player.isAttacking ? 18 : 8;

      // Guard
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, -6, 5, 12);

      // Serrated Blade Form
      ctx.fillStyle = player.phase.color;
      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len - 8, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 8, w / 2);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      // Inner glowing maw vein
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(6, -1, len - 14, 2);
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

    // Engulf Cataclysmic Devourer Maelstrom (when active)
    if (player.isEngulfActive) {
      const pulse = Math.sin(anim * 10) * 8;
      const engulfRadius = 240;

      // Outer Devouring Abyssal Shockwave Ring
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, engulfRadius + pulse * 0.5, anim * 2, anim * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner Cataclysmic Void Gravity Well
      const grad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, engulfRadius);
      grad.addColorStop(0, "rgba(124, 58, 237, 0.45)");
      grad.addColorStop(0.4, "rgba(220, 38, 38, 0.25)");
      grad.addColorStop(0.8, "rgba(250, 204, 21, 0.15)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, engulfRadius, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Devourer Tendrils / Maws
      for (let i = 0; i < 6; i++) {
        const angle = anim * 3 + (i * Math.PI / 3);
        const tDist = engulfRadius * 0.7 + Math.sin(anim * 8 + i) * 20;
        ctx.save();
        ctx.rotate(angle);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(250, 204, 21, 0.7)" : "rgba(239, 68, 68, 0.65)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(r + 10, 0);
        ctx.quadraticCurveTo(tDist * 0.5, 25, tDist, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- 17 DISTINCT PHASE AURAS ---
    if (p === 1) {
      // Phase 1: Hunger (Subtle bone mist, faint grey wisp)
      const pulse = Math.sin(anim * 2.5) * 1.2;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 4 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = anim * 0.8 + (i * Math.PI * 2 / 3);
        const dist = r + 3 + Math.sin(anim * 3 + i) * 1.5;
        ctx.fillStyle = "rgba(203, 213, 225, 0.35)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 2) {
      // Phase 2: Feast (Pulsing crimson flesh mist, small blood droplets)
      const pulse = Math.sin(anim * 3.5) * 2;
      ctx.strokeStyle = "rgba(220, 38, 38, 0.42)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = anim * 1.4 + (i * Math.PI / 2);
        const dist = r + 7 + Math.sin(anim * 4 + i) * 2;
        ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 3) {
      // Phase 3: Devourer (Abyssal violet shadow pulse, rotating void motes)
      const pulse = Math.sin(anim * 4) * 2.5;
      ctx.strokeStyle = "rgba(147, 51, 234, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 8 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = -anim * 1.8 + (i * Math.PI / 2);
        const dist = r + 9 + Math.cos(anim * 3 + i) * 2.5;
        ctx.fillStyle = "rgba(192, 132, 252, 0.65)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 4) {
      // Phase 4: Voracity (Hellfire orange heat flicker & rising sparks)
      const pulse = Math.sin(anim * 5) * 3;
      ctx.strokeStyle = "rgba(234, 88, 12, 0.65)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 10 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = anim * 2 + (i * Math.PI * 2 / 5);
        const dist = r + 11 + Math.sin(anim * 5 + i) * 3.5;
        ctx.fillStyle = "rgba(251, 146, 60, 0.75)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 5) {
      // Phase 5: Apex Maw (Glacial cyan crystalline frost aura)
      const pulse = Math.sin(anim * 5.5) * 3;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 12 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.rotate(anim * 0.8);
      ctx.strokeStyle = "rgba(34, 211, 238, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3);
        const rad = r + 13 + (i % 2 === 0 ? 3 : -1);
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    } else if (p === 6) {
      // Phase 6: World Eater (Eldritch amber double rings & radiating spikes)
      const pulse = Math.sin(anim * 6) * 3.2;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.75)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 14 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18 - pulse * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = anim * 1.5 + (i * Math.PI / 2);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 10), Math.sin(a) * (r + 10));
        ctx.lineTo(Math.cos(a) * (r + 20), Math.sin(a) * (r + 20));
        ctx.stroke();
      }
    } else if (p === 7) {
      // Phase 7: Cosmic Calamity (Emerald astral nebula ring & starlight motes)
      const pulse = Math.sin(anim * 6.5) * 3.5;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 16 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = anim * 2.2 + (i * Math.PI * 2 / 5);
        const dist = r + 17 + Math.sin(anim * 4 + i) * 3;
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    } else if (p === 8) {
      // Phase 8: Void Singularity (Gravitational magenta vortex distortion)
      const pulse = Math.sin(anim * 7) * 3.8;
      ctx.strokeStyle = "rgba(236, 72, 153, 0.85)";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.rotate(-anim * 2.5);
      ctx.strokeStyle = "rgba(244, 114, 182, 0.5)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (p === 9) {
      // Phase 9: Starved Husk (WEAK PHASE: SUBDUED, dying ash flicker)
      const faintPulse = Math.sin(anim * 1.5) * 0.8;
      ctx.strokeStyle = "rgba(82, 82, 91, 0.22)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, r + 3 + faintPulse, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 2; i++) {
        const a = anim * 0.6 + (i * Math.PI);
        const dist = r + 4 + Math.sin(anim * 2 + i) * 1.0;
        ctx.fillStyle = "rgba(113, 113, 122, 0.3)";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 10) {
      // Phase 10: Ascended Behemoth (Resurgent celestial sky-blue shockwaves & lightning)
      const pulse = Math.sin(anim * 7) * 4.2;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
      ctx.lineWidth = 3.0;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, r + 21 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 4; i++) {
        const a = anim * 2.8 + (i * Math.PI / 2);
        ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 14), Math.sin(a) * (r + 14));
        ctx.lineTo(Math.cos(a) * (r + 26), Math.sin(a) * (r + 26));
        ctx.stroke();
      }
    } else if (p === 11) {
      // Phase 11: Cosmic Devourer (Divine solar corona & radiant gold rays)
      const pulse = Math.sin(anim * 7.5) * 4.5;
      ctx.strokeStyle = "rgba(250, 204, 21, 0.92)";
      ctx.lineWidth = 3.2;
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, r + 24 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 8; i++) {
        const a = anim * 1.8 + (i * Math.PI / 4);
        ctx.strokeStyle = "rgba(254, 240, 138, 0.75)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 18), Math.sin(a) * (r + 18));
        ctx.lineTo(Math.cos(a) * (r + 29), Math.sin(a) * (r + 29));
        ctx.stroke();
      }
    } else if (p === 12) {
      // Phase 12: Abyssal Sovereign (Violet-Crimson dual-layered crown)
      const pulse = Math.sin(anim * 8) * 4.8;
      ctx.strokeStyle = "rgba(124, 58, 237, 0.95)";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 26 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 18 - pulse * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = -anim * 2.2 + (i * Math.PI / 3);
        const dist = r + 28 + Math.sin(anim * 5 + i) * 3;
        ctx.fillStyle = i % 2 === 0 ? "#a855f7" : "#ef4444";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 13) {
      // Phase 13: Singularity Core (Event horizon obsidian & magenta gravitational lensing)
      const pulse = Math.sin(anim * 8.2) * 5;
      ctx.strokeStyle = "rgba(236, 72, 153, 0.95)";
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.arc(0, 0, r + 29 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 15, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = anim * 3 + (i * Math.PI / 3);
        const dist = r + 30 + Math.cos(anim * 6 + i) * 4;
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (p === 14) {
      // Phase 14: Eldritch Eclipse (Solar eclipse flare orange)
      const pulse = Math.sin(anim * 8.5) * 5.2;
      ctx.strokeStyle = "rgba(249, 115, 22, 0.95)";
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.arc(0, 0, r + 32 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(254, 215, 170, 0.65)";
      ctx.lineWidth = 2;
      ctx.save();
      ctx.rotate(anim * 2);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 20), Math.sin(a) * (r + 20));
        ctx.quadraticCurveTo(Math.cos(a + 0.3) * (r + 30), Math.sin(a + 0.3) * (r + 30), Math.cos(a) * (r + 38), Math.sin(a) * (r + 38));
        ctx.stroke();
      }
      ctx.restore();
    } else if (p === 15) {
      // Phase 15: Cosmic Oblivion (Supernova constellation astral cyan)
      const pulse = Math.sin(anim * 8.8) * 5.5;
      ctx.strokeStyle = "rgba(6, 182, 212, 1.0)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, r + 35 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Cross starburst rays
      for (let i = 0; i < 4; i++) {
        const a = anim * 1.2 + (i * Math.PI / 2);
        ctx.strokeStyle = "rgba(165, 243, 252, 0.85)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 15), Math.sin(a) * (r + 15));
        ctx.lineTo(Math.cos(a) * (r + 45), Math.sin(a) * (r + 45));
        ctx.stroke();
      }
    } else if (p === 16) {
      // Phase 16: Ashen Dormancy (WEAK PHASE: SUBDUED, cracked slate stone)
      const faintPulse = Math.sin(anim * 2.0) * 1.0;
      ctx.strokeStyle = "rgba(100, 116, 139, 0.28)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 5 + faintPulse, 0, Math.PI * 2);
      ctx.stroke();
      // Subtle hairline fissures
      ctx.strokeStyle = "rgba(168, 85, 247, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-r - 3, 0);
      ctx.lineTo(-r * 0.4, 2);
      ctx.moveTo(r * 0.3, -2);
      ctx.lineTo(r + 4, 0);
      ctx.stroke();
    } else if (p === 17) {
      // Phase 17: The All Devourer (MOST IMPRESSIVE APEX AURA)
      const pulse = Math.sin(anim * 9) * 6;
      // Triple Concentric Divine Rings
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 22;
      ctx.strokeStyle = "rgba(250, 204, 21, 1.0)";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 24 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(254, 240, 138, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 38 + pulse * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Rotating Transcendent Halo
      ctx.save();
      ctx.rotate(anim * 2);
      ctx.strokeStyle = "rgba(254, 240, 138, 0.95)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -r - 12, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 8 Orbiting Celestial Diamond Runes
      for (let i = 0; i < 8; i++) {
        const a = anim * 2.2 + (i * Math.PI / 4);
        const dist = r + 42 + Math.sin(anim * 6 + i) * 4;
        ctx.save();
        ctx.translate(Math.cos(a) * dist, Math.sin(a) * dist);
        ctx.rotate(a + Math.PI / 4);
        ctx.fillStyle = i % 2 === 0 ? "#facc15" : "#38bdf8";
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      }

      // Outward God-Rays
      for (let i = 0; i < 8; i++) {
        const a = -anim * 1.5 + (i * Math.PI / 4);
        ctx.strokeStyle = "rgba(250, 204, 21, 0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (r + 20), Math.sin(a) * (r + 20));
        ctx.lineTo(Math.cos(a) * (r + 52), Math.sin(a) * (r + 52));
        ctx.stroke();
      }
    }

    ctx.restore();
  },

  /**
   * Gluttony beam — the Devourer active-ability visual.
   * Moved verbatim from Game.drawGluttonyBeam (Phase 4).
   * @param {CanvasRenderingContext2D} ctx @param {object} game
   */
  drawBeam(ctx, game) {
    if (!game.activeBeam) return;
    const b = game.activeBeam;
    const progress = Math.max(0, b.timer / 0.32);
    const alpha = Math.min(1, progress * 1.5);

    ctx.save();
    // Outer ethereal blast
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;
    ctx.lineWidth = 50;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();

    // Main beam
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
    ctx.lineWidth = 32;
    ctx.stroke();

    // Secondary core
    ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.95})`;
    ctx.lineWidth = 18;
    ctx.stroke();

    // Inner brilliant white core
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 8;
    ctx.stroke();

    // Forward beam impact ring at tip
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(b.x2, b.y2, 20 * progress, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
