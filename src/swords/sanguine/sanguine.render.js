/**
 * sanguine — blade and phase-aura rendering.
 *
 * Sanguine is the BLOOD sword. It must read as *wet and alive* rather than as red
 * fire: the blade is a pumping organ, its motion is a heartbeat, and everything it
 * does is downward (drips, pools, spray) rather than upward. That is what keeps it
 * distinct from Hellfire (which burns upward, orange, with embers) and from Umbra
 * (which pulls inward and is black). Sanguine never uses a flame shape.
 *
 * The curve is "fragile then explosive": phases 1-6 are deliberately pathetic —
 * thin, leaking, barely holding a shape — and the renderer has to make that read
 * as *weak* rather than as a smaller version of the strong thing. Phase 8 is then
 * an abrupt, visible jump in presence, not a gradual continuation.
 *
 * Phase bands:
 *   1-3   Droplet / Cut / Bleed        — a thin wet sliver, a few drips
 *   4-6   Wound / Hemorrhage /         — raw, open, spraying; veins on the edge
 *         Bloodloss
 *   7     Flatline                      — DELIBERATE COLLAPSE: flat grey slab, no
 *                                         pulse, no drips, no aura
 *   8-11  Rebound / Pulse / Throb /     — the blade beats and throws rings of blood
 *         Crimson
 *   12    Fester                        — DELIBERATE COLLAPSE: dark rotting core
 *   13-15 Carnage / Bloodlust /         — heavy spray, veins, a tide on the ground
 *         Crimson Tide
 *   16    Heartstopper                  — pale white blade over a black-red field
 *
 * Pure with respect to its parameters: state is read from `player`/`geom`, never
 * from globals or `window.Killstreak`. drawBlade receives
 * (ctx, geom = { baseX, baseY, angle }, player); drawAura receives (ctx, player).
 */

/** Deterministic pseudo-random in [0,1) — keeps rendering pure and repeatable. */
const noise = (i) => {
  const s = Math.sin(i * 39.7 + 61.1) * 24634.6345;
  return s - Math.floor(s);
};

/** A falling drip: a short tail off the blade, always downward. */
const drip = (ctx, x, y, len) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + len);
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
    const isFlatline = pNum === 7;
    const isFester = pNum === 12;
    // The heartbeat: a single sharp beat rather than a smooth sine, so the blade
    // visibly *thumps* instead of glowing steadily.
    const beat = Math.pow(Math.abs(Math.sin(anim * 2.6)), 6);

    ctx.save();
    ctx.translate(geom.baseX, geom.baseY);
    ctx.rotate(geom.angle);

    if (isFlatline || isFester) {
      // Flatline / Fester — the blood has stopped. A blunt slab with no pulse and
      // no drips. Fester is darker and rotted rather than merely grey.
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#0c0a09";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      ctx.fillStyle = isFlatline ? "#52525b" : "#44403c";
      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len * 0.5, -w / 2 + 1);
      ctx.lineTo(len - 9, -w / 2 + 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 9, w / 2 - 2);
      ctx.lineTo(len * 0.5, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#78716c";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (isFlatline) {
        // The flatline itself: one dead horizontal trace, no variation at all.
        ctx.strokeStyle = "rgba(161, 161, 170, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(len * 0.9, 0);
        ctx.stroke();
      } else {
        // Rot: dark blotches eating into the slab from both edges.
        ctx.fillStyle = "rgba(28, 25, 23, 0.85)";
        for (let i = 0; i < 5; i++) {
          const x0 = len * (0.16 + i * 0.16);
          const side = i % 2 === 0 ? -1 : 1;
          ctx.beginPath();
          ctx.arc(x0, side * (w / 2 - 0.5), 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pNum <= 3) {
      // Phases 1-3: Droplet / Cut / Bleed — a thin wet sliver. Deliberately the
      // least impressive blade in the game.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 10 : 4;

      ctx.fillStyle = "#450a0a";
      ctx.fillRect(-2, -w / 2 - 1, 4, w + 2);

      const grad = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      grad.addColorStop(0, "#fecaca");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(2, -w / 2);
      ctx.lineTo(len - 7, -w / 2 + 1);
      ctx.lineTo(len, 0);
      ctx.lineTo(len - 7, w / 2 - 1);
      ctx.lineTo(2, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#fee2e2";
      ctx.lineWidth = 1;
      ctx.stroke();

      // A few drips falling off the underside.
      ctx.strokeStyle = "rgba(220, 38, 38, 0.75)";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < pNum; i++) {
        const x0 = len * (0.3 + i * 0.24);
        const t = (anim * 1.6 + noise(i) * 1.4) % 1;
        drip(ctx, x0, w / 2 + 1, 2 + t * (4 + pNum * 2));
      }
    } else if (pNum <= 6) {
      // Phases 4-6: Wound / Hemorrhage / Bloodloss — raw and open. Veins crawl
      // along the edge and blood sprays clear of the blade.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum === 6 ? 26 : 18) : (pNum === 6 ? 13 : 8);

      ctx.fillStyle = "#450a0a";
      ctx.beginPath();
      ctx.moveTo(-4, -w - 4);
      ctx.lineTo(3, -w - 3);
      ctx.lineTo(2, 0);
      ctx.lineTo(3, w + 3);
      ctx.lineTo(-4, w + 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const core = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
      core.addColorStop(0, "#7f1d1d");
      core.addColorStop(0.35, accent);
      core.addColorStop(0.5, "#fecaca");
      core.addColorStop(0.65, accent);
      core.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = core;

      ctx.beginPath();
      ctx.moveTo(3, -w / 2);
      ctx.lineTo(len * 0.38, -w / 2 - 2);
      ctx.lineTo(len, 0);
      ctx.lineTo(len * 0.38, w / 2 + 2);
      ctx.lineTo(3, w / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Veins across the blade face.
      ctx.strokeStyle = "rgba(127, 29, 29, 0.9)";
      ctx.lineWidth = 1;
      for (let i = 0; i < pNum; i++) {
        const x0 = len * (0.15 + i * 0.14);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2 + 1);
        ctx.lineTo(x0 + 5, -w / 2 + 1 + (i % 2 === 0 ? 2 : -1));
        ctx.lineTo(x0 + 9, 0);
        ctx.stroke();
      }

      // Spray leaving the edge on every swing.
      if (player.isAttacking) {
        ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
        ctx.lineWidth = 1.3;
        for (let i = 0; i < pNum + 2; i++) {
          const x0 = len * (0.2 + noise(i * 3 + pNum) * 0.7);
          const side = i % 2 === 0 ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(x0, side * (w / 2));
          ctx.lineTo(x0 + 6, side * (w / 2 + 7 + noise(i * 5) * 5));
          ctx.stroke();
        }
      }
    } else if (pNum === 16) {
      // Phase 16: Heartstopper — a pale, almost white blade sitting inside a
      // black-red field, with dark veins and no drips left (it has taken enough).
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? 46 : 32;

      const field = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.85);
      field.addColorStop(0, "rgba(76, 5, 25, 0.7)");
      field.addColorStop(0.55, "rgba(127, 29, 29, 0.28)");
      field.addColorStop(1, "rgba(127, 29, 29, 0)");
      ctx.fillStyle = field;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#450a0a";
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
      core.addColorStop(0, "#7f1d1d");
      core.addColorStop(0.38, "#fb7185");
      core.addColorStop(0.5, "#ffffff");
      core.addColorStop(0.62, "#fb7185");
      core.addColorStop(1, "#7f1d1d");
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

      ctx.strokeStyle = "#fff1f2";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Black-red veins, the only dark thing on the blade.
      ctx.strokeStyle = "rgba(69, 10, 10, 0.95)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const x0 = len * (0.14 + i * 0.16);
        ctx.beginPath();
        ctx.moveTo(x0, -w / 2 + 1);
        ctx.lineTo(x0 + 6, -w / 2 + 3);
        ctx.lineTo(x0 + 12, 0);
        ctx.lineTo(x0 + 6, w / 2 - 3);
        ctx.lineTo(x0, w / 2 - 1);
        ctx.stroke();
      }

      // The beat is slow and enormous now.
      const pulse = 0.25 + beat * 0.5;
      ctx.strokeStyle = `rgba(255, 241, 242, ${pulse})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, w + 14, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Phases 8-11 and 13-15: Rebound / Pulse / Throb / Crimson / Carnage /
      // Bloodlust / Crimson Tide — the blade beats and throws blood.
      ctx.shadowColor = player.phase.glowColor;
      ctx.shadowBlur = player.isAttacking ? (pNum >= 13 ? 40 : 30) : (pNum >= 13 ? 24 : 16);

      // Beat halo: the sword's presence visibly increases on each beat.
      const halo = ctx.createRadialGradient(0, 0, w, 0, 0, len * 0.7);
      halo.addColorStop(0, `rgba(239, 68, 68, ${0.18 + beat * 0.3})`);
      halo.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // A tide on the ground, only once the sword is genuinely heavy.
      if (pNum >= 13) {
        ctx.fillStyle = "rgba(127, 29, 29, 0.3)";
        ctx.beginPath();
        ctx.ellipse(0, 0, len * 0.62, w + 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#450a0a";
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
      grad.addColorStop(0, "#7f1d1d");
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(0.7, accent);
      grad.addColorStop(1, "#7f1d1d");
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

      ctx.strokeStyle = "#fecaca";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Veins, now branching properly rather than just crawling.
      ctx.strokeStyle = "rgba(69, 10, 10, 0.95)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const y = (i === 0 ? -1 : 1) * (w / 2 - 1);
        for (let k = 0; k < 3; k++) {
          const x0 = len * (0.2 + k * 0.24);
          ctx.beginPath();
          ctx.moveTo(x0, y);
          ctx.lineTo(x0 + 7, y * 0.4);
          ctx.lineTo(x0 + 13, y);
          ctx.stroke();
        }
      }

      // Drips off the underside; heavier from Carnage on.
      ctx.strokeStyle = "rgba(220, 38, 38, 0.85)";
      ctx.lineWidth = 1.4;
      const drips = pNum >= 13 ? 6 : 4;
      for (let i = 0; i < drips; i++) {
        const x0 = len * (0.14 + i * 0.15);
        const t = (anim * 2.1 + noise(i * 9 + pNum) * 1.7) % 1;
        drip(ctx, x0, w / 2 + 1, 2 + t * (7 + (pNum >= 13 ? 10 : 5)));
      }
    }

    ctx.restore();
  },

  /** @param {CanvasRenderingContext2D} ctx @param {object} player */
  drawAura(ctx, player) {
    const pNum = (player.phase && player.phase.phase) || 1;
    const anim = player.animTimer || 0;
    const w = player.phase.bladeWidth;
    const beat = Math.pow(Math.abs(Math.sin(anim * 2.6)), 6);

    // Flatline and Fester keep the aura stripped: there is no pulse to project.
    if (pNum === 7 || pNum === 12) {
      ctx.save();
      ctx.strokeStyle = pNum === 7 ? "rgba(82, 82, 91, 0.28)" : "rgba(68, 64, 60, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, w + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();

    // Rings of blood thrown outward on the beat. From Throb on there are more of
    // them and they travel further, because the beat is much too strong.
    const rings = pNum === 16 ? 4 : (pNum >= 13 ? 3 : (pNum >= 8 ? 2 : 1));
    const strength = pNum === 16 ? 0.8 : (pNum >= 13 ? 0.6 : (pNum >= 8 ? 0.42 : 0.26));
    for (let i = 0; i < rings; i++) {
      const t = (beat + i / rings) % 1;
      const r = w + 7 + t * (pNum >= 13 ? 26 : (pNum >= 8 ? 16 : 9));
      ctx.strokeStyle = `rgba(239, 68, 68, ${strength * (1 - t)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Veins radiating from the wielder — the blade's circulatory system.
    if (pNum >= 4) {
      const veins = pNum >= 13 ? 10 : 6;
      ctx.strokeStyle = `rgba(127, 29, 29, ${0.5 + beat * 0.3})`;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < veins; i++) {
        const a = (i / veins) * Math.PI * 2 + anim * 0.3;
        const r0 = w + 8;
        const r1 = r0 + 6 + noise(i * 7 + pNum) * 10;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.stroke();
      }
    }

    // A pool forming under the wielder, growing with the phase.
    if (pNum >= 5) {
      ctx.fillStyle = `rgba(127, 29, 29, ${pNum >= 13 ? 0.26 : 0.14})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, w + 18, w + 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heartstopper: droplets hanging in the air, falling and never landing.
    if (pNum === 16) {
      ctx.fillStyle = "rgba(255, 241, 242, 0.8)";
      for (let i = 0; i < 12; i++) {
        const t = (anim * 0.4 + noise(i * 13 + 3)) % 1;
        const a = noise(i + 30) * Math.PI * 2;
        const rr = w + 12 + t * 30;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
};
