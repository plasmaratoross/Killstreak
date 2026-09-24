/**
 * lumen — blade and phase-aura rendering.
 *
 * Lumen is the LIGHT sword. It must read as *emitted* light rather than a
 * reflective metal edge: the blade is a bright core, and everything else is
 * straight rays, concentric halos and glare thrown clear of the weapon. That is
 * also what keeps it distinct from Voltstrike (jagged electrical bolts) and
 * Frostbite (facetted, stacked translucent ice) — Lumen never uses a jagged
 * segment line, only straight radii and rings.
 *
 * The curve is "radiant then refined": phases 1-6 escalate very fast and the
 * later phases grow slowly, so the renderer makes the *quality* of the light
 * change (core -> beam -> field -> crown -> orbit -> detonation -> source) rather
 * than simply adding more of it.
 *
 * Phase bands:
 *   1-3   Glimmer / Glow / Gleam        — thin blade, bright edge, few short rays
 *   4-6   Beam / Radiance / Solaris     — a held beam, halo, rays thrown clear
 *   7     Eclipse                        — DELIBERATE COLLAPSE: grey blade, one
 *                                          surviving seam of glow, no aura
 *   8-11  Daybreak / Zenith / Corona /   — layered light: halos, crowns, orbit
 *         Halo
 *   12    Occultation                    — DELIBERATE COLLAPSE: stone-grey, single
 *                                          seam, no aura
 *   13    Supernova                      — blinding core with expanding shells
 *   14    Eternal Noon                   — the source itself: white, no shadow
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

/** Deterministic pseudo-random in [0,1) — keeps rendering pure and repeatable. */
const noise = (i) => {
  const s = Math.sin(i * 71.3 + 19.7) * 43758.5453;
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
    const isCollapse = pNum === 7 || pNum === 12;

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (isCollapse) {
      // Eclipse / Occultation — the light is blocked, not lost. A dull grey bar
      // with one thin seam of colour still leaking out of it, and nothing else.
      // Deliberately the dimmest thing in the sword's whole progression.
      ctx.shadowBlur = 0;

      ctx.fillStyle = pNum === 7 ? "#1e293b" : "#1c1917";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = "#a8a29e";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 8, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 8, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#78716c";
      ctx.lineWidth = 1;
      ctx.stroke();

      // The surviving seam. It pulses rather than shines.
      const seam = 0.3 + Math.abs(Math.sin(anim * 3.2)) * 0.4;
      ctx.strokeStyle = pNum === 7
        ? `rgba(226, 232, 240, ${seam})`
        : `rgba(254, 243, 199, ${seam})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(len * 0.86, 0);
      ctx.stroke();
    } else if (pNum <= 3) {
      // Phases 1-3: Glimmer / Glow / Gleam — a thin blade with a hard bright edge
      // and a handful of short rays. The light is still contained.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 16 : 8;

      ctx.fillStyle = "#451a03";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#fffbeb");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#fbbf24");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 6, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 6, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fffbeb";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Straight rays, not arcs — light travels in lines.
      const rays = pNum + 1;
      ctx.strokeStyle = "rgba(255, 251, 235, 0.8)";
      ctx.lineWidth = 1;
      for (let i = 0; i < rays; i++) {
        const x0 = len * (0.16 + i * 0.22);
        const a = -0.9 + noise(i + pNum) * 1.8;
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2 - 1);
        ctx.lineTo(x0 + Math.cos(a) * len * 0.14, -w / 2 - 3 - Math.abs(Math.sin(a)) * len * 0.12);
        ctx.stroke();
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Beam / Radiance / Solaris — the blade becomes a held beam.
      // Bright core, halo bleeding off both edges, rays thrown clear.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 6 ? 34 : 26) : (pNum === 6 ? 19 : 13);

      const halo = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.6);
      halo.addColorStop(0, "rgba(255, 251, 235, 0.28)");
      halo.addColorStop(1, "rgba(255, 251, 235, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#451a03";
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

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#78350f");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#78350f");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.36, -w / 2 - 2);
      ctx.lineTo(len * 0.66, -w / 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.66, w / 2);
      ctx.lineTo(len * 0.36, w / 2 + 2);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fffbeb";
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Rays thrown clear of the blade on both sides.
      ctx.strokeStyle = "rgba(255, 251, 235, 0.85)";
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 4; i++) {
        const t = 0.12 + i * 0.2;
        const y = (i % 2 === 0 ? -1 : 1) * (w / 2 + 2);
        const a = (i % 2 === 0 ? -1 : 1) * (0.35 + noise(i * 3 + pNum) * 0.5);
        ctx.beginPath();
        ctx.moveTo(len * t, y);
        ctx.lineTo(len * t + Math.cos(a) * len * 0.2, y + Math.sin(a) * len * 0.2);
        ctx.stroke();
      }
    } else if (pNum === 14) {
      // Phase 14: Eternal Noon — the source. A white core that does not cast
      // shadow, wrapped in dense concentric light and a permanent halo.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 48 : 34;

      for (let ring = 3; ring >= 1; ring--) {
        const r = len * (0.5 + ring * 0.22);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - ring * 0.07})`;
        ctx.lineWidth = ring === 1 ? 2.4 : 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      const halo = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.9);
      halo.addColorStop(0, "rgba(255, 255, 255, 0.5)");
      halo.addColorStop(0.5, "rgba(254, 240, 138, 0.22)");
      halo.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#713f12";
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
      core.addColorStop(0, "#f59e0b");
      core.addColorStop(0.4, "#fef3c7");
      core.addColorStop(0.5, "#ffffff");
      core.addColorStop(0.6, "#fef3c7");
      core.addColorStop(1, "#f59e0b");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(4, -w / 2);
      ctx.lineTo(len * 0.3, -w / 2 - 5);
      ctx.lineTo(len * 0.58, -w / 2);
      ctx.lineTo(len * 0.86, -w / 2 - 6);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.86, w / 2 + 6);
      ctx.lineTo(len * 0.58, w / 2);
      ctx.lineTo(len * 0.3, w / 2 + 5);
      ctx.lineTo(4, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.7;
      ctx.stroke();

      // Rays at every angle, straight out of the core.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + anim * 0.5;
        const r0 = w + 6;
        const r1 = len * 0.72 + noise(i * 11 + 3) * len * 0.3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.stroke();
      }
    } else {
      // Phases 8-11 and 13: Daybreak / Zenith / Corona / Halo / Supernova —
      // layered light. The blade is a bright core and the light has *structure*:
      // crowns, rotating halos, expanding shells.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum >= 13 ? 42 : 32) : (pNum >= 13 ? 26 : 18);

      const shells = pNum >= 13 ? 3 : (pNum >= 10 ? 2 : 1);
      for (let s = shells; s >= 1; s--) {
        const t = ((anim * 0.5 + s * 0.3) % 1);
        ctx.strokeStyle = `rgba(255, 251, 235, ${(1 - t) * 0.35})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, w + 6 + t * len * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#451a03";
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
      grad.addColorStop(0, "#92400e");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#92400e");
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

      ctx.strokeStyle = "#fffbeb";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Crown: layered straight rays along the spine.
      ctx.strokeStyle = "rgba(255, 251, 235, 0.88)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const y = (i === 0 ? -1 : 1) * (w / 2 + 3);
        for (let k = 0; k < 4; k++) {
          const x0 = len * (0.15 + k * 0.2);
          ctx.beginPath();
          ctx.moveTo(x0, y);
          ctx.lineTo(x0 + 5, y * 1.9);
          ctx.stroke();
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

    // Both collapses keep the aura stripped: the whole point is that the light is
    // being blocked, so there is nothing radiating outward.
    if (pNum === 7 || pNum === 12) {
      ctx.save();
      ctx.strokeStyle = pNum === 7 ? "rgba(148, 163, 184, 0.22)" : "rgba(120, 113, 108, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, w + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();

    const rings = pNum === 14 ? 4 : (pNum >= 10 ? 3 : (pNum >= 4 ? 2 : 1));
    const strength = pNum === 14 ? 0.85 : (pNum >= 10 ? 0.6 : (pNum >= 4 ? 0.42 : 0.28));

    // Concentric halos — light organised into rings, one per tier of the curve.
    for (let i = 0; i < rings; i++) {
      const r = w + 8 + i * 11 + Math.sin(anim * 1.4 + i) * 2.5;
      ctx.strokeStyle = `rgba(255, 251, 235, ${strength * (1 - i / (rings + 1))})`;
      ctx.lineWidth = i === 0 ? 2 : 1.2;
      ctx.setLineDash(i % 2 === 0 ? [] : [12, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Rays radiating out from the wielder. From Halo onward they rotate.
    const rays = pNum === 14 ? 16 : (pNum >= 10 ? 11 : (pNum >= 4 ? 7 : 5));
    const spin = pNum >= 10 ? anim * 0.6 : 0;
    ctx.strokeStyle = `rgba(254, 240, 138, ${pNum >= 10 ? 0.7 : 0.45})`;
    ctx.lineWidth = 1.3;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + spin;
      const r0 = w + 9;
      const r1 = r0 + 9 + noise(i * 13 + pNum) * 12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
    }

    // Corona / Halo / Supernova / Eternal Noon: light pooling on the ground.
    if (pNum >= 8) {
      const pool = pNum === 14 ? 0.22 : (pNum >= 13 ? 0.18 : 0.12);
      ctx.fillStyle = `rgba(254, 243, 199, ${pool})`;
      ctx.beginPath();
      ctx.arc(0, 0, w + 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eternal Noon: floating motes of light that never fade out.
    if (pNum === 14) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      for (let i = 0; i < 14; i++) {
        const t = (anim * 0.5 + noise(i * 7 + 5)) % 1;
        const a = noise(i + 40) * Math.PI * 2;
        const rr = w + 12 + t * 34;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
};
