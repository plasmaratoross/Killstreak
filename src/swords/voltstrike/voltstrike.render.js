/**
 * voltstrike — blade and phase-aura rendering.
 *
 * Voltstrike is the LIGHTNING / SINGLE / HIGH DAMAGE sword. It must read as
 * compressed electricity rather than as a shape with sparks: thin, sharp, and
 * constantly discharging. Everything here is built from straight segments and
 * jagged bolts, because lightning has no curves — that is also what keeps it
 * visually distinct from Windy (open rotating rings) and Frostbite (facetted,
 * stacked translucent ice).
 *
 * Phase bands:
 *   1-4   Spark / Charge / Current /      — dim, sparse, restrained: a thin blade
 *         Voltage                            with a few short arcs
 *   5     Collapse                        — DELIBERATE COLLAPSE: extremely dim,
 *                                           broken arcs, almost no aura at all
 *   6-8   Surge / Arc / Thunder           — energy floods back, bolts travel the
 *                                           full length of the blade
 *   9-10  Lightning / Stormbolt           — real bolts, multiple layered discharge
 *   11-13 Overcharge / Thunderstrike /    — more than the blade can hold: constant
 *         Cataclysm                          leakage and distortion
 *   14    Malicious Thunderbolt           — maximum density, barely contained
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

/** Deterministic pseudo-random in [0,1) — keeps rendering pure and repeatable. */
const noise = (i) => {
  const s = Math.sin(i * 91.7 + 47.3) * 24634.6345;
  return s - Math.floor(s);
};

/** Jagged electrical bolt between two points. Straight segments only. */
const bolt = (ctx, x0, y0, x1, y1, segments, seed, jitter) => {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const j = (noise(seed + i) - 0.5) * jitter * Math.sin(t * Math.PI);
    ctx.lineTo(x0 + (x1 - x0) * t + j, y0 + (y1 - y0) * t + j * 0.6);
  }
  ctx.lineTo(x1, y1);
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

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (pNum === 5) {
      // Phase 5: Collapse — the energy is simply gone. An almost powerless blade:
      // barely any glow, one weak broken arc, nothing else. Deliberately the
      // weakest-looking weapon in the game.
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#27272a";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = "#a1a1aa";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 10, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 12, w / 2);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#71717a";
      ctx.lineWidth = 1;
      ctx.stroke();

      // A single flicker that immediately dies.
      const flicker = 0.25 + Math.abs(Math.sin(anim * 6)) * 0.35;
      ctx.strokeStyle = `rgba(250, 204, 21, ${flicker})`;
      ctx.lineWidth = 1;
      bolt(ctx, len * 0.2, 0, len * 0.5, 0, 4, 5, 5);
    } else if (pNum <= 4) {
      // Phases 1-4: Spark / Charge / Current / Voltage — restrained. A thin blade
      // with short arcs; the sword is still only containing the electricity.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 14 : 6;

      ctx.fillStyle = "#1c1917";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#fffbeb");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#fbbf24");
      ctx.fillStyle = grad;

      // Narrow, needle-like blade.
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 6, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // A few short arcs, not full-length bolts.
      const arcs = pNum + 1;
      ctx.strokeStyle = "rgba(254, 243, 199, 0.75)";
      ctx.lineWidth = 1;
      for (let i = 0; i < arcs; i++) {
        const x0 = len * (0.1 + i * 0.2);
        bolt(ctx, x0, -w / 2 - 2, x0 + len * 0.16, -w / 2 - 4, 4, i + pNum, 5);
      }
    } else if (pNum <= 8) {
      // Phases 6-8: Surge / Arc / Thunder — the stored energy erupts and becomes
      // focused. Bolts travel the whole blade and jump clear of it.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 8 ? 30 : 22) : (pNum === 8 ? 17 : 11);

      ctx.fillStyle = "#1c1917";
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
      grad.addColorStop(0, "#78350f");
      grad.addColorStop(0.28, accent);
      grad.addColorStop(0.5, "#fffbeb");
      grad.addColorStop(0.72, accent);
      grad.addColorStop(1, "#78350f");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.34, -w / 2 - 2);
      ctx.lineTo(len * 0.62, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.62, w / 2);
      ctx.lineTo(len * 0.34, w / 2 + 2);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fefce8";
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Bolts running the length of the blade.
      ctx.strokeStyle = "rgba(255, 251, 235, 0.9)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const y = (i === 0 ? -1 : 1) * (w / 2 + 3);
        bolt(ctx, 4, y, len * 0.9, y * 0.4, 7, i * 13 + pNum, 6);
      }
    } else if (pNum === 14) {
      // Phase 14: Malicious Thunderbolt — the maximum. Dense layered bolts, energy
      // crawling the whole blade and floating fragments. Nothing else in the game
      // is drawn with this much discharge.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 44 : 30;

      const halo = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.7);
      halo.addColorStop(0, "rgba(240, 249, 255, 0.36)");
      halo.addColorStop(1, "rgba(240, 249, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0c0a09";
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
      core.addColorStop(0, "#0e7490");
      core.addColorStop(0.38, "#7dd3fc");
      core.addColorStop(0.5, "#ffffff");
      core.addColorStop(0.62, "#7dd3fc");
      core.addColorStop(1, "#0e7490");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.28, -w / 2 - 5);
      ctx.lineTo(len * 0.56, -w / 2);
      ctx.lineTo(len * 0.84, -w / 2 - 6);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.84, w / 2 + 6);
      ctx.lineTo(len * 0.56, w / 2);
      ctx.lineTo(len * 0.28, w / 2 + 5);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f0f9ff";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Three layers of discharge at different widths.
      ctx.strokeStyle = "rgba(240, 249, 255, 0.95)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const y = (i - 1) * (w / 2 + 4);
        bolt(ctx, 4, y, len * (0.8 + i * 0.06), y * 0.35, 9, i * 29 + pNum, 9);
      }

      // Floating electrical fragments.
      ctx.fillStyle = "rgba(240, 249, 255, 0.85)";
      for (let i = 0; i < 7; i++) {
        const t = (anim * 0.8 + i * 0.33) % 1;
        const x0 = 8 + t * (len - 16);
        const y0 = (i % 2 === 0 ? -1 : 1) * (w / 2 + 7 + noise(i) * 8);
        ctx.fillRect(x0, y0, 2.4, 2.4);
      }
    } else {
      // Phases 9-13: Lightning / Stormbolt / Overcharge / Thunderstrike /
      // Cataclysm — bolts, layered discharge, energy leaking off the blade.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum >= 11 ? 36 : 28) : (pNum >= 11 ? 22 : 15);

      ctx.fillStyle = "#0c0a09";
      ctx.beginPath();
      ctx.moveTo(-5, -w - 7);
      ctx.lineTo(4, -w - 5);
      ctx.lineTo(3, 0);
      ctx.lineTo(4, w + 5);
      ctx.lineTo(-5, w + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#075985");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#075985");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 4);
      ctx.lineTo(len * 0.6, -w / 2);
      ctx.lineTo(len * 0.88, -w / 2 - 5);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.88, w / 2 + 5);
      ctx.lineTo(len * 0.6, w / 2);
      ctx.lineTo(len * 0.3, w / 2 + 4);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Layered bolts; later phases leak extra discharge off the spine.
      ctx.strokeStyle = "rgba(224, 242, 254, 0.9)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const y = (i === 0 ? -1 : 1) * (w / 2 + 3);
        bolt(ctx, 4, y, len * 0.92, y * 0.3, 8, i * 21 + pNum, 7);
      }
      if (pNum >= 11) {
        ctx.strokeStyle = "rgba(125, 211, 252, 0.75)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const x0 = len * (0.2 + i * 0.22);
          bolt(ctx, x0, -w / 2 - 2, x0 + 6, -w / 2 - 10, 4, i + pNum * 3, 6);
        }
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const anim = player.animTimer || 0;
    const w = player.phase.bladeWidth;

    // The collapse keeps its aura stripped: the whole point is that the energy is
    // not there any more.
    if (pNum === 5) {
      ctx.save();
      ctx.strokeStyle = "rgba(161, 161, 170, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, w + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();

    // Arc collar around the wielder — length and count scale with the phase.
    const arcs = pNum === 14 ? 10 : (pNum >= 9 ? 7 : (pNum >= 6 ? 5 : 3));
    ctx.strokeStyle = `rgba(254, 243, 199, ${pNum >= 9 ? 0.85 : 0.6})`;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < arcs; i++) {
      const a = (i / arcs) * Math.PI * 2 + anim * 1.6;
      const r0 = w + 7;
      const r1 = w + 7 + 6 + noise(i + pNum) * 7;
      bolt(
        ctx,
        Math.cos(a) * r0, Math.sin(a) * r0,
        Math.cos(a) * r1, Math.sin(a) * r1,
        4, i * 17 + pNum, 4
      );
    }

    // Discharge jumping to the ground once the sword becomes real lightning.
    if (pNum >= 9) {
      const strikes = pNum === 14 ? 4 : 2;
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.5 + Math.abs(Math.sin(anim * 3)) * 0.35})`;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < strikes; i++) {
        const a = anim * 0.9 + (i / strikes) * Math.PI * 2;
        bolt(
          ctx,
          Math.cos(a) * (w + 12), Math.sin(a) * (w + 12),
          Math.cos(a) * (w + 12), w + 12 + 14 + noise(i * 5) * 8,
          5, i * 41 + pNum, 7
        );
      }
    }

    // Overcharge and beyond: energy leaking outward as short sparks.
    if (pNum >= 11) {
      ctx.fillStyle = "rgba(240, 249, 255, 0.8)";
      const sparks = pNum === 14 ? 12 : 8;
      for (let i = 0; i < sparks; i++) {
        const t = (anim * 1.1 + noise(i * 7 + pNum)) % 1;
        const a = noise(i + 60) * Math.PI * 2;
        const rr = w + 10 + t * 26;
        ctx.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 2, 2);
      }
    }

    ctx.restore();
  }
};
