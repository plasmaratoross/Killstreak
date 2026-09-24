/**
 * AtlantisNpcRenderer.js
 *
 * Bespoke procedural Canvas 2D rendering for all 25 Atlantis underwater NPC types:
 * Reefmaw, Coralback, Tidescale, Seafang, Abyssfin, Deepclaw, Reefstalker, Dreadscale,
 * Tideborn, Leviathan, Abysswalker, Trenchmaw, Depthclaw, Gloomray, Abyssal, Sirenborn,
 * Stormscale, Dreadtide, Trenchborn, Deepwarden, Abysslord, Tidebreaker, Depthforged,
 * Oceanbane, Abyssforged.
 *
 * Each NPC features unique silhouette, hydrodynamic plating, fins, tentacles, pincers,
 * bio-luminescence, hostile state transitions, and hit-flash responses.
 */

export const AtlantisNpcRenderer = {
  /**
   * Render an Atlantis NPC if its type matches one of the 25 Atlantis beasts.
   * Returns true if handled, false otherwise.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} npc
   * @param {boolean} isHit
   * @returns {boolean}
   */
  draw(ctx, npc, isHit) {
    const fn = this.renderers[npc.type];
    if (typeof fn === "function") {
      ctx.save();
      fn.call(this, ctx, npc, isHit);
      ctx.restore();
      return true;
    }
    return false;
  },

  renderers: {
    // 1. REEFMAW — Predatory shark-like beast with needle jaws and dorsal fin
    reefmaw(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      const tailSwish = Math.sin(anim) * 0.25;
      const aim = npc.isHostile ? (npc.aimAngle || 0) : (npc.aimAngle || 0);

      ctx.translate(npc.x, npc.y);
      ctx.rotate(aim);

      // Tail caudal fin
      ctx.save();
      ctx.translate(-npc.radius + 2, 0);
      ctx.rotate(tailSwish);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0e7490" : "#083344");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Pectoral fins
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#06b6d4" : "#0e3a4e");
      ctx.beginPath();
      ctx.ellipse(-2, -npc.radius - 2, 9, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-2, npc.radius + 2, 9, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Torpedo Shark Body
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius + 4, npc.radius - 2, 0, 0, Math.PI * 2);
      if (isHit) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#a5f3fc";
      } else if (npc.isHostile) {
        ctx.fillStyle = "#0891b2";
        ctx.strokeStyle = "#22d3ee";
        ctx.shadowColor = "rgba(6, 182, 212, 0.85)";
        ctx.shadowBlur = 16;
      } else {
        ctx.fillStyle = "#0e3a4e";
        ctx.strokeStyle = "#06b6d4";
        ctx.shadowColor = "rgba(6, 182, 212, 0.4)";
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dorsal Fin
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#22d3ee" : "#0891b2");
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(-14, -18);
      ctx.lineTo(4, -6);
      ctx.closePath();
      ctx.fill();

      // Predatory Jaws & Razor Teeth
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      for (let t = -6; t <= 6; t += 3) {
        ctx.moveTo(npc.radius + 1, t);
        ctx.lineTo(npc.radius + 5, t + 1.5);
      }
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cyan Predatory Eyes
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#f43f5e" : "#67e8f9");
      ctx.beginPath();
      ctx.arc(6, -6, 2.5, 0, Math.PI * 2);
      ctx.arc(6, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 2. CORALBACK — Armored coral crustacean with branching polyps and heavy pincers
    coralback(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Walking legs
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#e11d48" : "#881337");
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 7, -npc.radius);
        ctx.lineTo(i * 9 - 4, -npc.radius - 8);
        ctx.moveTo(i * 7, npc.radius);
        ctx.lineTo(i * 9 - 4, npc.radius + 8);
        ctx.stroke();
      }

      // Coral Carapace Shell
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      if (isHit) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#fda4af";
      } else if (npc.isHostile) {
        ctx.fillStyle = "#be123c";
        ctx.strokeStyle = "#fb7185";
        ctx.shadowColor = "rgba(244, 63, 94, 0.85)";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = "#4c1d28";
        ctx.strokeStyle = "#f43f5e";
        ctx.shadowColor = "rgba(244, 63, 94, 0.4)";
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();

      // Twin Coral Pincers
      const clawPinch = Math.sin(anim * 1.5) * 2;
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#f43f5e" : "#9f1239");
      ctx.beginPath();
      // Left pincer
      ctx.moveTo(npc.radius - 2, -10);
      ctx.lineTo(npc.radius + 12, -14 - clawPinch);
      ctx.lineTo(npc.radius + 7, -8);
      ctx.closePath();
      // Right pincer
      ctx.moveTo(npc.radius - 2, 10);
      ctx.lineTo(npc.radius + 12, 14 + clawPinch);
      ctx.lineTo(npc.radius + 7, 8);
      ctx.closePath();
      ctx.fill();

      // Branching Coral Clusters on back
      ctx.fillStyle = isHit ? "#ffffff" : "#fb7185";
      ctx.beginPath();
      ctx.arc(-6, -5, 3.5, 0, Math.PI * 2);
      ctx.arc(-4, 6, 4, 0, Math.PI * 2);
      ctx.arc(-10, 1, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#fef08a";
      ctx.beginPath();
      ctx.arc(8, -5, 2, 0, Math.PI * 2);
      ctx.arc(8, 5, 2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 3. TIDESCALE — Shimmering aquatic sea drake with overlapping hydro-scales
    tidescale(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Frilled side fins that ripple
      const finWave = Math.sin(anim * 2) * 3;
      ctx.fillStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(56, 189, 248, 0.45)";
      ctx.beginPath();
      ctx.ellipse(-4, -npc.radius - 4 + finWave, 12, 5, -0.3, 0, Math.PI * 2);
      ctx.ellipse(-4, npc.radius + 4 - finWave, 12, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Main Drake Body
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      if (isHit) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#bae6fd";
      } else if (npc.isHostile) {
        ctx.fillStyle = "#0284c7";
        ctx.strokeStyle = "#38bdf8";
        ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = "#0c2e42";
        ctx.strokeStyle = "#0284c7";
        ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Overlapping scale crescents
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#7dd3fc" : "#0369a1");
      ctx.lineWidth = 1.6;
      for (let r = 5; r <= npc.radius - 4; r += 5) {
        ctx.beginPath();
        ctx.arc(-2, 0, r, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      // Whisker Barbels
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(npc.radius - 2, -4);
      ctx.quadraticCurveTo(npc.radius + 10, -10 + finWave, npc.radius + 14, -6);
      ctx.moveTo(npc.radius - 2, 4);
      ctx.quadraticCurveTo(npc.radius + 10, 10 - finWave, npc.radius + 14, 6);
      ctx.stroke();

      // Slit Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#facc15";
      ctx.beginPath();
      ctx.ellipse(6, -5, 2.5, 1.2, 0.2, 0, Math.PI * 2);
      ctx.ellipse(6, 5, 2.5, 1.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 4. SEAFANG — Abyssal viperfish with curved venom fangs and bioluminescent angler lure
    seafang(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Angler Lure arching over head
      const lurePulse = 0.7 + 0.3 * Math.sin(anim * 3);
      ctx.strokeStyle = isHit ? "#ffffff" : "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -npc.radius + 4);
      ctx.quadraticCurveTo(npc.radius * 0.8, -npc.radius - 12, npc.radius + 10, -npc.radius - 4);
      ctx.stroke();

      // Glowing Lure Bulb
      ctx.fillStyle = isHit ? "#ffffff" : `rgba(56, 189, 248, ${lurePulse})`;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12 * lurePulse;
      ctx.beginPath();
      ctx.arc(npc.radius + 10, -npc.radius - 4, 4 * lurePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dark Abyssal Body
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0369a1" : "#082f49");
      ctx.strokeStyle = isHit ? "#bae6fd" : (npc.isHostile ? "#38bdf8" : "#0284c7");
      ctx.lineWidth = 2.8;
      ctx.fill();
      ctx.stroke();

      // Giant curved ivory fangs protruding from jaw
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(npc.radius - 2, -6);
      ctx.lineTo(npc.radius + 9, -8);
      ctx.lineTo(npc.radius + 2, -3);
      ctx.closePath();
      ctx.moveTo(npc.radius - 2, 6);
      ctx.lineTo(npc.radius + 9, 8);
      ctx.lineTo(npc.radius + 2, 3);
      ctx.closePath();
      ctx.fill();

      // Ghostly White/Cyan Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#38bdf8";
      ctx.beginPath();
      ctx.arc(6, -6, 2.8, 0, Math.PI * 2);
      ctx.arc(6, 6, 2.8, 0, Math.PI * 2);
      ctx.fill();
    },

    // 5. ABYSSFIN — Pelagic needle predator with high dorsal sail fin
    abyssfin(ctx, npc, isHit) {
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Grand Dorsal Sail Fin
      ctx.fillStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(34, 211, 238, 0.4)";
      ctx.strokeStyle = isHit ? "#ffffff" : "#22d3ee";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-npc.radius + 2, -4);
      ctx.lineTo(-npc.radius * 0.3, -npc.radius - 12);
      ctx.lineTo(npc.radius * 0.4, -npc.radius - 10);
      ctx.lineTo(npc.radius * 0.8, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Streamlined Needle Body
      ctx.beginPath();
      ctx.ellipse(2, 0, npc.radius + 6, npc.radius - 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0e7490" : "#164e63");
      ctx.strokeStyle = isHit ? "#cffafe" : (npc.isHostile ? "#22d3ee" : "#06b6d4");
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      // Razor Beak
      ctx.fillStyle = isHit ? "#ffffff" : "#22d3ee";
      ctx.beginPath();
      ctx.moveTo(npc.radius + 7, -2);
      ctx.lineTo(npc.radius + 16, 0);
      ctx.lineTo(npc.radius + 7, 2);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#f43f5e" : "#67e8f9");
      ctx.beginPath();
      ctx.arc(8, -4, 2.2, 0, Math.PI * 2);
      ctx.arc(8, 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 6. DEEPCLAW — Heavy benthic king crab with crushing jagged pincers
    deepclaw(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Carapace side thorns
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#be123c" : "#881337");
      for (let a = -0.7; a <= 0.7; a += 0.35) {
        ctx.beginPath();
        const sx = Math.cos(Math.PI / 2 + a) * (npc.radius + 2);
        const sy = Math.sin(Math.PI / 2 + a) * (npc.radius + 2);
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        const sx2 = Math.cos(-Math.PI / 2 + a) * (npc.radius + 2);
        const sy2 = Math.sin(-Math.PI / 2 + a) * (npc.radius + 2);
        ctx.arc(sx2, sy2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Massive Heavy Carapace
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#9f1239" : "#4c0519");
      ctx.strokeStyle = isHit ? "#fecdd3" : (npc.isHostile ? "#fb7185" : "#e11d48");
      ctx.lineWidth = 3.5;
      ctx.fill();
      ctx.stroke();

      // Huge Crushing Pincers out front
      const clawOffset = Math.sin(anim * 2) * 2;
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#e11d48" : "#be123c");
      ctx.beginPath();
      // Upper crusher
      ctx.ellipse(npc.radius + 6, -12, 10, 6, -0.3, 0, Math.PI * 2);
      // Lower crusher
      ctx.ellipse(npc.radius + 6, 12, 10, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eyes on stalks
      ctx.fillStyle = isHit ? "#ffffff" : "#fef08a";
      ctx.beginPath();
      ctx.arc(npc.radius - 2, -6, 2.5, 0, Math.PI * 2);
      ctx.arc(npc.radius - 2, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 7. REEFSTALKER — Raptorial reef mantis with folded scythe blades
    reefstalker(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Chitinous Body
      ctx.beginPath();
      ctx.ellipse(-2, 0, npc.radius + 2, npc.radius - 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#047857" : "#064e3b");
      ctx.strokeStyle = isHit ? "#a7f3d0" : (npc.isHostile ? "#34d399" : "#10b981");
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      // Raptorial folded scythes
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#6ee7b7" : "#10b981");
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(npc.radius - 4, -8);
      ctx.lineTo(npc.radius + 12, -14);
      ctx.lineTo(npc.radius + 4, -4);
      ctx.moveTo(npc.radius - 4, 8);
      ctx.lineTo(npc.radius + 12, 14);
      ctx.lineTo(npc.radius + 4, 4);
      ctx.stroke();

      // Faceted Emerald Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#10b981";
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(8, -6, 3.2, 0, Math.PI * 2);
      ctx.arc(8, 6, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    },

    // 8. DREADSCALE — Serpentine sea wyrm with amethyst dorsal spine ridges
    dreadscale(ctx, npc, isHit) {
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Dorsal spine ridges along spine
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#c084fc" : "#7c3aed");
      for (let s = -npc.radius + 4; s <= npc.radius - 4; s += 7) {
        ctx.beginPath();
        ctx.moveTo(s, -6);
        ctx.lineTo(s + 3, -14);
        ctx.lineTo(s + 6, -6);
        ctx.closePath();
        ctx.fill();
      }

      // Wyrm Body
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius + 3, npc.radius - 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#581c87" : "#2e1065");
      ctx.strokeStyle = isHit ? "#e9d5ff" : (npc.isHostile ? "#a855f7" : "#8b5cf6");
      ctx.lineWidth = 2.8;
      ctx.fill();
      ctx.stroke();

      // Hypnotic Eyes
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#ef4444" : "#d8b4fe");
      ctx.beginPath();
      ctx.arc(7, -5, 2.5, 0, Math.PI * 2);
      ctx.arc(7, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 9. TIDEBORN — Living water elemental with spinning vortex rings
    tideborn(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // Counter-rotating vortex rings
      ctx.save();
      ctx.rotate(anim * 1.8);
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(14, 165, 233, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius + 6, npc.radius - 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.rotate(-anim * 1.4);
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(56, 189, 248, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius - 2, npc.radius + 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Fluid Hydro-Core
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0284c7" : "#082f49");
      ctx.strokeStyle = isHit ? "#bae6fd" : "#38bdf8";
      ctx.shadowColor = "#0ea5e9";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Orbiting droplets
      ctx.fillStyle = "#7dd3fc";
      for (let i = 0; i < 3; i++) {
        const a = anim * 2 + (i * Math.PI * 2) / 3;
        const dx = Math.cos(a) * (npc.radius + 4);
        const dy = Math.sin(a) * (npc.radius + 4);
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    // 10. LEVIATHAN — Colossal ancient oceanic behemoth with runic spine
    leviathan(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Colossal Fluked Tail
      const tailAng = Math.sin(anim) * 0.2;
      ctx.save();
      ctx.translate(-npc.radius, 0);
      ctx.rotate(tailAng);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#1e3a8a" : "#172554");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-18, -16);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-18, 16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Massive Titan Hull
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#1d4ed8" : "#1e293b");
      ctx.strokeStyle = isHit ? "#bfdbfe" : (npc.isHostile ? "#60a5fa" : "#3b82f6");
      ctx.shadowColor = "rgba(29, 78, 216, 0.8)";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.8;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Ancient Glowing Runic Markings along dorsal crest
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#93c5fd" : "#38bdf8");
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(2, 0);
      ctx.lineTo(-10, 6);
      ctx.moveTo(2, -8);
      ctx.lineTo(12, 0);
      ctx.lineTo(2, 8);
      ctx.stroke();

      // Deep Blue Behemoth Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#93c5fd";
      ctx.beginPath();
      ctx.arc(12, -7, 3, 0, Math.PI * 2);
      ctx.arc(12, 7, 3, 0, Math.PI * 2);
      ctx.fill();
    },

    // 11. ABYSSWALKER — Bathypelagic tripod horror with high chitin stilts and cyclops eye
    abysswalker(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // Long Stilt Legs radiating outward
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#4338ca" : "#1e1b4b");
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const legAng = (i * Math.PI) / 2 + Math.PI / 4 + Math.sin(anim + i) * 0.1;
        const lx = Math.cos(legAng) * (npc.radius + 12);
        const ly = Math.sin(legAng) * (npc.radius + 12);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }

      // Elevated Mantle Dome
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#3730a3" : "#312e81");
      ctx.strokeStyle = isHit ? "#c7d2fe" : "#6366f1";
      ctx.lineWidth = 2.8;
      ctx.fill();
      ctx.stroke();

      // Piercing Cyclopean Ocular Core
      const eyePulse = 0.8 + 0.2 * Math.sin(anim * 2.5);
      ctx.fillStyle = isHit ? "#ffffff" : "#818cf8";
      ctx.shadowColor = "#6366f1";
      ctx.shadowBlur = 14 * eyePulse;
      ctx.beginPath();
      ctx.arc(0, 0, 6 * eyePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Slit pupil
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    },

    // 12. TRENCHMAW — Gulper beast with gaping cavernous jaws and luminous throat
    trenchmaw(ctx, npc, isHit) {
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Gaping Cavernous Jaws
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#581c87" : "#3b0764");
      ctx.strokeStyle = isHit ? "#e9d5ff" : (npc.isHostile ? "#c084fc" : "#a855f7");
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Deep Purple Gullet Luminescence
      ctx.fillStyle = isHit ? "#ffffff" : "rgba(168, 85, 247, 0.85)";
      ctx.beginPath();
      ctx.arc(6, 0, npc.radius * 0.58, -Math.PI / 2, Math.PI / 2);
      ctx.fill();

      // Needle teeth ring
      ctx.fillStyle = "#ffffff";
      for (let a = -Math.PI / 2 + 0.3; a <= Math.PI / 2 - 0.3; a += 0.4) {
        const tx = 6 + Math.cos(a) * (npc.radius * 0.58);
        const ty = Math.sin(a) * (npc.radius * 0.58);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 4, ty);
        ctx.lineTo(tx, ty + 2);
        ctx.closePath();
        ctx.fill();
      }

      // Small glowing eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#f0abfc";
      ctx.beginPath();
      ctx.arc(-2, -9, 2.2, 0, Math.PI * 2);
      ctx.arc(-2, 9, 2.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 13. DEPTHCLAW — Barbed abyssal scorpion-lobster with arched tail stinger
    depthclaw(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Arched rear venom tail stinger
      const tailWiggle = Math.sin(anim * 2) * 3;
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#f0abfc" : "#c026d3");
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-npc.radius + 2, 0);
      ctx.quadraticCurveTo(-npc.radius - 10, tailWiggle, -npc.radius - 14, -8);
      ctx.stroke();

      // Luminous Stinger bulb
      ctx.fillStyle = isHit ? "#ffffff" : "#e879f9";
      ctx.beginPath();
      ctx.arc(-npc.radius - 14, -8, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Segmented Chitin Carapace
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#86198f" : "#4a044e");
      ctx.strokeStyle = isHit ? "#f5d0fe" : "#d946ef";
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Barbed Front Scythe Claws
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#d946ef" : "#a21caf");
      ctx.beginPath();
      ctx.moveTo(npc.radius - 2, -10);
      ctx.lineTo(npc.radius + 14, -14);
      ctx.lineTo(npc.radius + 8, -6);
      ctx.closePath();
      ctx.moveTo(npc.radius - 2, 10);
      ctx.lineTo(npc.radius + 14, 14);
      ctx.lineTo(npc.radius + 8, 6);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#fdf4ff";
      ctx.beginPath();
      ctx.arc(6, -6, 2.2, 0, Math.PI * 2);
      ctx.arc(6, 6, 2.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 14. GLOOMRAY — Phantom twilight manta ray with wide sweeping wings
    gloomray(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      const wingFlap = Math.sin(anim) * 5;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Long slender whip tail
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#c084fc" : "#7e22ce");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-npc.radius, 0);
      ctx.lineTo(-npc.radius - 22, Math.sin(anim * 1.5) * 4);
      ctx.stroke();

      // Wide Sweeping Wings
      ctx.beginPath();
      ctx.moveTo(npc.radius + 4, 0);
      ctx.quadraticCurveTo(0, -npc.radius - 16 + wingFlap, -npc.radius, -npc.radius - 8);
      ctx.quadraticCurveTo(-npc.radius * 0.5, 0, -npc.radius, 0);
      ctx.quadraticCurveTo(-npc.radius * 0.5, 0, -npc.radius, npc.radius + 8);
      ctx.quadraticCurveTo(0, npc.radius + 16 - wingFlap, npc.radius + 4, 0);
      ctx.closePath();

      if (isHit) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#f3e8ff";
      } else if (npc.isHostile) {
        ctx.fillStyle = "#6b21a8";
        ctx.strokeStyle = "#c084fc";
        ctx.shadowColor = "rgba(192, 132, 252, 0.85)";
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = "#3b0764";
        ctx.strokeStyle = "#9333ea";
        ctx.shadowColor = "rgba(192, 132, 252, 0.4)";
        ctx.shadowBlur = 10;
      }
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bioluminescent Starlight Spots on wings
      ctx.fillStyle = "#e9d5ff";
      const spots = [
        { x: -2, y: -12 + wingFlap * 0.5 },
        { x: 4, y: -8 },
        { x: -2, y: 12 - wingFlap * 0.5 },
        { x: 4, y: 8 }
      ];
      spots.forEach(sp => {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    },

    // 15. ABYSSAL — Eldritch void anomaly with 6 writhing tentacles and central void eye
    abyssal(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // 6 Animated Writhing Tentacles
      ctx.strokeStyle = isHit ? "#ffffff" : (npc.isHostile ? "#6d28d9" : "#4c1d95");
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 6; i++) {
        const baseAng = (i * Math.PI * 2) / 6;
        const wave = Math.sin(anim * 2 + i) * 6;
        const midX = Math.cos(baseAng) * (npc.radius + 6);
        const midY = Math.sin(baseAng) * (npc.radius + 6);
        const tipX = Math.cos(baseAng + 0.3) * (npc.radius + 15) + wave;
        const tipY = Math.sin(baseAng + 0.3) * (npc.radius + 15) + wave;

        ctx.beginPath();
        ctx.moveTo(Math.cos(baseAng) * (npc.radius * 0.7), Math.sin(baseAng) * (npc.radius * 0.7));
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        // Tentacle tip sucker
        ctx.fillStyle = "#a78bfa";
        ctx.beginPath();
        ctx.arc(tipX, tipY, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shifting Void Core
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#2e1065" : "#090514");
      ctx.strokeStyle = isHit ? "#ddd6fe" : "#7c3aed";
      ctx.shadowColor = "#7c3aed";
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Central Eldritch Eye
      ctx.fillStyle = isHit ? "#ffffff" : "#c084fc";
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    },

    // 16. SIRENBORN — Jellyfish-nymph hybrid with pulsating bell canopy and flowing tendrils
    sirenborn(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      const bellPulse = 1 + Math.sin(anim * 2.5) * 0.08;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Trailing Stinging Tendrils
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(236, 72, 153, 0.6)";
      ctx.lineWidth = 1.8;
      for (let t = -8; t <= 8; t += 4) {
        ctx.beginPath();
        ctx.moveTo(-npc.radius + 2, t);
        const tw = Math.sin(anim * 3 + t) * 4;
        ctx.quadraticCurveTo(-npc.radius - 8, t + tw, -npc.radius - 18, t);
        ctx.stroke();
      }

      // Translucent Bell Canopy
      ctx.save();
      ctx.scale(bellPulse, bellPulse);
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#be185d" : "#500724");
      ctx.strokeStyle = isHit ? "#fbcfe8" : "#ec4899";
      ctx.shadowColor = "rgba(236, 72, 153, 0.85)";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.8;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Pearl Tiara
      ctx.fillStyle = "#fdf2f8";
      for (let p = -6; p <= 6; p += 4) {
        ctx.beginPath();
        ctx.arc(6, p, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#f472b6";
      ctx.beginPath();
      ctx.arc(8, -4, 2.2, 0, Math.PI * 2);
      ctx.arc(8, 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    },

    // 17. STORMSCALE — Electric hydro-serpent with crackling lightning arcs
    stormscale(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Crackling Electric Arcs
      ctx.strokeStyle = isHit ? "#ffffff" : "#38bdf8";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 3; i++) {
        const arcAng = anim * 4 + i * 2;
        const ax1 = Math.cos(arcAng) * (npc.radius + 2);
        const ay1 = Math.sin(arcAng) * (npc.radius + 2);
        const ax2 = Math.cos(arcAng + 0.8) * (npc.radius + 7);
        const ay2 = Math.sin(arcAng + 0.8) * (npc.radius + 7);
        ctx.beginPath();
        ctx.moveTo(ax1, ay1);
        ctx.lineTo((ax1 + ax2) / 2 + (Math.random() - 0.5) * 4, (ay1 + ay2) / 2);
        ctx.lineTo(ax2, ay2);
        ctx.stroke();
      }

      // Charged Body
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0369a1" : "#082f49");
      ctx.strokeStyle = isHit ? "#bae6fd" : "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Twin Lightning Antennae
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(npc.radius - 2, -6);
      ctx.lineTo(npc.radius + 12, -12);
      ctx.moveTo(npc.radius - 2, 6);
      ctx.lineTo(npc.radius + 12, 12);
      ctx.stroke();

      // Electric Yellow/Cyan Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#fde047";
      ctx.beginPath();
      ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
      ctx.arc(8, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 18. DREADTIDE — Necrotic spectral wraith with tattered ghost currents
    dreadtide(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Tattered Spectral Currents
      ctx.fillStyle = isHit ? "rgba(255,255,255,0.5)" : "rgba(37, 99, 235, 0.35)";
      for (let w = -1; w <= 1; w++) {
        const wave = Math.sin(anim * 2 + w) * 5;
        ctx.beginPath();
        ctx.moveTo(-npc.radius + 4, w * 8);
        ctx.lineTo(-npc.radius - 18, w * 12 + wave);
        ctx.lineTo(-npc.radius - 12, w * 4);
        ctx.closePath();
        ctx.fill();
      }

      // Spectral Revenant Core
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#1d4ed8" : "#172554");
      ctx.strokeStyle = isHit ? "#bfdbfe" : "#2563eb";
      ctx.shadowColor = "rgba(37, 99, 235, 0.9)";
      ctx.shadowBlur = 22;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      // Barnacled Iron Chestplate Fragment
      ctx.fillStyle = isHit ? "#ffffff" : "#334155";
      ctx.beginPath();
      ctx.rect(-6, -6, 12, 12);
      ctx.fill();

      // Ghostly Spectral Gaze
      ctx.fillStyle = isHit ? "#ffffff" : "#93c5fd";
      ctx.beginPath();
      ctx.arc(7, -5, 3, 0, Math.PI * 2);
      ctx.arc(7, 5, 3, 0, Math.PI * 2);
      ctx.fill();
    },

    // 19. TRENCHBORN — Hydrothermal vent beast with sulfur crystals and smoking vents
    trenchborn(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Smoking Vent Chimneys on back
      const chimneys = [
        { x: -8, y: -8 },
        { x: -12, y: 0 },
        { x: -8, y: 8 }
      ];
      chimneys.forEach((ch, idx) => {
        ctx.fillStyle = isHit ? "#ffffff" : "#1e1b4b";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ch.x, ch.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dark volcanic bubble particle
        const bOffset = (anim * 1.5 + idx * 0.7) % 1;
        ctx.fillStyle = `rgba(168, 85, 247, ${1 - bOffset})`;
        ctx.beginPath();
        ctx.arc(ch.x - bOffset * 10, ch.y, 2.5 * bOffset, 0, Math.PI * 2);
        ctx.fill();
      });

      // Basalt Carapace
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#581c87" : "#1e1b4b");
      ctx.strokeStyle = isHit ? "#f3e8ff" : "#9333ea";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#9333ea";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sulfur Crystal Shards
      ctx.fillStyle = isHit ? "#ffffff" : "#facc15";
      ctx.beginPath();
      ctx.moveTo(2, -8);
      ctx.lineTo(7, -13);
      ctx.lineTo(6, -6);
      ctx.closePath();
      ctx.moveTo(2, 8);
      ctx.lineTo(7, 13);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();

      // Violet eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#c084fc";
      ctx.beginPath();
      ctx.arc(9, -4, 2.5, 0, Math.PI * 2);
      ctx.arc(9, 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 20. DEEPWARDEN — Ancient Atlantean temple guardian construct with jade armor
    deepwarden(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // Rotating Warding Runes
      ctx.save();
      ctx.rotate(anim * 0.8);
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.7)" : "rgba(16, 185, 129, 0.45)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        const rx = Math.cos(ang) * (npc.radius + 6);
        const ry = Math.sin(ang) * (npc.radius + 6);
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Hexagonal Carved Jade Armor
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI * 2) / 6;
        const px = Math.cos(ang) * npc.radius;
        const py = Math.sin(ang) * npc.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#047857" : "#064e3b");
      ctx.strokeStyle = isHit ? "#d1fae5" : "#10b981";
      ctx.lineWidth = 3.2;
      ctx.shadowColor = "#059669";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gold Inlaid Atlantean Sigil
      ctx.strokeStyle = isHit ? "#ffffff" : "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.moveTo(-6, -2);
      ctx.lineTo(6, -2);
      ctx.stroke();

      // Emerald Guardian Core
      ctx.fillStyle = isHit ? "#ffffff" : "#34d399";
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    },

    // 21. ABYSSLORD — Regal abyssal sovereign with dark void crystal crown and orbiting pearls
    abysslord(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // 4 Orbiting Royal Void Pearls
      for (let i = 0; i < 4; i++) {
        const ang = anim * 1.6 + (i * Math.PI * 2) / 4;
        const px = Math.cos(ang) * (npc.radius + 8);
        const py = Math.sin(ang) * (npc.radius + 8);
        ctx.fillStyle = isHit ? "#ffffff" : "#c084fc";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Sovereign Mantle
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#6b21a8" : "#3b0764");
      ctx.strokeStyle = isHit ? "#f3e8ff" : "#a855f7";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "rgba(168, 85, 247, 0.9)";
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Crown of Void Crystals (at top)
      ctx.fillStyle = isHit ? "#ffffff" : "#e9d5ff";
      ctx.beginPath();
      ctx.moveTo(-10, -npc.radius + 4);
      ctx.lineTo(-14, -npc.radius - 8);
      ctx.lineTo(-6, -npc.radius + 2);
      ctx.lineTo(0, -npc.radius - 12);
      ctx.lineTo(6, -npc.radius + 2);
      ctx.lineTo(14, -npc.radius - 8);
      ctx.lineTo(10, -npc.radius + 4);
      ctx.closePath();
      ctx.fill();

      // Golden Monarch Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#fde047";
      ctx.beginPath();
      ctx.arc(-5, 0, 2.8, 0, Math.PI * 2);
      ctx.arc(5, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
    },

    // 22. TIDEBREAKER — Heavy battering ram titan with bone armor prow
    tidebreaker(ctx, npc, isHit) {
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Huge Reinforced Forward Battering Ram Prow
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0e7490" : "#155e75");
      ctx.strokeStyle = isHit ? "#cffafe" : "#06b6d4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(npc.radius * 0.4, -npc.radius - 2);
      ctx.lineTo(npc.radius + 18, 0);
      ctx.lineTo(npc.radius * 0.4, npc.radius + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main Armored Hull
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#0891b2" : "#0e3a4e");
      ctx.strokeStyle = isHit ? "#a5f3fc" : "#22d3ee";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bone Armor Plates (lateral bands)
      ctx.strokeStyle = isHit ? "#ffffff" : "#e0f2fe";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-4, 0, npc.radius - 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#f43f5e";
      ctx.beginPath();
      ctx.arc(8, -7, 2.6, 0, Math.PI * 2);
      ctx.arc(8, 7, 2.6, 0, Math.PI * 2);
      ctx.fill();
    },

    // 23. DEPTHFORGED — Sunken clockwork bathysphere construct with glowing porthole
    depthforged(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // Heavy Hydraulic Clamp Arms
      ctx.fillStyle = isHit ? "#ffffff" : "#78350f";
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.rect(npc.radius - 2, -14, 14, 6);
      ctx.rect(npc.radius - 2, 8, 14, 6);
      ctx.fill();
      ctx.stroke();

      // Brass-Riveted Mechanical Bathysphere Hull
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#b45309" : "#451a03");
      ctx.strokeStyle = isHit ? "#fde68a" : "#f59e0b";
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(245, 158, 11, 0.85)";
      ctx.shadowBlur = 22;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Rivets around rim
      ctx.fillStyle = "#fbbf24";
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        const rx = Math.cos(ang) * (npc.radius - 3);
        const ry = Math.sin(ang) * (npc.radius - 3);
        ctx.beginPath();
        ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Illuminated Circular Porthole Lens
      const lampPulse = 0.8 + 0.2 * Math.sin(anim * 3);
      ctx.fillStyle = isHit ? "#ffffff" : `rgba(253, 224, 71, ${lampPulse})`;
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 16 * lampPulse;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    },

    // 24. OCEANBANE — Apocalyptic primordial sea titan with sweeping horns and volcanic vents
    oceanbane(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);
      ctx.rotate(npc.aimAngle || 0);

      // Sweeping Demonic Titan Horns
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#991b1b" : "#450a0a");
      ctx.strokeStyle = isHit ? "#fecaca" : "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(npc.radius * 0.2, -npc.radius);
      ctx.quadraticCurveTo(npc.radius * 0.5, -npc.radius - 18, npc.radius + 14, -npc.radius - 14);
      ctx.lineTo(npc.radius * 0.6, -npc.radius + 2);
      ctx.closePath();
      ctx.moveTo(npc.radius * 0.2, npc.radius);
      ctx.quadraticCurveTo(npc.radius * 0.5, npc.radius + 18, npc.radius + 14, npc.radius + 14);
      ctx.lineTo(npc.radius * 0.6, npc.radius - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Colossal Primordial Titan Core
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : (npc.isHostile ? "#7f1d1d" : "#260303");
      ctx.strokeStyle = isHit ? "#fee2e2" : "#dc2626";
      ctx.lineWidth = 4.2;
      ctx.shadowColor = "rgba(239, 68, 68, 0.95)";
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Volcanic Magma Vents along spine
      const heatPulse = Math.sin(anim * 3) * 2;
      ctx.fillStyle = isHit ? "#ffffff" : "#f97316";
      ctx.beginPath();
      ctx.arc(-8, -6, 3 + heatPulse * 0.3, 0, Math.PI * 2);
      ctx.arc(-10, 6, 3 - heatPulse * 0.3, 0, Math.PI * 2);
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Furious Crimson/Gold Eyes
      ctx.fillStyle = isHit ? "#ffffff" : "#fef08a";
      ctx.beginPath();
      ctx.arc(12, -7, 3, 0, Math.PI * 2);
      ctx.arc(12, 7, 3, 0, Math.PI * 2);
      ctx.fill();
    },

    // 25. ABYSSFORGED — Cosmic abyss nexus / primordial singularity with gravitational accretion rings
    abyssforged(ctx, npc, isHit) {
      const anim = npc.wingTimer || 0;
      ctx.translate(npc.x, npc.y);

      // Dual Counter-Rotating Cosmic Accretion Rings
      ctx.save();
      ctx.rotate(anim * 1.5);
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.8)" : "rgba(168, 85, 247, 0.65)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius + 12, npc.radius - 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.rotate(-anim * 1.2);
      ctx.strokeStyle = isHit ? "rgba(255,255,255,0.8)" : "rgba(139, 92, 246, 0.65)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, npc.radius - 2, npc.radius + 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Orbiting Gravitational Void Shards
      for (let i = 0; i < 5; i++) {
        const shardAng = anim * 2.2 + (i * Math.PI * 2) / 5;
        const sx = Math.cos(shardAng) * (npc.radius + 16);
        const sy = Math.sin(shardAng) * (npc.radius + 16);
        ctx.fillStyle = isHit ? "#ffffff" : "#c084fc";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Singularity Event Horizon Core
      ctx.beginPath();
      ctx.arc(0, 0, npc.radius, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? "#ffffff" : "#05020a";
      ctx.strokeStyle = isHit ? "#f5d0fe" : "#8b5cf6";
      ctx.lineWidth = 4.5;
      ctx.shadowColor = "rgba(139, 92, 246, 1.0)";
      ctx.shadowBlur = 32;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Celestial Galaxy Swirl Core
      const corePulse = 0.85 + 0.15 * Math.sin(anim * 4);
      ctx.fillStyle = isHit ? "#ffffff" : `rgba(167, 139, 250, ${corePulse})`;
      ctx.beginPath();
      ctx.arc(0, 0, 8 * corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Piercing Cosmic Eye
      ctx.fillStyle = isHit ? "#ffffff" : "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

if (typeof window !== "undefined") {
  window.Killstreak = window.Killstreak || {};
  window.Killstreak.AtlantisNpcRenderer = AtlantisNpcRenderer;
}
