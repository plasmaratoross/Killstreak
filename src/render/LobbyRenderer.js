/**
 * LobbyRenderer — sanctuary lobby rendering, extracted from js/game.js in Phase 4.
 *
 * Bodies moved verbatim; `this` rebound to the `game` parameter.
 * Note: drawLobbyDecorations is not called anywhere in the codebase. It is kept
 * (still exported) because the refactor must not remove existing features.
 */
import { drawSafeRoundRect } from './WorldRenderer.js';

/** @param {object} game */
export function drawAmbientMenuBg(game) {
  game.ctx.save();
  game.ctx.fillStyle = "#080c14";
  game.ctx.fillRect(0, 0, game.viewport.width, game.viewport.height);
  game.ctx.restore();
}

/** @param {object} game @param {object} map */
export function drawLobbyFloor(game, map) {
  if (!map) return;
  const ctx = game.ctx;

  // 1. Draw Woven Rugs
  if (map.rugs) {
    for (let rug of map.rugs) {
      ctx.save();
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      drawSafeRoundRect(ctx, rug.x + 4, rug.y + 4, rug.width, rug.height, 12);
      ctx.fill();

      // Rug Body
      ctx.fillStyle = rug.color || "#0f172a";
      ctx.beginPath();
      drawSafeRoundRect(ctx, rug.x, rug.y, rug.width, rug.height, 12);
      ctx.fill();

      // Rug Border Stitched Pattern
      ctx.strokeStyle = rug.borderColor || "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner Accent Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      drawSafeRoundRect(ctx, rug.x + 8, rug.y + 8, rug.width - 16, rug.height - 16, 8);
      ctx.stroke();

      // If gallery rug, render soft radiant floor halos under the 3 pedestals
      if (rug.id === "gallery_rug" && map.swordStands) {
        for (let stand of map.swordStands) {
          const haloGrad = ctx.createRadialGradient(stand.x, stand.y, 4, stand.x, stand.y, 32);
          const haloColor = stand.swordId === "soil"
            ? "rgba(180, 83, 9, 0.25)"
            : (stand.swordId === "aquatic"
              ? "rgba(6, 182, 212, 0.22)"
              : (stand.swordId === "overdrive" ? "rgba(239, 68, 68, 0.20)" : "rgba(56, 189, 248, 0.20)"));
          haloGrad.addColorStop(0, haloColor);
          haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(stand.x, stand.y, 32, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // 2. Draw Floor Lamps Light Pools
  if (map.lamps) {
    for (let lamp of map.lamps) {
      ctx.save();
      const glowGrad = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, lamp.glowRadius || 110);
      glowGrad.addColorStop(0, "rgba(254, 240, 138, 0.22)");
      glowGrad.addColorStop(0.5, "rgba(253, 224, 71, 0.08)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.glowRadius || 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/** @param {object} game @param {object} map */
export function drawLobbyFurnitureAndProps(game, map) {
  if (!map) return;
  const ctx = game.ctx;

  // 3. Draw Lounge Furniture (Sofas, Armchairs, Coffee Table, Credenzas)
  if (map.furniture) {
    for (let f of map.furniture) {
      ctx.save();
      // Drop Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      drawSafeRoundRect(ctx, f.x + 3, f.y + 4, f.width, f.height, 8);
      ctx.fill();

      if (f.type === "sofa_long") {
        // Main Long Sofa Body
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x, f.y, f.width, f.height, 8);
        ctx.fill();
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Backrest & Armrests
        ctx.fillStyle = "#334155";
        ctx.fillRect(f.x, f.y, f.width, 14);
        ctx.fillRect(f.x, f.y, 14, f.height);
        ctx.fillRect(f.x + f.width - 14, f.y, 14, f.height);

        // Soft Seat Cushions
        const cWidth = (f.width - 34) / 3;
        for (let c = 0; c < 3; c++) {
          const cx = f.x + 17 + c * cWidth;
          ctx.fillStyle = "#253347";
          ctx.fillRect(cx + 2, f.y + 16, cWidth - 4, f.height - 18);
          ctx.strokeStyle = "#38485e";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx + 2, f.y + 16, cWidth - 4, f.height - 18);
        }

      } else if (f.type === "chair") {
        // Armchair Body
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x, f.y, f.width, f.height, 8);
        ctx.fill();
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Outer Back/Sides
        ctx.fillStyle = "#334155";
        ctx.fillRect(f.x, f.y, f.width, 12);
        ctx.fillRect(f.x, f.y + f.height - 12, f.width, 12);

        // Center Cushion
        ctx.fillStyle = "#253347";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x + 8, f.y + 14, f.width - 16, f.height - 28, 4);
        ctx.fill();
        ctx.strokeStyle = "#38485e";
        ctx.lineWidth = 1;
        ctx.stroke();

      } else if (f.type === "table") {
        // Coffee Table Dark Wood Base
        ctx.fillStyle = "#1f1610";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x, f.y, f.width, f.height, 6);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glass/Tinted Inlay Top
        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x + 8, f.y + 7, f.width - 16, f.height - 14, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Tabletop Centerpiece (Books + Mini Succulent)
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(f.x + f.width / 2 - 28, f.y + f.height / 2 - 6, 18, 12);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(f.x + f.width / 2 - 26, f.y + f.height / 2 - 8, 14, 10);

        // Mini Potted Plant on Table
        ctx.fillStyle = "#92400e";
        ctx.beginPath();
        ctx.arc(f.x + f.width / 2 + 16, f.y + f.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(f.x + f.width / 2 + 16, f.y + f.height / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (f.type === "credenza") {
        // Archive Credenza / Shelving Unit
        ctx.fillStyle = "#271d15";
        ctx.beginPath();
        drawSafeRoundRect(ctx, f.x, f.y, f.width, f.height, 4);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shelves & Book Spines
        const shelves = 4;
        const sH = f.height / shelves;
        for (let s = 1; s < shelves; s++) {
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(f.x + 2, f.y + s * sH);
          ctx.lineTo(f.x + f.width - 2, f.y + s * sH);
          ctx.stroke();

          ctx.fillStyle = s % 2 === 0 ? "#0284c7" : "#d97706";
          ctx.fillRect(f.x + 6, f.y + (s - 1) * sH + 6, f.width - 12, sH - 10);
        }
      }

      ctx.restore();
    }
  }

  // 4. Draw Floor Lamp Models
  if (map.lamps) {
    for (let lamp of map.lamps) {
      ctx.save();
      // Base
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#334155";
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Core Bulb
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "#fef08a";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
    }
  }

  // 5. Draw Potted Plants
  if (map.plants) {
    for (let p of map.plants) {
      ctx.save();
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.arc(p.x + 3, p.y + 4, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ceramic Planter Rim
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Soil
      ctx.fillStyle = "#3f2212";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // Leaves
      ctx.fillStyle = "#15803d";
      for (let a = 0; a < 6; a++) {
        const angle = (a * Math.PI / 3) + 0.2;
        const lx = p.x + Math.cos(angle) * (p.radius * 0.75);
        const ly = p.y + Math.sin(angle) * (p.radius * 0.75);
        ctx.beginPath();
        ctx.arc(lx, ly, p.radius * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#22c55e";
      for (let a = 0; a < 5; a++) {
        const angle = (a * Math.PI * 2 / 5) - 0.1;
        const lx = p.x + Math.cos(angle) * (p.radius * 0.45);
        const ly = p.y + Math.sin(angle) * (p.radius * 0.45);
        ctx.beginPath();
        ctx.arc(lx, ly, p.radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 6. Draw Columns / Pillars
  if (map.decorations) {
    for (let col of map.decorations) {
      if (col.type !== "pillar") continue;
      ctx.save();
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.arc(col.x + 3, col.y + 4, col.radius, 0, Math.PI * 2);
      ctx.fill();

      // Base
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Shaft
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }
}

/** @param {object} game @param {object} map */
export function drawLobbyDecorations(game, map) {
  drawLobbyFloor(game, map);
  drawLobbyFurnitureAndProps(game, map);
}

export default { drawAmbientMenuBg, drawLobbyFloor, drawLobbyFurnitureAndProps, drawLobbyDecorations };
