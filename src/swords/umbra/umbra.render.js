/**
 * umbra — blade and phase-aura rendering.
 *
 * Umbra is the VOID sword. It must read as *absence* rather than as a dark
 * material: a black core that swallows its own rim, with pale violet light bending
 * INTO it instead of shining out of it. That is what keeps it distinct from
 * Hellfire (which glows outward, red and orange) and from Lumen (which emits).
 * Nothing here is jagged like Voltstrike or facetted like Frostbite — Umbra's
 * vocabulary is the smooth arc, the hard boundary ring, and the inward-pointing
 * radius.
 *
 * The curve is "slow and steady": the phases grow in a straight line with no
 * spike, so the renderer escalates by *deepening* the void one tier at a time
 * (rim -> distortion -> wake -> shell -> pull -> point -> boundary -> wake again),
 * not by adding a flashy new effect each phase.
 *
 * Phase bands:
 *   1-3   Null / Dusk / Shade       — thin dark blade, pale rim, first distortion
 *   4-6   Veil / Hollow / Grasp     — a wake trailing the blade, matter leaning in
 *   7     Unmaking                  — DELIBERATE COLLAPSE: blunt grey blade, one
 *                                     hairline violet seam, no aura
 *   8-11  Abyss / Oblivion /        — deep core ringed in violet; a hard boundary
 *         Event Horizon / Singularity  appears at 10 and a bright knot at 11
 *   12    Unravelling               — DELIBERATE COLLAPSE: scarred black blade,
 *                                     violet light leaking through the cracks
 *   13-14 Voidwake / Erebus         — the blade drags absent space behind it
 *   15    Absolute Void             — the void is simply the default now
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

/** Deterministic pseudo-random in [0,1) — keeps rendering pure and repeatable. */
const noise = (i) => {
  const s = Math.sin(i * 57.1 + 83.9) * 31298.4217;
  return s - Math.floor(s);
};

/** One inward-pointing radius: a line that leans toward the core, never away. */
const inwardLine = (ctx, angle, r0, r1) => {
  ctx.beginPath();
  ctx.moveTo(Math.cos(angle) * r0, Math.sin(angle) * r0);
  ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
  ctx.stroke();
};

export default {
  /** @param {CanvasRenderingContext2D} ctx @param {object} geom @param {object} player */
  drawBlade(ctx, geom, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const len = player.phase.bladeLength;
    const w = player.phase.bladeWidth;
    const anim = player.animTimer || 0;
    const accent = player.phase.color;
    const isCollapse = pNum === 7 || pNum === 12;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (isCollapse) {
      // Unmaking / Unravelling — the void turns on itself. A blunt, scarred slab
      // with a single hairline of violet still surviving along the spine (p7) or
      // leaking through the cracks (p12).
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = pNum === 7 ? "#52525b" : "#292524";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len * 0.55, -w / 2 + 1);
      ctx.lineTo(len - 9, -w / 2 + 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 9, w / 2 - 2);
      ctx.lineTo(len * 0.55, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#71717a";
      ctx.lineWidth = 1;
      ctx.stroke();

      const glow = 0.25 + Math.abs(Math.sin(anim * 2.6)) * 0.35;
      ctx.strokeStyle = `rgba(167, 139, 250, ${glow})`;
      ctx.lineWidth = pNum === 7 ? 1.2 : 1.4;
      if (pNum === 7) {
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(len * 0.88, 0);
        ctx.stroke();
      } else {
        // Cracks leaking violet, drawn as short angled seams off the spine.
        for (let i = 0; i < 4; i++) {
          const x0 = len * (0.2 + i * 0.18);
          const dy = (i % 2 === 0 ? -1 : 1) * (w / 2 - 1);
          ctx.beginPath();
          ctx.moveTo(x0, 0);
          ctx.lineTo(x0 + 7, dy);
          ctx.stroke();
        }
      }
    } else if (pNum <= 3) {
      // Phases 1-3: Null / Dusk / Shade — a thin dark blade under a pale rim. The
      // blade does not shine; the rim is the only thing that reads.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 14 : 6;

      ctx.fillStyle = "#09090b";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#1c1917");
      grad.addColorStop(0.42, "#0c0a09");
      grad.addColorStop(0.5, "#000000");
      grad.addColorStop(0.58, "#0c0a09");
      grad.addColorStop(1, "#1c1917");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 6, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // A couple of inward-leaning whiskers of light.
      ctx.strokeStyle = `rgba(196, 181, 253, ${0.35 + pNum * 0.1})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < pNum; i++) {
        const x0 = len * (0.3 + i * 0.25);
        inwardLine(ctx, -1.1 + noise(i + pNum) * 0.4, x0, x0 * 0.72);
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Veil / Hollow / Grasp — a wake trails the blade and loose
      // matter visibly leans into the edge.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 6 ? 30 : 22) : (pNum === 6 ? 16 : 10);

      const drain = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.7);
      drain.addColorStop(0, "rgba(0, 0, 0, 0.5)");
      drain.addColorStop(0.6, "rgba(124, 58, 237, 0.12)");
      drain.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx.fillStyle = drain;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.moveTo(-4, -w - 4);
      ctx.lineTo(3, -w - 3);
      ctx.lineTo(2, 0);
      ctx.lineTo(3, w + 3);
      ctx.lineTo(-4, w + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const core = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      core.addColorStop(0, "#2e1065");
      core.addColorStop(0.32, "#0c0a09");
      core.addColorStop(0.5, "#000000");
      core.addColorStop(0.68, "#0c0a09");
      core.addColorStop(1, "#2e1065");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.4, -w / 2 - 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.4, w / 2 + 2);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Matter leaning into the edge, on both sides.
      ctx.strokeStyle = "rgba(167, 139, 250, 0.6)";
      ctx.lineWidth = 1;
      const lean = pNum * 2;
      for (let i = 0; i < lean; i++) {
        const t = 0.12 + (i / lean) * 0.76;
        const side = i % 2 === 0 ? -1 : 1;
        const y0 = side * (w / 2 + 4 + noise(i * 5 + pNum) * 7);
        ctx.beginPath();
        ctx.moveTo(len * t, y0);
        ctx.lineTo(len * t * 0.82, side * (w / 2 + 0.5));
        ctx.stroke();
      }
    } else if (pNum === 15) {
      // Phase 15: Absolute Void — there is no core to draw, only the total absence
      // of anything else. A white blade surrounded by black that eats its own rays.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 46 : 32;

      const voidField = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.85);
      voidField.addColorStop(0, "rgba(0, 0, 0, 0.85)");
      voidField.addColorStop(0.55, "rgba(0, 0, 0, 0.45)");
      voidField.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = voidField;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(-6, -w - 8);
      ctx.lineTo(5, -w - 6);
      ctx.lineTo(3, 0);
      ctx.lineTo(5, w + 6);
      ctx.lineTo(-6, w + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const core = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      core.addColorStop(0, "#4c1d95");
      core.addColorStop(0.36, "#c4b5fd");
      core.addColorStop(0.5, "#ffffff");
      core.addColorStop(0.64, "#c4b5fd");
      core.addColorStop(1, "#4c1d95");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 5);
      ctx.lineTo(len * 0.6, -w / 2);
      ctx.lineTo(len * 0.88, -w / 2 - 6);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.88, w / 2 + 6);
      ctx.lineTo(len * 0.6, w / 2);
      ctx.lineTo(len * 0.3, w / 2 + 5);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f5f3ff";
      ctx.lineWidth = 1.7;
      ctx.stroke();

      // Rays that terminate before they reach the blade: light falls in, never out.
      ctx.strokeStyle = "rgba(221, 214, 254, 0.7)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + anim * 0.4;
        const r1 = w + 8;
        const r0 = len * 0.9 + noise(i * 17) * len * 0.25;
        inwardLine(ctx, a, r0, r1);
      }
    } else {
      // Phases 8-11 and 13-14: Abyss / Oblivion / Event Horizon / Singularity /
      // Voidwake / Erebus — a deep core ringed in violet. From Event Horizon on the
      // ring is a HARD boundary; from Singularity on there is a bright knot.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum >= 13 ? 40 : 30) : (pNum >= 13 ? 24 : 16);

      if (pNum >= 13) {
        // The wake: a trailing smear of absent space behind the blade.
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, -w - 6);
        ctx.lineTo(4, -w - 3);
        ctx.lineTo(3, w + 3);
        ctx.lineTo(-len * 0.5, w + 6);
        ctx.closePath();
        ctx.fill();
      }

      if (pNum >= 10) {
        // Event horizon: a hard ring that nothing crosses.
        const pulse = 0.5 + Math.abs(Math.sin(anim * 2.2)) * 0.4;
        ctx.strokeStyle = `rgba(196, 181, 253, ${pulse})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, w + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(-5, -w - 6);
      ctx.lineTo(4, -w - 4);
      ctx.lineTo(3, 0);
      ctx.lineTo(4, w + 4);
      ctx.lineTo(-5, w + 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#2e1065");
      grad.addColorStop(0.3, "#0c0a09");
      grad.addColorStop(0.5, "#000000");
      grad.addColorStop(0.7, "#0c0a09");
      grad.addColorStop(1, "#2e1065");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.32, -w / 2 - 4);
      ctx.lineTo(len * 0.62, -w / 2);
      ctx.lineTo(len * 0.9, -w / 2 - 5);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.9, w / 2 + 5);
      ctx.lineTo(len * 0.62, w / 2);
      ctx.lineTo(len * 0.32, w / 2 + 4);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Violet rim light, alive along both edges.
      const rim = 0.55 + Math.abs(Math.sin(anim * 3)) * 0.35;
      ctx.strokeStyle = `rgba(167, 139, 250, ${rim})`;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 2; i++) {
        const y = (i === 0 ? -1 : 1) * (w / 2 + 1.5);
        ctx.beginPath();
        ctx.moveTo(4, y);
        ctx.lineTo(len * 0.94, y * 0.35);
        ctx.stroke();
      }

      // Singularity and beyond: a single bright knot at the centre of the blade.
      if (pNum >= 11) {
        const knot = ctx.createRadialGradient(0, 0, 0, 0, 0, w + 5);
        knot.addColorStop(0, "rgba(245, 243, 255, 0.95)");
        knot.addColorStop(0.5, "rgba(196, 181, 253, 0.5)");
        knot.addColorStop(1, "rgba(196, 181, 253, 0)");
        ctx.fillStyle = knot;
        ctx.beginPath();
        ctx.arc(0, 0, w + 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const anim = player.animTimer || 0;
    const w = player.phase.bladeWidth;

    // Both collapses strip the aura: the void is currently busy eating itself.
    if (pNum === 7 || pNum === 12) {
      ctx.save();
      ctx.strokeStyle = pNum === 7 ? "rgba(63, 63, 70, 0.3)" : "rgba(41, 37, 36, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, w + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();

    // Everything here points INWARD. That is the whole visual grammar of the sword.
    const lines = pNum === 15 ? 18 : (pNum >= 10 ? 12 : (pNum >= 4 ? 8 : 5));
    const spin = pNum >= 8 ? anim * 0.5 : 0;
    ctx.strokeStyle = `rgba(167, 139, 250, ${pNum >= 10 ? 0.6 : 0.4})`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < lines; i++) {
      const a = (i / lines) * Math.PI * 2 + spin;
      const r1 = w + 7;
      const r0 = r1 + 12 + noise(i * 9 + pNum) * (pNum >= 10 ? 22 : 13);
      inwardLine(ctx, a, r0, r1);
    }

    // From Abyss onward the boundary is a ring; from Event Horizon it is hard.
    if (pNum >= 8) {
      const hard = pNum >= 10;
      ctx.strokeStyle = `rgba(196, 181, 253, ${hard ? 0.7 : 0.4})`;
      ctx.lineWidth = hard ? 2.2 : 1.4;
      ctx.setLineDash(hard ? [] : [10, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, w + (hard ? 22 : 18), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // The void dims its surroundings. Drawn as a black wash over the ground.
    if (pNum >= 5) {
      ctx.fillStyle = `rgba(0, 0, 0, ${pNum === 15 ? 0.3 : 0.16})`;
      ctx.beginPath();
      ctx.arc(0, 0, w + 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Absolute Void: motes that fall inward and never arrive.
    if (pNum === 15) {
      ctx.fillStyle = "rgba(237, 233, 254, 0.8)";
      for (let i = 0; i < 14; i++) {
        const t = (anim * 0.35 + noise(i * 11 + 7)) % 1;
        const a = noise(i + 50) * Math.PI * 2;
        const rr = w + 10 + (1 - t) * 38;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
};
