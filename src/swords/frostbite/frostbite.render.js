/**
 * frostbite — blade and phase-aura rendering.
 *
 * Frostbite is the FROZEN / SLOW / DEBUFF sword. Where Windy is slim and fast,
 * Frostbite is heavy, angular and crystalline: the blade should read as a chunk of
 * glacier that was shaped into a weapon, not as a thin blade with blue particles.
 * Every silhouette here is therefore built from polygons with visible facets and
 * stacked translucent layers.
 *
 * Phase bands:
 *   1-3   Ice Cube / Frost / Chill      — near-plain angular blade, a few crystals
 *   4-6   Icebound / Frozen / Glacier   — ice plating, frost mist, first spectacle
 *   7     Shatter                       — DELIBERATE COLLAPSE: cracked, fragmentary,
 *                                         almost no aura; only the cracks glow
 *   8-10  Permafrost / Deep Freeze /    — the ice reforms and outgrows the glacier:
 *         Frozen Wasteland                layered translucent ice, constant snow
 *   11    Fracture                      — DELIBERATE COLLAPSE: mismatched shards and
 *                                         gaps where ice is missing
 *   12    Absolute Zero                 — maximum complexity: stacked layers,
 *                                         floating shards, crystalline halo
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

/** Deterministic pseudo-random in [0,1) — keeps rendering pure and repeatable. */
const noise = (i) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = player.phase.bladeLength;
    const w = player.phase.bladeWidth;
    const anim = player.animTimer || 0;
    const accent = player.phase.color;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (pNum === 7) {
      // Phase 7: Shatter — the glacier breaks. A stunted, mismatched blade with
      // cracks running through it and no aura to speak of. Deliberately weak: the
      // art must not sell this as an upgrade.
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len * 0.55, -w / 2 + 1);
      ctx.lineTo(len * 0.72, -1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.6, w / 2 + 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cracks glow faintly — the only sign the cold is still in there.
      ctx.strokeStyle = "rgba(125, 211, 252, 0.55)";
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 3; i++) {
        const x0 = len * (0.18 + i * 0.22);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2);
        ctx.lineTo(x0 + 4, 0);
        ctx.lineTo(x0 - 2, w / 2);
        ctx.stroke();
      }
    } else if (pNum === 11) {
      // Phase 11: Fracture — the same break, but across a blade that has grown far
      // too large for the ice holding it together. Sections are simply missing.
      ctx.shadowColor = "rgba(100, 116, 139, 0.35)";
      ctx.shadowBlur = player.isAttacking ? 10 : 4;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-3, -w / 2 - 2, 5, w + 4);

      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 3);
      ctx.lineTo(len * 0.46, -w / 2 + 3);   // gap
      ctx.lineTo(len * 0.66, -w / 2 - 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.7, w / 2 + 4);
      ctx.lineTo(len * 0.5, w / 2 - 2);     // gap
      ctx.lineTo(len * 0.26, w / 2 + 2);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const x0 = len * (0.14 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2);
        ctx.lineTo(x0 + 5, 0);
        ctx.lineTo(x0 + 1, w / 2);
        ctx.stroke();
      }
    } else if (pNum <= 3) {
      // Phases 1-3: Ice Cube / Frost / Chill — a small angular chip of ice. Barely
      // any effect: the cold has not started doing anything interesting yet.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 10 : 4;

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#f8fafc");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#cbd5e1");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 7, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 7, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // A couple of facets catching the light.
      ctx.strokeStyle = "rgba(248, 250, 252, 0.55)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) {
        const x0 = len * (0.3 + i * 0.3);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2 + 1);
        ctx.lineTo(x0 + 4, w / 2 - 1);
        ctx.stroke();
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Icebound / Frozen / Glacier — ice plating grows along the spine
      // and the blade thickens noticeably. Phase 6 is the first real spectacle.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 6 ? 26 : 18) : (pNum === 6 ? 15 : 9);

      // Guard / ice shelf behind the blade.
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(-4, -w - 5);
      ctx.lineTo(3, -w - 4);
      ctx.lineTo(2, 0);
      ctx.lineTo(3, w + 4);
      ctx.lineTo(-4, w + 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#0c4a6e");
      grad.addColorStop(0.28, accent);
      grad.addColorStop(0.5, "#f0f9ff");
      grad.addColorStop(0.72, accent);
      grad.addColorStop(1, "#0c4a6e");
      ctx.fillStyle = grad;

      // Blocky, glacier-cut profile.
      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.26, -w / 2 - 4);
      ctx.lineTo(len * 0.52, -w / 2 - 1);
      ctx.lineTo(len * 0.8, -w / 2 - 5);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.8, w / 2 + 5);
      ctx.lineTo(len * 0.52, w / 2 + 1);
      ctx.lineTo(len * 0.26, w / 2 + 4);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Ice plating sitting proud of the edge.
      ctx.fillStyle = "rgba(224, 242, 254, 0.5)";
      const plates = pNum === 6 ? 4 : 3;
      for (let i = 0; i < plates; i++) {
        const x0 = len * (0.16 + i * 0.18);
        const h = w * (0.22 + noise(i + pNum) * 0.2);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2 - 2);
        ctx.lineTo(x0 + 6, -w / 2 - 2 - h);
        ctx.lineTo(x0 + 11, -w / 2 - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Frost mist running off the edge.
      ctx.strokeStyle = "rgba(224, 242, 254, 0.45)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const off = -w / 2 - 4 - i * 3.5;
        ctx.beginPath();
        ctx.moveTo(6, off);
        ctx.lineTo(len * (0.7 + i * 0.08) + Math.sin(anim * 2 + i) * 2, off);
        ctx.stroke();
      }
    } else if (pNum === 12) {
      // Phase 12: Absolute Zero — the ultimate form. Layered translucent ice,
      // hostile overhang, floating shards, constant snow. Nothing else in the game
      // is drawn this elaborately.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 40 : 26;

      // Halo behind the whole weapon.
      const halo = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.75);
      halo.addColorStop(0, "rgba(224, 242, 254, 0.34)");
      halo.addColorStop(1, "rgba(224, 242, 254, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#082f49";
      ctx.beginPath();
      ctx.moveTo(-7, -w - 10);
      ctx.lineTo(6, -w - 8);
      ctx.lineTo(4, 0);
      ctx.lineTo(6, w + 8);
      ctx.lineTo(-7, w + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Core blade, then two translucent shells around it.
      const core = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      core.addColorStop(0, "#0e7490");
      core.addColorStop(0.4, accent);
      core.addColorStop(0.5, "#ffffff");
      core.addColorStop(0.6, accent);
      core.addColorStop(1, "#0e7490");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.24, -w / 2 - 7);
      ctx.lineTo(len * 0.48, -w / 2);
      ctx.lineTo(len * 0.72, -w / 2 - 9);
      ctx.lineTo(len * 0.9, -w / 2 + 3);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.9, w / 2 - 3);
      ctx.lineTo(len * 0.72, w / 2 + 9);
      ctx.lineTo(len * 0.48, w / 2);
      ctx.lineTo(len * 0.24, w / 2 + 7);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#f0f9ff";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "rgba(224, 242, 254, 0.42)";
      ctx.beginPath();
      ctx.moveTo(len * 0.2, -w / 2 - 4);
      ctx.lineTo(len * 0.5, -w / 2 - 4);
      ctx.lineTo(len * 0.66, w / 2 + 4);
      ctx.lineTo(len * 0.34, w / 2 + 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(165, 243, 252, 0.3)";
      ctx.beginPath();
      ctx.moveTo(len * 0.55, -w / 2 - 6);
      ctx.lineTo(len * 0.82, -w / 2 - 6);
      ctx.lineTo(len * 0.9, w / 2 + 6);
      ctx.lineTo(len * 0.62, w / 2 + 6);
      ctx.closePath();
      ctx.fill();

      // Floating shards orbiting the blade.
      ctx.fillStyle = "rgba(224, 242, 254, 0.85)";
      for (let i = 0; i < 6; i++) {
        const t = (anim * 0.6 + i * 0.37) % 1;
        const x0 = 8 + t * (len - 16);
        const y0 = (i % 2 === 0 ? -1 : 1) * (w / 2 + 6 + noise(i) * 7);
        const s = 2 + noise(i + 30) * 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0 - s);
        ctx.lineTo(x0 + s, y0);
        ctx.lineTo(x0, y0 + s);
        ctx.lineTo(x0 - s, y0);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Phases 8-10: Permafrost / Deep Freeze / Frozen Wasteland — the ice reforms
      // and grows past what the glacier ever managed. More layers each phase.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 10 ? 34 : 24) : (pNum === 10 ? 20 : 13);

      ctx.fillStyle = "#082f49";
      ctx.beginPath();
      ctx.moveTo(-6, -w - 8);
      ctx.lineTo(5, -w - 6);
      ctx.lineTo(3, 0);
      ctx.lineTo(5, w + 6);
      ctx.lineTo(-6, w + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#075985");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#f0f9ff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#075985");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.22, -w / 2 - 6);
      ctx.lineTo(len * 0.44, -w / 2);
      ctx.lineTo(len * 0.68, -w / 2 - 8);
      ctx.lineTo(len * 0.86, -w / 2 + 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.86, w / 2 - 2);
      ctx.lineTo(len * 0.68, w / 2 + 8);
      ctx.lineTo(len * 0.44, w / 2);
      ctx.lineTo(len * 0.22, w / 2 + 6);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#bae6fd";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Translucent ice layer laid over the core.
      ctx.fillStyle = "rgba(224, 242, 254, 0.34)";
      ctx.beginPath();
      ctx.moveTo(len * 0.3, -w / 2 - 3);
      ctx.lineTo(len * 0.6, -w / 2 - 3);
      ctx.lineTo(len * 0.74, w / 2 + 3);
      ctx.lineTo(len * 0.42, w / 2 + 3);
      ctx.closePath();
      ctx.fill();

      // Frozen ground shelf under the guard, texturing the base of the weapon.
      ctx.fillStyle = "rgba(8, 145, 178, 0.35)";
      ctx.beginPath();
      ctx.ellipse(2, 0, 9, w + 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const anim = player.animTimer || 0;
    const w = player.phase.bladeWidth;
    const accent = player.phase.color;

    // Collapse phases keep their auras stripped back on purpose: the whole point of
    // Shatter and Fracture is that the power is not there any more.
    if (pNum === 7 || pNum === 11) {
      ctx.save();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, w + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();

    const layers = pNum === 12 ? 4 : (pNum >= 8 ? 3 : (pNum >= 4 ? 2 : 1));

    for (let i = 0; i < layers; i++) {
      const r = w + 8 + i * 7;
      const spin = anim * (0.5 + i * 0.3) * (i % 2 === 0 ? 1 : -1);
      ctx.strokeStyle = `rgba(224, 242, 254, ${0.32 - i * 0.06})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Open ring, not a filled disc — the swords read as shapes, not blobs.
      ctx.arc(0, 0, r, spin, spin + Math.PI * 1.35);
      ctx.stroke();
    }

    // Crystalline points around the wielder, growing with phase.
    if (pNum >= 4) {
      const spikes = pNum === 12 ? 8 : (pNum >= 8 ? 6 : 4);
      ctx.fillStyle = "rgba(224, 242, 254, 0.5)";
      for (let i = 0; i < spikes; i++) {
        const a = anim * 0.4 + (i / spikes) * Math.PI * 2;
        const rr = w + 14 + noise(i + pNum) * 8;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        const s = 1.6 + noise(i + 7) * 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y - s);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x, y + s);
        ctx.lineTo(x - s, y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Drifting snow, densest at absolute zero.
    if (pNum >= 5) {
      const flakes = pNum === 12 ? 14 : (pNum >= 8 ? 9 : 5);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (let i = 0; i < flakes; i++) {
        const t = (anim * 0.25 + noise(i * 3 + pNum)) % 1;
        const a = noise(i + 90) * Math.PI * 2;
        const rr = w + 6 + t * 30;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Absolute Zero: a cold floor ring that reads as ground freezing underfoot.
    if (pNum === 12) {
      const pulse = 0.5 + Math.sin(anim * 2.2) * 0.5;
      ctx.strokeStyle = `rgba(165, 243, 252, ${0.18 + pulse * 0.16})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, w + 44 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
};
