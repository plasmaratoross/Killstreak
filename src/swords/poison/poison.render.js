/**
 * poison — render strategy.
 *
 * Implements the visual rendering for Poison:
 *   - Sleek, surgical assassin dagger / rapier silhouette with a needle-sharp point.
 *   - Dark obsidian/titanium spine with glowing toxic green fluid channels.
 *   - Dripping venom particles and toxic mist aura (Phase 7+).
 *   - Floating toxic emerald crystals and virulent miasma (Phase 13-14).
 *   - Cracked, corroded, leaking dark sludge variants for the two deliberate collapses:
 *     Phase 4 (Contamination) and Phase 12 (Poisoned Collapse).
 */

export function renderSword(ctx, player, phase, scale) {
  const pNum = phase.phase || 1;
  const isCollapse = pNum === 4 || pNum === 12;
  const length = (phase.bladeLength || 55) * scale;
  const width = (phase.bladeWidth || 6) * scale;
  const tipX = length;
  const tipY = 0;

  ctx.save();

  // 1. Toxic Miasma / Poison Aura (Phases 7+)
  if (pNum >= 7 && !isCollapse) {
    const time = Date.now() * 0.003;
    const auraRadius = length * 0.45;
    ctx.save();
    ctx.shadowColor = pNum >= 13 ? "#86efac" : "#22c55e";
    ctx.shadowBlur = pNum >= 13 ? 18 : 10;

    // Orbiting poison droplets / crystals
    const count = pNum >= 13 ? 6 : (pNum >= 10 ? 4 : 3);
    for (let i = 0; i < count; i++) {
      const a = time + (i * Math.PI * 2) / count;
      const dist = auraRadius + Math.sin(time * 2 + i) * 6;
      const px = length * 0.55 + Math.cos(a) * dist * 0.6;
      const py = Math.sin(a) * dist * 0.35;

      ctx.fillStyle = i % 2 === 0 ? "#4ade80" : "#22c55e";
      ctx.beginPath();
      ctx.arc(px, py, 2.2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Base Assassin Blade (Needle / Dagger profile)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -width * 0.5);

  if (isCollapse) {
    // Jagged / fractured blade silhouette for deliberate collapse
    ctx.lineTo(length * 0.3, -width * 0.7);
    ctx.lineTo(length * 0.5, -width * 0.35);
    ctx.lineTo(length * 0.8, -width * 0.6);
    ctx.lineTo(tipX, 0);
    ctx.lineTo(length * 0.8, width * 0.4);
    ctx.lineTo(length * 0.45, width * 0.6);
    ctx.lineTo(length * 0.25, width * 0.35);
    ctx.lineTo(0, width * 0.5);
    ctx.closePath();

    ctx.fillStyle = pNum === 4 ? "#292524" : "#0f172a";
    ctx.fill();
    ctx.strokeStyle = pNum === 4 ? "#3f6212" : "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cracks leaking toxic sludge
    ctx.strokeStyle = pNum === 4 ? "rgba(77, 124, 15, 0.7)" : "rgba(34, 197, 94, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(length * 0.2, 0);
    ctx.lineTo(length * 0.45, -width * 0.2);
    ctx.lineTo(length * 0.7, width * 0.2);
    ctx.stroke();
  } else {
    // Streamlined needle-sharp blade
    ctx.lineTo(length * 0.7, -width * 0.45);
    ctx.lineTo(tipX, 0);
    ctx.lineTo(length * 0.7, width * 0.45);
    ctx.lineTo(0, width * 0.5);
    ctx.closePath();

    // Dark sleek assassin spine
    ctx.fillStyle = pNum >= 13 ? "#022c22" : (pNum >= 7 ? "#064e3b" : "#0f172a");
    ctx.fill();

    // Glowing toxic edge
    ctx.strokeStyle = phase.color || "#22c55e";
    ctx.lineWidth = pNum >= 10 ? 2.2 : 1.5;
    ctx.shadowColor = phase.glowColor || "rgba(34, 197, 94, 0.6)";
    ctx.shadowBlur = pNum >= 13 ? 16 : 8;
    ctx.stroke();

    // Internal toxic fluid vein
    ctx.strokeStyle = pNum >= 13 ? "#86efac" : (pNum >= 7 ? "#4ade80" : "#22c55e");
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(length * 0.1, 0);
    ctx.lineTo(length * 0.85, 0);
    ctx.stroke();

    // Branching capillary nerve lines (Phase 7+)
    if (pNum >= 7) {
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(length * 0.35, 0);
      ctx.lineTo(length * 0.48, -width * 0.3);
      ctx.moveTo(length * 0.55, 0);
      ctx.lineTo(length * 0.68, width * 0.28);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 3. Compact Assassin Guard & Grip
  ctx.save();
  ctx.fillStyle = isCollapse ? "#44403c" : "#1e293b";
  ctx.strokeStyle = phase.color || "#22c55e";
  ctx.lineWidth = 1.2;

  // Thin crossguard angled back like fangs
  ctx.beginPath();
  ctx.moveTo(4, -width * 1.3);
  ctx.lineTo(0, -width * 0.6);
  ctx.lineTo(-6, -width * 0.6);
  ctx.lineTo(-6, width * 0.6);
  ctx.lineTo(0, width * 0.6);
  ctx.lineTo(4, width * 1.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Handle / Pommel with toxic vial cap
  ctx.fillStyle = "#09090b";
  ctx.fillRect(-16, -2.5, 10, 5);

  // Toxic gem / vial pommel
  ctx.fillStyle = phase.color || "#22c55e";
  ctx.shadowColor = phase.color || "#22c55e";
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(-18, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export default {
  renderSword
};
